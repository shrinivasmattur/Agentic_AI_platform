const { getDBStatus } = require('../config/db');
const env = require('../config/env');

const checkHealth = (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'healthy',
    service: 'Agentic AI Automation Platform API (Agentflow_AI)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus,
    openRouterConfigured: !!env.OPENROUTER_API_KEY,
    geminiConfigured: !!env.GEMINI_API_KEY,
  });
};

module.exports = {
  checkHealth,
};
