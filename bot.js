'use strict';

const timer = require('./bot_components/timer.js');
const poller = require('./bot_components/poller.js');
const asker = require('./bot_components/asker.js');
const stalePoster = require('./bot_components/stalePoster.js');

module.exports = {
	doTimer: timer.run,
	doGif: asker.gif,
	doPoll: poller.poll,
	updatePoll: poller.update,
	markCoffeeDrunk: stalePoster.wasDrunk
};
