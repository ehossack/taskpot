'use strict';

const userProvider = require('../userProvider.js');
const giphy = require('../giphy.js');

const POLL_GIPHY_TEXT = 'who wants coffee';

module.exports = {
    poll: poll,
    update: update
};

/**
 * Creates a poll
 * @param {SlackResponder} slackResponder the slack responder
 * @param {object} params the params
 *		{
 *			userid: <slack user id>,
 *			username: <slack username>
 *		}
 *	}
 */
function poll(slackResponder, params) {
    userProvider.retrieveDisplayName(params.userid, params.username)
    .then(displayName => {
        giphy.call(POLL_GIPHY_TEXT).then(giphyResponse => {
            slackResponder.async(makePollPayload(params.pollText,
                                                 displayName,
                                                 giphyResponse.url));
        }).catch((err) => {
            console.log('giphy request failed!!');
            console.log(err);
            slackResponder.async(makePollPayload(params.pollText, displayName));
        });
    });

	slackResponder.ack();
}

function makePollPayload(pollText, user, gifUrl) {
	const userString = user.replace(',',', ');
	const payload = {
		'text': 'Who wants coffee?',
		'response_type': 'in_channel',
		'attachments': [
			{
				'fallback': 'You should totally respond if you want coffee',
				'callback_id': 'coffee_poll',
				'text': `${pollText}`,
				'footer': '/giphy \'who wants coffee\'',
				'actions': [
					{
						'type': 'button',
						'name': 'yes_i_want_coffee',
						'text': 'Me!'
					}
				],
				'fields': [
					{
						'title': 'wants taskpot:',
						'value': `${userString}`,
						'short': false
					}
				]
			}
		]
	};
	if (gifUrl) {
		const attachment = payload.attachments[0];
		attachment.image_url = gifUrl;
		attachment.thumb_url = gifUrl;
		attachment.actions[0].url += `&gif=${gifUrl}`;
	}
	return payload;
}

/**
 * Updates the poll
 * @param {SlackResponder} slackResponder the slack responder
 * @param {object} params the params
 *		{
            originalMessage: <original message>,
 *			newUserid: <slack user id>,
 *			newUsername: <slack username>
 *		}
 *	}
 */
function update(slackResponder, params) {
	userProvider.retrieveDisplayName(params.newUserid, params.newUsername)
    .then(displayName => updateAndRespond(slackResponder, params.originalMessage, displayName));

	slackResponder.ack();
}

function updateAndRespond(slackResponder, originalMessage, displayName) {
	const wantsTaskpot = originalMessage.attachments[0].fields[0];
	const value = wantsTaskpot.value;
	if (value.indexOf(displayName) > -1) {
		return;
	}
	wantsTaskpot.value = `${value}, ${displayName}`;
	slackResponder.async(originalMessage);
}
