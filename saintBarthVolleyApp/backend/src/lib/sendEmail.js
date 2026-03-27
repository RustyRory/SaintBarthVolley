import nodemailer from 'nodemailer';

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('🧪 Ethereal account created:');
  console.log('USER:', testAccount.user);
  console.log('PASS:', testAccount.pass);

  return transporter;
}

export default async function sendEmail({ to, subject, html }) {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: '"Test App" <no-reply@test.com>',
      to,
      subject,
      html,
    });

    console.log('📧 Email envoyé:', info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('🔗 Preview URL:', previewUrl);
  } catch (err) {
    console.error('❌ Erreur envoi email:', err);
    throw err;
  }
}
