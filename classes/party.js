if(typeof fs == "undefined"){
    fs = require("fs");
}


class Party{
    constructor(){
        this.users = {};

        this.paused = 0;
        this.playing = false;
        this.optionsShown = true;
        this.timerMax = 20;
        this.tempsEntreQuestions = 6;
        this.holdTime = 3;
        this.gameCode = null;
        this.ip = null;
        this.filename = null;
        this.scoreBonneReponse = 1
        this.scorePlusRapide = 0
        this.scoreMauvaiseReponse = 0
        this.scorePlusLent = 0
        this.zoom = 100;

        this.questionList = null;
        this.currentQuestion = null;
        this.currentQuestionIx = null; // Integer
        this.remainingQuestions = [];
        this.effectifs = [0,0,0,0];

        $(".player-list").html("");

        $(".answer-box .answer").css("width", "100px");
        $(".answer .effectif").css("opacity", 0);
    }

    addUser(userObj){
        var ranker = $(`
        <div class="player">
            <div class="patch trp"></div>
            <div class="name">${userObj.username}</div>
            <div class="score">${userObj.fullScore}</div>
        </div>
        `);
        $(".player-list").append(ranker);
        userObj.ranker = ranker;

        var height = $(".player").height();
        $(ranker).css("top", height*(this.getNumberOfUsers()-1));

        this.updateData();
    }

    allUsers(fn){
        for(let key in this.users){
            let user = this.users[key].user;
            fn(user);
        }
    }

    disconnectAll(){
        _Party.allUsers(function(user){
            user.peer.send("signal", {code: "E3", value:"Vous avez été déconnecté par le serveur"})
        })
    }

    getNumberOfUsers(){
        return Object.keys(this.users).length;
    }

    toggleOptions(){
        this.optionsShown = !this.optionsShown;
        
        $(".options").css("opacity", this.optionsShown?1:0)

    }

    changeSettings(){
        this.timerMax = $("#timerMax").val() != "" ? parseInt($("#timerMax").val()) : this.timerMax;
        this.tempsEntreQuestions = $("#tempsEntreQuestions").val() != "" ? parseInt($("#tempsEntreQuestions").val()) : this.tempsEntreQuestions;
        this.scoreBonneReponse = $("#scoreBonneReponse").val() != "" ? parseInt($("#scoreBonneReponse").val()) : this.scoreBonneReponse;
        this.scoreMauvaiseReponse = $("#scoreMauvaiseReponse").val() != "" ? parseInt($("#scoreMauvaiseReponse").val()) : this.scoreMauvaiseReponse;
        this.scorePlusRapide = $("#scorePlusRapide").val() != "" ? parseInt($("#scorePlusRapide").val()) : this.scorePlusRapide;
        this.scorePlusLent = $("#scorePlusLent").val() != "" ? parseInt($("#scorePlusLent").val()) : this.scorePlusLent;
        this.zoom = parseInt($("#zoom").val()) || this.zoom;
        $(".zoomed").css("zoom", this.zoom/100);


        $("#timerMax").attr("placeholder", this.timerMax)
        $("#tempsEntreQuestions").attr("placeholder", this.tempsEntreQuestions)
        $("#scoreBonneReponse").attr("placeholder", this.scoreBonneReponse)
        $("#scoreMauvaiseReponse").attr("placeholder", this.scoreMauvaiseReponse)
        $("#scorePlusRapide").attr("placeholder", this.scorePlusRapide)
        $("#scorePlusLent").attr("placeholder", this.scorePlusLent)
        $("#zoom").attr("placeholder", this.zoom)

    }

    getQuestions(){
        var json = null;

        dialog.showOpenDialog({
            properties: ["openFile"]
        }, function(file){
            if(file.length != 1) return false;

            _Party.processQuestions(file[0]);
        })
    }

