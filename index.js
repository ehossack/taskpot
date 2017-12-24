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


const server = http.createServer((request, response) => {;
	response.setHeader('Content-Type', 'application/json');
	function respondDirectly (obj) {
		response.end(JSON.stringify(obj));
	}

	try {
		const queryParams = url.parse(request.url, true).query;
		console.log(request.url);

		if(!queryParams || !queryParams.user_name) {
			return response.end(ERR_RESPONSE);
		}

		if(request.url.startsWith(bot.INTERACTIVE_URL)) {
			console.log('updating poll!');
			return bot.updatePoll({
				respondDirectly: respondDirectly,
				user: queryParams.user_name,
				responseUrl: queryParams.response_url,
				params: queryParams
			});
		}

		const commandText = queryParams.text;
		console.log('request: @'+queryParams.user_name+' sent "/taskpot ' + queryParams.text + '"');

		if (commandText.startsWith('timer')) {
			return bot.doTimer({
				respondDirectly: respondDirectly,
				steepLocation: getLocation(commandText),
				user: queryParams.user_name,
				responseUrl: queryParams.response_url
			});
		} else if (commandText.startsWith('asks')) {
			return bot.doAsks({
				respondDirectly: respondDirectly,
				inputText: commandText.substring('asks '.length),
				responseUrl: queryParams.response_url
			});
		} else {
			return bot.doPoll({
				respondDirectly: respondDirectly,
				pollText: commandText,
				user: queryParams.user_name,
				responseUrl: queryParams.response_url
			});
		}

	}
	catch (err) {
		console.error(err);
		return response.end(ERR_RESPONSE);
	}
});

server.listen(WEBFACTION_PORT, '127.0.0.1', (err) => {
	if (err) {
		return console.log('something bad happened', err);
	}

	console.log(`server is listening on ${WEBFACTION_PORT}`);
});

function getLocation(commandText) {
	if (commandText.indexOf(' ') === -1) {
		return null;
	}
	return commandText.substring('timer '.length);
}
