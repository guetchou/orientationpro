'use strict';

const yauzl = require('yauzl');

const MAX_DOCX_ENTRIES = 1024;
const MAX_DOCX_TOTAL_UNCOMPRESSED = 50 * 1024 * 1024;
const MAX_DOCX_ENTRY_UNCOMPRESSED = 20 * 1024 * 1024;
const MAX_DOCX_COMPRESSION_RATIO = 200;
const MAX_CONTENT_TYPES_BYTES = 1024 * 1024;
const MAX_DOCUMENT_XML_BYTES = 20 * 1024 * 1024;

const CONTENT_TYPES_ENTRY = '[Content_Types].xml';
const DOCUMENT_ENTRY = 'word/document.xml';

class DocxValidationError extends Error {
  constructor(reason) {
    super('Le conteneur DOCX est invalide.');
    this.name = 'DocxValidationError';
    this.reason = reason;
  }
}

const openZip = (buffer) =>
  new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      buffer,
      {
        lazyEntries: true,
        decodeStrings: true,
        validateEntrySizes: true,
        strictFileNames: true,
        autoClose: false,
      },
      (error, zipFile) => {
        if (error || !zipFile) {
          reject(
            new DocxValidationError('ZIP_PARSE_ERROR'),
          );
          return;
        }

        resolve(zipFile);
      },
    );
  });

const isUnsafeEntryName = (name) => {
  if (
    typeof name !== 'string'
    || name.length === 0
    || name.includes('\0')
    || name.includes('\\')
    || name.startsWith('/')
    || /^[A-Za-z]:/.test(name)
  ) {
    return true;
  }

  const withoutTrailingSlash = name.endsWith('/')
    ? name.slice(0, -1)
    : name;

  if (!withoutTrailingSlash) {
    return true;
  }

  return withoutTrailingSlash
    .split('/')
    .some(
      (segment) =>
        segment === ''
        || segment === '.'
        || segment === '..',
    );
};

const readEntryBuffer = (
  zipFile,
  entry,
  maximumBytes,
) =>
  new Promise((resolve, reject) => {
    zipFile.openReadStream(
      entry,
      (error, stream) => {
        if (error || !stream) {
          reject(
            new DocxValidationError(
              'ENTRY_READ_ERROR',
            ),
          );
          return;
        }

        const chunks = [];
        let total = 0;
        let settled = false;

        const fail = (reason) => {
          if (settled) return;
          settled = true;
          stream.destroy();
          reject(new DocxValidationError(reason));
        };

        stream.on('data', (chunk) => {
          if (settled) return;

          total += chunk.length;

          if (total > maximumBytes) {
            fail('ENTRY_CONTENT_TOO_LARGE');
            return;
          }

          chunks.push(chunk);
        });

        stream.on('error', () => {
          fail('ENTRY_READ_ERROR');
        });

        stream.on('end', () => {
          if (settled) return;
          settled = true;
          resolve(Buffer.concat(chunks, total));
        });
      },
    );
  });

const validateContentTypes = (buffer) => {
  const xml = buffer.toString('utf8');

  if (
    !xml.includes('/word/document.xml')
    || !xml.includes(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
    )
  ) {
    throw new DocxValidationError(
      'INVALID_CONTENT_TYPES',
    );
  }
};

const validateDocumentXml = (buffer) => {
  const xml = buffer.toString('utf8');

  const hasDocumentElement =
    /<(?:[A-Za-z_][\w.-]*:)?document(?:\s|>)/u.test(
      xml,
    );

  const hasWordNamespace =
    xml.includes(
      'wordprocessingml/2006/main',
    )
    || xml.includes(
      'purl.oclc.org/ooxml/wordprocessingml/main',
    );

  if (!hasDocumentElement || !hasWordNamespace) {
    throw new DocxValidationError(
      'INVALID_DOCUMENT_XML',
    );
  }
};

