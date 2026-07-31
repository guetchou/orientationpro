const nodemailer = require('nodemailer');

const required = (env, name) => {
  const value = env[name];
  if (!value) throw new Error(`${name} is required when AUTH_V1_ENABLED=true`);
  return value;
};

const redactAddress = (value) => {
  const [local = '', domain = ''] = String(value || '').split('@');
  if (!domain) return 'invalid';
  return `${local.slice(0, 2)}***@${domain}`;
};

const sanitizeDelivery = (info = {}) => ({
  messageId: info.messageId || null,
  accepted: (info.accepted || []).map(redactAddress),
  rejected: (info.rejected || []).map(redactAddress),
  pending: (info.pending || []).map(redactAddress),
  response: typeof info.response === 'string' ? info.response.slice(0, 500) : null,
  envelope: info.envelope
    ? {
        from: redactAddress(info.envelope.from),
        to: (info.envelope.to || []).map(redactAddress),
      }
    : null,
});

const createSmtpEmailAdapter = (env = process.env, dependencies = {}) => {
  const webUrl = new URL(required(env, 'APP_WEB_URL'));
  const from = required(env, 'SMTP_FROM');
  const envelopeFrom = env.SMTP_ENVELOPE_FROM || from;
  const logger = dependencies.logger || console;
  const transporter = dependencies.transporter || nodemailer.createTransport({
    host: required(env, 'SMTP_HOST'),
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_SECURE === 'true',
    requireTLS: env.SMTP_REQUIRE_TLS !== 'false',
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

  const deliver = async ({ kind, email, subject, text }) => {
    let info;
    try {
      info = await transporter.sendMail({
        from,
        envelope: { from: envelopeFrom, to: [email] },
        to: email,
        subject,
        text,
      });
    } catch (error) {
      logger.error('auth_email_delivery_failed', {
        kind,
        recipient: redactAddress(email),
        code: error?.code || null,
        responseCode: error?.responseCode || null,
        command: error?.command || null,
        response: typeof error?.response === 'string' ? error.response.slice(0, 500) : null,
      });
      throw error;
    }

    const delivery = sanitizeDelivery(info);
    const accepted = Array.isArray(info.accepted) && info.accepted.length > 0;
    const rejected = Array.isArray(info.rejected) && info.rejected.length > 0;
    const pending = Array.isArray(info.pending) && info.pending.length > 0;

    if (!accepted || rejected || pending) {
      const error = new Error('SMTP server did not accept every recipient');
      error.code = 'SMTP_RECIPIENT_NOT_ACCEPTED';
      error.delivery = delivery;
      logger.error('auth_email_delivery_not_accepted', { kind, ...delivery });
      throw error;
    }

    logger.info('auth_email_delivery_accepted', { kind, ...delivery });
    return delivery;
  };

  return {
    verify: () => transporter.verify(),
    sendVerification: ({ email, token }) => deliver({
      kind: 'verification',
      email,
      subject: 'Vérifiez votre compte MAKOKI',
      text: `Bienvenue sur MAKOKI. Vérifiez votre compte : ${link('/verify-email', token)}`,
    }),
    sendPasswordReset: ({ email, token }) => deliver({
      kind: 'password_reset',
      email,
      subject: 'Réinitialisez votre mot de passe MAKOKI',
      text: `Réinitialisez votre mot de passe MAKOKI : ${link('/reset-password', token)}`,
    }),
  };
};

module.exports = { createSmtpEmailAdapter, redactAddress, sanitizeDelivery };
