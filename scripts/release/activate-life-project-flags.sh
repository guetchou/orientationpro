#!/usr/bin/env bash
set -Eeuo pipefail

env_file="${1:-}"
[[ -f "${env_file}" ]] || { printf 'Usage: %s ENV_FILE\n' "$0" >&2; exit 2; }

upsert_flag() {
  local key="$1"
  local value="$2"
  local temporary
  temporary="$(mktemp "${env_file}.XXXXXX")"

  awk -F= -v key="${key}" -v value="${value}" '
    BEGIN { found = 0 }
    $1 == key { print key "=" value; found = 1; next }
    { print }
    END { if (!found) print key "=" value }
  ' "${env_file}" >"${temporary}"

  chmod --reference="${env_file}" "${temporary}"
  chown --reference="${env_file}" "${temporary}" 2>/dev/null || true
  mv "${temporary}" "${env_file}"
}

required_true=(
  AUTH_V1_ENABLED
  LIFE_PROJECT_API_ENABLED
  VITE_LIFE_PROJECT_ENABLED
)

required_false=(
  LEGACY_AUTH_ENABLED
  LEGACY_API_ENABLED
  DATA_RIGHTS_API_ENABLED
  RIASEC_API_ENABLED
  RIASEC_ALLOW_DRAFT
  CAREER_API_ENABLED
  CV_API_V1_ENABLED
  FEATURE_CHATBOT
  FEATURE_ANALYTICS
)

for flag in "${required_true[@]}"; do
  upsert_flag "${flag}" true
done

for flag in "${required_false[@]}"; do
  upsert_flag "${flag}" false
done

read_flag() {
  local key="$1"
  awk -F= -v key="${key}" '$1 == key { value = $2 } END { print value }' "${env_file}"
}

for flag in "${required_true[@]}"; do
  [[ "$(read_flag "${flag}")" == true ]] || {
    printf '%s must be true for the Projet de vie production release\n' "${flag}" >&2
    exit 1
  }
done

for flag in "${required_false[@]}"; do
  [[ "$(read_flag "${flag}")" == false ]] || {
    printf '%s must be false during the Projet de vie production release\n' "${flag}" >&2
    exit 1
  }
done

printf 'Projet de vie release flags verified\n'

release_dir="$(dirname "${env_file}")"
smtp_diagnostic_marker="${release_dir}/ops/production/diagnose-auth-email-delivery"
if [[ -f "${smtp_diagnostic_marker}" ]]; then
  grep -qx 'DIAGNOSE_SMTP_ONCE' "${smtp_diagnostic_marker}"
  api_container=orientationpro_riasec-api-1
  docker inspect "${api_container}" >/dev/null
  smtp_report="$(mktemp)"

  if ! docker exec -i \
    -e SMTP_DIAGNOSTIC_RECIPIENT=makemba02@gmail.com \
    "${api_container}" node - >"${smtp_report}" <<'NODE'
const crypto = require('node:crypto');
const nodemailer = require('nodemailer');

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};
const hash = (value) => crypto.createHash('sha256').update(String(value || '')).digest('hex');
const domainOf = (value) => String(value || '').match(/@([^>\s]+)/)?.[1] || 'unknown';

(async () => {
  const recipient = required('SMTP_DIAGNOSTIC_RECIPIENT');
  const from = required('SMTP_FROM');
  const host = required('SMTP_HOST');
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: required('SMTP_USER'),
      pass: required('SMTP_PASSWORD'),
    },
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
    responseCode: String(info.response || '').match(/^\d{3}/)?.[0] || null,
    messageIdHash: hash(info.messageId),
    responseHash: hash(info.response),
    timestamp: new Date().toISOString(),
  };
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (report.status !== 'accepted_by_smtp') process.exitCode = 1;
})().catch((error) => {
  process.stdout.write(`${JSON.stringify({
    status: 'smtp_error',
    errorName: error?.name || 'Error',
    errorCode: error?.code || null,
    command: error?.command || null,
    responseCode: error?.responseCode || null,
    messageHash: hash(error?.message),
    timestamp: new Date().toISOString(),
  })}\n`);
  process.exitCode = 1;
});
NODE
  then
    cat "${smtp_report}"
    rm -f "${smtp_report}"
    exit 1
  fi

  cat "${smtp_report}"
  grep -q '"status":"accepted_by_smtp"' "${smtp_report}"
  grep -q '"transportVerified":true' "${smtp_report}"
  rm -f "${smtp_report}"
fi
