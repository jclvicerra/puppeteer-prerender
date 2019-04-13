const NodeCache = require('node-cache');

const myCache = new NodeCache({
  stdTTL: 1, // 1 day
});

module.exports = myCache;
