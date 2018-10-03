// defines a cache
'use strict';

const storage = require('node-persist');
storage.initSync();

module.exports = {
	clearAll: () => {
		console.log('clearing storage...');
		storage.clearSync();
		console.log('done');
	},
	clear: (key) => storage.removeItemSync(key),
	store: (key, val) => storage.setItemSync(key, val),
	retrieve: (key) => storage.getItemSync(key),
	retrieveOrDefault: (key, defaultValue) => storage.getItemSync(key) || defaultValue,
	retrieveOrLoad: (key, loadFn) => {
		let storedValue = storage.getItemSync(key);
		if (!storedValue) {
			const loadedValue = loadFn();
			storage.setItemSync(key, loadedValue);
			storedValue = loadedValue;
		}
		return storedValue;
	}
};