'use strict';

// Attrapeur SMTP minimal pour le harnais Playwright #216 : aucune bibliothèque
// externe n'existe déjà dans ce repo pour intercepter les emails de
// vérification/réinitialisation envoyés par backend/src/auth-v1/smtp-email.js
// (nodemailer réel, sans mode test). Ce script implémente le sous-ensemble
// SMTP strictement nécessaire (EHLO, MAIL FROM, RCPT TO, DATA, QUIT — sans
// AUTH, jamais annoncée donc jamais tentée par nodemailer) et expose les
// emails capturés via une API HTTP locale que les tests interrogent pour
// extraire le lien de vérification, sans jamais envoyer de courrier réel.
const net = require('node:net');
const http = require('node:http');

const SMTP_PORT = Number(process.env.SMTP_CATCHER_PORT || 2525);
const HTTP_PORT = Number(process.env.SMTP_CATCHER_HTTP_PORT || 2526);

const emailsByRecipient = new Map();

const storeEmail = ({ to, body }) => {
  const list = emailsByRecipient.get(to) || [];
  list.push({ body, receivedAt: new Date().toISOString() });
  emailsByRecipient.set(to, list);
};

const smtpServer = net.createServer((socket) => {
  let state = 'greeting';
  let recipient = null;
  let dataBuffer = '';

  socket.write('220 localhost ESMTP life-project-e2e-catcher\r\n');

  socket.on('data', (chunk) => {
    if (state === 'data') {
      dataBuffer += chunk.toString('utf8');
      const terminatorIndex = dataBuffer.indexOf('\r\n.\r\n');
      if (terminatorIndex !== -1) {
        const body = dataBuffer.slice(0, terminatorIndex);
        if (recipient) storeEmail({ to: recipient, body });
        dataBuffer = '';
        state = 'command';
        socket.write('250 OK id=life-project-e2e\r\n');
      }
      return;
    }

    const lines = chunk.toString('utf8').split('\r\n').filter(Boolean);
    for (const line of lines) {
      const command = line.slice(0, 4).toUpperCase();
      if (command === 'EHLO' || command === 'HELO') {
        socket.write('250 localhost\r\n');
      } else if (command === 'MAIL') {
        socket.write('250 OK\r\n');
      } else if (command === 'RCPT') {
        const match = line.match(/<([^>]+)>/);
        recipient = match ? match[1] : null;
        socket.write('250 OK\r\n');
      } else if (command === 'DATA') {
        state = 'data';
        socket.write('354 Start mail input; end with <CRLF>.<CRLF>\r\n');
      } else if (command === 'QUIT') {
        socket.write('221 Bye\r\n');
        socket.end();
      } else {
        socket.write('250 OK\r\n');
      }
    }
  });
});

const httpServer = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${HTTP_PORT}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (url.pathname === '/emails') {
    const to = url.searchParams.get('to');
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(to ? (emailsByRecipient.get(to) || []) : []));
    return;
  }

  if (url.pathname === '/reset' && req.method === 'POST') {
    emailsByRecipient.clear();
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(404);
  res.end();
});

smtpServer.listen(SMTP_PORT, '127.0.0.1', () => {
  process.stdout.write(`SMTP catcher listening on 127.0.0.1:${SMTP_PORT}\n`);
});

httpServer.listen(HTTP_PORT, '127.0.0.1', () => {
  process.stdout.write(`SMTP catcher HTTP API listening on 127.0.0.1:${HTTP_PORT}\n`);
});
