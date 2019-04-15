const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const pino = require('express-pino-logger')();

const nodeCache = require('./cache');
const health = require('./routes/health');
const renderer = require('./routes/renderer');
const createRenderer = require('./core/Renderer');



const app = express();

app.use(helmet());
app.use(compression());
app.use(pino);
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);

const metaCacheMiddleware = (req, res, next) => {

	const query = req.query;

	const { url } = query;

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

app.get('/_health', health);
app.get('/', metaCacheMiddleware, renderer);

createRenderer()
	.then(createdRenderer => {
		app.set('renderer', createdRenderer);
		console.info('Initialized renderer.');

		const port = app.get('port');
		app.listen(port, () => console.log(`Prerender Service listening on port ${port}!`));
	})
	.catch(e => {
		console.error('Failed to initialze renderer.', e)
	});

// Error page.
// app.use((err, req, res) => {
// 	console.error(err)
// 	res.status(500).send('Oops, An expected error seems to have occurred.')
// })

// Terminate process
process.on('SIGINT', () => {
	process.exit(0);
});

