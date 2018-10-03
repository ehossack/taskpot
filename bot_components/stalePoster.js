'use strict';

const setTimeoutPromise = require('util').promisify(setTimeout);
const checks = require('../checks.js');
const client = require('../client.js');
const secrets = require('../secretsLoader.js');
const cache = require('../cache.js');
const userProvider = require('../userProvider.js');

const ONE_MIN_IN_MS = 60000;
const STALE_TIMEOUT_PROMPT = 15 * ONE_MIN_IN_MS;
const TIME_TO_RESPOND = ONE_MIN_IN_MS;
const COFFEE_IS_LEFT = 'not_drunk';

module.exports = {
	ensureFreshness: ensureFreshness,
	wasDrunk: wasDrunk
};

/**
 * Ensures that the coffee is drunk
 * @param {object} params the params
 *		{
 *			userid: <slack user id who set the timer>,
 * 			originalChannel: <originating message channel>
 *		}
 *	}
 *	@returns {promise} the return promise
 */
function ensureFreshness(params) {
	checks.areTruthy(params, params.userid, params.originalChannel);
	const userid = params.userid;
	console.log(`... ensuring freshness of coffee of ${userProvider.getDisplayNameForUser(userid)}`);

	return setTimeoutPromise(STALE_TIMEOUT_PROMPT)
	.then(() => {
		staleCoffeeForUser(userid, true);
		askIfStale(userid);

		setTimeoutPromise(TIME_TO_RESPOND).then(() => {
			if (isCoffeeStale(userid)) {
				client.doFormPost('https://slack.com/api/chat.postMessage', {
					token: secrets.getPrivateKey('SLACK_OAUTH_CODE'),
					channel: params.originalChannel,
					text: 'Remember to drink the coffee!'
				});
				staleCoffeeForUser(userid, false);
			}
		});

	});
}

function askIfStale(userid) {
	console.log(`asking ${userProvider.getDisplayNameForUser(userid)} if the coffee has been drunk...`);
	const questionData = {
		'text': 'Has the coffee been drunk?',
		'attachments': JSON.stringify([
			{
				'fallback': 'You should make sure the coffee is drunk',
				'callback_id': 'stale_timeout',
				'actions': [
					{
						'type': 'button',
						'name': 'yes_drunk',
						'text': 'Yes'
					},
					{
						'type': 'button',
						'name': COFFEE_IS_LEFT,
						'text': 'No'
					}
				]
			}
		])
	};
	dm(userid, questionData);
}

function dm(userid, data) {
	const payload = Object.assign({}, data);
	payload.token = secrets.getPrivateKey('SLACK_OAUTH_CODE');
	payload.channel = userid;
	client.doFormPost('https://slack.com/api/chat.postMessage', payload)
	.then(JSON.parse)
	.then(dmResponse => {
		if (!dmResponse.ok) {
			console.log('unsuccessful post', dmResponse);
			console.log('data');
		}
	});
}

function isCoffeeStale(userid) {
	return cache.retrieveOrDefault(key(userid), false);
}

/**
 * Indicates the coffee is drunk
 * @param {object} params the params
 *		{
 *			userid: <slack user id who set the timer>
 * 			action: action
 *		}
 *	}
 *	@returns {void}
 */
function wasDrunk(params) {
	checks.areTruthy(params, params.userid);
	checks.isTruthy(params.hasOwnProperty('action'), 'Must supply action');
	if (params.action.name !== COFFEE_IS_LEFT) {
		staleCoffeeForUser(params.userid, false);
		console.log(`${userProvider.getDisplayNameForUser(params.userid)} said the coffee was drunk`);
	} else {
		console.log(`${userProvider.getDisplayNameForUser(params.userid)} said there's coffee left!`);
	}
}

function staleCoffeeForUser(userid, setTimer) {
	if (setTimer) {
		cache.store(key(userid), true);
	} else {
		cache.clear(key(userid));
	}
}

function key(userid) {
	return `timer-stale-coffee-${userid}`;
}
