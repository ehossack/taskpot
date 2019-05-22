
'use strict';

const AS_THEY_SAY_IN_HUB = [
	'Now I regret touching this...',
    'This is way more complicated then I expected',
    'Why was it done this way?',
    'Is there a simple way to...... oh nvm..',
    'Why do we have this test?',
    'This is a nightmare',
    'It shouldn\'t be this hard',
    'I feel things should be simpler',
    'Just another day or two',
    'Oh I forgot to cherry-pick',
    'It\'s so sad why it\'s not that easy to make it work.',
    'Can you provide some logs?',
    'I don\'t know how to name this, just gonna add Service to the end....',
    'There\'s a code cut off today?',
    'Why is this a code red?'
].map(string => `As they say in hub, "${string}"`);

const AS_THEY_SAY_IN_VIZ = [
	'Is production down?',
	'Is staging down?',
	'Deplying to production!',
	'Delete the service to restart it',
	'Demo soon, don\'t touch anything',
	'Reprocessing...',
	'What does internal server error mean?',
	'My minikube is giving me an error...',
	'Have you tried deleting it and restarting?',
].map(string => `As they say in viz, "${string}"`);

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
].concat(AS_THEY_SAY_IN_HUB).concat(AS_THEY_SAY_IN_VIZ);

module.exports = {
    getPhrase: () => TIMER_RESPONSES[Math.floor(Math.random() * TIMER_RESPONSES.length)]
};
