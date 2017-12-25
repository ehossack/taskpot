'use strict';

const util = require('util');
const rp = require('request-promise');
const storage = require('node-persist');
const Promise = require('promise');

const INTERACTIVE_URL = '/record-response';

module.exports = {
	clearStorage: clearStorage,
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

storage.initSync();

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

function clearStorage() {
	console.log('clearing storage...');
	storage.clearSync();
	console.log('done');
}

function doTimer(params) {
	const user = params.user;
	const timerSetAt = Date.now();
	const setBy = storage.getItemSync('timer_set_by');

	if (!!setBy) {
		const cachedName = storage.getItemSync(setBy) || setBy;
		return params.respondDirectly({
			'response_type': 'ephemeral',
			'text': `Sorry, a timer was already set by ${cachedName}`
		});
	}
	storage.setItemSync('timer_set_by', user.name);

	Promise.all([
		new Promise(resolve => {
			_getPerson(user)
				.then(resolve)
				.catch(() => {
					resolve(user.name);
				});
		}),
		new Promise(resolve => {
			_callGiphy('4 minutes')
				.then(resolve)
				.catch(() => {
					resolve(null);
				});
		})
	]).then(arr => {
		console.log(arr);
		const username = arr[0];
		const giphyResponse = arr[1];
		const attachment = 	{
			'fallback': '4 minute gif was displayed',
			'pretext': `${username} is steeping the coffee :coffee:`,
			'footer': '/giphy 4 minutes',
			'ts': timerSetAt
		};
		const responseObj = {
			'response_type': 'in_channel',
			'attachments': [
				attachment
			]
		};

		if (giphyResponse) {
			attachment.image_url = giphyResponse.fixed_height_downsampled_url;
			attachment.thumb_url = giphyResponse.fixed_height_downsampled_url;
		} else {
			delete attachment.footer;
		}

		client.doPost(params.responseUrl, responseObj);
	});

	params.respondDirectly(REQUEST_RECEIVED);

	return setTimeoutPromise(240000).then(() => {
		storage.removeItemSync('timer_set_by');

		const randomPhrase = TIMER_RESPONSES[Math.floor(Math.random() * TIMER_RESPONSES.length)];
		const responseData = {
			'response_type': 'in_channel',
			'text': `*4 minutes is up!* ${randomPhrase}`
		};
		if (params.steepLocation) {
			responseData.attachments = [
				{ 'text': params.steepLocation }
			];
		}

		client.doPost(params.responseUrl, responseData);
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

	_callGiphy(keywords).then((giphyResponse) => {
		client.doPost(responseUrl, {
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

	params.respondDirectly(REQUEST_RECEIVED);
}

function getQuotedKeywords(inputText) {
	if (!inputText.startsWith('“') && !inputText.startsWith('"')) {
		return null;
	}
	return inputText.replace(/“/i, '').replace(/”/i, '').replace(/"/g, '');
}

function doPoll(params) {
	_getPerson(params.user).then((username) => {
		_respondWithPollGif(username, params);
	}).catch(() => {
		_respondWithPollGif(params.user.name, params);
	});

	params.respondDirectly(REQUEST_RECEIVED);
}

function _getPerson(user) {
	const cachedName = storage.getItemSync(user.name);
	if (cachedName) {
		console.log(`found ${user.name} in cache: ${cachedName}`);
		return cachedName;
	}
	return client.doPost('https://slack.com/api/users.profile.get', {
							user: user.id,
							token: 'xoxp-2161696051-46847412978-290950186915-f3d376610a1e43f25d9bc1ad1f22d99b'
						}, client.URL_ENCODED)
		.then((unwrappedData) => {
			const data = JSON.parse(unwrappedData);

			let name = `@${user.name}`;
			if (data.ok) {
				name = data.profile.first_name;
				storage.setItemSync(user.name, name);
			} else {
				console.log(`requesting ${name}'s real name (id ${user.id}) failed`);
				console.log(data);
			}
			return name;
		});
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
	_getPerson(params.newUser.id).then((username) => {
		_updateAndRespond(params.responseUrl, params.originalMessage, username);
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
