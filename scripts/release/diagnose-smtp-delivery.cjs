const crypto = require('node:crypto');
const nodemailer = require('nodemailer');

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const recipient = required('SMTP_DIAGNOSTIC_RECIPIENT');
const from = required('SMTP_FROM');
const host = required('SMTP_HOST');
const port = Number(process.env.SMTP_PORT || 587);
const secure = process.env.SMTP_SECURE === 'true';
const user = required('SMTP_USER');
const pass = required('SMTP_PASSWORD');

const hash = (value) => crypto.createHash('sha256').update(String(value || '')).digest('hex');
const domainOf = (address) => String(address || '').split('@').pop() || 'unknown';

(async () => {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.verify();
  const info = await transporter.sendMail({
    from,
    to: recipient,
    subject: 'Diagnostic de livraison MAKOKI',
    text: [
      'Ceci est un message technique de diagnostic de livraison MAKOKI.',
      `Horodatage UTC : ${new Date().toISOString()}`,
      'Aucune action n’est requise.',
    ].join('\n'),
  });

  const accepted = Array.isArray(info.accepted) ? info.accepted : [];
  const rejected = Array.isArray(info.rejected) ? info.rejected : [];
  const responseCode = String(info.response || '').match(/^\d{3}/)?.[0] || null;

  const report = {
    status: accepted.length > 0 && rejected.length === 0 ? 'accepted_by_smtp' : 'smtp_partial_or_rejected',
    transportVerified: true,
    smtpHostHash: hash(host),
    smtpPort: port,
    smtpSecure: secure,
    senderDomain: domainOf(from),
    recipientDomain: domainOf(recipient),
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    responseCode,
    messageIdHash: hash(info.messageId),
    responseHash: hash(info.response),
    timestamp: new Date().toISOString(),
  };

  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (report.status !== 'accepted_by_smtp') process.exitCode = 1;
})().catch((error) => {
  const report = {
    status: 'smtp_error',
    errorName: error?.name || 'Error',
    errorCode: error?.code || null,
    command: error?.command || null,
    responseCode: error?.responseCode || null,
    messageHash: hash(error?.message),
    timestamp: new Date().toISOString(),
  };
  process.stdout.write(`${JSON.stringify(report)}\n`);
  process.exitCode = 1;
});
