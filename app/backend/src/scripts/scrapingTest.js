import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const CLUB_TEAM_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";
const URL =
  'https://www.ffvbbeach.org/ffvbapp/resu/vbspo_calendrier.php?saison=2025%2F2026&codent=ABCCS&poule=3MB&calend=COMPLET';

async function testScraping() {
  console.log('📡 Lancement de Puppeteer...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('📊 Récupération du HTML...');
  await page.goto(URL, { waitUntil: 'networkidle2' });

  const html = await page.content();
  const $ = cheerio.load(html);

  console.log('📊 Parsing des matchs...');

  $('tr').each((i, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 6) return; // ignorer les lignes qui ne sont pas des matchs

    const date = $(tds[1]).text().trim();
    const time = $(tds[2]).text().trim();
    const homeTeam = $(tds[3]).text().trim();
    const awayTeam = $(tds[5]).text().trim();

    if (!homeTeam || !awayTeam) return;

    // uniquement les matchs du club
    if (homeTeam === CLUB_TEAM_NAME || awayTeam === CLUB_TEAM_NAME) {
      console.log(`🏐 Match: ${homeTeam} vs ${awayTeam} - ${date} ${time}`);
    }
  });

  await browser.close();
  console.log('🎉 Test terminé !');
}

testScraping();
