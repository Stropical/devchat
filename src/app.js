"use strict";

//Imports
const inquirer = require("inquirer");
const colors = require('colors');
const io = require('socket.io-client');
const readline = require("readline");

//Globals
var currentUser, currentPass, currentRoom, rooms, state, myLastMessage = {user: ""};

state = "noAuth";

//Connect to server
const socket = io("https://devchat-cli.herokuapp.com/")


//Handle Message
socket.on('message', (data) => {
    if (currentRoom != data.roomID || data.user == myLastMessage.user) {

    } else {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log((data.user).bold + " >> ".blue + data.msg)

        process.stdout.write("You ".bold + ">> ".bold.green)
    }
})

//Handle disconnect
socket.on('disconnect', (token) => {
    console.log("\r\n Disconnected".red.bold);
    console.log("This is either a server error or your username is too long")
    process.exit(0)
})

//Acquire Rooms
socket.emit("rooms")

socket.on('rooms', (data) => {
    rooms = data;

    //Create login prompt
    inquirer
        .prompt(
            [
                {
                    type: "input",
                    message: "Username",
                    name: "user",
                    validate: function (answer) {
                        currentUser = answer;
                        return true;
                    }
                },
                {
                    type: "search-list",
                    message: "Select room",
                    name: "room",
                    choices: rooms,
                    validate: function (answer) {
                        if (answer === 'Bottle') {
                            return `Whoops, ${answer} is not a real topping.`;
                        } else {
                            socket.emit('joinRoom', { room: answer })
                        }
                        return true;
                    }
                }
            ])
        .then(function (answers) {
            currentRoom = answers.room;
            process.stdin.resume()
            startLoop();
        })
        .catch(e => console.log(e));
});

function startLoop() {
    process.stdout.write("You ".bold + ">> ".bold.green)

    var inputBuffer = ""
    process.stdin.on('keypress', (str, key) => {
        if (key && key.name == "enter") {
            inputBuffer = inputBuffer.replace(/(\r\n|\n|\r)/gm, "");
            socket.emit('message', { msg: inputBuffer, user: currentUser })
            myLastMessage = { msg: inputBuffer, user: currentUser }
            inputBuffer = ""
            process.stdout.write("You ".bold + ">> ".bold.green)

        } else {
            inputBuffer += str;
        }
    });
}

// Register plugin
inquirer.registerPrompt("search-list", require("inquirer-search-list"));