const NodeCache = require('node-cache');

const ttl = process.env.TTL || 86400; // 1 day

const myCache = new NodeCache({
	stdTTL: ttl,
});

module.exports = myCache;
