'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

const bot = require('./bot.js');
const cache = require('./cache.js');
const SlackResponder = require('./slackResponder.js');

const WEBFACTION_PORT = 13323;
const INTERACTIVE_POLL_URL = '/record-response';

SlackResponder.setSlackTokens();

app.post('/', (request, response) => {
	try {
		const payload = request.body;

		if (!payload || !payload.user_name) {
			return _sendError(response);
		}

		const allCommand = (payload.text || '');
		const parts = allCommand.split(' ');
		if (parts.length < 1) {
			return _sendError(response);
		}
		const command = parts[0];
		const commandText = parts.slice(1).join(' ');

		const params = {
			username: payload.user_name,
			userid: payload.user_id
		};
		const logName = params.username ? `@${params.username}` : params.userid;
		console.log(`request: ${logName} sent "/taskpot ${allCommand}" (command: '${command}', text: '${commandText}')`);

		const responder = new SlackResponder(_respondWith(response), payload.response_url);

		if (command === 'timer') {
			console.log('calling timer');
			params.steepLocation = commandText;
			return bot.doTimer(responder, params);
		} else if (command === 'asks') {
			console.log('calling gif');
			return bot.doAsks(responder, {
				inputText: commandText
			});
		} else {
			console.log('polling');
			params.pollText = commandText;
			return bot.doPoll(responder, params);
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

app.post(INTERACTIVE_POLL_URL, (request, response) => {
	const payload = JSON.parse(request.body.payload);

	const params = {
		username: payload.user.name,
		userid: payload.user.id
	};
	const logName = params.username ? `@${params.username}` : params.userid;
	console.log(`request: ${logName} clicked the poll button`);

	const responder = new SlackResponder(_respondWith(response), payload.response_url);

	try {
		return bot.updatePoll(responder, {
			originalMessage: payload.original_message,
			newUserid: params.userid,
			newUsername: params.username
		});
	} catch (err) {
		console.error(err);
		return _sendError(response);
	}
});

app.listen(WEBFACTION_PORT, (err) => {
	cache.clearAll();
	if (err) {
		return console.log('something bad happened', err);
	}

	console.log(`server is listening on ${WEBFACTION_PORT}`);
});
