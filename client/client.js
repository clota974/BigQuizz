var socket = io();
var selected = -1;
var pseudo = null;
var startTime = null;

$(document).ready(function(){
    $("#play").click(function(){
        startConnection()
     });

    socket.on("info", function(msg){
        if(msg.code === "Y2") openGame(msg);
    });

    socket.on("signal", function(msg){
        if(msg.code==="E2"){
            $("#play").prop("disabled", false);
            pseudo = false;
            alert("Malheureusment, ce nom d'utilisateur est déjà pris. Choisis en un autre 😉")
        }

        if(msg.code==="E3"){ // Disconnected All
            alert(msg.value);
            window.location.reload();
        }

        if(msg.code==="Y1" && pseudo != null){
            // Reconnect

            startConnection();
        }

        if(msg.code==="M1"){
            restart();
        }

        if(msg.code==="M2"){
            reveal(msg);
        }
    })

    $(".answer").click(function(e){
        if(selected == -1){
            select($(this).index());
        }
    });

    restart();
});

function startConnection(){
    pseudo = $("#pseudo").val() || pseudo;

    if(typeof pseudo != "string") return false;

    if(pseudo.match(/^([a-zA-Z0-9]+)$/) === null){
        pseudo = null;
        alert("Le format du pseudo est incorrect.");
        return false;
    }

    socket.emit("config", {
        code: "C1",
        value: pseudo
    });

    $("#play").prop("disabled", true);
}

function openGame(msg){
    infos = msg.info;
    infos.pts = 0;

    $(".auth").css("display", "none");
    $(".game").css("display", "block");

    $(".pseudo").text(infos.pseudo)
    $(".rang").text(infos.rang)
    $(".pts").text(infos.pts)

    restart();
}
function restart(){
    selected = -1;
    startTime = Date.now();

    $(".correct").removeClass("correct");
    $(".select").removeClass("select");
    $(".wrong").removeClass("wrong");
}
function select(ix){
    selected = ix;
    $($(".answer").get(ix)).addClass("select");

    socket.emit("game", {code: "M1", value: ix, time: Date.now()-startTime});
}
function reveal(msg){
    msg = msg.value;

    if(msg.correct === selected){
        $(".select").addClass("correct") .removeClass("select")
    }else{
        $(".select").addClass("wrong") .removeClass("select")

        $( $(".answer").get(msg.correct) ).addClass("correct")
    }

    $(".pts").text(msg.score)
    $(".rang").text(msg.rang)
    
    selected = -2; // Just to lock
}