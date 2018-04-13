/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),   
    Twit = require('twit'),
    { read, write } = require(`./data-service`),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter);

app.use(express.static('public'));

app.all(`/rss1`, async (req, res) => {
  const Parser = require('rss-parser');
  const parser = new Parser();
  
  // Emoji based on categories[0]

  const feed = await parser.parseURL('https://irrelevant.org.il/feed');
  const firstItem = feed.items[0];
  const {title, link, pubDate, isoDate, guid} = firstItem;
  const partialFirstItem = {title, link, pubDate, isoDate, guid};
  
  const categories = feed.items.map(item => item.categories[0]);
  
  const data = partialFirstItem;
  res.status(200).send('<pre>'+JSON.stringify(data, '', 4)+'</pre>');
  return;
  
  console.log(feed.title);

  feed.items.forEach(item => {
    console.log(item.title + ':' + item.link)
  });
});

app.all(`/test`, (req, res) => {
  const data = read(`.data/counter.json`);
  data.counter = (data.counter || 0) + 1;
  write(`.data/counter.json`, data);
  res.status(200).send(`${data.counter}`)
});

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */
app.all("/" + process.env.BOT_ENDPOINT, function (req, res) {
  try {
    let counter = -1;
    counter++;
    process.env.counter = counter;
    const {data, response} = T.post('statuses/update', { status: `hello bot 👋 ${counter}` });
    res.status(200).send(`OK ${counter}`);
  } catch (err) {
      console.log('error!', err);
      res.sendStatus(500);
  }

});

app.all(`/${process.env.ECHO_ENDPOINT}/:stuff?`, function (req, res) {
  try {
    const stuff = req.params.stuff;
    const status = stuff ?
          `I'm saying "${stuff}".` :
          `I don't know what to say.`;
    const {data, response} = T.post('statuses/update', { status });
    res.status(200).send(`Sent "${status}"`);
  } catch (err) {
      console.log('error!', err);
      res.sendStatus(500);
  }

});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
