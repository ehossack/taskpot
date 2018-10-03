// for asking and giph logic
'use strict';

const giphy = require('../giphy.js');

module.exports = {
    ask: ask
};

/**
 * Responds with a gif.
 * @param {SlackResponder} slackResponder the slack responder
 * @param {object} params the params
 *		{
 *			inputText: <some input text>
 *		}
 *	}
 * @returns {void}
 */
function ask(slackResponder, params) {
	const keywords = getQuotedKeywords(params.inputText);
	if (!keywords) {
		return slackResponder.directly({
			'response_type': 'ephemeral',
			'text': 'you need to quote your ask with “like this”!'
		});
	}
    giphy.call(keywords)
    .then(response => {
		slackResponder.async({
			'response_type': 'in_channel',
			'attachments': [
				{
					'fallback': `I had nothing to say about ${keywords}`,
					'title': `${keywords}`,
					'title_link': response.giphy_url,
					'image_url': response.url,
					'thumb_url': response.url,
					'footer': 'Posted using giphy'
				}
			]
		});
	});

	slackResponder.ack();
}

function getQuotedKeywords(inputText) {
	if (!inputText.startsWith('“') && !inputText.startsWith('"')) {
		return null;
	}
	return inputText.replace(/“/i, '').replace(/”/i, '').replace(/"/g, '');
}
