require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const dns = require('dns')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:false})) //just figured out this is needed when making post requests from a web browser for some reason...
app.use(express.json()) //... and this is needed for making post requests from POST man for some reason.

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const shortUrls = {
  /*
    store urls and short urls here
  */
}

app.post('/api/shorturl/new', (req, res)=>{
  let short_url
  do{
    short_url = Math.floor(Math.random()*10000)
  }while(short_url in shortUrls)
  // console.log(short_url)

  // res.json({original_url:"www.original.com", short_url:short_url})

  // console.log(req.body)
  
  let original_url = String(req.body.url)
  let truncated_url = original_url.replace(/^https?:\/\//ig, "")
  console.log("ORIGINAL URL: " + original_url)
  console.log("TRUNCATED URL: " + truncated_url)

  dns.lookup(truncated_url, (err, address, family)=>{
    if(err){
      console.error(err)
      res.json({message:"invalid url"})
    }else{
      shortUrls[short_url] = original_url
      console.log(shortUrls)
      res.json({
        original_url,
        short_url
      })
    }
  })
 
})

app.get('/api/shorturl/:url', (req, res)=>{
  let short_url = req.params.url
  if(short_url in shortUrls){
    res.redirect(shortUrls[short_url])
  }else{
    res.status(404).json({message: "Invalid short url"})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
