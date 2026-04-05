import nodemailer from 'nodemailer';

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`📧 SMTP configuré via .env (${process.env.SMTP_HOST})`);
    return transporter;
  }

  // Fallback Ethereal si pas de config
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('🧪 Ethereal fallback:', testAccount.user);
  return transporter;
}

export default async function sendEmail({ to, subject, html }) {
  try {
    const t = await getTransporter();
    const from = process.env.SMTP_FROM ?? '"Saint-Barth Volley" <no-reply@sbvb.fr>';

    const info = await t.sendMail({ from, to, subject, html });

    console.log('📧 Email envoyé:', info.messageId);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('🔗 Preview:', preview);
  } catch (err) {
    console.error('❌ Erreur envoi email:', err.message);
    throw err;
  }
}
