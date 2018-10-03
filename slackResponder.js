'use strict';
// means to respond to slack:
// See api docs: https://api.slack.com/slash-commands#responding_to_commands

const client = require('./client.js');
const checks = require('./checks.js');
const secretsLoader = require('./secretsLoader.js');

class SlackResponder {

	static setSlackTokens() {
		if (!secretsLoader.getPrivateKey('SLACK_OAUTH_CODE')) {
			throw Error('App currently does not support proper OAuth');
		}
	}

	constructor(directFn, asyncUrl, debugEnabled) {
		checks.areTruthy(directFn, asyncUrl);
		this.directFn = directFn;
		this.asyncUrl = asyncUrl;
		this.debugEnabled = debugEnabled;
		if (this.debugEnabled) {
			console.log('Create responder responding to', asyncUrl);
		}
	}

	/**
	 * Acknowledeges the response
	 */
	ack() {
		this.directFn('');
	}

	/**
	 * Directly responds with a string or object.
	 * @param {object} responseObject response object, or string
	 */
	directly(responseObject) {
		this.directFn(responseObject);
	}

	/**
	 * Responds to the interactive command url with the object.
	 * @async
	 * @param {object} responseObject response object
	 * @returns {Promise} a promise
	 */
	async(responseObject) {
		if (this.debugEnabled) {
			console.log(`Async response to ${this.asyncUrl}`);
			console.log(JSON.stringify(responseObject));
		}
		return client.doPost(this.asyncUrl, responseObject);
	}
}

module.exports = SlackResponder;
