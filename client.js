'use strict';

const URL_ENCODED = 'urlencoded';
const rp = require('request-promise');

module.exports = {
	URL_ENCODED: URL_ENCODED,
	doGet: doGet,
	doPost: doPost,
	doFormPost: doFormPost
};

function doGet(url) {
	return rp({
		uri: url,
		headers: {
			'User-Agent': 'Request-Promise',
			'Accept': 'application/json'
		},
		json: true
	});
}

function doPost(url, payload, urlencoded) {
	const isJson = (urlencoded !== URL_ENCODED);
	return rp({
		method: 'POST',
		uri: url,
		headers: {
			'User-Agent': 'Request-Promise',
			'Content-Type': isJson ? 'application/json; charset=utf-8' : 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		body: isJson ? payload : undefined,
		form: isJson ? undefined : payload,
		json: isJson
	});
}

function doFormPost(url, payload) {
	return doPost(url, payload, URL_ENCODED);
}
