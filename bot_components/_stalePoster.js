
const util = require('util');
const client = require('./client.js');

const STALE_TIMEOUT_PROMPT = 900000;
const STALE_TIMEOUT = 1200000;

const setTimeoutPromise = util.promisify(setTimeout);

module.exports = {
	ensureFreshness: makeSureCoffeeIsntStale
};

function makeSureCoffeeIsntStale(responseUrl, responseData) {
	setTimeoutPromise(STALE_TIMEOUT_PROMPT).then(() => {
		const responseData = {
			'response_type': 'ephemeral',
			'attachments': [
				{
					'fallback': 'You should make sure the coffee is drunk',
					'callback_id': 'stale_timeout',
					'text': 'Has the coffee been drunk?',
					'actions': [
						{
							'type': 'button',
							'name': 'yes_drunk',
							'text': 'Yes'
						},
						{
							'type': 'button',
							'name': 'not_drunk',
							'text': 'No'
						}
					]
				}
			]
		}
		client.doPost(responseUrl, responseData);
	});
}