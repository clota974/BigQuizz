var socket = io();

var resp = {
    "Y1": signIn,
    "E2": cancelSignIn,
    "G1": loadGame,
    "G2": showGame,
    "G3": startGame,
    "G4": endRace,
    "G7": preStart,
}

var pos = 0;
var countdown = 3;

$(document).ready(function(){
    $("#ready").click(function(){
        output("Ready", "green");
        socket.emit("game", {code: "M2", text:"Ready for playing"});
    });

    $(".game").on("click", ".push", null, function(evt){
        console.log(evt);
        pos+=100;
        $(".pedal").toggleClass("push");

        socket.emit("data", {code: "D1", text:"Game data", value: pos})
    })

    socket.on("signal", function(msg){
        if(msg.code[0]==="E"){
            output(msg.text, "red");
        }else{
            output(msg.text, "blue");
        }


        if(resp.hasOwnProperty(msg.code)){
            resp[msg.code](msg);
        }
    })

    socket.on("game", function(msg){
        if(msg.code[0]==="E"){
            output(msg.text, "red");
        }else{
            output(msg.text, "black");
        }


        console.log(msg.code);
        if(resp.hasOwnProperty(msg.code)){
            resp[msg.code](msg);
        }
    })
});

function output(message, color){
    $("output").append(`<span style="color: ${color}">${message}</span><br/>`);
}

function signIn(){
    var username = atob(Math.round(Math.random()*100000000));
    //username = "Killian";
    output("Trying to register user", "orange");

    socket.emit("config", {code:"C2", text: "Username registration", value: username});
}
function cancelSignIn(){
    
}

function loadGame(msg){
    output("Simulating loading of "+msg.value, "pink");
    

    
    socket.emit("game", {code:"M1", text: "Game loaded"});
    socket.emit("game", {code: "M2", text:"Ready for playing"});
}
function preStart(){
    countdown = 3;

    countdownInterval = setInterval(function(){
        if(countdown==0){
            clearInterval(countdownInterval);
            startGame();
        }
        
        $("h1").text(countdown);
        countdown--;
    }, 1000);
}
function startGame(){
    $("div.game").css("display", "block");
    startingTime = new Date();
}
function showGame(){
 
}

function endRace(){
    pos = 0;
    $("div.game").css("display", "none");
    $("h1").text("Terminé !")

    totalTime = new Date() - startingTime;
    
    socket.emit("game", {code: "M3", text: "Résultat du jeu", value: totalTime})
}