    updateData(){
        $("#numberOfPlayers").text(Object.keys(this.users).length);
        $("#remaining").text(this.remainingQuestions.length);

        var eta = (this.remainingQuestions.length) * ( this.timerMax + this.tempsEntreQuestions + this.holdTime);
        var eta_m = Math.floor(eta/60);
        var eta_s = eta%60;
        $("#endTime").text(`${eta_m} mins et ${eta_s}s`);

        if(this.questionList){
            var questionNumber = this.questionList.data.length - this.remainingQuestions.length;
            $(".question-number").text(questionNumber);
        }
    }

    processQuestions(filename){
        //  filename peut être égal à "default" ou "last"

        if(filename === "default") filename = "/Users/Killian/Desktop/Programmation/Electron/BigQuizz/data/default.json";
        else if(filename === "last") filename = this.filename;
        
        this.filename = filename;
        
        var buffer = fs.readFileSync(filename);
        var string = buffer.toString();
        
        var json = $.parseJSON(string);
        this.questionList = json;

        if(this.questionList === null) alert("Une erreur inconnue est survenue. @party.js:processQuestion")

        var data = this.questionList;
        
        $("#filename").html(filename);
        $("#gameTitle").text(data.titre);
        $(".welcome h1").html(data.titre);
        $("#numberOfQuestions, #remaining").html(this.questionList.data.length);

        this.remainingQuestions = [];
        for (let ix = 0; ix < data.data.length; ix++) {
            this.remainingQuestions.push(ix);
        }

        this.updateData();
    }

    startGame(){
        var self = this;

        if(this.playing || this.optionsShown) return false;
        
        if(this.questionList === null){
            alert("Veuillez charger un fichier! \nOuvrez les options en appuyant sur 0")
            return false;
        }

        if(_Server.running === false) alert("Aucun serveur n'est démarré!")

        this.paused = 0;

        $(".welcome, .winner").addClass("unopaque")
        $(".screen").removeClass("unopaque")

        this.playing = true;
        setTimeout(function(){
            self.loadNewQuestion();
        }, this.holdTime*1000)
    }

    loadNewQuestion(){
        // Choose new game among the list
        var ran = Math.floor(Math.random() * this.remainingQuestions.length);

        if(this.remainingQuestions.length === 0){
            this.endGame();
            return false;
        }
        
        this.currentQuestion = new Question("texte",this.questionList.data[ this.remainingQuestions[ran] ]);
        this.currentQuestionIx = ran;
        
        this.remainingQuestions.splice(this.currentQuestionIx,1)
        this.updateData();

        this.allUsers(function(user){
            user.peer.send("signal", {code: "M1", value: "NONE"})
            user.answerIx = -1;
        })

        $(".patch").removeClass("a b c d answered")
    
        this.effectifs = [0,0,0,0]
    }

    pause(){
        if(this.paused === 0){
            this.paused = 1;
            $(".timerbg").css("background", "#FFCB00");
        }else{
            if(this.paused === 2){
                this.paused = 0;                
                this.closeQuestion();
            }

            this.paused = 0;                

            $(".timerbg").css("background", "");

        }
    }

    openQuestion(){
        $(".question-box").css("opacity", 1)

        for (let ix = 0; ix < 4; ix++) {
            
            setTimeout(function(){
              $($(".answer-box .answer")[ix]).css("width", "");
            }, 200*(ix+1))            
        }

        $(".correct").removeClass("correct")
    }
    
