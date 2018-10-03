// for asking and giph logic
'use strict';

const giphy = require('../giphy.js');

module.exports = {
    gif: gif
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
function gif(slackResponder, params) {
    const keywords = params.inputText;
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
