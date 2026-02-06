import dotenv from 'dotenv';
dotenv.config();

import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import Match from '../models/Match.js';
import Standing from '../models/Standing.js';

// 🔹 Constantes
const CHAMPIONSHIP_ID = '6985bd859903c98a455ca98d'; // ton championnat
const CLUB_TEAM_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";
const FFVB_URL =
  'https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=2025%2F2026&codent=ABCCS&poule=3MB&division=&tour=&calend=COMPLET&x=15&y=15';

// 🔹 Utilitaire pour parser date FR -> ISO
function parseDateFR(dateStr, timeStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(fullYear, month - 1, day, hours, minutes).toISOString();
}

// 🔹 Transforme string sets en array d'objets pour Mongo
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

    // -----------------------------
    // 🔹 Scraping des matchs
    // -----------------------------
    console.log('📊 Parsing des matchs...');
    const matches = [];
    const now = new Date();

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

        // 🔹 Déterminer le status correctement
        const matchDate = new Date(dateISO);
        let status = 'scheduled';
        if (matchDate <= now && (scoreFor > 0 || scoreAgainst > 0)) {
          status = 'played';
        }

        matches.push({
          championshipId: CHAMPIONSHIP_ID,
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

    console.log('💾 Mise à jour des matchs dans MongoDB...');
    for (const m of matches) {
      const existing = await Match.findOne({
        championshipId: CHAMPIONSHIP_ID,
        opponentName: m.opponentName,
        date: m.date,
      });

      if (existing) {
        // 🔹 Vérifier si on a de nouvelles infos avant mise à jour
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
    console.log(`🎉 ${matches.length} matchs analysés.`);

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
        championshipId: CHAMPIONSHIP_ID,
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
    let updatedCount = 0;
    for (const s of standings) {
      await Standing.findOneAndUpdate({ championshipId: CHAMPIONSHIP_ID, teamName: s.teamName }, s, { upsert: true });
      updatedCount++;
    }

    console.log(`🎉 ${updatedCount} équipes mises à jour ou créées.`);
  } catch (err) {
    console.error('❌ Erreur pendant le scraping :', err);
  }
}

// -----------------------------
// 🔹 Connexion MongoDB via .env
// -----------------------------
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saintbarthvolley')
  .then(() => scrapeFFVB())
  .finally(() => mongoose.disconnect());
