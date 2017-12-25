'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

const bot = require('./bot.js');

const WEBFACTION_PORT = 13323;

app.post('/', (request, response) => {
	try {
		const payload = request.body;

		if (!payload || !payload.user_name) {
			return _sendError(response);
		}

		const commandText = payload.text;
		const user = {
			name: payload.user_name,
			id: payload.user_id
		};
		console.log('request: @' + user.name + ' sent "/taskpot ' + payload.text + '"');

		if (commandText.startsWith('timer')) {
			return bot.doTimer({
				respondDirectly: _respondWith(response),
				steepLocation: _getLocation(commandText),
				user: user,
				responseUrl: payload.response_url
			});
		} else if (commandText.startsWith('asks')) {
			return bot.doAsks({
				respondDirectly: _respondWith(response),
				inputText: commandText.substring('asks '.length),
				responseUrl: payload.response_url
			});
		} else {
			return bot.doPoll({
				respondDirectly: _respondWith(response),
				pollText: commandText,
				user: user,
				responseUrl: payload.response_url
			});
		}
	} catch (err) {
		console.error(err);
		return _sendError(response);
	}
});

function _sendError(response) {
	response.statusCode = 500;
	return response.json({
		'response_type': 'ephemeral',
		'text': 'Oops there was an error'
	});
}

function _respondWith(response) {
	return (input) => {
		response.statusCode = 200;
		if (typeof input === 'object') {
			response.json(input);
		} else {
			response.end(input);
		}
	};
}

function _getLocation(commandText) {
	if (commandText.indexOf(' ') === -1) {
		return null;
	}
	return commandText.substring('timer '.length);
}

app.post(bot.INTERACTIVE_URL, (request, response) => {
	const payload = JSON.parse(request.body.payload);
	console.log(`@${payload.user.name} clicked the poll button`);

	try {
		return bot.updatePoll({
			respondDirectly: _respondWith(response),
			responseUrl: payload.response_url,
			originalMessage: payload.original_message,
			newUser: payload.user
		});
	} catch (err) {
		console.error(err);
		return _sendError(response);
	}
});

app.listen(WEBFACTION_PORT, (err) => {
	bot.clearStorage();
	if (err) {
		return console.log('something bad happened', err);
	}

	console.log(`server is listening on ${WEBFACTION_PORT}`);
});
