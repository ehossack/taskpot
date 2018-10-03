// methods to provide user metadata
'use strict';

const Promise = require('promise');
const cache = require('./cache.js');
const secrets = require('./secretsLoader.js');
const client = require('./client.js');
const checks = require('./checks.js');

module.exports = {
    retrieveDisplayName: retrieveDisplayName,
    getDisplayNameForUser: getDisplayNameForUser
};


/**
 * Gets the display name for a slack user
 * @async
 * @param {string} userid the slack user id to look for
 * @param {string} [username] the slack username
 * @returns {Promise} a promise resolving to a display name, never rejecting
 */
function retrieveDisplayName(userid, username) {
    checks.isTruthy(userid, 'Must provide at least userid');
    const cachedName = cache.retrieve(key(userid));
    if (cachedName) {
        console.log(`provided ${userid} from cache: ${cachedName}`);
        return Promise.resolve(cachedName);
    }

    const slackToken = secrets.getPrivateKey('SLACK_OAUTH_CODE');
	return client.doGet(`https://slack.com/api/users.profile.get?user=${userid}&token=${slackToken}`)
		.then(data => {
            let displayName = username ? `@${username}` : `id=${userid}`;

			if (data.ok) {
				displayName = data.profile.first_name;
				cache.store(key(userid), displayName);
			} else {
				console.log(`requesting ${displayName}'s real name (id ${userid}) was not ok`);
				console.log(data);
			}
			return displayName;
        })
        .catch(err => {
            console.log(`requesting ${username}'s real name (id ${userid}) failed`);
            console.log(err);
            return username || userid;
        });
}

/**
 * Returns the previously retrieved user's display name, or just returns the user id.
 * 
 * @param {string} userid the user id
 * @param {string} [username] the username if available
 * @returns {string} the string
 */
function getDisplayNameForUser(userid, username) {
    checks.isTruthy(userid, 'Must provide at least userid');
    return cache.retrieveOrDefault(key(userid), username || userid);
}

function key(userid) {
    return `display-name-for-${userid}`;
}
