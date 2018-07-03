require = window.nodeRequire;
function output(text, color){
    $("output").append(`<span style="color: ${color}">${text}</span>\n`);
}

var path = require("path");
var ansi = require("ansi-colors");

var app = require("express")();
var server = require("http").Server(app);

var io = require("socket.io")(server);

var superglobal = {};

app.all("/", function(req,res){
    res.sendFile(path.resolve(__dirname + "/../test/index.html"))
})
app.all(/\/.+/, function(req,res){
    res.sendFile(path.resolve(__dirname + "/../test" + req.url))
})



io.on("connection", function(socket){
    var peer = new Peer(socket);
});

var port = 8888;
server.listen(port, function(){
    output("Listening on port "+port, "bold");
});