/** 
const timeBeforeGame = 7;
const countdownSteps = 5;
const classementTime = 8;
/***/

const timeBeforeGame = 7;
const countdownSteps = 5;
const classementTime = 8;

class Game{
    constructor(name){
        this.name = name;
        this.rootPath = path.resolve(__dirname+"/../games/"+name);

        var XMLdesc = fs.readFileSync(this.rootPath+"/descriptif.xml"); // ==> Buffer : descriptif
        XMLdesc = $.parseXML(XMLdesc.toString()); // Conversion du descriptif en XML

        this.title = $(XMLdesc).find("title").text();
        this.slogan = $(XMLdesc).find("slogan").text();
        this.description = $(XMLdesc).find("description").text();

        //this.loadInstructions();

        var clientHTML = fs.readFileSync(this.rootPath+"/client.html").toString();
        this.clientHTML = clientHTML;
    }

    loadInstructions(){
        var $this = this;
        // Changement du contenu HTML

        //Affichage des instructions
        $("section.instructions .titles h1").text(this.title);
        $("section.instructions .titles h2").text(this.slogan);
        $("section.instructions p").text(this.description);


        //Insertion de intent.css
        var css = $(`<link id="intentcss" rel="stylesheet" href="${this.rootPath}/intent.css"/>`);
        $("head").append(css);

        //Insertion de intent.html
        $("section.intent").load(this.rootPath+"/intent.html", null, function(){
            //Insertion de intent.js
            console.info(`<script src="${$this.rootPath}/intent.js"></script>`)
            var js = $(`<script id="intentjs" src="${$this.rootPath}/intent.js"></script>`);
            $("head").append(js);

            $this.startCountdown();
            $this.showInstructions();
            //setTimeout(()=>$this.showGame(), 10);
        });        
    }

    startCountdown(){
        setTimeout(()=>this.showCountdown(), (timeBeforeGame-countdownSteps)*1000);
    }

    showInstructions(){
        $("div.banniere").addClass("show");
        setTimeout(function(){
            $(".leaderboard").css("display", "none");
            $(".instructions").css("display", "block");
            $("div.banniere").removeClass("show");
        }, 900);

        this.state = g_s.LOBBY;
    }

    showCountdown(){
        var $this = this;
        $(".instructions .countdown").css({opacity: 1});

        this.countdownSteps = countdownSteps;
        $(".instructions .countdown").text(Math.round($this.countdownSteps));

        this.countdownFunc = setInterval(function(){
            $this.countdownSteps -= 1;
            
            if($this.countdownSteps == 0){
                $(".instructions .countdown").text("Prêts?");
                $(".instructions .countdown").css({opacity: 0});
                clearInterval($this.countdownFunc);
                $this.showGame();
                return false;
            }

            $(".instructions .countdown").text($this.countdownSteps);
        }, 1000);
    }

    showGame(){
        _Party.state = g_s.PREPLAYING;

        _Intent.onShow(_Party.readyUsers);

        $("div.banniere").addClass("show");
        setTimeout(function(){
            $(".instructions").css("display", "none");
            $(".intent").css("display", "block");
            $("div.banniere").removeClass("show");

            setTimeout(()=>_Intent.onPreStart(), 500);
        }, 900);

        io.in("ready").emit("game", {code:"G2", text:"Affichage du jeu"});

        for (const id in _Party.readyUsers) {
            const userObj = _Party.readyUsers[id];

            _Party.players[id] = userObj;

            userObj.peer.socket.leave("ready");
            userObj.peer.socket.join("players");

        }

    }

    delete(){
        $(".instructions .readyBox").text("");

        $("#intentcss").remove();
        $("#intentjs").remove();

        for(const user in _Party.users){
            _Party.users[user].data = {};
        }

        _Party.players = {};
        _Party.readyUsers = {};
    }
}