const config = require('config');
const queue = require('express-queue');

module.exports = queue({ activeLimit: config.get('maxConcurrentSessions'), queuedLimit: -1 });
