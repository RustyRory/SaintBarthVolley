// src/scripts/scraping.js
import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import Match from '../models/Match.js';
import Standing from '../models/Standing.js';
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Constantes
const CHAMPIONSHIP_ID = '6985bd859903c98a455ca98d';
const CLUB_TEAM_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";
const FFVB_URL =
  'https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=2025%2F2026&codent=ABCCS&poule=3MB&division=&tour=&calend=COMPLET&x=15&y=15';

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

// 🔹 Fonction principale
async function scrapeFFVB() {
  try {
    console.log('📡 Lancement de Puppeteer...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log('📊 Récupération du HTML...');
    await page.goto(FFVB_URL, { waitUntil: 'networkidle2' });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // ---------------------
    // 🔹 Scraping des matchs
    // ---------------------
    console.log('📊 Parsing des matchs...');
    const matches = [];

    $('tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 6) return;

      const homeTeam = $(tds[3]).text().trim();
      const awayTeam = $(tds[5]).text().trim();
      if (!homeTeam || !awayTeam) return;

      if (homeTeam === CLUB_TEAM_NAME || awayTeam === CLUB_TEAM_NAME) {
        const homeAway = homeTeam === CLUB_TEAM_NAME ? 'home' : 'away';
        const scoreFor = homeAway === 'home' ? parseInt($(tds[6]).text()) || 0 : parseInt($(tds[7]).text()) || 0;
        const scoreAgainst = homeAway === 'home' ? parseInt($(tds[7]).text()) || 0 : parseInt($(tds[6]).text()) || 0;
        const dateISO = parseDateFR($(tds[1]).text().trim(), $(tds[2]).text().trim());
        const setsDetail = parseSetsDetail($(tds[8]).text().trim());

        console.log(`🏐 Match: ${homeTeam} vs ${awayTeam} - ${dateISO}`);
        matches.push({
          championshipId: CHAMPIONSHIP_ID,
          clubName: CLUB_TEAM_NAME, // pour filtrer plus tard
          opponentName: homeAway === 'home' ? awayTeam : homeTeam,
          date: dateISO,
          homeAway,
          status: $(tds[6]).text().trim() || $(tds[7]).text().trim() ? 'played' : 'scheduled',
          scoreFor,
          scoreAgainst,
          setsDetail,
        });
      }
    });

    console.log('💾 Mise à jour des matchs dans MongoDB...');
    for (const m of matches) {
      await Match.findOneAndUpdate({ championshipId: CHAMPIONSHIP_ID, opponentName: m.opponentName, date: m.date }, m, {
        upsert: true,
      });
    }
    console.log(`🎉 ${matches.length} matchs mis à jour.`);

    // ---------------------
    // 🔹 Scraping du classement (standings)
    // ---------------------
    console.log('📊 Parsing des standings...');
    const standings = [];

    // Exemple : chaque ligne du classement
    $('table.standings tr').each((i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 8) return; // on a besoin de 8 colonnes pour ton modèle

      const rank = parseInt($(tds[0]).text()) || 0;
      const teamName = $(tds[1]).text().trim();
      const played = parseInt($(tds[2]).text()) || 0;
      const wins = parseInt($(tds[3]).text()) || 0;
      const losses = parseInt($(tds[4]).text()) || 0;
      const setsFor = parseInt($(tds[5]).text()) || 0;
      const setsAgainst = parseInt($(tds[6]).text()) || 0;
      const points = parseInt($(tds[7]).text()) || 0;

      standings.push({
        championshipId: CHAMPIONSHIP_ID,
        teamName,
        rank,
        played,
        wins,
        losses,
        setsFor,
        setsAgainst,
        points,
      });
    });

    console.log('💾 Mise à jour des standings dans MongoDB...');
    for (const s of standings) {
      await Standing.findOneAndUpdate({ championshipId: CHAMPIONSHIP_ID, teamName: s.teamName }, s, { upsert: true });
    }

    console.log(`🎉 ${standings.length} équipes mises à jour.`);
  } catch (err) {
    console.error('❌ Erreur pendant le scraping :', err);
  }
}

// 🔹 Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saintbarthvolley')
  .then(() => scrapeFFVB())
  .finally(() => mongoose.disconnect());
