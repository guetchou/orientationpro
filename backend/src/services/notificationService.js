const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mailhog',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: false,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined,
      tls: { rejectUnauthorized: false }
    });
  }

  async sendEmail({ to, subject, html, text, from }) {
    const mailOptions = {
      from: from || process.env.SMTP_FROM || 'no-reply@orientationpro.local',
      to,
      subject,
      text: text || undefined,
      html: html || undefined
    };

    const info = await this.transporter.sendMail(mailOptions);
    return { messageId: info.messageId || null, accepted: info.accepted, rejected: info.rejected };
  }
}

module.exports = NotificationService;


