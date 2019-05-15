'use strict';

const https = require('https');
const zlib = require('zlib');

const supportedCompression = ['gzip', 'deflate'];

const postUrl = (options, postData) => new Promise((resolve, reject) => {
	const req = https.request(options, (distant) => {
		let response = '';
		distant.on('data', packet => {

			response += packet.toString();
		});
		distant.on('end', () => resolve(response));

	})
		.on('error', (e) => {
			reject(e);
		});
	req.write(postData);
	req.end();
});

const compressBody = (body, compression) => {
	if (compression === 'gzip') {
		return zlib.gzipSync(body)
			.toString('base64');
	} else if (compression === 'deflate') {
		return zlib.deflateSync(body)
			.toString('base64');
	} else {
		return body;  // no compression
	}
};

const detectCompression = (request) => {

	const accept = request.headers['accept-encoding'] || [];
	for (const i = 0; i < accept.length; i++) {

		const encoding = `${accept[i].value}`;

		const splitEncoding = encoding.split(',') || [];

		const matchedEncoding = splitEncoding.map((item) => item.trim())
			.find((compression => supportedCompression.includes(compression)));

		return matchedEncoding || null;
	}
	return null;
};


exports.handler = (event, context, callback) => {
	const request = event.Records[0].cf.request;

	const isFromBot = request.headers['x-prerender-token'] && request.headers['x-prerender-path'];
	if (isFromBot) {

		// let encodedPath = encodeURIComponent(`https://${request.headers['x-prerender-path'][0].value}`);
		// encodedPath = encodedPath.replace(/\/+$/, "");

		let encodedPath = `https://${request.headers['x-prerender-path'][0].value}`;
		// const isGzip = hasGzipHeaders(request.headers);

		// detect compression from request headers
		const compression = detectCompression(request);

		postUrl({
			method: 'POST',
			hostname: 'prerender.realty.com.au',
			port: 443,
			path: '/content?token=B19C3CD526B2C',
			headers: {
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json'
			},
		}, JSON.stringify({ url: encodedPath }))
			.then(async (result) => {

				let response = {
					status: '200',
					statusDescription: 'OK',
					headers: {
						'x-ssr': [{
							key: 'X-SSR',
							value: `Prerender with path ${encodedPath}`
						}],
						'cache-control': [{
							key: 'Cache-Control',
							value: 'max-age=0',
						}],
						'content-type': [{
							key: 'Content-Type',
							value: 'text/html; charset=utf-8',
						}],
					}
				};

				try {

					const body = compressBody(result, compression);

					response = {
						...response,
						bodyEncoding: compression === null ? 'text' : 'base64',
						body,
						headers: {
							...response.headers,
							'content-encoding': [{
								key: 'Content-Encoding',
								value: compression || 'utf-8',
							}]
						}
					};

					callback(null, response);

					// callback(null, {
					//     body: `Meta rendering error: ${JSON.stringify(request, null, 2)}`,
					//     headers: {
					//         'x-ssr': [{ key: 'X-SSR', value: 'error' }],
					//     },
					//     status: 200,
					//     statusDescription: 'HTTP OK',
					// });

				} catch (error) {

					// callback(null, {
					//     ...request,
					//     headers: {
					//         ...request.headers,
					//         'x-ssr': [{
					//             key: 'X-SSR',
					//             value: `Prerender Error mode ${compression} with path ${encodedPath}`
					//         }],
					//     }
					// });
					callback(null, {
						body: `Meta rendering error: ${error}`,
						headers: {
							'x-ssr': [{
								key: 'X-SSR',
								value: 'error'
							}],
						},
						status: 200,
						statusDescription: 'HTTP OK',
					});
				}

			})
			.catch((error) => {
				callback(null, request);

				// callback(null, {
				//     body: `Meta rendering error: ${error}`,
				//     headers: {
				//         'x-ssr': [{ key: 'X-SSR', value: 'error' }],
				//     },
				//     status: 200,
				//     statusDescription: 'HTTP OK',
				// });
			});
	} else {
		callback(null, request);
	}
};
