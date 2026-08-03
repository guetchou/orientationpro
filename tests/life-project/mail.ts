// Décodage minimal du quoted-printable produit par nodemailer (assemble les
// sauts de ligne "souples" =\r\n et décode les séquences =XX), suffisant pour
// retrouver le lien de vérification/réinitialisation dans un email capturé
// par smtp-catcher.cjs — jamais un envoi réel, jamais une donnée de jeune.
export const decodeQuotedPrintable = (input: string): string => input
  .replace(/=\r?\n/g, '')
  .replace(/=([0-9A-Fa-f]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

export const extractLink = (rawEmailBody: string, pathname: string): string => {
  const decoded = decodeQuotedPrintable(rawEmailBody);
  const pattern = new RegExp(`(https?://\\S*${pathname}\\?token=\\S+)`);
  const match = decoded.match(pattern);
  if (!match) {
    throw new Error(`No "${pathname}" link found in captured email:\n${decoded}`);
  }
  return match[1].trim();
};

export const fetchLatestEmail = async (httpPort: number, to: string): Promise<string> => {
  const response = await fetch(`http://127.0.0.1:${httpPort}/emails?to=${encodeURIComponent(to)}`);
  const emails = (await response.json()) as Array<{ body: string; receivedAt: string }>;
  if (emails.length === 0) {
    throw new Error(`No email captured for ${to}`);
  }
  return emails[emails.length - 1].body;
};
