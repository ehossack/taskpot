'use strict';

const Promise = require('promise');
const util = require('util');
const nodeRestClient = require('node-rest-client');

module.exports = {
	doTimer: doTimer,
	doAsks: doAsks,
	doPoll: doPoll
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
const REQUEST_RECEIVED = {};

const client = new nodeRestClient.Client();
const setTimeoutPromise = util.promisify(setTimeout);

const previousInvocations = {
	inLastMinute: 0
};

function doTimer(params) {
	const user = params.urlQueryParams.user;
	const delayedResponseUrl = params.urlQueryParams.response_url;
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
	const requestUrl = `https://api.giphy.com/v1/gifs/random?tag=${text}&api_key=${GIPHY_API_KEY}`;
	return new Promise((resolve, reject) => {
		client.get(requestUrl,
			function onSuccess(data, response) {
				resolve(data.data, keywords);
			},
			function onFail(data, response) {
				reject(data, response);
			});
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
	const responseUrl = params.urlQueryParams.response_url;
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
	const user = params.urlQueryParams.user;
	const responseUrl = params.urlQueryParams.response_url;

	params.respondDirectly(REQUEST_RECEIVED);

	_callGiphy(POLL_GIPHY_TEXT).then((giphyResponse) => {
		_respondWith(responseUrl, {
			'text': 'Who wants coffee?',
			'attachments': [
				{
					'fallback': 'You should totally respond if you want coffee',
					'image_url': giphyResponse.fixed_height_downsampled_url,
					'thumb_url': giphyResponse.fixed_height_downsampled_url,
					'text': params.pollText,
					'footer': '/giphy \'who wants coffee\'',
					'actions': [
						{
							'type': 'button',
							'name': 'yes_i_want_coffee',
							'text': 'Me!',
							'url': `taskpot.hossack.me/record-response?url=${responseUrl}`
						}
					],
					'fields': [
						{
							'title': 'wants taskpot',
							'value': `${user}`,
							'short': false
						}
					]
				}
			]
		});
	});
}

