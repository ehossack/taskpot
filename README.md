# taskpot
The taskpot timer

## Current Commands

* `/taskpot timer`  

Sets a 4-minute timer for coffee. This is based on the fact that french press has a 30 second steep period to account for bloom,
then a 4-minute further steep period which requires nothing but patience.  
The timer also includes gifs, because we need more gifs. The gif keyword is "four minutes".  
After 4 minutes, a random text string from the predefined list will appear.  

`/taskpot timer <some text>` will append the text to the ultimate response,
for example `/taskpot timer on levon's desk` if the coffee was steeped in an unusual location.

* `/taskpot <some text>`

With any text, Taskpot will create a poll with a gif (keyword "who wants coffee") and the text included.
There is an interactive "Me" button, that, when clicked, will append the user's name to a list of interested folk.

* `/taskpot asks "<some text"`

This effectively allows Taskpot to send any gif with an arbitrary text defined in quotes.
