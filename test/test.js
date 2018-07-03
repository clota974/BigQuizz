var socket = io();

var resp = {
    "Y1": signIn,
    "E2": cancelSignIn
}


$(document).ready(function(){
    $("#one").click(function(){
        socket.emit("hello", {code: "A1"});
    });

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
});

function output(message, color){
    $("output").append(`<span style="color: ${color}">${message}</span><br/>`);
}

function signIn(){
    var username = "Killian";
    output("Trying to register user", "orange");

    socket.emit("config", {code:"C1", text: "Username registration", value: username});
}
function cancelSignIn(){

}