# taskpot
The taskpot timer

## Setup

1. Find a host to run the server
2. Install an app in slack
3. Get your credentials, create a `secrets.json`:
```
{
	"SLACK_CLIENT_ID":"...",
	"SLACK_CLIENT_SECRET":"...",
	"SLACK_OAUTH_CODE":"...",
	"GIPHY_API_KEY":"..."
}
```
4. Run `server.js`, with something like:
```
$bash: node server.js | tee logs/server.log
```

## Current Commands

* `/taskpot --help` shows help

* `/taskpot --timer <minutes or location>`  

Sets a timer for coffee, if the text is a numerical value less than four this will be the time.
Otherwise we will set a 4-minute timer for coffee. This is based on the fact that french press has a 30 second steep period to account for bloom,
then a 4-minute further steep period which requires nothing but patience.  
The timer also includes gifs, because we need more gifs. The gif keyword is "X minutes", where X is the calculated number of minutes.
After X minutes, a random text string from the predefined list will appear.  
If the text is non-numerical, it will append the text to the ultimate response,
for example `/taskpot timer on levon's desk` if the coffee was steeped in an unusual location.

* `/taskpot <some text>`

With any text, Taskpot will send a random gif, much as giphy once did.

* `/taskpot --poll <optional text>`

Creates a poll for "Who wants coffee?" with optional text
There is an interactive "Me" button, that, when clicked, will append the user's name to a list of interested folk.

## Running tests

1. Write tests
2. Run them
3. Commit them

In all seriousness, this is a hacked project. No tests for now :)

