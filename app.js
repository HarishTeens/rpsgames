var expresss = require('express');
var express = expresss();
var socket = require('socket.io');

express.set("view engine", "ejs");
express.use(expresss.static("assets"));

express.get("/", function (req, res) {
    res.render("index");
})
//Server Setup
var server = express.listen(3000, function () {
    console.log("THe Server is running");
})

//Socket Setup
var io = socket(server);
//GAME VARIABLES
var rooms = 1;
var choice1 = "", choice2 = "";

//FUNCTIONS

//Function to calculate winner
function getWinner(p, c) {
    if (p === c) {
        return "draw";
    } else if (p === "rock") {
        if (c === "paper") {
            return "2";
        } else {
            return "1";
        }
    } else if (p === "paper") {
        if (c === "scissors") {
            return "2";
        } else {
            return "1";
        }
    } else if (p === "scissors") {
        if (c === "rock") {
            return "2";
        } else {
            return "1";
        }
    }
}
//Function to do executed after gettin both choices
function result() {
    var winner = getWinner(choice1, choice2);
    io.sockets.emit('result', {
        winner: winner,
        choice1: choice1,
        choice2: choice2
    })
    choice1 = "";
    choice2 = "";
}
//Socket Connection
io.on('connection', function (socket) {
    console.log("made connection with socket");

    //Create Game Listener
    socket.on('createGame', function (data) {
        socket.join('room-' + ++rooms);
        socket.emit('newGame', {
            name: data.name,
            room: 'room-' + rooms
        })
    })
    //Join Game Listener
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room) {
            if (room.length == 1) {
                socket.join(data.room);
                socket.broadcast.to(data.room).emit('player1', { oppName: data.name });
                socket.emit('player2', { name: data.name, room: data.room })
            }
            else {
                socket.emit('err', { message: 'Sorry, The room is full!' });
            }
        } else {
            socket.emit('err', { message: 'Invalid Room Key' });
        }
    });
    //Listener to pass the name of the game creater
    socket.on('joinedGame', function (data) {
        socket.broadcast.emit('welcomeGame', data);
    })
    //Listener to Player 1's Choice
    socket.on('choice1', function (c1) {
        choice1 = c1;
        if (choice2 != "") {
            result();
        }
    })
    //Listener to Player 2's Choice
    socket.on('choice2', function (c2) {
        choice2 = c2;
        if (choice1 != "") {
            result();
        }
    })

    //Listener to Chat Messages
    socket.on('chat', function (data) {
        io.sockets.emit('chat', data);
    })
    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data);
    })
    socket.on('player', function (data) {
        socket.broadcast.emit('opponent', data);
    })
})