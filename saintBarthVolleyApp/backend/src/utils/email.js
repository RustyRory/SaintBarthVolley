// utils/email.js
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  // Pour tester avec Ethereal
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"Saint Barth Volley" <no-reply@saintbarthvolley.test>`,
    to,
    subject,
    html,
  });

  console.log('Message envoyé: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // 🔗 lien pour voir le mail
}
