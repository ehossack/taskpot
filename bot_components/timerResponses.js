
'use strict';

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
	'There\'s a _pressing_ issue to solve',
	':vuvuzela: tasktoot :vuvuzela:',
	':vuvuzela: :taskpot: :vuvuzela:',
	':postal_horn: :groovy: :postal_horn:',
	':ci: Enjoy a tender moment with a pot of task :ci:',
	'Thanks @andre.bakker'
];

module.exports = {
    getPhrase: () => TIMER_RESPONSES[Math.floor(Math.random() * TIMER_RESPONSES.length)]
};
