const express = require('express');
const helmet = require('helmet');
const cache = require('./cache');

const compression = require('compression');
const pino = require('express-pino-logger')();

const health = require('./routes/health');
const renderer = require('./routes/renderer');
const metaCacheMiddleware = require('./middlewares/metaCacheMiddleware');
const queueMiddleware = require('./middlewares/queueMiddleware');

const app = express();

app.use(helmet());
app.use(compression());
app.use(pino);
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);

app.get('/_health', health);

app.get('/render', [metaCacheMiddleware, queueMiddleware], renderer);

app.delete('/cache', (req, res) => {

	let { url, type, ...options } = req.query;

	if (!url) {
		return res.status(400).send('Url is required');
	}
	cache.del(url, (err, count) => {
		if (!err) {
			return res.status(200).send(true);
		} else {
			return res.status(400).send(err);
		}
	})
});

app.get('/cache', (req, res) => {

	let { url, type, ...options } = req.query;

	if (url) {
		cache.get(url, (err, value) => {

			if (!err) {
				if (value === undefined) {
					return res.status(404).send(`Cache with url ${url} not found`);
				} else {
					return res.status(200).send(value);
				}
			}
		})
	} else {
		cache.keys(function (err, cacheKeys) {
			if (!err) {
				return res.status(200).jsonp(cacheKeys);
			} else {
				return res.status(400).send(err);
			}
		});
	}
});

app.post('/cache/flush', (req, res) => {

	cache.flushAll();

	return res.status(200).jsonp(cache.getStats());
});

app.get('/', (req, res) => {
	res.send('Prerender Service');
});


const port = app.get('port');
app.listen(port, () => console.log(`Prerender Service listening on port ${port}!`));

// createRenderer()
// 	.then(createdRenderer => {
// 		app.set('renderer', createdRenderer);
// 		console.info('Initialized renderer.');
//
// 		const port = app.get('port');
// 		app.listen(port, () => console.log(`Prerender Service listening on port ${port}!`));
// 	})
// 	.catch(e => {
// 		console.error('Failed to initialze renderer.', e)
// 	});

// Error page.
// app.use((err, req, res) => {
// 	console.error(err)
// 	res.status(500).send('Oops, An expected error seems to have occurred.')
// })

// Terminate process
// process.on('SIGINT', () => {
// 	process.exit(0);
// });
let listener = null;
if (!listener) {
	listener = process.on('SIGINT', () => process.exit(0));
}

