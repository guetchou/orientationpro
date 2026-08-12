'use strict';

const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const express = require('express');
const multer = require('multer');

const {
  CV_MAX_FILE_SIZE,
  isAllowedCvFile,
} = require('../security/cv-access');

const { CvInputError } = require('./errors');

const route = (handler) =>
  (req, res, next) =>
    Promise.resolve(
      handler(req, res, next),
    ).catch(next);

const cleanupUploadedFile = async (file) => {
  if (!file?.path) return;

  await fs.unlink(file.path)
    .catch(() => undefined);
};

const cvErrorStatus = (code) => {
  if (code === 'CV_FILE_TOO_LARGE') {
    return 413;
  }

  if (
    [
      'CV_FILE_CORRUPTED',
      'CV_PDF_SCANNED',
      'CV_TEXT_EXTRACTION_FAILED',
      'CV_TEXT_TOO_SHORT',
      'CV_TEXT_UNREADABLE',
    ].includes(code)
  ) {
    return 422;
  }

  return 400;
};

const requirePermission = (
  hasPermission,
  permissionId,
) => route(async (req, res, next) => {
  const allowed = await hasPermission({
    accountId: req.auth.account.id,
    permissionId,
  });

  if (!allowed) {
    return res.status(403).json({
      error: {
        code: 'PERMISSION_DENIED',
        message:
          "Le compte authentifie n'est pas autorise a effectuer cette action CV.",
      },
    });
  }

  return next();
});

const DEFAULT_UPLOAD_DIRECTORY = path.join(
  os.tmpdir(),
  'makoki-cv-uploads',
);

const resolveUploadDirectory = (value) => {
  if (
    value === undefined
    || value === null
    || value === ''
  ) {
    return DEFAULT_UPLOAD_DIRECTORY;
  }

  if (typeof value !== 'string') {
    throw new Error(
      'CV upload directory must be an absolute path.',
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    return DEFAULT_UPLOAD_DIRECTORY;
  }

  if (!path.isAbsolute(normalized)) {
    throw new Error(
      'CV upload directory must be an absolute path.',
    );
  }

  return path.resolve(normalized);
};

const createUploadReceiver = (
  uploadDirectory,
) => {
  fsSync.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
      mode: 0o700,
    },
  );

  const storage = multer.diskStorage({
    destination: (
      req,
      file,
      callback,
    ) => {
      callback(null, uploadDirectory);
    },

    filename: (
      req,
      file,
      callback,
    ) => {
      callback(
        null,
        `${
          randomUUID()
        }${
          path.extname(
            file.originalname,
          ).toLowerCase()
        }`,
      );
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: CV_MAX_FILE_SIZE,
      files: 1,
      fields: 3,
      parts: 4,
      fieldNameSize: 100,
      fieldSize: 96 * 1024,
    },
    fileFilter: (
      req,
      file,
      callback,
    ) => {
      if (!isAllowedCvFile(file)) {
        callback(
          new CvInputError(
            'CV_FILE_TYPE_UNSUPPORTED',
          ),
        );
        return;
      }

      callback(null, true);
    },
  });

  return (
    req,
    res,
    next,
  ) => {
    upload.single('cv')(
      req,
      res,
      async (error) => {
        if (!error) {
          next();
          return;
        }

        await cleanupUploadedFile(req.file);

        if (error instanceof CvInputError) {
          next(error);
          return;
        }

        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            next(
              new CvInputError(
                'CV_FILE_TOO_LARGE',
              ),
            );
            return;
          }

          if (
            error.code
            === 'LIMIT_UNEXPECTED_FILE'
          ) {
            next(
              new CvInputError(
                'CV_FILE_TYPE_UNSUPPORTED',
              ),
            );
            return;
          }

          next(
            new CvInputError(
              'CV_UPLOAD_INVALID',
            ),
          );
          return;
        }

        next(error);
      },
    );
  };
};

