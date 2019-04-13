'use strict';

const { URL } = require('url');
const contentDisposition = require('content-disposition');

module.exports = async (req, res, next) => {

	const app = req.app;

	const renderer = app.get('renderer');

	let { url, type, ...options } = req.query;

	if (!url) {
		return res.status(400).send('Search with url parameter. For example, ?url=http://yourdomain')
	}

	if (!url.includes('://')) {
		url = `http://${url}`
	}

	console.info(`Rendering url ${url} for type ${type} with options ${JSON.stringify(options)}`);

	try {
		switch (type) {
			case 'pdf':
				const urlObj = new URL(url);
				let filename = urlObj.hostname;
				if (urlObj.pathname !== '/') {
					filename = urlObj.pathname.split('/').pop();
					if (filename === '') filename = urlObj.pathname.replace(/\//g, '');
					const extDotPosition = filename.lastIndexOf('.');
					if (extDotPosition > 0) filename = filename.substring(0, extDotPosition)
				}
				const pdf = await renderer.pdf(url, {
					...options,
					scale: options.scale || 1
				});
				res
					.set({
						'Content-Type': 'application/pdf',
						'Content-Length': pdf.length,
						'Content-Disposition': contentDisposition(filename + '.pdf'),
					})
					.send(pdf);
				break

			case 'screenshot':
				const image = await renderer.screenshot(url, options);
				res
					.set({
						'Content-Type': 'image/png',
						'Content-Length': image.length,
					})
					.send(image);
				break;

			default:
				const html = await renderer.render(url, options);
				res.status(200).send(html)
		}
	} catch (e) {
		next(e)
	}
};
