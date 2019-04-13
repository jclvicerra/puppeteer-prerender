'use strict';

exports.handler = (event, context, callback) => {
	const request = event.Records[0].cf.request;

	const isFromBot= request.headers['x-prerender-token'] && request.headers['x-prerender-path']
	if (isFromBot) {

		const encodedPath = encodeURIComponent(`https://${request.headers['x-prerender-path'][0].value}`);

		request.origin = {
			custom: {
				domainName: 'prerender.realestate.sg',
				port: 443,
				protocol: 'https',
				readTimeout: 20,
				keepaliveTimeout: 5,
				customHeaders: {},
				sslProtocols: ['TLSv1', 'TLSv1.1'],
				path: `/?url=${encodedPath}`
			}
		};

		request.headers['host'] = [{ key: 'Host', value: 'prerender.realestate.sg'}];
		request['uri'] = "/";
	}

	callback(null, request);
};
