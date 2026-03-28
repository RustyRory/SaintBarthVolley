import dotenv from 'dotenv';
dotenv.config();

import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import Match from '../../models/Match.js';
import Standing from '../../models/Standing.js';

// 🔹 Club fixe
const CLUB_TEAM_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";

// 🔹 Utilitaires
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

// 🔹 Scraping d’un championnat
async function scrapeChampionship(champ) {
  try {
    console.log(`\n🏐 ${champ.name || 'Championnat inconnu'}`);
    console.log(`🔗 ${champ.federationUrl}`);
    if (!champ.federationUrl) {
      console.warn(`⚠️ Championnat ${champ.name || champ._id} n’a pas d’URL, skipping...`);
      return;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(champ.federationUrl, { waitUntil: 'networkidle2' });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // -----------------------------
    // 🔹 Scraping des matchs
    // -----------------------------
    console.log('📊 Parsing des matchs...');
    const matches = [];
    const now = new Date();

    $('tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 6) return;

      const row = [];
      tds.each((j, td) => row.push($(td).text().trim()));

      const homeTeam = row[3];
      const awayTeam = row[5];
      if (!homeTeam || !awayTeam) return;

      if (homeTeam === CLUB_TEAM_NAME || awayTeam === CLUB_TEAM_NAME) {
        const homeAway = homeTeam === CLUB_TEAM_NAME ? 'home' : 'away';
        const scoreFor = homeAway === 'home' ? parseInt(row[6]) || 0 : parseInt(row[7]) || 0;
        const scoreAgainst = homeAway === 'home' ? parseInt(row[7]) || 0 : parseInt(row[6]) || 0;
        const dateISO = parseDateFR(row[1], row[2]);
        const setsDetail = parseSetsDetail(row[8]);

        const matchDate = new Date(dateISO);
        let status = 'scheduled';
        if (matchDate <= now && (scoreFor > 0 || scoreAgainst > 0)) {
          status = 'played';
        }

        matches.push({
          championshipId: champ._id,
          opponentName: homeAway === 'home' ? awayTeam : homeTeam,
          date: dateISO,
          homeAway,
          status,
          scoreFor,
          scoreAgainst,
          setsDetail,
        });
      }
    });

    console.log(`🧪 ${matches.length} matchs détectés`);

    for (const m of matches) {
      const existing = await Match.findOne({
        championshipId: champ._id,
        opponentName: m.opponentName,
        date: m.date,
      });

      if (existing) {
        const needsUpdate =
          existing.status !== m.status ||
          existing.scoreFor !== m.scoreFor ||
          existing.scoreAgainst !== m.scoreAgainst ||
          JSON.stringify(existing.setsDetail) !== JSON.stringify(m.setsDetail);

        if (needsUpdate) {
          await Match.updateOne({ _id: existing._id }, m);
          console.log(`🔄 Match mis à jour : ${m.opponentName} (${m.date})`);
        }
      } else {
        await Match.create(m);
        console.log(`➕ Match créé : ${m.opponentName} (${m.date})`);
      }
    }

    // -----------------------------
    // 🔹 Scraping des standings
    // -----------------------------
    console.log('📊 Parsing des standings...');
    const standings = [];

    $('table tbody tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 16) return;

      const rank = parseInt($(tds[0]).text()) || 0;
      const teamName = $(tds[1]).text().trim();
      if (!teamName) return;

      const points = parseInt($(tds[2]).text()) || 0;
      const played = parseInt($(tds[3]).text()) || 0;
      const wins = parseInt($(tds[4]).text()) || 0;
      const losses = parseInt($(tds[5]).text()) || 0;
      const setsFor = parseInt($(tds[13]).text()) || 0;
      const setsAgainst = parseInt($(tds[14]).text()) || 0;
      const coefficientSets = parseFloat($(tds[15]).text()) || 0;
      const pointsFor = parseInt($(tds[16]).text()) || 0;
      const pointsAgainst = parseInt($(tds[17]).text()) || 0;
      const coefficientPoints = parseFloat($(tds[18]).text()) || 0;

      standings.push({
        championshipId: champ._id,
        teamName,
        rank,
        played,
        wins,
        losses,
        setsFor,
        setsAgainst,
        coefficientSets,
        pointsFor,
        pointsAgainst,
        coefficientPoints,
        points,
      });
    });

    console.log('💾 Mise à jour des standings dans MongoDB...');
    for (const s of standings) {
      await Standing.findOneAndUpdate({ championshipId: champ._id, teamName: s.teamName }, s, { upsert: true });
    }
    console.log(`🎉 ${standings.length} équipes mises à jour ou créées`);
  } catch (err) {
    console.error('❌ Erreur pendant le scraping :', err);
  }
}

// -----------------------------
// 🔹 Connexion MongoDB et scraping de tous les championnats
// -----------------------------
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saintbarthvolley')
  .then(async () => {
    console.log('✅ MongoDB connecté');
    const championships = await mongoose.connection.db.collection('championships').find().toArray();

    console.log(`🚀 ${championships.length} championnats à scraper`);
    for (const champ of championships) {
      await scrapeChampionship(champ);
    }
  })
  .finally(() => mongoose.disconnect());
