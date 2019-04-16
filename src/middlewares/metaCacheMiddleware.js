
const nodeCache = require('../cache');

const metaCacheMiddleware = (req, res, next) => {

	const query = req.query;

	const { url } = query;

	if (!url) {
		next();
		return;
	}

	const key = url;
	const cacheContent = nodeCache.get(key);
	if (cacheContent) {
		res.send(cacheContent);
		return;
	}
	res.sendResponse = res.send;
	res.send = (body) => {
		nodeCache.set(key, body);
		res.sendResponse(body);
	};
	next();
};

module.exports = metaCacheMiddleware;
