'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const { validateDocxContainer } = require('./docx-validator');

const {
  CV_MAX_FILE_SIZE,
  isAllowedCvFile,
  matchesCvFileSignature,
} = require('../security/cv-access');

const { CvInputError } = require('./errors');

const PDF_MIME = 'application/pdf';
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const sanitizeFileName = (originalName) => {
  const baseName = path.basename(String(originalName || 'document'));

  const cleaned = baseName
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}._ -]/gu, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

  return cleaned || 'document';
};

const sha256 = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

const defaultDocxParser = async (buffer) =>
  mammoth.extractRawText({ buffer });

const validateUploadedFile = (file) => {
  if (!file || typeof file !== 'object' || !file.path) {
    throw new CvInputError('CV_FILE_REQUIRED');
  }

  if (
    !Number.isFinite(file.size) ||
    file.size <= 0
  ) {
    throw new CvInputError('CV_FILE_CORRUPTED');
  }

  if (file.size > CV_MAX_FILE_SIZE) {
    throw new CvInputError('CV_FILE_TOO_LARGE', {
      maximumBytes: CV_MAX_FILE_SIZE,
    });
  }

  if (!isAllowedCvFile(file)) {
    throw new CvInputError('CV_FILE_TYPE_UNSUPPORTED');
  }
};

const extractCvFile = async (file, options = {}) => {
  const {
    deleteAfter = true,
    readFile = fs.readFile,
    unlink = fs.unlink,
    pdfParser = pdfParse,
    docxParser = defaultDocxParser,
    docxValidator = validateDocxContainer,
  } = options;

  let buffer;

  try {
    validateUploadedFile(file);

    try {
      buffer = await readFile(file.path);
    } catch {
      throw new CvInputError('CV_FILE_CORRUPTED');
    }

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new CvInputError('CV_FILE_CORRUPTED');
    }

    if (buffer.length > CV_MAX_FILE_SIZE) {
      throw new CvInputError('CV_FILE_TOO_LARGE', {
        maximumBytes: CV_MAX_FILE_SIZE,
      });
    }

    if (!matchesCvFileSignature(buffer.subarray(0, 8), file.mimetype)) {
      throw new CvInputError('CV_FILE_SIGNATURE_INVALID');
    }

    let extractedText;
    let pageCount = null;

    try {
      if (file.mimetype === PDF_MIME) {
        const parsed = await pdfParser(buffer);
        extractedText = parsed?.text;

        if (Number.isSafeInteger(parsed?.numpages) && parsed.numpages > 0) {
          pageCount = parsed.numpages;
        }
      } else if (file.mimetype === DOCX_MIME) {
        await docxValidator(buffer);
        const parsed = await docxParser(buffer);
        extractedText = parsed?.value;
      } else {
        throw new CvInputError('CV_FILE_TYPE_UNSUPPORTED');
      }
    } catch (error) {
      if (error instanceof CvInputError) {
        throw error;
      }

      throw new CvInputError('CV_FILE_CORRUPTED');
    }

    const text = typeof extractedText === 'string'
      ? extractedText.trim()
      : '';

    if (!text) {
      if (file.mimetype === PDF_MIME) {
        throw new CvInputError('CV_PDF_SCANNED');
      }

      throw new CvInputError('CV_TEXT_EXTRACTION_FAILED');
    }

    return {
      text,
      document: {
        fileName: sanitizeFileName(file.originalname),
        mimeType: file.mimetype,
        fileSize: buffer.length,
        pageCount,
        sha256: sha256(buffer),
      },
    };
  } finally {
    if (deleteAfter && file?.path) {
      await unlink(file.path).catch(() => undefined);
    }
  }
};

module.exports = {
  DOCX_MIME,
  PDF_MIME,
  extractCvFile,
  sanitizeFileName,
  sha256,
  validateUploadedFile,
};
