const path  = require('path');  
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// function used in application 
const generateRandomSentence = require('./randomsentence'); 

var app = express()

// always have bodyparser json method 
app.use(bodyParser.json() );  
app.use(cors()); 

const port = process.env.PORT || 3000; 

app.use(express.static(path.join(__dirname, '../public') )); 

// default value 
let numWords = 10;

app.get('/', (req, res) =>{ 
    res.sendFile(path.join(__dirname, '../public/typing.html') );      
});

app.get('/random-words', (req, res) =>{ 
    const sentence = generateRandomSentence(numWords);  
    res.send({sentence});  
});

app.post('/random-words', (req, res) =>{
    // update numwords 
    numWords = parseInt(req.body.newWordNum);
    // send back a response 
    const sentence = generateRandomSentence(numWords);  
    res.send({sentence});
}); 

app.listen(port, (req, res) =>{
    console.log(`listening on port ${port}`);  
})
