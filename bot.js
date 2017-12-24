'use strict';

const Promise = require('promise');
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
const REQUEST_RECEIVED = undefined;

const setTimeoutPromise = util.promisify(setTimeout);

const previousInvocations = {
	inLastMinute: 0
};

const client = {
	doGet: (url) => {
		return rp({
			uri: url,
			headers: {
				'User-Agent': 'Request-Promise'
			},
			json: true
		});
	},
	doPost: (url, payload, urlencoded) => {
		const isJson = urlencoded !== 'urlencoded';
		return rp({
			method: 'POST',
			uri: url,
			headers: {
				'User-Agent': 'Request-Promise',
				'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded'
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

	params.respondDirectly(REQUEST_RECEIVED);
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
	}).catch((reason) => {

		_respondWith(delayedResponseUrl, {
			'response_type': 'in_channel',
			'attachments': [
				{
					'pretext': `${user} is steeping the coffee :coffee:`,
					'ts': Date.now()
				}
			]
		});

	});

	return setTimeoutPromise(240000).then(() => {
		const randomPhrase = TIMER_RESPONSES[Math.floor(Math.random()*TIMER_RESPONSES.length)];
		const responseData = {
			'response_type': 'in_channel',
			'text': randomPhrase
		};
		if (params.steepLocation) {
			responseData['attachments'] = [
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

function _respondWith(requestUrl, obj) {
	return new Promise((resolve, reject) => {
		client.post(requestUrl, {
			headers: { 'Content-Type': 'application/json' },
			data: obj
		}, function onReply(requestData, response) {
			resolve(requestData, response);
		});
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
	params.respondDirectly(REQUEST_RECEIVED);

	_getPerson(params.user).then((personData) => {
		let name = params.user;
		if(personData.ok) {
			name = personData.user.profile.real_name;
		}
		_respondWithPollGif(name, params);
	}).catch((err) => {
		_respondWithPollGif(params.user, params);
	});
}

function _getPerson(username) {
	return client.doPost('https://slack.com/api/users.info', {
		user: username,
		token: 'xoxp-2161696051-46847412978-290950186915-f3d376610a1e43f25d9bc1ad1f22d99b'
	}, 'urlencoded');
}

function _respondWithPollGif(user, params) {
	const responseUrl = params.responseUrl;

	let attachment = {
		'fallback': 'You should totally respond if you want coffee',
		'text': params.pollText,
		'footer': '/giphy \'who wants coffee\'',
		'actions': [
			{
				'type': 'button',
				'name': 'yes_i_want_coffee',
				'text': 'Me!',
				'url': `http:/taskpot.hossack.me/record-response?url=${responseUrl}`
			}
		],
		'fields': [
			{
				'title': 'wants taskpot',
				'value': `${user}`,
				'short': false
			}
		]
	};
	const responseObj = {
		'text': 'Who wants coffee?',
		'attachments': [
			attachment
		]
	};

	_callGiphy(POLL_GIPHY_TEXT).then((giphyResponse) => {
		attachment.image_url = giphyResponse.fixed_height_downsampled_url;
		attachment.thumb_url = giphyResponse.fixed_height_downsampled_url;

		client.doPost(responseUrl, responseObj);
	}).catch((err) => {
		console.log('giphy request failed!!');
		console.log(err);
		client.doPost(responseUrl, responseObj);
	});
}

function updatePoll(params) {

}