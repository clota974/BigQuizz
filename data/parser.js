const fs = require("fs");
var buffer = fs.readFileSync("/Users/Killian/Desktop/Programmation/Electron/BigQuizz/data/tmp.json");
var string = buffer.toString();
        
var json = JSON.parse(string);

var l = {};

l.titre = json["thème"];
l.data = [];

var questions = json.quizz["débutant"].concat(
    json.quizz["confirmé"].concat(
        json.quizz["expert"]
    )
)

for(d of questions){
    let tmp = {
        question: d.question,
        reponses: []
    }

    tmp.reponses.push(d["réponse"]);

    for(p of d.propositions){
        if(p === d["réponse"]) continue;

        tmp.reponses.push(p)
    }

    l.data.push(tmp)
}

fs.writeFileSync("/Users/Killian/Desktop/Programmation/Electron/BigQuizz/data/output.json", JSON.stringify(l))