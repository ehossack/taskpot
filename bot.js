'use strict';

const timer = require('./bot_components/timer.js');
const poller = require('./bot_components/poller.js');
const asker = require('./bot_components/asker.js');

module.exports = {
	doTimer: timer.run,
	doAsks: asker.ask,
	doPoll: poller.poll,
	updatePoll: poller.update
};
