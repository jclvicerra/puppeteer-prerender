const cache = require('./../cache');

module.exports = async (req, res, next) => {

  console.log('Checking health status');

  try {
    res.status(200).jsonp({
      cache: cache.getStats(),
    });
  } catch (e) {
    res.status(500).jsonp({
      error: e.toString(),
    });
  }

  next();
};
