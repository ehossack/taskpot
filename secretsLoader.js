'use strict';

const fs = require('fs');
const SECRETS_FILE = 'secrets.json';

let loadedObj = undefined;

module.exports = {
	getPrivateKey: (keyName) => {
		loadSecrets();

		if (loadedObj[keyName]) {
			return loadedObj[keyName];
		}
		if (!process.env[keyName]) {
			throw new Error(`Missing ${SECRETS_FILE} value or environment variable for ${keyName}`);
		}
		return process.env[keyName];
	},

	setPrivateKey: (keyName) => {
		loadSecrets();

		if (loadedObj[keyName]) {
			console.log(`Replacing previously stored value for ${keyName}, ${loadedObj[keyName]}`);
		}
		loadedObj[keyName] = keyName;
	}
};

function loadSecrets() {
	if (!loadedObj) {
		const jsonSecrets = JSON.parse(fs.readFileSync(`./${SECRETS_FILE}`, 'utf8'));
		console.log(`Loaded values from ${SECRETS_FILE}`);
		loadedObj = jsonSecrets;
	}
}
