Matrix Pointe Software Mastermind console application
========================
Author: Andy Horner


Configuration
-------------
The maximum number of chances a player gets to guess the code can be configured in the `config.json` file.
If this file does not exist, it will be recreated on the next run of the game and `maxGuesses` will default to 10.
The max number of guesses can also be specified at runtime with the `--maxGuesses` switch. For example:

    node mastermind.js --maxGuesses 15

Requirements
-------------
* Node.JS
* NPM (Node Package Manager)

Setup
-----
To setup the game, please run the following command:

    npm install

Run
---

To run the game, please run the following command:

    node mastermind.js
