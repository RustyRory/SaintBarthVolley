// src/services/scrapingService.js
// Scraping FFVB — utilise Team.federationUrl directement (pas de collection Championship)
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import Standing from '../models/Standing.js';

const CLUB_TEAM_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";

// Patterns qui indiquent une ligne à ignorer (division, journée exempte, placeholder)
const DIVISION_PATTERN =
  /^(nationale|régionale?|régional|poule|division|phase|honneur|excellence|fédérale|pro\s?[ab]?)\s*\d*$/i;
const BYE_PATTERN = /^(x+|exempt[e]?|bye|-+)$/i; // journée exempte (xxxxx, exempt, -)
const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{2,4}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function parseDateFR(dateStr, timeStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(fullYear, month - 1, day, hours, minutes).toISOString();
}

function parseSetsDetail(setsStr) {
  if (!setsStr) return [];
  return setsStr.split(',').map((s, idx) => {
    const [scoreFor, scoreAgainst] = s.trim().split(':').map(Number);
    return { setNumber: idx + 1, scoreFor: scoreFor || 0, scoreAgainst: scoreAgainst || 0 };
  });
}

async function scrapeTeam(team, log) {
  const result = {
    teamId: team._id,
    teamName: team.name,
    matchesCreated: 0,
    matchesUpdated: 0,
    standings: 0,
    error: null,
  };

  try {
    if (!team.federationUrl) {
      log(`⚠️  ${team.name} : pas d'URL FFVB, ignoré`);
      result.error = 'Pas de federationUrl';
      return result;
    }

    log(`🏐 Scraping ${team.name} → ${team.federationUrl}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(team.federationUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const now = new Date();
    const matches = [];

    $('tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 6) return;

      const row = [];
      tds.each((j, td) => row.push($(td).text().trim()));

      const homeTeam = row[3];
      const awayTeam = row[5];
      if (!homeTeam || !awayTeam) return;

      // Ignorer les lignes dont la date ou l'heure ne correspondent pas au format attendu
      if (!DATE_PATTERN.test(row[1]) || !TIME_PATTERN.test(row[2])) return;

      if (homeTeam === CLUB_TEAM_NAME || awayTeam === CLUB_TEAM_NAME) {
        const homeAway = homeTeam === CLUB_TEAM_NAME ? 'home' : 'away';
        const opponentName = homeAway === 'home' ? awayTeam : homeTeam;

        // Ignorer les noms de division (ex: "Nationale 3") et les journées exemptées (ex: "xxxxx")
        if (DIVISION_PATTERN.test(opponentName.trim())) return;
        if (BYE_PATTERN.test(opponentName.trim())) return;

        const scoreFor = homeAway === 'home' ? parseInt(row[6]) || 0 : parseInt(row[7]) || 0;
        const scoreAgainst = homeAway === 'home' ? parseInt(row[7]) || 0 : parseInt(row[6]) || 0;

        let dateISO;
        try {
          dateISO = parseDateFR(row[1], row[2]);
        } catch {
          return;
        }

        const setsDetail = parseSetsDetail(row[8]);
        const matchDate = new Date(dateISO);
        const status = matchDate <= now && (scoreFor > 0 || scoreAgainst > 0) ? 'played' : 'scheduled';

        matches.push({
          teamId: team._id,
          opponentName,
          date: dateISO,
          homeAway,
          status,
          scoreFor,
          scoreAgainst,
          setsDetail,
        });
      }
    });

    log(`📋 ${matches.length} match(es) détecté(s)`);

    for (const m of matches) {
      const existing = await Match.findOne({ teamId: team._id, opponentName: m.opponentName, date: m.date });
      if (existing) {
        const needsUpdate =
          existing.status !== m.status || existing.scoreFor !== m.scoreFor || existing.scoreAgainst !== m.scoreAgainst;
        if (needsUpdate) {
          await Match.updateOne({ _id: existing._id }, m);
          result.matchesUpdated++;
        }
      } else {
        await Match.create(m);
        result.matchesCreated++;
      }
    }

    // Standings
    const standings = [];
    $('table tbody tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 16) return;

      const rank = parseInt($(tds[0]).text()) || 0;
      const teamName = $(tds[1]).text().trim();
      if (!teamName) return;

      standings.push({
        teamId: team._id,
        teamName,
        rank,
        points: parseInt($(tds[2]).text()) || 0,
        played: parseInt($(tds[3]).text()) || 0,
        wins: parseInt($(tds[4]).text()) || 0,
        losses: parseInt($(tds[5]).text()) || 0,
        setsFor: parseInt($(tds[13]).text()) || 0,
        setsAgainst: parseInt($(tds[14]).text()) || 0,
      });
    });

    for (const s of standings) {
      await Standing.findOneAndUpdate({ teamId: team._id, teamName: s.teamName }, s, { upsert: true });
    }
    result.standings = standings.length;

    log(
      `✅ ${team.name} : ${result.matchesCreated} créé(s), ${result.matchesUpdated} màj, ${result.standings} classements`,
    );
  } catch (err) {
    log(`❌ ${team.name} : ${err.message}`);
    result.error = err.message;
  }

  return result;
}

export async function runScraping(onLog = () => {}) {
  // Équipes ayant une federationUrl
  const teams = await Team.find({ federationUrl: { $exists: true, $ne: '' } });
  const validTeamIds = teams.map((t) => t._id.toString());

  // Nettoyage : supprimer matches et standings dont l'équipe n'existe plus
  // ou n'a plus d'URL FFVB
  const deletedMatches = await Match.deleteMany({ teamId: { $nin: validTeamIds } });
  const deletedStandings = await Standing.deleteMany({ teamId: { $nin: validTeamIds } });

  if (deletedMatches.deletedCount > 0 || deletedStandings.deletedCount > 0) {
    onLog(
      `🗑️  Nettoyage : ${deletedMatches.deletedCount} match(es) et ${deletedStandings.deletedCount} classement(s) orphelins supprimés`,
    );
  }

  onLog(`🚀 ${teams.length} équipe(s) avec URL FFVB à scraper`);

  if (teams.length === 0) {
    onLog("⚠️  Aucune équipe n'a d'URL FFVB configurée. Allez dans Saisons → Équipe → URL FFVB.");
    return [];
  }

  const results = [];
  for (const team of teams) {
    const r = await scrapeTeam(team, onLog);
    results.push(r);
  }

  return results;
}
