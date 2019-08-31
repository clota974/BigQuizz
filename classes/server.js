const QRCode = require("qrcode");

class Server{
    constructor(){
        this.running = false;
        this.app = require("express")();
        this.server = require("http").Server(this.app);
        this.port = 80;
        this.ip = this.getIp();

        var io = require("socket.io")(this.server);

        io.on("connection", function(socket){
            var peer = new Peer(socket);
        });
    }

    getIp(){
        var ifaces = os.networkInterfaces();
        var ip = null;

        /// get IP
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
                }

                ip = iface.address;
                ++alias;
            });
        });

        return ip;
    }

    startServer(code){

        if(this.running) this.stopServer();

        this.app.all("/g/"+code, function(req,res){
            res.sendFile(path.resolve(__dirname + "/../client/client.html"))
        })
        this.app.all(/\/g\/(.+)/, function(req,res){
            res.sendFile(path.resolve(__dirname + "/../client/error.html"))
        })
        this.app.all(/\/.+/, function(req,res){
            res.sendFile(path.resolve(__dirname + "/../client/" + req.url))
        })

        this.server.listen(this.port, function(){
            output("Listening on port "+_Server.port, "bold");
        });

        _Party.allUsers(function(user){
            user.peer.send("signal", {code: "Y1", text: "Successfully connected"});
            user.delete();
        })

        var link = `http://${this.ip}/g/${code}/`

        QRCode.toDataURL(link)
            .then(url => {
                var img = $("<img></img>");
                $(img).attr("src", url);
                $(".qrCode").html("");
                $(".qrCode").append(img)
            })
            .catch(err => {
                console.error("Impossible de créer le QR Code")
            })

        this.running = true;

        $("#serverStatus").text("Marche");
        $(".link").text(link);
    }

    stopServer(){
        if(!this.running) return false;

        this.server.close();

        this.running = false;

        $("#serverStatus").text("Arrêt");
        $(".link").text("Aucun");

        output("Server closed", "red");
    }
}