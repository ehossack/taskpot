// for asking and giph logic
'use strict';

const giphy = require('../giphy.js');
const userProvider = require('../userProvider.js');
const Promise = require('promise');

module.exports = {
    gif: gif
};

/**
 * Responds with a gif.
 * @param {SlackResponder} slackResponder the slack responder
 * @param {object} params the params
 *		{
 *			inputText: <some input text>,
 * 			userid: <id of posting user>,
 * 			[username]: <username of user>
 *		}
 *	}
 * @returns {void}
 */
function gif(slackResponder, params) {
	const checks = require('../checks.js');
	checks.areTruthy(params, params.inputText, params.userid);
	const keywords = params.inputText;

	Promise.all([
		new Promise(resolve => {
			userProvider.retrieveDisplayName(params.userid, params.username)
				.then(resolve);
		}),
		new Promise(resolve => {
			giphy.call(keywords)
				.then(resolve)
				.catch(() => resolve(null));
		})
	])
	.then(arr => {
		const displayName = arr[0];
		const response = arr[1];
		if (!response) {
			slackResponder.async({
				'response_type': 'ephemeral',
				'text': `No matches on "${keywords}"!`
			});
		}
		slackResponder.async({
			'response_type': 'in_channel',
			'text': '',
			'attachments': [
				{
					'fallback': `I had nothing to say about ${keywords}`,
					'title': `${keywords}`,
					'title_link': response.giphy_url,
					'image_url': response.url,
					'thumb_url': response.url,
					'footer': `Posted by ${displayName} using giphy`
				}
			]
		});
	});

	slackResponder.ack();
}
