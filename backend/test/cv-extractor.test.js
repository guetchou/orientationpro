'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const {
  DOCX_MIME,
  PDF_MIME,
  extractCvFile,
  sanitizeFileName,
} = require('../src/cv/extractor');

const { CV_MAX_FILE_SIZE } = require('../src/security/cv-access');

const {
  DocxValidationError,
  validateDocxContainer,
} = require('../src/cv/docx-validator');

const SAMPLE_TEXT =
  'Profil professionnel avec experience, formation, competences et resultats mesurables.';

const createFile = async ({
  name,
  mimeType,
  buffer,
  declaredSize,
}) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'makoki-cv-extractor-'),
  );

  const filePath = path.join(directory, 'upload.bin');
  await fs.writeFile(filePath, buffer);

  return {
    directory,
    file: {
      path: filePath,
      originalname: name,
      mimetype: mimeType,
      size: declaredSize ?? buffer.length,
    },
  };
};

const expectMissing = async (filePath) => {
  await assert.rejects(
    fs.access(filePath),
    (error) => error?.code === 'ENOENT',
  );
};

test('refuse une requete sans fichier', async () => {
  await assert.rejects(
    extractCvFile(null),
    (error) => error?.code === 'CV_FILE_REQUIRED',
  );
});

test('refuse un type de fichier non supporte', async (t) => {
  const fixture = await createFile({
    name: 'cv.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('texte'),
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  await assert.rejects(
    extractCvFile(fixture.file),
    (error) => error?.code === 'CV_FILE_TYPE_UNSUPPORTED',
  );

  await expectMissing(fixture.file.path);
});

test('refuse un fichier declare trop volumineux', async (t) => {
  const fixture = await createFile({
    name: 'cv.pdf',
    mimeType: PDF_MIME,
    buffer: Buffer.from('%PDF-1.7\nfixture'),
    declaredSize: CV_MAX_FILE_SIZE + 1,
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  await assert.rejects(
    extractCvFile(fixture.file),
    (error) => error?.code === 'CV_FILE_TOO_LARGE',
  );

  await expectMissing(fixture.file.path);
});

test('refuse une fausse signature PDF', async (t) => {
  const fixture = await createFile({
    name: 'cv.pdf',
    mimeType: PDF_MIME,
    buffer: Buffer.from('not-a-pdf'),
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  await assert.rejects(
    extractCvFile(fixture.file),
    (error) => error?.code === 'CV_FILE_SIGNATURE_INVALID',
  );

  await expectMissing(fixture.file.path);
});

test('extrait un PDF et supprime le temporaire', async (t) => {
  const buffer = Buffer.from('%PDF-1.7\nfixture-pdf');

  const fixture = await createFile({
    name: 'Mon CV.pdf',
    mimeType: PDF_MIME,
    buffer,
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  const result = await extractCvFile(fixture.file, {
    pdfParser: async () => ({
      text: SAMPLE_TEXT,
      numpages: 2,
    }),
  });

  assert.equal(result.text, SAMPLE_TEXT);
  assert.equal(result.document.fileName, 'Mon CV.pdf');
  assert.equal(result.document.mimeType, PDF_MIME);
  assert.equal(result.document.pageCount, 2);
  assert.equal(
    result.document.sha256,
    crypto.createHash('sha256').update(buffer).digest('hex'),
  );

  await expectMissing(fixture.file.path);
});

test('extrait un DOCX et supprime le temporaire', async (t) => {
  const buffer = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00,
  ]);

  const fixture = await createFile({
    name: 'cv.docx',
    mimeType: DOCX_MIME,
    buffer,
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  const result = await extractCvFile(fixture.file, {
    docxParser: async () => ({ value: SAMPLE_TEXT }),
    docxValidator: async () => undefined,
  });

  assert.equal(result.text, SAMPLE_TEXT);
  assert.equal(result.document.mimeType, DOCX_MIME);
  assert.equal(result.document.pageCount, null);

  await expectMissing(fixture.file.path);
});

test('classe un PDF sans texte comme probablement scanne', async (t) => {
  const fixture = await createFile({
    name: 'scan.pdf',
    mimeType: PDF_MIME,
    buffer: Buffer.from('%PDF-1.7\nscan'),
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  await assert.rejects(
    extractCvFile(fixture.file, {
      pdfParser: async () => ({ text: '', numpages: 1 }),
    }),
    (error) => error?.code === 'CV_PDF_SCANNED',
  );

  await expectMissing(fixture.file.path);
});

test('refuse un DOCX sans texte extrait', async (t) => {
  const fixture = await createFile({
    name: 'vide.docx',
    mimeType: DOCX_MIME,
    buffer: Buffer.from([
      0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00,
    ]),
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  await assert.rejects(
    extractCvFile(fixture.file, {
      docxParser: async () => ({ value: '   ' }),
      docxValidator: async () => undefined,
    }),
    (error) => error?.code === 'CV_TEXT_EXTRACTION_FAILED',
  );

  await expectMissing(fixture.file.path);
});

test('convertit une erreur parseur en fichier corrompu', async (t) => {
  const fixture = await createFile({
    name: 'corrompu.pdf',
    mimeType: PDF_MIME,
    buffer: Buffer.from('%PDF-1.7\ncorrupted'),
  });

  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  await assert.rejects(
    extractCvFile(fixture.file, {
      pdfParser: async () => {
        throw new Error('raw parser details must not escape');
      },
    }),
    (error) =>
      error?.code === 'CV_FILE_CORRUPTED'
      && !error.message.includes('raw parser details'),
  );

  await expectMissing(fixture.file.path);
});

test('nettoie le nom sans utiliser un chemin fourni', () => {
  const result = sanitizeFileName('Mon CV (final)!!.pdf');

  assert.ok(!result.includes('!'));
  assert.ok(!result.includes('/'));
  assert.ok(result.endsWith('.pdf'));
});

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1)
        ? (0xedb88320 ^ (value >>> 1))
        : (value >>> 1);
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const crc32 = (buffer) => {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
};

const createStoredZip = (entries) => {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.isBuffer(entry.data)
      ? entry.data
      : Buffer.from(entry.data, 'utf8');

    const useDeflate = entry.deflate === true;
    const storedData = useDeflate
      ? zlib.deflateRawSync(data)
      : data;

    const compressionMethod = useDeflate ? 8 : 0;
    const flags = Number(entry.flags || 0);
    const checksum = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(flags, 6);
    localHeader.writeUInt16LE(
      compressionMethod,
      8,
    );
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(
      storedData.length,
      18,
    );
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const localRecord = Buffer.concat([
      localHeader,
      name,
      storedData,
    ]);

    localParts.push(localRecord);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(flags, 8);
    centralHeader.writeUInt16LE(
      compressionMethod,
      10,
    );
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(
      storedData.length,
      20,
    );
    centralHeader.writeUInt32LE(
      data.length,
      24,
    );
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(
      localOffset,
      42,
    );

    centralParts.push(Buffer.concat([
      centralHeader,
      name,
    ]));

    localOffset += localRecord.length;
  }

  const localData = Buffer.concat(localParts);
  const centralDirectory =
    Buffer.concat(centralParts);

  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(
    centralDirectory.length,
    12,
  );
  endRecord.writeUInt32LE(
    localData.length,
    16,
  );
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([
    localData,
    centralDirectory,
    endRecord,
  ]);
};

const createRealDocxBuffer = () => {
  const contentTypes = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    '</Types>',
  ].join('');

  const relationships = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" ',
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" ',
    'Target="word/document.xml"/>',
    '</Relationships>',
  ].join('');

  const documentXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:body>',
    '<w:p><w:r><w:t>Profil professionnel fictif</w:t></w:r></w:p>',
    '<w:p><w:r><w:t>Experience en comptabilite, service client et gestion administrative.</w:t></w:r></w:p>',
    '<w:p><w:r><w:t>Formation fictive et competences professionnelles documentees.</w:t></w:r></w:p>',
    '<w:sectPr/>',
    '</w:body>',
    '</w:document>',
  ].join('');

  return createStoredZip([
    {
      name: '[Content_Types].xml',
      data: contentTypes,
    },
    {
      name: '_rels/.rels',
      data: relationships,
    },
    {
      name: 'word/document.xml',
      data: documentXml,
    },
  ]);
};


const getPdfParseFixture = (fileName) =>
  path.join(
    path.dirname(require.resolve('pdf-parse')),
    'test',
    'data',
    fileName,
  );

test('extrait reellement un PDF avec pdf-parse', async (t) => {
  const referencePath = getPdfParseFixture(
    '05-versions-space.pdf',
  );

  const buffer = await fs.readFile(referencePath);

  const fixture = await createFile({
    name: 'cv-fictif-reference.pdf',
    mimeType: PDF_MIME,
    buffer,
  });

  t.after(() =>
    fs.rm(fixture.directory, {
      recursive: true,
      force: true,
    })
  );

  const result = await extractCvFile(fixture.file);

  assert.match(result.text, /Dadfrtfjh/);
  assert.equal(result.document.mimeType, PDF_MIME);
  assert.equal(result.document.pageCount, 1);
  assert.equal(result.document.fileSize, buffer.length);
  assert.equal(
    result.document.sha256,
    crypto.createHash('sha256').update(buffer).digest('hex'),
  );

  await expectMissing(fixture.file.path);
});

test('refuse reellement un PDF invalide avec pdf-parse', async (t) => {
  const referencePath = getPdfParseFixture(
    '03-invalid.pdf',
  );

  const buffer = await fs.readFile(referencePath);

  const fixture = await createFile({
    name: 'cv-invalide-reference.pdf',
    mimeType: PDF_MIME,
    buffer,
  });

  t.after(() =>
    fs.rm(fixture.directory, {
      recursive: true,
      force: true,
    })
  );

  await assert.rejects(
    extractCvFile(fixture.file),
    (error) =>
      error?.code === 'CV_FILE_CORRUPTED'
      && !error.message.includes(
        'invalid top-level pages dictionary',
      ),
  );

  await expectMissing(fixture.file.path);
});

test('extrait reellement un DOCX avec mammoth', async (t) => {
  const buffer = createRealDocxBuffer();

  const fixture = await createFile({
    name: 'cv-fictif-valide.docx',
    mimeType: DOCX_MIME,
    buffer,
  });

  t.after(() =>
    fs.rm(fixture.directory, {
      recursive: true,
      force: true,
    })
  );

  const result = await extractCvFile(fixture.file);

  assert.match(result.text, /Profil professionnel fictif/);
  assert.match(result.text, /comptabilite/);
  assert.equal(result.document.mimeType, DOCX_MIME);
  assert.equal(result.document.fileSize, buffer.length);

  await expectMissing(fixture.file.path);
});

test('refuse reellement un conteneur DOCX corrompu', async (t) => {
  const fixture = await createFile({
    name: 'cv-corrompu.docx',
    mimeType: DOCX_MIME,
    buffer: Buffer.from([
      0x50, 0x4b, 0x03, 0x04,
      0x00, 0x00, 0x00, 0x00,
      0x01, 0x02, 0x03, 0x04,
    ]),
  });

  t.after(() =>
    fs.rm(fixture.directory, {
      recursive: true,
      force: true,
    })
  );

  await assert.rejects(
    extractCvFile(fixture.file),
    (error) => error?.code === 'CV_FILE_CORRUPTED',
  );

  await expectMissing(fixture.file.path);
});


const SECURITY_CONTENT_TYPES = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
  '<Default Extension="xml" ContentType="application/xml"/>',
  '<Override PartName="/word/document.xml" ',
  'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
  '</Types>',
].join('');

const SECURITY_DOCUMENT_XML = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<w:document ',
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
  '<w:body><w:p><w:r><w:t>CV fictif</w:t></w:r></w:p></w:body>',
  '</w:document>',
].join('');

const createSecurityDocx = (extraEntries = []) =>
  createStoredZip([
    {
      name: '[Content_Types].xml',
      data: SECURITY_CONTENT_TYPES,
    },
    {
      name: 'word/document.xml',
      data: SECURITY_DOCUMENT_XML,
    },
    ...extraEntries,
  ]);

test('durcit le conteneur DOCX avant mammoth', async () => {
  let parserCalled = false;

  const fixture = await createFile({
    name: 'faux.docx',
    mimeType: DOCX_MIME,
    buffer: Buffer.from([
      0x50, 0x4b, 0x03, 0x04,
      0x00, 0x00, 0x00, 0x00,
    ]),
  });

  await assert.rejects(
    extractCvFile(fixture.file, {
      docxParser: async () => {
        parserCalled = true;
        return { value: SAMPLE_TEXT };
      },
    }),
    (error) =>
      error?.code === 'CV_FILE_CORRUPTED',
  );

  assert.equal(parserCalled, false);
  await expectMissing(fixture.file.path);

  await fs.rm(fixture.directory, {
    recursive: true,
    force: true,
  });
});

test('refuse un DOCX sans word document', async () => {
  const buffer = createStoredZip([
    {
      name: '[Content_Types].xml',
      data: SECURITY_CONTENT_TYPES,
    },
  ]);

  await assert.rejects(
    validateDocxContainer(buffer),
    (error) =>
      error instanceof DocxValidationError
      && error.reason === 'MISSING_DOCUMENT',
  );
});

test('refuse les chemins ZIP dangereux', async () => {
  const buffer = createSecurityDocx([
    {
      name: '../contenu-interdit.xml',
      data: '<interdit/>',
    },
  ]);

  await assert.rejects(
    validateDocxContainer(buffer),
    (error) =>
      error instanceof DocxValidationError,
  );
});

test('refuse les entrees DOCX dupliquees', async () => {
  const buffer = createSecurityDocx([
    {
      name: 'word/document.xml',
      data: SECURITY_DOCUMENT_XML,
    },
  ]);

  await assert.rejects(
    validateDocxContainer(buffer),
    (error) =>
      error instanceof DocxValidationError
      && error.reason === 'DUPLICATE_ENTRY',
  );
});

test('refuse une entree DOCX chiffree', async () => {
  const buffer = createSecurityDocx([
    {
      name: 'word/chiffre.bin',
      data: 'contenu fictif',
      flags: 1,
    },
  ]);

  await assert.rejects(
    validateDocxContainer(buffer),
    (error) =>
      error instanceof DocxValidationError,
  );
});

test('refuse un ratio de compression suspect', async () => {
  const buffer = createSecurityDocx([
    {
      name: 'word/bombe.txt',
      data: Buffer.alloc(
        2 * 1024 * 1024,
        0x41,
      ),
      deflate: true,
    },
  ]);

  await assert.rejects(
    validateDocxContainer(buffer),
    (error) =>
      error instanceof DocxValidationError
      && error.reason
        === 'SUSPICIOUS_COMPRESSION_RATIO',
  );
});
