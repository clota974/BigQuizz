superglobal.users = {};

class User{
    constructor(args){
        this.username = args.username;
        this.peer = args.peer;

        superglobal.users[this.username] = this;

        output("New user generated : @" + this.username, "lightgreen");
        var t = this.peer.send("signal", {code: "Y2", text: `User ${this.username} registered`});
    }

    delete(){
        delete superglobal.users[this.username];
    }
}