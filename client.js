'use strict';

const URL_ENCODED = 'urlencoded';
const rp = require('request-promise');

module.exports = {
	URL_ENCODED: URL_ENCODED,
	doGet: (url) => {
		return rp({
			uri: url,
			headers: {
				'User-Agent': 'Request-Promise',
				'Accept': 'application/json'
			},
			json: true
		});
	},
	doPost: (url, payload, urlencoded) => {
		const isJson = (urlencoded !== URL_ENCODED);
		return rp({
			method: 'POST',
			uri: url,
			headers: {
				'User-Agent': 'Request-Promise',
				'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded',
				'Accept': 'application/json'
			},
			body: isJson ? payload : undefined,
			form: isJson ? undefined : payload,
			json: !!isJson
		});
	},
	doFormPost: (url, payload) => this.doPost(url, payload, URL_ENCODED)
};
