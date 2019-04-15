const cache = require('./../cache');
const config = require('config');

module.exports = async (req, res, next) => {

	console.log('Checking health status');

	try {
		res.status(200).jsonp({
			cache: cache.getStats(),
			cacheTTL: config.get('ttl')
		});
	} catch (e) {
		res.status(500).jsonp({
			error: e.toString(),
		});
	}

	next();
};
