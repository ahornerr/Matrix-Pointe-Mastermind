/* global -Promise */
var Promise = require("bluebird"),
    prompt = require('prompt'),
    _ = require('underscore');

// prompt.message = "";
// prompt.delimiter = "";
prompt.colors = false;
prompt.start();
var getPrompt = Promise.promisify(prompt.get);

var guessProperties = [{
    name: 'Guess',
    validator: /^[1-6]{4}$/,
    warning: 'Guess must be 4 digits between 1 and 6'
}];

function promptGuess(code, guesses, maxGuesses) {
    console.log("You have " + (maxGuesses - guesses) + " remaining tries to crack the code.");
    return getPrompt(guessProperties).then(function(input) {
        var guess = input.Guess;
        guesses++;

        var correct = isGuessCorrect(code, guess);
        if (correct || (!correct && guesses >= maxGuesses)) {
            return {
                correct: correct,
                guesses: guesses
            };
        } else {
            console.log("Your score is: " + calculateScore(code, guess) + "\n");
            return promptGuess(code, guesses, maxGuesses);
        }
    });
}

function mainLoop() {
    var guesses = 0,
        maxGuesses = 10,
        correct = false,
        code = createSecretCode();

    console.log(code);
    var codeString = _.reduce(code, function(memo, num) {
        memo + num;
    }, "");
    promptGuess(code, guesses, maxGuesses).then(function(result) {
        if (result.correct) {
            console.log("You solved it! Took " + result.guesses + " guesses.");
        } else {
            console.log("You lose :( The code was: " + codeString);
        }
    }).catch(function(error) {
        if (error.name == 'OperationalError') {
            console.log("Thanks for playing!");
        } else {
            console.error(error);
        }
    });
}

function isGuessCorrect(code, guess) {
    var correct = true;
    for (var i = 0; i < code.length; i++) {
        if (code[i] != guess[i]) {
            return false;
        }
    }
    return true;
}

function calculateScore(code, guess) {
    var matches = "",
        wrongPos = "",
        codeCopy = code.slice(0),
        guessCopy = _.map(guess.split(""), function(num) {
            return parseInt(num);
        });

    //Loop to check for exact matches
    for (var i = 0; i < guess.length; i++) {
        if (guess[i] == code[i]) {
            matches += "+";
            codeCopy[i] = -1;
            guessCopy[i] = 0;
        }
    }

    for (var i = 0; i < guessCopy.length; i++) {
        var index = codeCopy.indexOf(guessCopy[i]);
        if (index > -1) {
            wrongPos += "-";
            codeCopy[index] = "";
        }
    }
    return matches + wrongPos;
}

function createSecretCode() {
    var code = [];
    for (var i = 0; i < 4; i++) {
        code[i] = Math.floor(Math.random() * (6) + 1);
    }
    return code;
}

mainLoop();