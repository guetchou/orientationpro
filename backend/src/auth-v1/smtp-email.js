const nodemailer = require('nodemailer');

const required = (env, name) => {
  const value = env[name];
  if (!value) throw new Error(`${name} is required when AUTH_V1_ENABLED=true`);
  return value;
};

const createSmtpEmailAdapter = (env = process.env) => {
  const webUrl = new URL(required(env, 'APP_WEB_URL'));
  const from = required(env, 'SMTP_FROM');
  const transporter = nodemailer.createTransport({
    host: required(env, 'SMTP_HOST'),
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_SECURE === 'true',
    auth: {
      user: required(env, 'SMTP_USER'),
      pass: required(env, 'SMTP_PASSWORD'),
    },
  });

  const link = (pathname, token) => {
    const url = new URL(pathname, webUrl);
    url.searchParams.set('token', token);
    return url.toString();
  };

  return {
    sendVerification: ({ email, token }) => transporter.sendMail({
      from,
      to: email,
      subject: 'Vérifiez votre compte Orientation Pro Congo',
      text: `Vérifiez votre compte : ${link('/verify-email', token)}`,
    }),
    sendPasswordReset: ({ email, token }) => transporter.sendMail({
      from,
      to: email,
      subject: 'Réinitialisez votre mot de passe Orientation Pro Congo',
      text: `Réinitialisez votre mot de passe : ${link('/reset-password', token)}`,
    }),
  };
};

module.exports = { createSmtpEmailAdapter };
