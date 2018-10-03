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
const ONE_MIN_IN_MS = 60000;
const FOUR_MIN_IN_MS = ONE_MIN_IN_MS * 4;

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
 *			timerOpts: <double time or, steeping location>
 *		}
 *	}
 *	@returns {promise} the return promise
 */
function run(slackResponder, params) {
	const userid = params.userid;
	const username = params.username;
	const parseTime = computeParseTime(params.timerOpts);
	const gifText = `${parseTime / ONE_MIN_IN_MS} minutes`;
	const steepLocation = computeSteepLocation(params.timerOpts);

	if (parseTime < 0.1) {
		return slackResponder.directly({
			'response_type': 'ephemeral',
			'text': 'Sorry, that is too short a time'
		});
	}

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
			giphy.call(gifText)
				.then(resolve)
				.catch(() => resolve(null));
		})
	]).then(arr => {
		const displayName = arr[0];
		const gif = arr[1];
		const attachment = 	{
			'fallback': `${gifText} gif was displayed`,
			'pretext': `${displayName} is steeping the coffee :coffee:`,
			'footer': `/giphy ${gifText}`,
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

	console.log(`Setting a time for ${parseTime / ONE_MIN_IN_MS} minutes...`);
	return setTimeoutPromise(parseTime).then(() => {
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

function computeParseTime(possibleDoubleString) {
	const asNumber = parseFloat(possibleDoubleString);
	if (isNaN(asNumber) || asNumber > 4) {
		return FOUR_MIN_IN_MS;
	}
	return asNumber.toPrecision(3) * ONE_MIN_IN_MS;
}

function computeSteepLocation(possibleSteepLocation) {
	if (possibleSteepLocation && Number.isNaN(possibleSteepLocation)) {
		return possibleSteepLocation;
	}
	return null;
}