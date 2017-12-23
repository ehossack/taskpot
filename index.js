'use strict';

const Promise = require('promise');
const http = require('http');
const url = require('url');
const bot = require('./bot.js');

const WEBFACTION_PORT = 13323;
const ERR_RESPONSE = JSON.stringify({
	'response_type': 'ephemeral',
	'text': 'Oops there was an error'
});


const server = http.createServer((request, response) => {
	// console.log(request);
	response.setHeader('Content-Type', 'application/json');
	function respondDirectly (obj) {
		response.end(JSON.stringify(obj));
	}

	silently(() => {
		// TODO: update poll

		const queryParams = url.parse(request.url, true).query;
		const commandText = queryParams.text;

		console.log('request: @'+queryParams.user_name+' sent "/taskpot ' + queryParams.text + '"');

		if (queryParams.user !== 'etienneh') {
			return respondDirectly({
				'text':'down for maintenance'
			});
		}

		if (commandText.startsWith('timer')) {
			return bot.doTimer({
				respondDirectly: respondDirectly,
				steepLocation: getLocation(commandText),
				urlQueryParams: queryParams
			});
		} else if (commandText.startsWith('asks')) {
			return bot.doAsks({
				respondDirectly: respondDirectly,
				inputText: commandText.substring('asks '.length)
			});
		} else {
			return bot.doPoll({
				respondDirectly: respondDirectly,
				pollText: commandText
			});
		}


	}).catch((thrownError) => {
		console.error(thrownError);
		return response.end(ERR_RESPONSE);
	});
});

server.listen(WEBFACTION_PORT, '127.0.0.1', (err) => {
	if (err) {
		return console.log('something bad happened', err);
	}

	console.log(`server is listening on ${WEBFACTION_PORT}`);
});

function silently(fn, thisArg) {
	// const originalArguments = Array.from(arguments).slice(3);

	return new Promise((resolve, reject) => {
		try {
			const result = fn.apply(thisArg || this);
			resolve(result);
		} catch (err) {
			reject(err);
		}
	});
}

function getLocation(commandText) {
	if (commandText.indexOf(' ') === -1) {
		return null;
	}
	return commandText.substring('timer '.length);
}
