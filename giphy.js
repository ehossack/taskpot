
// interacts with giphy API

'use strict';

const client = require('./client.js');
const secrets = require('./secretsLoader.js');

module.exports = {
	call: call
};

/**
 * Finds a random gif
 * @param {string} keywords the keywords
 * @returns {object} with properties: 
 * {
 * 		"giphy_url": <url on giphy>
 * 		"url": <image url>
 * }
 */
function call(keywords) {
	const text = encodeURI(keywords);
	const apiKey = secrets.getPrivateKey('GIPHY_API_KEY');
	return client.doGet(`https://api.giphy.com/v1/gifs/random?tag=${text}&api_key=${apiKey}`)
		.then(wrappedData => {
			return {
				giphy_url: wrappedData.data.url,
				url: wrappedData.data.fixed_height_downsampled_url
			};
		});
}


/*

	Sample payload
	e.g. giphy who wants coffee

	{
	data: {
		type: "gif",
		id: "vja3eL2uSMKWs",
		url: "http://giphy.com/gifs/vja3eL2uSMKWs",
		image_original_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/giphy.gif",
		image_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/giphy.gif",
		image_mp4_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/giphy.mp4",
		image_frames: "63",
		image_width: "608",
		image_height: "312",
		fixed_height_downsampled_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/200_d.gif",
		fixed_height_downsampled_width: "390",
		fixed_height_downsampled_height: "200",
		fixed_width_downsampled_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/200w_d.gif",
		fixed_width_downsampled_width: "200",
		fixed_width_downsampled_height: "103",
		fixed_height_small_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100.gif",
		fixed_height_small_still_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100_s.gif",
		fixed_height_small_width: "195",
		fixed_height_small_height: "100",
		fixed_width_small_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100w.gif",
		fixed_width_small_still_url: "https://media2.giphy.com/media/vja3eL2uSMKWs/100w_s.gif",
		fixed_width_small_width: "100",
		fixed_width_small_height: "51",
		username: "",
		caption: ""
	},
	meta: {
			status: 200,
			msg: "OK",
			response_id: "5a3ad6cc636b373859579259"
		}
	}
 */
