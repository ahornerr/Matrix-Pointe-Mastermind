/* global -Promise */
// This is to prevent a JSHint warning

var Promise = require("bluebird"),
    prompt = require('prompt'),
    nconf = require('nconf'),
    fs = require('fs');

var configFileLocation = './config.json';

nconf.argv()
    .file({
        file: configFileLocation
    });

// Load the configuration file (./config.json)
nconf.load();
// Set the config defaults (only if the configuration file doesn't exist)
nconf.defaults({
    'maxGuesses': 10
});
// This recreates the configuration file in case it gets deleted.
nconf.set('maxGuesses', nconf.get('maxGuesses'));
nconf.save();

var guessProperties = {
    name: 'Guess',
    type: 'string',
    required: true,
    validator: /^[1-6]{4}$/,
    warning: 'Guess must be 4 digits between 1 and 6'
};

prompt.start();

var getPrompt = Promise.promisify(prompt.get);

function gameLoop() {
    var guesses = 0,
        maxGuesses = nconf.get('maxGuesses'),
        code = createSecretCode();

    promptGuess(code, guesses, maxGuesses).then(function(result) {
        if (result.correct) {
            console.log("\nYou solved it! Took " + result.guesses + " " + pluralizeGuess(result.guesses));
        } else {
            console.log("\nYou lose :( The code was: " + code);
        }
        printEndGame();
    }).catch(function(error) {
        if (error.name == 'OperationalError') {
            console.log("\n\nYou lose :( The code was: " + code);
            printEndGame();
        } else {
            console.error("Unexpected error: " + error);
        }
    });
}

function createSecretCode() {
    var code = "";
    // Generates a string 4 characters long, each character from 1 to 6
    for (var i = 0; i < 4; i++) {
        code += Math.floor(6 * Math.random() + 1);
    }
    return code;
}

function promptGuess(code, guesses, maxGuesses) {
    var remainingGuesses = maxGuesses - guesses;
    console.log("You have " + remainingGuesses + " remaining " + pluralizeGuess(remainingGuesses) + " to crack the code.");
    return getPrompt(guessProperties).then(function(input) {
        var guess = input.Guess;
        guesses++;

        var correct = isGuessCorrect(code, guess);
        // Either the guess was correct, or there are no guesses remaining
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

function pluralizeGuess(num) {
    return (num > 1) ? "guesses" : "guess";
}

function isGuessCorrect(code, guess) {
    return code == guess;
}

function calculateScore(code, guess) {
    var output = "",
        ignoredCodeIndicies = [],
        ignoredGuessIndicies = [];

    //Loop to check for exact matches
    for (var i = 0; i < code.length; i++) {
        if (code[i] == guess[i]) {
            output += "+";
            // An ignored code index is when there is an exact match on a number (right number, right position)
            // We also ignore this index in the guess because it's an exact match
            ignoredGuessIndicies.push(i);
            ignoredCodeIndicies.push(i);
        }
    }

    // Loop to check for matches in the wrong position
    // While ignoring exact matches
    for (var codeIndex = 0; codeIndex < code.length; codeIndex++) {
        if (ignoredCodeIndicies.indexOf(codeIndex) == -1) {
            var codeElem = code[codeIndex];
            var guessIndex = guess.indexOf(codeElem);
            // (guessIndex != -1) means that code character exists somewhere in the guess
            while (guessIndex != -1) {
                // (ignoredGuessIndicies.indexOf(guessIndex) == -1) means this index of the character in the guess is not ignored
                // for an index to be ignored means it was an exact match already, or already counted as a wrong position match 
                if (ignoredGuessIndicies.indexOf(guessIndex) == -1) {
                    output += "-";
                    ignoredGuessIndicies.push(guessIndex);
                    // Break out of the while loop if we found a match for this character in the guess
                    break;
                } else {
                    //Search the guess string for the next instance of the code character
                    guessIndex = guess.indexOf(codeElem, guessIndex + 1);
                }
            }
        }
    }
    return output;
}

function printEndGame() {
    console.log("\nThanks for playing Andy\'s Mastermind game!");
}

gameLoop();