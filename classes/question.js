class Question{
    constructor(type, params){

        this.type = type;
        this.params = params;
        this.loadTexte();
    }

    loadTexte(){
        var q = this.params;

        $(".question-box div").text(q.question)

        var answers = [...q.reponses];


        // Shuffle
        answers.sort(() => 0.5 - Math.random());

        for (let ix = 0; ix < 4; ix++) {
            $($(".answer .text")[ix]).text(answers[ix]);

            if(answers[ix] === q.reponses[0]) q.correct = ix;
        }

        this.startTimer()
        _Party.openQuestion();
    }

    startTimer(updater){
        var self = this;
        this.startTime = Date.now();
        this.updateTime();

        this.interval = setInterval(function(){
            self.updateTime();
        },1000);
    }

    updateTime(){
        var timerMax = _Party.timerMax;
        var delta = (Date.now() - this.startTime)/1000;
        var progress = ((delta+1)/timerMax)*100
        
        $(".timerline").css("width", progress+"%")

        $(".countdown").css("opacity",1)
        $(".countdown").text(timerMax - Math.round(delta))

        if(delta>=timerMax) this.stopTimer();
    }

    stopTimer(){
        var self = this;

        clearInterval(this.interval);

        setTimeout(function(){
            $(".timerline").css("width", 0)
            $(".countdown").css("opacity",0)
        }, 2000)

        $( $(".answer")[this.params.correct] ).addClass("correct");

        _Party.revealAnswer();
    }

    finish(){
        _Party.closeQuestion();
    }

}