const u_s = {
    CONFIGURING: "US1",
    WAITING: "US3", // Waiting for game data
    UNREADY: "US4", // Data received but not ready
    READY: "US5", // Data received but not ready
    PLAYING: "US6"

}
class User{
    constructor(args){
        this.username = args.username;
        this.peer = args.peer;

        this.answerIx = -1;
        this.fullScore = 0;
        this.rang = -1;
        this.time = Infinity;

        _Party.addUser(this);
        this.peer.socket.join("users");

        output("New user generated : @" + this.username, "green");
        var t = this.peer.send("info", {code: "Y2", text: `User ${this.username} registered`, info: {rang: _Party.getNumberOfUsers(), pseudo: this.username}});
    }

    delete(){
        $(this.ranker).remove();

        delete _Party.users[this.username];

        _Party.updateData();
    }
    
    answer(ix, time){
        this.answerIx = ix;
        this.time = time;

        $(this.ranker).children(".patch").addClass("answered");
    }
}