const validateDocxContainer = async (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new DocxValidationError(
      'INVALID_BUFFER',
    );
  }

  let zipFile;

  try {
    zipFile = await openZip(buffer);

    return await new Promise((resolve, reject) => {
      const seenNames = new Set();

      let entryCount = 0;
      let totalUncompressed = 0;
      let contentTypesFound = false;
      let documentFound = false;
      let settled = false;

      const closeZip = () => {
        try {
          zipFile.close();
        } catch {
          // Rien à faire : le buffer appartient au processus.
        }
      };

      const fail = (errorOrReason) => {
        if (settled) return;
        settled = true;
        closeZip();

        if (
          errorOrReason instanceof
          DocxValidationError
        ) {
          reject(errorOrReason);
          return;
        }

        reject(
          new DocxValidationError(
            String(errorOrReason),
          ),
        );
      };

      zipFile.on('error', () => {
        fail('ZIP_PARSE_ERROR');
      });

      zipFile.on('entry', (entry) => {
        Promise.resolve()
          .then(async () => {
            if (settled) return;

            entryCount += 1;

            if (entryCount > MAX_DOCX_ENTRIES) {
              throw new DocxValidationError(
                'TOO_MANY_ENTRIES',
              );
            }

            const name = entry.fileName;

            if (isUnsafeEntryName(name)) {
              throw new DocxValidationError(
                'UNSAFE_ENTRY_NAME',
              );
            }

            if (seenNames.has(name)) {
              throw new DocxValidationError(
                'DUPLICATE_ENTRY',
              );
            }

            seenNames.add(name);

            const compressedSize =
              Number(entry.compressedSize);
            const uncompressedSize =
              Number(entry.uncompressedSize);

            if (
              !Number.isSafeInteger(compressedSize)
              || compressedSize < 0
              || !Number.isSafeInteger(
                uncompressedSize,
              )
              || uncompressedSize < 0
            ) {
              throw new DocxValidationError(
                'INVALID_ENTRY_SIZE',
              );
            }

            if (
              uncompressedSize
              > MAX_DOCX_ENTRY_UNCOMPRESSED
            ) {
              throw new DocxValidationError(
                'ENTRY_TOO_LARGE',
              );
            }

            totalUncompressed += uncompressedSize;

            if (
              totalUncompressed
              > MAX_DOCX_TOTAL_UNCOMPRESSED
            ) {
              throw new DocxValidationError(
                'ARCHIVE_TOO_LARGE',
              );
            }

            if (
              typeof entry.isEncrypted ===
                'function'
              && entry.isEncrypted()
            ) {
              throw new DocxValidationError(
                'ENCRYPTED_ENTRY',
              );
            }

            if (
              typeof entry.canDecodeFileData ===
                'function'
              && !entry.canDecodeFileData()
            ) {
              throw new DocxValidationError(
                'UNSUPPORTED_COMPRESSION',
              );
            }

            if (
              uncompressedSize > 0
              && compressedSize === 0
            ) {
              throw new DocxValidationError(
                'INVALID_COMPRESSION_RATIO',
              );
            }

            if (
              uncompressedSize > 1024 * 1024
              && compressedSize > 0
              && (
                uncompressedSize
                / compressedSize
              ) > MAX_DOCX_COMPRESSION_RATIO
            ) {
              throw new DocxValidationError(
                'SUSPICIOUS_COMPRESSION_RATIO',
              );
            }

            if (name === CONTENT_TYPES_ENTRY) {
              const contentTypes =
                await readEntryBuffer(
                  zipFile,
                  entry,
                  MAX_CONTENT_TYPES_BYTES,
                );

              validateContentTypes(contentTypes);
              contentTypesFound = true;
            }

            if (name === DOCUMENT_ENTRY) {
              const documentXml =
                await readEntryBuffer(
                  zipFile,
                  entry,
                  MAX_DOCUMENT_XML_BYTES,
                );

              validateDocumentXml(documentXml);
              documentFound = true;
            }

            zipFile.readEntry();
          })
          .catch(fail);
      });

      zipFile.on('end', () => {
        if (settled) return;

        if (!contentTypesFound) {
          fail('MISSING_CONTENT_TYPES');
          return;
        }

        if (!documentFound) {
          fail('MISSING_DOCUMENT');
          return;
        }

        settled = true;
        closeZip();

        resolve({
          entryCount,
          totalUncompressed,
        });
      });

      zipFile.readEntry();
    });
  } catch (error) {
    if (error instanceof DocxValidationError) {
      throw error;
    }

    throw new DocxValidationError(
      'ZIP_PARSE_ERROR',
    );
  }
};

module.exports = {
  CONTENT_TYPES_ENTRY,
  DOCUMENT_ENTRY,
  DocxValidationError,
  MAX_DOCX_COMPRESSION_RATIO,
  MAX_DOCX_ENTRIES,
  MAX_DOCX_ENTRY_UNCOMPRESSED,
  MAX_DOCX_TOTAL_UNCOMPRESSED,
  isUnsafeEntryName,
  validateDocxContainer,
};
