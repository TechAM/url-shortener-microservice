require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const dns = require('dns')
const mongoose = require('mongoose')
const app = express();

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true})
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: Number
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
// app.use(express.json()) //... and this is needed for making post requests from POST man for some reason.

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let responseObject = {}
app.post('/api/shorturl/new', (request, response) => {
  let inputUrl = request.body['url']
  
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  
  if(!inputUrl.match(urlRegex)){
    response.json({error: 'invalid url'})
    return
  }
    
  responseObject['original_url'] = inputUrl
  console.log(`original url: ${inputUrl}`)
  
  let inputShort = 1
  
  URLModel.findOne({})
        .sort({short_url: 'desc'})
        .exec((error, result) => {
          if(!error && result != undefined){
            inputShort = result.short_url + 1
          }
          if(!error){
            URLModel.findOneAndUpdate(
              {original_url: inputUrl},
              {original_url: inputUrl, short_url: inputShort},
              {new: true, upsert: true },
              (error, savedUrl)=> {
                if(!error){
                  responseObject['short_url'] = savedUrl.short_url
                  response.json(responseObject)
                }
              }
            )
          }
  })
  
})


app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  URLModel.findOne({short_url: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original_url)
    }else{
      response.json('URL not Found')
    }
  })
})
// app.post('/api/shorturl/new', bodyParser.urlencoded({extended:false}), (req, res)=>{
//   let original_url = String(req.body.url)
//   // let truncated_url = original_url.replace(/^[a-zA-Z]+:\/\//ig, "")
//   console.log("ORIGINAL URL: " + original_url)
//   // console.log("TRUNCATED URL: " + truncated_url)

//   // OKAY, PRETTY SURE NOW THAT DNS LOOKUP IS THE CULPRIT... BUT WHY???
//   // HOW ELSE WILL I VALIDATE URLS???
//   dns.lookup(new URL(original_url).hostname, (err, address, family) => {
//     if (err) {
//       console.log("an error occurred")
//       console.log(err)
//       res.json({ error: "invalid url" });
//     } else {
//       const url = new URLModel({ original_url });
//       url.save()
//         .then((obj)=>{
//           console.log(obj)
//           res.json({original_url, short_url:obj._id})
//         })
//         .catch((err)=>{
//           console.log(err)
//           res.json({message:err.message})
//         })
//     }
//   })
 
// })

// app.get('/api/shorturl/:url', (req, res)=>{
//   URLModel.findById(req.params.url, (err, urlDoc)=>{
//     if(err) res.json({message:"invalid short url"})

//     console.log(urlDoc.original_url)
//     res.redirect(urlDoc.original_url)
//   })
// })

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
