//MAKE CONNECTION TO THE SOCKET
var socket=io.connect("http://localhost:3000");


//QUERY DOM
let playerChoice;
let computerChoice;
let winner;

let playerName;
let message=document.getElementById("message");
let handle=document.getElementById("handle");
let btn=document.getElementById("send");
let output=document.getElementById("output");
let feedback=document.getElementById("feedback");


//EMIT EVENTS
btn.addEventListener("click",function(){
  socket.emit('chat',{
    message:message.value,
    handle:handle.value
  });
})
message.addEventListener("keypress",function(){
  socket.emit('typing',handle.value);
})

//Listen for events
socket.on('chat',function(data){
  feedback.innerHTML="";
  output.innerHTML += '<p><strong>' + data.handle + '</strong> : ' + data.message + '</p>';
});
socket.on('typing',function(data){
  feedback.innerHTML=data+'is typing a message';
});

$(document).ready(function(){
  playerName=prompt("Enter Your Name");
    $("#player1Name").html(playerName);
    $("#handle").val(playerName);
})

const choices = document.querySelectorAll(".choice");
const score = document.getElementById("score");
const result = document.getElementById("result");
const restart = document.getElementById("restart");
const modal = document.querySelector(".modal");
const scoreboard = {
  player1: 0,
  player2: 0
};

// Play game
function play(e) {
  restart.style.display = "inline-block";
  playerChoice = e.target.id;
  socket.emit("player",{
    name:playerName,
    choice:playerChoice
  });
  socket.on("opponent",function(data){
    $("#score #p2").val(data.name);
    computerChoice=data.choice;
  })
  winner = getWinner(playerChoice, computerChoice);
  showWinner(winner, computerChoice);
}

// Get computers choice
function getComputerChoice() {
  const rand = Math.random();
  if (rand < 0.34) {
    return "rock";
  } else if (rand <= 0.67) {
    return "paper";
  } else {
    return "scissors";
  }
}

// Get game winner
function getWinner(p, c) {
  if (p === c) {
    return "draw";
  } else if (p === "rock") {
    if (c === "paper") {
      return "computer";
    } else {
      return "player";
    }
  } else if (p === "paper") {
    if (c === "scissors") {
      return "computer";
    } else {
      return "player";
    }
  } else if (p === "scissors") {
    if (c === "rock") {
      return "computer";
    } else {
      return "player";
    }
  }
}

function showWinner(winner, computerChoice) {
  if (winner === "player") {
    // Inc player score
    scoreboard.player1++;
    // Show modal result
    result.innerHTML = `
      <h1 class="text-win">You Win</h1>
      <i class="fas fa-hand-${computerChoice} fa-10x"></i>
      <p>Computer Chose <strong>${computerChoice.charAt(0).toUpperCase() +
        computerChoice.slice(1)}</strong></p>
    `;
  } else if (winner === "computer") {
    // Inc computer score
    scoreboard.player2++;
    // Show modal result
    result.innerHTML = `
      <h1 class="text-lose">You Lose</h1>
      <i class="fas fa-hand-${computerChoice} fa-10x"></i>
      <p>Computer Chose <strong>${computerChoice.charAt(0).toUpperCase() +
        computerChoice.slice(1)}</strong></p>
    `;
  } else {
    result.innerHTML = `
      <h1>It's A Draw</h1>
      <i class="fas fa-hand-${computerChoice} fa-10x"></i>
      o
    `;
  }
  // Show score
  $("#score #p1").html(scoreboard.player1);
  $("#score #p2").html(scoreboard.player2);

  modal.style.display = "block";
}

// Restart game
function restartGame() {
  scoreboard.player = 0;
  scoreboard.computer = 0;
  score.innerHTML = `
    <p>Player: 0</p>
    <p>Computer: 0</p>
  `;
}

// Clear modal
function clearModal(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

// Event listeners
choices.forEach(choice => choice.addEventListener("click", play));
window.addEventListener("click", clearModal);
restart.addEventListener("click", restartGame);