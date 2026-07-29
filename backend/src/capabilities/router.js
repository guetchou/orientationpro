'use strict';

const express = require('express');
const { createCapabilityRegistry } = require('./registry');

const createCapabilitiesRouter = ({ env = process.env } = {}) => {
  const registry = createCapabilityRegistry(env);
  const router = express.Router();

  router.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(registry);
  });

  return router;
};

module.exports = { createCapabilitiesRouter };
