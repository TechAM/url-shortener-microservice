require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const dns = require('dns')
const mongoose = require('mongoose')
const urlExists = require('url-exists')
const app = express();

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true})
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String
  }
  // short_url: {
  //   type: String,
  //   unique: true
  // }
})
// OK FINALLY FIGURED OUT WHY THE APP KEPT CRASHING WHEN TRYING TO RUN THE FCC TESTS
// FOR SOME DUMBASS REASON, USING THE MODEL NAME 'URL' WAS CAUSING THE ERROR
// SO I'VE CHANGED IT TO URLMODEL
// FUCKING HELL 
// UPDATE: NOPE, NEVER MIND IT DID JACK SHIT
const URLModel = mongoose.model('URLModel', urlSchema)


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


app.post('/api/shorturl/new', async (req, res)=>{
  // res.json({original_url:"www.original.com", short_url:short_url})

  let original_url = String(req.body.url)
  // let truncated_url = original_url.replace(/^[a-zA-Z]+:\/\//ig, "")
  console.log("ORIGINAL URL: " + original_url)
  // console.log("TRUNCATED URL: " + truncated_url)


  urlExists(original_url, (err, exists)=>{
    if(err){
      res.json({message:'invalid url'})
    }else{
      try {
        const newUrl = await url.save();
        console.log(url)
        res.json({original_url, short_url:newUrl._id});
      } catch (e) {
        res.json({ message: e.message });
      }
    }
  })

  // const url = new URLModel({ original_url });
  // if(validUrl.isUri(original_url)){

  // }else{
  //   res.json({message:'invalid url'})
  // }
  // OKAY, PRETTY SURE NOW THAT DNS LOOKUP IS THE CULPRIT... BUT WHY???
  // HOW ELSE WILL I VALIDATE URLS???

  // dns.lookup(original_url, async (err, address, family) => {
  //   if (err) {
  //     console.log(err)
  //     res.json({ message: "invalid url" });
  //   } else {
  //     const url = new URLModel({ original_url });
  //     console.log(url)

  //     try {
  //       const newUrl = await url.save();
  //       res.json({original_url, short_url:newUrl._id});
  //     } catch (e) {
  //       res.json({ message: e.message });
  //     }
  //   }
  // })
 
})

app.get('/api/shorturl/:url', (req, res)=>{
  URLModel.findById(req.params.url, (err, urlDoc)=>{
    if(err) res.json({message:"invalid short url"})

    console.log(urlDoc.original_url)
    res.redirect(urlDoc.original_url)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
