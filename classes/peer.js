superglobal.peers = {};

class Registry{
    constructor(){
        
    }
}
Registry = new Registry();

class Peer{
    constructor(socket){
        var $this = this;
        this.peer = this;
        this.socket = socket;
        this.id = socket.id;

        output("New peer generated #"+this.id, "yellow");

        socket.on("disconnect", (msg)=> this.onDisconnect(msg));
        socket.on("config", (msg)=>this.register(msg));

        this.send("signal", {code: "Y1", text: "Successfully connected"});
    }

    onDisconnect(){
        output("Client disconnected #"+this.id, "gray");

        if(this.hasOwnProperty("user")){
            this.user.delete();
            delete superglobal.peers[this.user.username];
        }

        

        delete this;
        console.log(this)
    }

    register(msg){
        if(msg.code === "C1"){
            if(superglobal.users.hasOwnProperty(msg.value)){
                this.send("signal", {code: "E2", text: "Username taken"});

                return false;
            }
            console.log(superglobal.users);

            superglobal.users[msg.value] = this;
            this.user = new User({username: msg.value, peer: this});

            return true;   
        }

        return false;
    }

    send(channel, msg){
        this.socket.emit(channel, msg);
        output(`Code sent : ${msg.code}`);

        return "hd";
    }

    
}
