const NodeCache = require('node-cache');
const config = require('config');

const myCache = new NodeCache({
	stdTTL: config.get('ttl'),
});

module.exports = myCache;
