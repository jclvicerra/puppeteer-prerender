const express = require('express');
const helmet = require('helmet');
const config = require('config');

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
app.get('/', function (req, res) {
	res.send('renderer');
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

