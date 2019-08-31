superglobal.peers = {};

class Peer{
    constructor(socket){
        var $this = this;
        this.peer = this;
        this.socket = socket;
        this.id = socket.id;

        output("New peer generated #"+this.id, "yellow");

        socket.on("disconnect", (msg)=> this.onDisconnect(msg));
        socket.on("config", (msg)=>this.register(msg));
        socket.on("game", (msg)=>this.onGame(msg))
        socket.on("data", (msg)=>this.onData(msg))

        this.send("signal", {code: "Y1", text: "Successfully connected"});
    }

    onDisconnect(){
        output("Client disconnected #"+this.id, "gray");

        if(this.hasOwnProperty("user")){
            this.user.delete();
            delete superglobal.peers[this.user.username];
        }

        delete this;
    }

    register(msg){
        if(msg.code === "C1"){
            if(_Party.users.hasOwnProperty(msg.value)){
                this.send("signal", {code: "E2", text: "Username taken"});

                return false;
            }

            _Party.users[msg.value] = this;
            this.user = new User({username: msg.value, peer: this});

            return true;   
        }

        return false;
    }

    send(channel, msg){
        this.socket.emit(channel, msg);
        output(`Code sent : ${msg.code}`);
    }

    onGame(msg){
        if(_Server.running === false) return false;
        console.log(_Server.running)

        if(msg.code == "M1"){ // Envoi de la Réponse à la qestion
            try{
                this.user.answer(msg.value, msg.time)
            }catch{}
        }
    }

    onData(msg){
        if(_Party.state == g_s.PLAYING) _Intent.onData(msg, this.user);
    }
}
