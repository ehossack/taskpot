// The timer component
'use strict';

const moment = require('moment-timezone');
const cache = require('../cache.js');
const giphy = require('../giphy.js');
const userProvider = require('../userProvider.js');
const Promise = require('promise');
const setTimeoutPromise = require('util').promisify(setTimeout);
const timerResponses = require('./timerResponses.js');

const PREVIOUS_TIMER_USER = 'timer_set_by';
const FOUR_MIN_IN_MS = 240000;

module.exports = {
	run: run
};

/**
 * Sets the timer
 * @param {SlackResponder} slackResponder the slack responder
 * @param {object} params the params
 *		{
 *			userid: <slack user id>,
 *			username: <slack username>,
 *			steepLocation: <steeping location>
 *		}
 *	}
 *	@returns {promise} the return promise
 */
function run(slackResponder, params) {
	const userid = params.userid;
	const username = params.username;
	const steepLocation = params.steepLocation;

	const timerSetAt = moment().tz('America/Los_Angeles').unix();

	if (cache.retrieve(PREVIOUS_TIMER_USER)) {
		const previousUsername = cache.retrieve(PREVIOUS_TIMER_USER);
		const nameToDisplay = userProvider.getDisplayNameForUser(previousUsername);
		return slackResponder.directly({
			'response_type': 'ephemeral',
			'text': `Sorry, a timer was already set by ${nameToDisplay}`
		});
	}
	cache.store(PREVIOUS_TIMER_USER, userid); // mark started

	Promise.all([
		new Promise(resolve => {
			userProvider.retrieveDisplayName(userid, username)
				.then(resolve);
		}),
		new Promise(resolve => {
			giphy.call('4 minutes')
				.then(resolve)
				.catch(() => resolve(null));
		})
	]).then(arr => {
		const displayName = arr[0];
		const gif = arr[1];
		const attachment = 	{
			'fallback': '4 minute gif was displayed',
			'pretext': `${displayName} is steeping the coffee :coffee:`,
			'footer': '/giphy 4 minutes',
			'ts': timerSetAt
		};
		const responseObj = {
			'response_type': 'in_channel',
			'attachments': [
				attachment
			]
		};

		if (gif) {
			attachment.image_url = gif.url;
			attachment.thumb_url = gif.url;
		} else {
			delete attachment.footer;
		}

		slackResponder.async(responseObj);
	});

	slackResponder.ack();

	// stalePoster.ensureFreshness(params.responseUrl, userNameProvider);

	return setTimeoutPromise(FOUR_MIN_IN_MS).then(() => {
		cache.clear(PREVIOUS_TIMER_USER);

		const responseData = {
			'response_type': 'in_channel',
			'text': `*4 minutes is up!* ${timerResponses.getPhrase()}`
		};
		if (steepLocation) {
			responseData.attachments = [
				{ 'text': steepLocation }
			];
		}

		slackResponder.async(responseData);
	});
}