    revealAnswer(){
        var self = this; 

        var fastest = [Infinity, null];
        var slowest = [-Infinity, null];
        this.allUsers(function(user){
            var correctIx = self.currentQuestion.params.correct;

            self.effectifs[user.answerIx] += 1;
            
            if(user.answerIx === correctIx){
                user.fullScore += _Party.scoreBonneReponse; // Bonne réponse

                if(user.time < fastest[0]) fastest = [user.time, user];
            }else{
                user.fullScore -= _Party.scoreMauvaiseReponse;
                if(user.time > slowest[0]) slowest = [user.time, user];
            }
        });

        $(".player").css("border-color", "")
        if(fastest[1] != null){
            $(fastest[1].ranker).css("border-color", "#FFCB00");
            fastest[1].fullScore += _Party.scorePlusRapide; // Le plus rapide
        }
        if(slowest[1] != null){
            $(slowest[1].ranker).css("border-color", "red");
            slowest[1].fullScore -= _Party.scorePlusLent; // Le plus lent
        }

        this.makeClassement();

        this.allUsers(function(user){
            if(user.fullScore < 0) user.fullScore = 0;

            var letters = ["a","b","c","d"];
            $(user.ranker).children(".patch").addClass(letters[user.answerIx])
            $(user.ranker).children(".score").text(user.fullScore)

            user.peer.send("signal", {code: "M2", value:{ 
                correct: self.currentQuestion.params.correct,
                score: user.fullScore,
                rang: user.rang
            }})
        });

        // Affiche les effectife
        for (let ix = 0; ix < 4; ix++) {
            $($(".answer").get(ix)) .children(".effectif") .text( self.effectifs[ix] )
            $(".answer .effectif").css("opacity", 1);
        }

        setTimeout(function(){
            _Party.currentQuestion.finish();
        }, this.tempsEntreQuestions*1000);
    }

    closeQuestion(loadNextQuestion){
        loadNextQuestion = loadNextQuestion || true;

        if(this.paused){
            this.paused = 2; // Waiting
            return false;
        }

        $(".question-box").css("opacity", 0)

        for (let ix = 0; ix < 4; ix++) {
            
            setTimeout(function(){
                $($(".answer-box .answer")[ix]).css("width", "100px");
                $(".answer .effectif").css("opacity", 0);
            }, 200*(ix+1))
        }

        setTimeout(function(){
            _Party.loadNewQuestion();
        }, this.holdTime*1000)
        
    }

    makeClassement(){
        var $this = this;

        var userArray = [];
        for (const obj in this.users) {
            userArray.push($this.users[obj]);
        }

        userArray.sort(function(a,b){
            return b.user.fullScore - a.user.fullScore
        });

        $(".player").removeClass("first second third")

        var lock = 0; // Si plusieurs joueurs ont le même score
        var lastScore = 0;
        for (let ix = 0; ix < userArray.length; ix++) {
            let user = userArray[ix].user;

            if(user.fullScore == lastScore){
                lock++;
            }else{
                lock = 0;
            }
            lastScore = user.fullScore;

            var place = ix + 1;
            user.top = place;

            place -= lock;
            place = place <= 0 ? 0 : place;
            user.rang = place;



            if(place === 1) $(user.ranker).addClass("first")
            if(place === 2) $(user.ranker).addClass("second")
            if(place === 3) $(user.ranker).addClass("third")

        }

        this.allUsers(function(user){
            var ranker = user.ranker; 
            var height = $(ranker).height();

            $(ranker).css("position", "absolute");
            $(ranker).css("top", height*(user.top-1))
        })
    }

    endGame(){
        this.playing = false;

        $(".winner h1").text("");
        $(".winner h2").text("Le vainqueur est ")

        var nWinners = 0;
        this.allUsers(function(user){
            if(user.rang !== 1) return false;

            if(nWinners>0){
                $(".winner h1").append(", ");
                $(".winner h2").text("Les vainqueurs sont")
            }

            $(".winner h1").append(user.username);
            nWinners++;
        });

        $(".game").addClass("unopaque");
        $(".winner").removeClass("unopaque")

        _Party.processQuestions("last");
    }

    resetScores(){
        this.allUsers(function(user){
            user.fullScore = 0;
        })
    }

    auto(){
        // _Party.processQuestions("/Users/Killian/Desktop/Programmation/Electron/BigQuizz/data/output.json");
        _Party.processQuestions("default");
        _Server.startServer("kiki");
        this.toggleOptions();
    }
}
