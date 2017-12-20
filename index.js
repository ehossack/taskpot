// content of index.js
const http = require('http')
var url = require('url');
const port = 13323

const giphyApiKey = 'Jkh4yX4p203mgi9ThU7ALmKjndryogfK';

const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const Client = require('node-rest-client').Client;
const client = new Client();

const ERR_RESPONSE = JSON.stringify({
							'response_type': 'ephemeral',
							'text': 'Oops there was an error'
					});

const requestHandler = (request, response) => {
	// console.log(request);
  	response.setHeader('Content-Type', 'application/json');

  	silently(() => {
		const queryParams = url.parse(request.url, true).query;
		const commandText = queryParams.text;

		console.log('request: @'+queryParams.user_name+' sent "/taskpot ' + queryParams.text + '"');

		if(commandText.startsWith('timer')) {
			return doTimer(response, queryParams, getLocation(commandText));
		}
		return doGif(response, commandText);
  	});
}

const server = http.createServer(requestHandler)

server.listen(port, '127.0.0.1', (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});

function doTimer(response, queryParams, location) {
	const responses = [
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
		'There\'s a _pressing_ issue to solve'
	];

	if(queryParams.user_name === 'kenneth') {
		return response.end(JSON.stringify({
			'response_type': 'in_channel',
			'text': 'Who are you kidding Kenneth? You don\'t drink coffee!'
		}));
	}

	callGiphy('4 minutes', (giphyResponse) => {
		silently(() => {

	  		let responseObj = {
				'response_type': 'in_channel',
				'attachments': [
					{
						'title': queryParams.user_name + ' is steeping the coffee :)',
						'text': '/giphy 4 minutes',
						'image_url': giphyResponse.data.fixed_height_downsampled_url
						// 'https://i.imgur.com/Zf6g6ac.gif' // 4 min timer gif
					}
				]
			};
	    	response.end(JSON.stringify(responseObj));

		});
	});

	return setTimeoutPromise(240000).then(() => {
		let responseData = {
			'response_type': 'in_channel',
  			'text': responses[Math.floor(Math.random()*responses.length)]
		};
		if(location) {
			responseData['attachments'] = [
				{ 'text': location }
			];
		}
		silently(() => {
		  	client.post(queryParams.response_url, {
    			headers: { 'Content-Type': 'application/json' },
    			data: responseData
    		}, (data, postResponse) => {});
		})
	});
}

function doGif(response, commandText) {
	let keywords = 'who wants coffee';
	if(commandText.startsWith('asks ')) {
		keywords = getQuotedKeywords(commandText);
		if(!keywords) {
			return response.end(JSON.stringify({
				'response_type': 'ephemeral',
				'text': 'you need to quote your ask with “like this”!'
			}));
		}
	}

	callGiphy(keywords, (giphyResponse, requestKeywords) => {
		silently(() => {

	  		let responseObj = {
	  			'response_type': 'in_channel',
			    'text': requestKeywords || 'Who wants coffee?',
			    'attachments': [
			        {
			            'image_url': giphyResponse.data.image_url
			        }
			    ]
			}
	    	response.end(JSON.stringify(responseObj));

		});
	});
}

function getQuotedKeywords(commandText) {
	let keywords = commandText.substring('asks '.length);
	if(!keywords.startsWith('“') && !keywords.startsWith('"')) {
		return null;
	}
	return keywords.replace(/“/i, '').replace(/”/i, '')
					   .replace(/"/g, '');
}

function callGiphy(keywords, cb) {
	requestUrl = 'https://api.giphy.com/v1/gifs/random?tag='+encodeURI(keywords)+'&api_key='+giphyApiKey;
	client.get(requestUrl, function (data, response) {
	    cb(data, keywords);
	});
}

function getLocation(commandText) {
	if(commandText.indexOf(' ') === -1) {
		return null;
	}
	return commandText.substring('timer '.length);
}

function silently(fn, thisArg) {
	try {
		fn.apply(thisArg || this, arguments);
	}
	catch (err) {
		console.error(err);
		return response.end(ERR_RESPONSE);
	}
}
