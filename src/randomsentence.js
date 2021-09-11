const randomWords = require('random-words'); 

const generateRandomSentence = (length) =>{
    let sentence = randomWords(length).join(" ");
    // capitalize first letter 
    sentence = sentence.charAt(0).toUpperCase() + sentence.substring(1); 
    // add period 
    sentence += '.';
    return sentence; 
}
module.exports = generateRandomSentence;  