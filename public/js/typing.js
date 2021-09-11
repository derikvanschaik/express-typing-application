// completes a fetch request for the words 
const getRandomWords = async () => { 
    let response = await fetch('/random-words');      
    return await response.json();    
}
// posts new number of word to server 
const postNewWordNum = async (newWordNum) =>{ 
    const data = {newWordNum};   
    let response = await fetch('/random-words', { 
        method: 'POST', // *GET, POST, PUT, DELETE, etc. 
        headers: {
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json();   
}
// outputs text onto DOM 
const displayText = async (textOut, sentence ) =>{
    sentence = sentence.split(" ").join("_"); // replace spaces with underscores 
    textOut.innerHTML = ''; // init inner html

    let charCount = 0; 
    const wordList = sentence.split("_"); 
    wordList.forEach( (word, wordCount) =>{
        Array.from(word).forEach((char, charIdx) =>{  
            
            textOut.innerHTML += `<span id="${charCount++}" >${char}</span>`; 
        });
        if (wordCount !== wordList.length -1 ){ 
            textOut.innerHTML += `<span id="${charCount++}" >_</span>`; // space characters 
        }

        // want to have 6 words per line -- not on the last line  
        if (wordCount !== 0 && wordCount % 6 === 0){ 
            textOut.innerHTML += `<br>`;  
        } 
        
    }); 
}

const colorCursorIn = (cursor) =>{
    const curChar = document.getElementById(`${cursor}`);
    curChar.style.backgroundColor = "black";
    curChar.style.color = "white";
}

const colorCursorOut = (cursor, colorRed) =>{
    const curChar = document.getElementById(`${cursor}`);
    // mistake was made 
    if (colorRed){
        curChar.style.backgroundColor = null; 
        curChar.style.color = 'red';
        return; 
    }
    curChar.style.backgroundColor = null; 
    curChar.style.color = null;
}

const animateFlashingCursor = (cursor) =>{ 

    return setInterval( ()=>{ 
        const curChar = document.getElementById(`${cursor}`);  
        if (curChar.style.backgroundColor){ // undo coloring 
            colorCursorOut(cursor); 
        }else{
            colorCursorIn(cursor); // color cursor in 
        }
    }, 350); // flashes every 350 milliseconds 
}

// returns new cursor and newsentence param 
const resetGame = async (textOut, flashingCursor, errorCountOutput) =>{  
    // get new randomSentence 
    let data = await getRandomWords(); 
    // update output text 
    displayText( textOut, data.sentence);
    if (flashingCursor){
        clearInterval(flashingCursor);
    }
    // update error output
    errorCountOutput.textContent = 'Errors: (0)'; 
    flashingCursor = animateFlashingCursor(0); 
    // return new cursor and sentence and flashingCursor function 
    return [data.sentence, 0, 0, true,   flashingCursor];     
     
}

const hideAndShowSettings = (settings) =>{
    if (settings.style.display === "block"){ 
        settings.style.display = "none"; 
    }else{
        settings.style.display = "block";    
    }
}

const moveCursor = (cursor, length, val, lastCharCorrect) =>{ 
    const lastCursor = cursor; 
    cursor += val; // increment by val 
    // undo previous styling   
    colorCursorOut(lastCursor, lastCharCorrect); 
    // new styling
    if (cursor >= 0 && cursor < length){ 
        colorCursorIn(cursor);
        return cursor; 
    } 
    if (cursor >= length){
        return 0; 
    }

}
const calculateWpm = (startMilliseconds, numWords) =>{ 
    const endMilliseconds = Date.now(); 
    const secondsElapsed = (endMilliseconds/1000) - (startMilliseconds/1000 );  
    const minutes = secondsElapsed / 60; 
    return Math.floor( numWords / minutes ); // returns wpm 
}

const resetWpm = (speedOutput, startTime,numWords, finishedTyping) =>{
    // WPM
    if (finishedTyping){
        const wpm = calculateWpm(startTime, numWords); 
        speedOutput.textContent = `Speed: (${wpm} WPM)`;
    }else{
        speedOutput.textContent = `Speed: (No Value Yet)`; 
    }
    
    return [null, false]; // startTime, startedTyping   
}

window.onload = async () =>{
    // DOM elements 
    const newWordsButton = document.querySelector("#new-words");
    const applyChangesButton = document.querySelector("#apply");
    const sentenceLengthSlider = document.querySelector("#slider");
    const settingsLink = document.querySelector("#settings-link");
    const settings = document.querySelector("#settings-container");
    const displayText = document.querySelector("#text");
    const errorCountOutput = document.querySelector("#error-count");
    const speedOutput = document.querySelector("#speed"); 
    // global variables to typing application 
    let sentence;
    let cursor = 0;
    let mistakeCount = 0;
    let lastCharCorrect = true; 
    let flashingCursor; // pointer to function
    let startedTyping = false;
    let startTime; // start time  (milliseconds)

    // we will init the game 
    [sentence, cursor, mistakeCount, lastCharCorrect, flashingCursor] = await resetGame(
         displayText, flashingCursor, errorCountOutput
         ); 

    // cursor event handlers 
    window.addEventListener("keyup", (event) =>{
        setTimeout(() =>console.log("this working?"), 1000); 
        if (flashingCursor){ 
            clearInterval(flashingCursor);
            flashingCursor = null; 
        }
        flashingCursor = animateFlashingCursor(cursor);          
    });  
    // needs to be async 
    window.addEventListener("keydown", async (event) =>{

        if (!startedTyping && cursor === 0){ // user just started typing -- grab start time
            startedTyping = true;
            startTime = Date.now();  
        }

        // stop current flashing of cursor 
        clearInterval(flashingCursor); 
        flashingCursor = null;

        // we want to freeze our current cursor until next key up event
        colorCursorIn(cursor); 

        if(event.key === sentence.charAt(cursor) ){
            // could be last cursor 
            if (cursor === sentence.split("").length -1 ){   
                // update wpm content
                const finishedTyping = true; // user got to the end 
                [startTime, startedTyping ] = resetWpm(speedOutput, startTime, sentence.split(" ").length, finishedTyping);  
                // game 
                [sentence, cursor, mistakeCount, lastCharCorrect, flashingCursor, startedTyping, startTime] = await resetGame(
                    displayText, flashingCursor, errorCountOutput
                    ); 
                
                return;  
            } 
            // lastCharCorrect is passed into to move cursor for coloring last char red or black 
            cursor = moveCursor(cursor,  sentence.split("").length, 1, !lastCharCorrect);  
            lastCharCorrect = true;
            return;         
        }
        if (event.key === "Backspace") {  
            // at init character, do not want user to be able to go any further back 
            if (cursor === 0 ){
                return; 
            }
            // pass in true for lastCharCorrect param as backspacing undos all mistakes made 
            cursor = moveCursor(cursor, sentence.split("").length, -1); // decrement cursor 
            lastCharCorrect = true; 
            return; 
        }
        if (event.key == "Capslock" || event.key === "Shift"){ 
            return; 
        }
        if (event.key !== sentence.charAt(cursor)){  
            errorCountOutput.textContent = `Errors: (${++mistakeCount})`; 
            lastCharCorrect = false; 
        } 

    }); 

    // event handlers 
    settingsLink.addEventListener("click", ()=> { 
        hideAndShowSettings(settings); 
    }); 

    newWordsButton.addEventListener("click", async () =>{
        // update wpm content
        const finishedTyping = false; // user did not get to end  
        [startTime, startedTyping ] = resetWpm(speedOutput, startTime, sentence.split(" ").length, finishedTyping); 

        [sentence, cursor, mistakeCount, lastCharCorrect, flashingCursor] = await resetGame(
            displayText, flashingCursor, errorCountOutput
            ); 

    });

    applyChangesButton.addEventListener("click", async () =>{  
        // hide settings 
        hideAndShowSettings(settings); 
        // wpm  
        // update wpm content
        const finishedTyping = false; // user did not get to end 
        [startTime, startedTyping ] = resetWpm(speedOutput, startTime, sentence.split(" ").length, finishedTyping); 

        let status = await postNewWordNum(
            parseInt(sentenceLengthSlider.value) 
                                ); 
        [sentence, cursor, mistakeCount, lastCharCorrect, flashingCursor] = await resetGame(
                                    displayText, flashingCursor, errorCountOutput
                                    );      

    });

    sentenceLengthSlider.addEventListener("input", () =>{
        const sentenceLengthLabel = document.querySelector("#slider-value-label"); 
        const num = sentenceLengthSlider.value; 
        sentenceLengthLabel.textContent = `Number of words: ${num}`;   
    }); 
} 