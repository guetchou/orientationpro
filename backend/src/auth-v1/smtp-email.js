const nodemailer = require('nodemailer');

const required = (env, name) => {
  const value = env[name];
  if (!value) throw new Error(`${name} is required when AUTH_V1_ENABLED=true`);
  return value;
};

const BRAND = {
  name: 'MAKOKI',
  tagline: 'Orientation • Compétences • Emploi — Congo',
  site: 'https://makoki.org',
  emerald: '#052e2b',
  green: '#047857',
  amber: '#f59e0b',
  ink: '#1f2937',
  muted: '#6b7280',
  bg: '#eef2f0',
  card: '#ffffff',
  border: '#e5e7eb',
};

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Table-based, inline-CSS HTML layout compatible with major email clients.
function layout({ preheader, heading, intro, paragraphs = [], ctaText, ctaUrl, fallbackLabel, note }) {
  const B = BRAND;
  const paras = paragraphs
    .map((p) => `<tr><td style="padding:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${B.ink};">${p}</td></tr>`)
    .join('');
  const cta = ctaText && ctaUrl ? `
          <tr><td style="padding:10px 0 4px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" bgcolor="${B.green}" style="border-radius:10px;">
                <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px;">${esc(ctaText)}</a>
              </td>
            </tr></table>
          </td></tr>` : '';
  const fallback = ctaUrl && fallbackLabel ? `
          <tr><td style="padding:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${B.muted};">${esc(fallbackLabel)}<br><a href="${ctaUrl}" target="_blank" style="color:${B.green};word-break:break-all;">${ctaUrl}</a></td></tr>` : '';
  const noteRow = note ? `
          <tr><td style="padding:22px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${B.border};padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${B.muted};">${note}</td></tr></table></td></tr>` : '';
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:${B.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${B.bg};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr><td style="background:${B.emerald};border-radius:16px 16px 0 0;padding:26px 32px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;letter-spacing:2px;color:#ffffff;">MAKOKI</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${B.amber};padding-top:6px;">${esc(B.tagline)}</div>
      </td></tr>
      <tr><td style="height:4px;background:${B.amber};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="background:${B.card};padding:32px;border-left:1px solid ${B.border};border-right:1px solid ${B.border};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:${B.emerald};line-height:28px;">${esc(heading)}</td></tr>
          ${intro ? `<tr><td style="padding:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${B.ink};">${intro}</td></tr>` : ''}
          ${paras}
          ${cta}
          ${fallback}
          ${noteRow}
        </table>
      </td></tr>
      <tr><td style="background:${B.card};border-radius:0 0 16px 16px;border:1px solid ${B.border};border-top:none;padding:20px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${B.muted};">
        Cet e-mail t'a été envoyé automatiquement par MAKOKI. Merci de ne pas y répondre.<br>
        <a href="${B.site}" target="_blank" style="color:${B.green};text-decoration:none;">makoki.org</a> — ${esc(B.tagline)}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

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
  const page = (pathname) => new URL(pathname, webUrl).toString();
  const send = ({ to, subject, html, text }) => transporter.sendMail({ from, to, subject, html, text });

  return {
    sendVerification: ({ email, token }) => {
      const url = link('/verify-email', token);
      return send({
        to: email,
        subject: 'Vérifiez votre compte MAKOKI',
        text: `Bienvenue sur MAKOKI.\n\nConfirme ton adresse e-mail pour activer ton compte :\n${url}\n\nCe lien expire après un court délai. Si tu n'es pas à l'origine de cette inscription, ignore cet e-mail.`,
        html: layout({
          preheader: "Confirme ton adresse pour activer ton compte MAKOKI.",
          heading: 'Confirme ton adresse e-mail',
          intro: "Bienvenue sur <strong>MAKOKI</strong> ! Il ne reste qu'une étape : confirmer ton adresse e-mail pour activer ton compte.",
          ctaText: 'Vérifier mon adresse',
          ctaUrl: url,
          fallbackLabel: 'Le bouton ne fonctionne pas ? Copie ce lien dans ton navigateur :',
          note: "Ce lien expire après un court délai. Si tu n'es pas à l'origine de cette inscription, ignore simplement cet e-mail.",
        }),
      });
    },

    sendPasswordReset: ({ email, token }) => {
      const url = link('/reset-password', token);
      return send({
        to: email,
        subject: 'Réinitialisez votre mot de passe MAKOKI',
        text: `Tu as demandé à réinitialiser ton mot de passe MAKOKI.\n\nChoisis un nouveau mot de passe :\n${url}\n\nCe lien expire bientôt et ne sert qu'une fois. Si tu n'as pas fait cette demande, ignore cet e-mail : ton mot de passe reste inchangé.`,
        html: layout({
          preheader: 'Réinitialise ton mot de passe MAKOKI.',
          heading: 'Réinitialise ton mot de passe',
          intro: 'Tu as demandé à réinitialiser ton mot de passe MAKOKI. Clique sur le bouton ci-dessous pour en choisir un nouveau.',
          ctaText: 'Réinitialiser mon mot de passe',
          ctaUrl: url,
          fallbackLabel: 'Le bouton ne fonctionne pas ? Copie ce lien :',
          note: "Ce lien expire bientôt et ne peut servir qu'une fois. Si tu n'as pas demandé cette réinitialisation, ignore cet e-mail : ton mot de passe reste inchangé.",
        }),
      });
    },

    sendWelcome: ({ email }) => {
      const url = page('/');
      return send({
        to: email,
        subject: 'Bienvenue sur MAKOKI 🎉',
        text: `Ton compte MAKOKI est activé.\n\nPasse les tests d'orientation (modèle RIASEC), explore des métiers adaptés au Congo, et retrouve ton parcours sur tous tes appareils :\n${url}`,
        html: layout({
          preheader: 'Ton compte MAKOKI est activé.',
          heading: 'Ton compte est activé 🎉',
          intro: 'Félicitations — ton adresse est confirmée et ton espace <strong>MAKOKI</strong> est prêt.',
          paragraphs: [
            "Tu peux maintenant passer les tests d'orientation (modèle RIASEC), explorer des métiers sourcés O*NET adaptés au Congo, et retrouver ton parcours sur tous tes appareils.",
          ],
          ctaText: 'Découvrir mon profil',
          ctaUrl: url,
          note: 'Des résultats expliqués — tu gardes la décision.',
        }),
      });
    },

    sendPasswordChanged: ({ email }) => {
      const url = page('/login');
      return send({
        to: email,
        subject: 'Ton mot de passe MAKOKI a été modifié',
        text: `Le mot de passe de ton compte MAKOKI vient d'être modifié.\n\nSi ce n'était pas toi, réinitialise-le immédiatement : ${url}`,
        html: layout({
          preheader: 'Confirmation : ton mot de passe a été modifié.',
          heading: 'Ton mot de passe a été modifié',
          intro: "Nous te confirmons que le mot de passe de ton compte MAKOKI vient d'être modifié avec succès.",
          ctaText: 'Me connecter',
          ctaUrl: url,
          note: "Si tu n'es pas à l'origine de ce changement, réinitialise ton mot de passe immédiatement et contacte-nous.",
        }),
      });
    },
  };
};

module.exports = { createSmtpEmailAdapter };
