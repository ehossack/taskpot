'use strict';

// const Promise = require('promise');
const util = require('util');
const rp = require('request-promise');

const INTERACTIVE_URL = '/record-response';

module.exports = {
	doTimer: doTimer,
	doAsks: doAsks,
	doPoll: doPoll,
	updatePoll: updatePoll,
	INTERACTIVE_URL: INTERACTIVE_URL
};

const POLL_GIPHY_TEXT = 'who wants coffee';
const TIMER_RESPONSES = [
	'Coffee is ready!',
	'Pasktot for all!',
	'The nector has been produced',
	'Drink ye, all who require me',
	'Brew complete',
	'Ready to work!',
	'It\'s time for caffeine biscuitheads!!',
	'André drinks?',
	'~Tasktop~ Taskpot is ready',
	'Time\'s up! PLUNGE ME',
	'There\'s a _pressing_ issue to solve'
];
const GIPHY_API_KEY = 'Jkh4yX4p203mgi9ThU7ALmKjndryogfK';
const REQUEST_RECEIVED = '';

const setTimeoutPromise = util.promisify(setTimeout);

// eslint-disable-next-line no-unused-vars
const previousInvocations = {
	inLastMinute: 0
};

const client = {
	URL_ENCODED: 'urlencoded',
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
		const isJson = (urlencoded !== client.URL_ENCODED);
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
	}
};

function doTimer(params) {
	const user = params.user;
	const delayedResponseUrl = params.responseUrl;
	const timerSetAt = Date.now();

	// params.respondDirectly(REQUEST_RECEIVED);
	// TODO: check invocations

	_callGiphy('4 minutes').then((giphyResponse) => {

		_respondWith(delayedResponseUrl, {
			'response_type': 'in_channel',
			'attachments': [
				{
					'fallback': '4 minute gif was displayed',
					'pretext': `${user} is steeping the coffee :coffee:`,
					'image_url': giphyResponse.fixed_height_downsampled_url,
					'thumb_url': giphyResponse.fixed_height_downsampled_url,
					'footer': '/giphy 4 minutes',
					'ts': timerSetAt
				}
			]
		});
	}).catch(() => {

		_respondWith(delayedResponseUrl, {
			'response_type': 'in_channel',
			'attachments': [
				{
					'pretext': `${user} is steeping the coffee :coffee:`,
					'ts': timerSetAt
				}
			]
		});

	});

	return setTimeoutPromise(240000).then(() => {
		const randomPhrase = TIMER_RESPONSES[Math.floor(Math.random() * TIMER_RESPONSES.length)];
		const responseData = {
			'response_type': 'in_channel',
			'text': randomPhrase
		};
		if (params.steepLocation) {
			responseData.attachments = [
				{ 'text': params.steepLocation }
			];
		}

		_respondWith(delayedResponseUrl, responseData);
	});
}

/*
e.g. giphy who wants coffee

	{
	data: {
		type: "gif",
		id: "vja3eL2uSMKWs",
		url: "http://giphy.com/gifs/vja3eL2uSMKWs",
		image_original_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/giphy.gif",
		image_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/giphy.gif",
		image_mp4_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/giphy.mp4",
		image_frames: "63",
		image_width: "608",
		image_height: "312",
		fixed_height_downsampled_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/200_d.gif",
		fixed_height_downsampled_width: "390",
		fixed_height_downsampled_height: "200",
		fixed_width_downsampled_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/200w_d.gif",
		fixed_width_downsampled_width: "200",
		fixed_width_downsampled_height: "103",
		fixed_height_small_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100.gif",
		fixed_height_small_still_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100_s.gif",
		fixed_height_small_width: "195",
		fixed_height_small_height: "100",
		fixed_width_small_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100w.gif",
		fixed_width_small_still_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100w_s.gif",
		fixed_width_small_width: "100",
		fixed_width_small_height: "51",
		username: "",
		caption: ""
	},
	meta: {
			status: 200,
			msg: "OK",
			response_id: "5a3ad6cc636b373859579259"
		}
	}
 */
function _callGiphy(keywords) {
	const text = encodeURI(keywords);
	return client.doGet(`https://api.giphy.com/v1/gifs/random?tag=${text}&api_key=${GIPHY_API_KEY}`)
		.then((wrappedData) => {
			return wrappedData.data;
		});
}

function doAsks(params) {
	const responseUrl = params.responseUrl;
	const keywords = getQuotedKeywords(params.inputText);
	if (!keywords) {
		return params.respondDirectly({
			'response_type': 'ephemeral',
			'text': 'you need to quote your ask with “like this”!'
		});
	}

	params.respondDirectly(REQUEST_RECEIVED);

	_callGiphy(keywords, (giphyResponse) => {
		_respondWith(responseUrl, {
			'response_type': 'in_channel',
			'attachments': [
				{
					'fallback': `I had nothing to say about ${keywords}`,
					'title': `${keywords}`,
					'title_link': giphyResponse.image_url,
					'image_url': giphyResponse.fixed_height_downsampled_url,
					'thumb_url': giphyResponse.fixed_height_downsampled_url,
					'footer': 'Posted using giphy'
				}
			]
		});
	});
}

function getQuotedKeywords(inputText) {
	if (!inputText.startsWith('“') && !inputText.startsWith('"')) {
		return null;
	}
	return inputText.replace(/“/i, '').replace(/”/i, '').replace(/"/g, '');
}

function doPoll(params) {
	_getPerson(params.user.id).then((personData) => {
		const name = _getName(personData, params.user.name, params.user.id);
		_respondWithPollGif(name, params);
	}).catch(() => {
		_respondWithPollGif(params.user.name, params);
	});

	params.respondDirectly(REQUEST_RECEIVED);
}

function _getPerson(userId) {
	return client.doPost('https://slack.com/api/users.profile.get', {
		user: userId,
		token: 'xoxp-2161696051-46847412978-290950186915-f3d376610a1e43f25d9bc1ad1f22d99b'
	}, client.URL_ENCODED).then((unwrappedData) => {
		return JSON.parse(unwrappedData);
	});
}

function _getName(personData, user, userId) {
	let name = `@${user}`;
	if (personData.ok) {
		name = personData.profile.first_name;
	} else {
		console.log(`requesting ${name}'s real name (id ${userId}) failed`);
		console.log(personData);
	}
	return name;
}

function _respondWithPollGif(userName, params) {
	const responseUrl = params.responseUrl;

	_callGiphy(POLL_GIPHY_TEXT).then((giphyResponse) => {
		client.doPost(responseUrl, _makePollPayload(params.pollText,
													userName,
													giphyResponse.fixed_height_downsampled_url));
	}).catch((err) => {
		console.log('giphy request failed!!');
		console.log(err);
		client.doPost(responseUrl, _makePollPayload(params.pollText, userName));
	});
}

function _makePollPayload(pollText, user, gifUrl) {
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

function updatePoll(params) {
	_getPerson(params.newUser.id).then((personData) => {
		const name = _getName(personData, params.newUser.name, params.newUser.id);
		_updateAndRespond(params.responseUrl, params.originalMessage, name);
	}).catch(() => {
		_updateAndRespond(params.responseUrl, params.originalMessage, params.newUser.name);
	});

	params.respondDirectly(REQUEST_RECEIVED);
}

function _updateAndRespond(url, originalMessage, name) {
	const wantsTaskpot = originalMessage.attachments[0].fields[0];
	const value = wantsTaskpot.value;
	if (value.indexOf(name) > -1) {
		return;
	}
	wantsTaskpot.value = `${value}, ${name}`;
	client.doPost(url, originalMessage);
}
