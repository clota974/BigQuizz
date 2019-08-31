require = window.nodeRequire;

const {ipcRenderer} = require("electron");
const {remote} = require("electron");
const {dialog} = remote;
const path = require("path");
const ansi = require("ansi-colors");
const fs = require("fs");
const os = require('os');

var superglobal = {};

var started = false;

remote.getCurrentWindow().removeMenu();


function output(text, color){

    var ansiText = text;
    if(ansi.hasOwnProperty(color)) ansiText = ansi[color](text);

    ipcRenderer.send("log", ansiText);
}

_Party = null; /// GLOBAL
$(document).ready(function(){
    _Party = new Party();
    _Server = new Server();

    $("body").on("keydown", function(ev){
        if( $("input").is(":focus") ) return true;

        var k = ev.key.toLowerCase();

        if(k === "enter" && !started){
            ev.preventDefault();
            _Party.startGame();
        } else if(k === " "){
            _Party.pause();
        } else if(k === "o"){
            _Party.toggleOptions();
        } else if(k === "s"){
            let v = $("#zoom").val();
            
            if(v <= 15) return true;

            $("#zoom").val(+v-15);
            _Party.changeSettings();
        } else if(k === "z"){
            let v = $("#zoom").val();
            $("#zoom").val(+v+15);
            _Party.changeSettings();
        } else if(k === "0"){
            $("#zoom").val("100");
            _Party.changeSettings();
        } else if(k === "f"){
            remote.getCurrentWindow().setFullScreen(true);
        } else if(k === "a" && ev.shiftKey ===true){
            _Party.auto();
        } else if(k === "i" && ev.shiftKey ===true){
            remote.getCurrentWindow().toggleDevTools();
        }
    })

    $("#loadFile").on("click", function(){
        _Party.getQuestions();
    })
    $("#defaultFile").on("click", function(){
        _Party.processQuestions("default");
    })
    $(".settings input").on("keyup change",function(){
        _Party.changeSettings();
    })

    $("#serverStart").click(function(){
        var code = $("#gameCode").val();
        if(code === ""){
            alert("Veuillez entrer un game code correct.")

            return false;
        }

        _Server.startServer(code);
    });
    $("#serverStop").click(e => _Server.stopServer())

    $("#disconnectAll").click(function(){
        _Party.disconnectAll();
    })

    $("#resetScore").click(function(){
        _Party.resetScores();
    });

    
    /*** RANDOM TEST

    for (let jx = 0; jx < 100; jx++) {
        let a = [1,2,3,4];
        let p = {};

        for (let ix = 0; ix < 10000; ix++) {
            r = a.sort( () => 0.5 - Math.random())
            r = JSON.stringify(r)
    
            if(!p.hasOwnProperty(r)) p[r] = 0
            else p[r]++
        }

        var o = []
        var i = 0;

        for(let key in p){
            i++;
            if(key === "[1,4,2,3]") console.log(i);
            o.push([key, p[key]])
        }

        o.sort((a,b) => a[1]-b[1])

        // console.table(o);
    }

    ***/

    
});