const createCvRouter = ({
  service,
  authenticate,
  hasPermission,
  uploadDirectory = path.join(
    os.tmpdir(),
    'makoki-cv-uploads',
  ),
} = {}) => {
  if (
    !service
    || typeof authenticate !== 'function'
    || typeof hasPermission !== 'function'
  ) {
    throw new Error(
      'CV service, authentication and permission checks are required.',
    );
  }

  const router = express.Router();

  const resolvedUploadDirectory =
    resolveUploadDirectory(uploadDirectory);

  const receiveCvUpload =
    createUploadReceiver(
      resolvedUploadDirectory,
    );

  router.post(
    '/preview',
    receiveCvUpload,
    route(async (req, res) => {
      try {
        const preview =
          await service.createPreview({
            file: req.file,
            body: req.body,
          });

        res.setHeader(
          'Cache-Control',
          'private, no-store, max-age=0',
        );

        return res.status(200).json({
          preview,
        });
      } finally {
        await cleanupUploadedFile(req.file);
      }
    }),
  );

  router.use(authenticate);

  router.post(
    '/analyses',
    requirePermission(
      hasPermission,
      'cv.analysis.create',
    ),
    receiveCvUpload,
    route(async (req, res) => {
      try {
        const analysis =
          await service.createAnalysis({
            accountId:
              req.auth.account.id,
            file: req.file,
            body: req.body,
          });

        return res.status(201).json({
          analysis,
        });
      } finally {
        await cleanupUploadedFile(req.file);
      }
    }),
  );

  router.get(
    '/analyses',
    requirePermission(
      hasPermission,
      'cv.analysis.read_own',
    ),
    route(async (req, res) => {
      const result =
        await service.listAnalyses({
          accountId:
            req.auth.account.id,
          limit: req.query.limit,
          offset: req.query.offset,
        });

      return res.status(200).json(result);
    }),
  );

  router.get(
    '/analyses/:analysisId',
    requirePermission(
      hasPermission,
      'cv.analysis.read_own',
    ),
    route(async (req, res) => {
      const analysis =
        await service.getAnalysis({
          accountId:
            req.auth.account.id,
          analysisId:
            req.params.analysisId,
        });

      if (!analysis) {
        return res.status(404).json({
          error: {
            code:
              'CV_ANALYSIS_NOT_FOUND',
            message:
              "L'analyse CV demandee n'existe pas pour le compte authentifie.",
          },
        });
      }

      return res.status(200).json({
        analysis,
      });
    }),
  );

  router.get(
    '/analyses/:analysisId/report.pdf',
    requirePermission(
      hasPermission,
      'cv.report.read_own',
    ),
    route(async (req, res) => {
      const report =
        await service.getReport({
          accountId:
            req.auth.account.id,
          analysisId:
            req.params.analysisId,
        });

      if (!report) {
        return res.status(404).json({
          error: {
            code:
              'CV_ANALYSIS_NOT_FOUND',
            message:
              "L'analyse CV demandee n'existe pas pour le compte authentifie.",
          },
        });
      }

      res.setHeader(
        'Content-Type',
        'application/pdf',
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${report.fileName}"`,
      );

      res.setHeader(
        'Content-Length',
        String(report.buffer.length),
      );

      res.setHeader(
        'Cache-Control',
        'private, no-store, max-age=0',
      );

      res.setHeader(
        'Pragma',
        'no-cache',
      );

      res.setHeader(
        'X-Content-Type-Options',
        'nosniff',
      );

      return res
        .status(200)
        .send(report.buffer);
    }),
  );

  router.delete(
    '/analyses/:analysisId',
    requirePermission(
      hasPermission,
      'cv.analysis.delete_own',
    ),
    route(async (req, res) => {
      const deleted =
        await service.deleteAnalysis({
          accountId:
            req.auth.account.id,
          analysisId:
            req.params.analysisId,
        });

      if (!deleted) {
        return res.status(404).json({
          error: {
            code:
              'CV_ANALYSIS_NOT_FOUND',
            message:
              "L'analyse CV demandee n'existe pas pour le compte authentifie.",
          },
        });
      }

      return res.status(204).end();
    }),
  );

  router.use((
    error,
    req,
    res,
    next,
  ) => {
    if (!(error instanceof CvInputError)) {
      next(error);
      return;
    }

    res.status(
      cvErrorStatus(error.code),
    ).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  });

  return router;
};

module.exports = {
  DEFAULT_UPLOAD_DIRECTORY,
  cleanupUploadedFile,
  createCvRouter,
  createUploadReceiver,
  cvErrorStatus,
  requirePermission,
  resolveUploadDirectory,
};
