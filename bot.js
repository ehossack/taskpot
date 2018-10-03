'use strict';

const timer = require('./bot_components/timer.js');
const poller = require('./bot_components/poller.js');
const giffer = require('./bot_components/giffer.js');
const stalePoster = require('./bot_components/stalePoster.js');

module.exports = {
	doTimer: timer.run,
	doGif: giffer.gif,
	doPoll: poller.poll,
	updatePoll: poller.update,
	markCoffeeDrunk: stalePoster.wasDrunk
};
