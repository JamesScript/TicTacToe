let title = [];
let menu;
let game;
let font;
let firstGoChosen = false;

function preload() {
    font = loadFont(
        //"https://s3.amazonaws.com/aws-website-nuclearfallin-y1bb0/TypoWriter.otf"
        "TypoWriter.otf"
    );
}

function setup() {
    $("#p1").hide();
    $("#p2").hide();
    $("#c").hide();
    createCanvas(500, 500);
    angleMode(DEGREES);
    const str = "Tic Tac Toe";
    for (let i = 0; i < str.length; i++) {
        title[i] = new TitleChar(str[i], i);
    }
    menu = new Menu();
    game = new Game();
}

function draw() {
    background(50);
    for (let i = 0; i < title.length; i++) {
        title[i].show();
    }
    $("#p1").hide();
    $("#p2").hide();
    $("#c").hide();
    if (menu.page === 3) {
        if (!game.winScreen) {
            displayer();
        }
        if (!firstGoChosen) {
            let coinToss = Math.random();
            if (menu.numOfPlayers === 1) {
                coinToss >= 0.5 ? game.computerPlaying = true : game.computerPlaying = false;
            } else {
                coinToss >= 0.5 ? game.currentPlayer = 1 : game.currentPlayer = 2;
            }
            firstGoChosen = true;
        }
        game.show();
    }
    if (title[title.length - 6].done) {
        menu.show();
    }
}

function displayer() {
    if (game.computerPlaying) {
        $("#c").show();
    } else if (game.currentPlayer === 1) {
        $("#p1").show();
    } else if (game.currentPlayer === 2) {
        $("#p2").show();
    }
}

function Game() {
    this.computerPlaying = false;
    this.computerThinking = 0;
    this.cPlayed = false;
    this.currentPlayer = 1;
    this.winScreen = false;
    this.winner = 0;
    this.board = () => {
        stroke(255);
        fill(10);
        rect(80, 100, 330, 330);
        stroke(120);
        line(190, 110, 190, 420);
        line(300, 110, 300, 420);
        line(90, 210, 400, 210);
        line(90, 320, 400, 320);
    };
    this.data = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];
    this.reset = () => {
        this.data = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];
        firstGoChosen = false;
    };
    this.buttons = () => {
        for (let i = 0; i < this.data.length; i++) {
            if (!this.computerPlaying) {
                let sx = (i % 3 + 1) * 110 - 30;
                let ex = sx + 110;
                let sy = Math.floor(i / 3) * 110 + 180 - 70;
                let ey = sy + 110;
                if (
                    mouseX > sx &&
                    mouseX < ex &&
                    mouseY > sy &&
                    mouseY < ey &&
                    mouseIsPressed &&
                    this.data[i] === "-"
                ) {
                    if (this.currentPlayer === 1) {
                        menu.player1isX ? (this.data[i] = "x") : (this.data[i] = "o");
                        menu.numOfPlayers === 2
                            ? (this.currentPlayer = 2)
                            : (this.computerPlaying = true);
                        this.computerThinking = 20;
                    } else {
                        menu.player1isX ? (this.data[i] = "o") : (this.data[i] = "x");
                        this.currentPlayer = 1;
                    }
                }
            }
        }
    };
    this.easy = () => {
        if (this.computerThinking > 0) {
            this.computerThinking--;
        } else {
            let choice = Math.floor(Math.random() * 9);
            if (this.data[choice] === "-") {
                menu.player1isX ? (this.data[choice] = "o") : (this.data[choice] = "x");
                this.computerPlaying = false;
            } else {
                this.easy();
            }
        }
    };
    this.hard = () => {
        if (this.computerThinking > 0) {
            this.computerThinking--;
        } else {
            this.cPlayed = false;
            this.lookForWin();
            let p1side = menu.player1isX ? "x" : "o";
            let compSide = menu.player1isX ? "o" : "x";
            let regP1 = p1side === "x" ? /x/g : /o/g;
            let regCp = p1side === "o" ? /x/g : /o/g;
            let corners = this.data[0] + this.data[2] + this.data[6] + this.data[8];
            let edges = this.data[1] + this.data[3] + this.data[5] + this.data[7];
            // If first go, go in corner
            if (this.data.join("").indexOf(p1side) === -1) {
                let numArr = [0, 2, 6, 8];
                this.data[numArr[Math.floor(Math.random() * 4)]] = compSide;
            } else if (
                // If one of the corners is taken and it's their first move, take the centre
                (corners.indexOf(p1side) > -1 &&
                this.data[4] === "-" &&
                !this.cPlayed) ||
                // OR if the opponents starting move is an edge - take the centre
                (this.data.join("").match(regP1) !== null &&
                this.data.join("").match(regP1).length === 1 &&
                this.data[4] === "-" &&
                !this.cPlayed &&
                edges.indexOf(p1side) > -1)
            ) {
                this.data[4] = compSide;
                console.log("1");
            } else if (
                this.data.join("").match(regP1) !== null &&
                this.data.join("").match(regP1).length === 1 &&
                this.data.join("").indexOf(p1side) === 4 &&
                this.data.join("").indexOf(compSide) === -1
            ) {
                // If center is taken and computer hasn't gone, go for a random corner
                console.log("2");
                let cornRnd = Math.floor(Math.random() * 4);
                switch (cornRnd) {
                    case 0:
                        this.data[0] = compSide;
                        break;
                    case 1:
                        this.data[2] = compSide;
                        break;
                    case 2:
                        this.data[6] = compSide;
                        break;
                    case 3:
                        this.data[8] = compSide;
                        break;
                }
                // Centre is taken and no obvious win for either side, go for a remaining corner
            } else if (
                this.data[4] === p1side &&
                corners.match(regP1) !== null &&
                corners.match(regCp) !== null &&
                corners.match(regP1).length === 1 &&
                corners.match(regCp).length === 1
            ) {
                console.log("3");
                let rnd4 = Math.floor(Math.random() * 4);
                while (corners[rnd4] !== "-") {
                    rnd4 = Math.floor(Math.random() * 4);
                }
                let numArr = [0, 2, 6, 8];
                this.data[numArr[rnd4]] = compSide;
            } else if (
                // If one or more corners has player1's mark and the computer's already taken the centre and edges have a space
                corners.indexOf(p1side) > -1
                && this.data[4] === compSide
                && edges.indexOf("-") > -1
                && !this.cPlayed
            ) {
                console.log("4");
                let rnd4 = Math.floor(Math.random() * 4);
                while (edges[rnd4] !== "-") {
                    rnd4 = Math.floor(Math.random() * 4);
                }
                let numArr = [1, 3, 5, 7];
                this.data[numArr[rnd4]] = compSide;
            } else if (
                edges.match(regP1) !== null
                && edges.match(regP1).length === 2
                && !this.cPlayed
                && this.data.join("").match(regP1) !== null
                && this.data.join("").match(regP1).length === 2
            ) {
                console.log("5");
                // If opponent has played twice; Two edges (not opposite - picked up by lookForWin function) have been played by opponent, fill in between them to stop them guaranteeing a win
                if (this.data[1] === p1side) {
                    this.data[3] === p1side ? this.data[0] = compSide : this.data[2] = compSide;
                } else {
                    this.data[3] === p1side ? this.data[6] = compSide : this.data[8] = compSide;
                }
            } else if (!this.cPlayed) {
                console.log("6");
                this.easy();
            }
            this.computerPlaying = false;
        }
    };
    this.lookForWin = () => {
        let compSide = menu.player1isX ? "o" : "x";
        let xClose = /xx-|x-x|-xx/g;
        let oClose = /oo-|o-o|-oo/g;
        let compReg = compSide === "x" ? xClose : oClose;
        let pReg = compSide === "x" ? oClose : xClose;
        let goLook = reg => {
            for (let i = 0; i < 3; i++) {
                // Horizontal possibilities
                let horizontal =
                    this.data[i * 3] + this.data[i * 3 + 1] + this.data[i * 3 + 2];
                if (reg.test(horizontal)) {
                    this.data[i * 3 + horizontal.indexOf("-")] = compSide;
                    return false;
                }
                // Vertical possibilities
                let vertical = this.data[i] + this.data[i + 3] + this.data[i + 6];
                if (reg.test(vertical)) {
                    this.data[i + vertical.indexOf("-") * 3] = compSide;
                    return false;
                }
            }
            let diag1 = this.data[0] + this.data[4] + this.data[8];
            if (reg.test(diag1)) {
                this.data[diag1.indexOf("-") * 4] = compSide;
                return false;
            }
            let diag2 = this.data[2] + this.data[4] + this.data[6];
            if (reg.test(diag2)) {
                this.data[diag2.indexOf("-") * 2 + 2] = compSide;
                return false;
            }
            return true;
        };
        if (goLook(compReg)) {
            if (!goLook(pReg)) {
                this.cPlayed = true;
            }
        } else {
            this.cPlayed = true;
        }
    };
    this.check = () => {
        // Tie if board complete, and not overridden by code below
        if (!/\-/.test(this.data.join(""))) {
            this.wins("tie");
        }
        for (let i = 0; i < 3; i++) {
            // Horizontal possibilities
            if (
                this.data[i * 3] !== "-" &&
                this.data[i * 3] === this.data[i * 3 + 1] &&
                this.data[i * 3 + 1] === this.data[i * 3 + 2]
            ) {
                this.wins(this.data[i * 3]);
            }
            // Vertical possibilities
            if (
                this.data[i] !== "-" &&
                this.data[i] === this.data[i + 3] &&
                this.data[i + 3] === this.data[i + 6]
            ) {
                this.wins(this.data[i]);
            }
        }
        // Diagonal possibilities
        if (
            this.data[0] !== "-" &&
            this.data[0] === this.data[4] &&
            this.data[4] === this.data[8]
        ) {
            this.wins(this.data[4]);
        }
        if (
            this.data[2] !== "-" &&
            this.data[2] === this.data[4] &&
            this.data[4] === this.data[6]
        ) {
            this.wins(this.data[4]);
        }
    };
    this.wins = sym => {
        if (sym === "x") {
            menu.player1isX ? (this.winner = 1) : (this.winner = 2);
        } else if (sym === "o") {
            menu.player1isX ? (this.winner = 2) : (this.winner = 1);
        } else {
            this.winner = 0;
        }
        this.winScreen = true;
    };
    this.mark = () => {
        for (let i = 0; i < this.data.length; i++) {
            textSize(70);
            fill(255);
            if (this.data[i] === "x") {
                text("X", (i % 3 + 1) * 110, Math.floor(i / 3) * 110 + 180);
            } else if (this.data[i] === "o") {
                text("O", (i % 3 + 1) * 110, Math.floor(i / 3) * 110 + 180);
            }
        }
    };
    this.show = () => {
        if (this.winScreen) {
            if (this.winner === 3) {
                textSize(50);
                fill(255);
                text("Computer Wins", 40, 250);
            } else if (this.winner === 1) {
                textSize(50);
                fill(255);
                text("Player 1 Wins", 40, 250);
            } else if (this.winner === 2) {
                textSize(50);
                fill(255);
                text("Player 2 Wins", 40, 250);
            } else {
                textSize(50);
                fill(255);
                text("It's A Tie", 110, 250);
            }
        } else {
            this.board();
            this.mark();
            this.buttons();
            this.check();
            if (this.computerPlaying) {
                menu.easy ? this.easy() : this.hard();
            }
        }
    };
}

function TitleChar(c, ind) {
    this.chr = c;
    this.yOff = 30;
    this.xOff = 40;
    this.ind = ind;
    this.ang = this.ind * 28;
    this.speed = 5;
    this.rotSpeed = 4;
    this.size = 1;
    this.y = this.ind * this.yOff + 500;
    this.done = false;
    this.show = () => {
        textSize(this.size);
        textFont(font);
        push();
        translate(this.ind * this.xOff + 30, this.y);
        rotate(this.ang);
        fill(0);
        text(this.chr, 10, 2);
        fill(255);
        text(this.chr, 0, 0);
        pop();
        if (this.y > 60) {
            this.y -= this.speed;
            this.ang -= this.rotSpeed;
        } else if (Math.abs(this.ang) % 360 !== 0) {
            this.ang--;
        } else {
            this.done = true;
        }
        if (this.size < 60) {
            this.size++;
        }
    };
}

function Menu() {
    this.underline = 0;
    this.hidden = 255;
    this.page = 0;
    this.transitioning = false;
    this.targetPage = 0;
    this.numOfPlayers = 1;
    this.player1isX = true;
    this.easy = true;
    this.show = () => {
        // Underline title
        noStroke();
        fill(0);
        rect(50, 72, this.underline, 10);
        fill(255);
        rect(40, 70, this.underline, 10);
        if (this.underline < 430) {
            this.underline += 5;
        }
        cursor(ARROW);
        strokeWeight(5);
        // Page 0 - One or Two Player
        if (this.page === 0) {
            textSize(24);
            // one player button
            if (mouseX > 150 && mouseX < 350 && mouseY > 150 && mouseY < 250) {
                cursor(HAND);
                stroke(252);
                fill(120);
                rect(150, 150, 200, 100, 10);
                noStroke();
                fill(255);
                text("One Player", 175, 210);
                if (mouseIsPressed) {
                    this.transitioning = true;
                    this.targetPage = 1;
                    this.numOfPlayers = 1;
                    game.currentPlayer = 1;
                    firstGoChosen = false;
                }
            } else {
                stroke(152);
                fill(86);
                rect(150, 150, 200, 100, 10);
                noStroke();
                fill(0);
                text("One Player", 175, 210);
            }
            // two player button
            if (mouseX > 150 && mouseX < 350 && mouseY > 300 && mouseY < 400) {
                cursor(HAND);
                stroke(252);
                fill(120);
                rect(150, 300, 200, 100, 10);
                noStroke();
                fill(255);
                text("Two Player", 175, 360);
                if (mouseIsPressed) {
                    this.transitioning = true;
                    this.targetPage = 1;
                    this.numOfPlayers = 2;
                    game.computerPlaying = false;
                    firstGoChosen = false;
                }
            } else {
                stroke(152);
                fill(86);
                rect(150, 300, 200, 100, 10);
                noStroke();
                fill(0);
                text("Two Player", 175, 360);
            }
        }
        // Page 1 - One player, choose X or O
        if (this.page === 1) {
            textSize(30);
            text("Player 1 choose:", 100, 200);
            // X
            if (mouseX > 100 && mouseX < 200 && mouseY > 250 && mouseY < 350) {
                cursor(HAND);
                stroke(252);
                fill(120);
                rect(100, 250, 100, 100, 10);
                noStroke();
                fill(255);
                textSize(50);
                text("X", 133, 315);
                if (mouseIsPressed) {
                    this.player1isX = true;
                    this.transitioning = true;
                    this.targetPage = 2;
                }
            } else {
                stroke(152);
                fill(86);
                rect(100, 250, 100, 100, 10);
                noStroke();
                fill(0);
                textSize(50);
                text("X", 133, 315);
            }
            // O
            if (mouseX > 300 && mouseX < 400 && mouseY > 250 && mouseY < 350) {
                cursor(HAND);
                stroke(252);
                fill(120);
                rect(300, 250, 100, 100, 10);
                noStroke();
                fill(255);
                textSize(50);
                text("O", 333, 315);
                if (mouseIsPressed) {
                    this.player1isX = false;
                    this.transitioning = true;
                    this.targetPage = 2;
                }
            } else {
                stroke(152);
                fill(86);
                rect(300, 250, 100, 100, 10);
                noStroke();
                fill(0);
                textSize(50);
                text("O", 333, 315);
            }
        }
        // Page 2 - Easy or Hard, skip if two player
        if (this.page === 2) {
            if (this.numOfPlayers === 2) {
                this.page = 3;
            } else {
                textSize(30);
                text("Choose difficulty", 100, 120);
                // Easy
                if (mouseX > 150 && mouseX < 350 && mouseY > 150 && mouseY < 250) {
                    cursor(HAND);
                    stroke(252);
                    fill(120);
                    rect(150, 150, 200, 100, 10);
                    noStroke();
                    fill(255);
                    text("Easy", 210, 210);
                    if (mouseIsPressed) {
                        this.easy = true;
                        this.transitioning = true;
                        this.targetPage = 3;
                    }
                } else {
                    stroke(152);
                    fill(86);
                    rect(150, 150, 200, 100, 10);
                    noStroke();
                    fill(0);
                    text("Easy", 210, 210);
                }
                // Hard
                if (mouseX > 150 && mouseX < 350 && mouseY > 300 && mouseY < 450) {
                    cursor(HAND);
                    stroke(252);
                    fill(120);
                    rect(150, 300, 200, 100, 10);
                    noStroke();
                    fill(255);
                    text("Hard", 210, 360);
                    if (mouseIsPressed) {
                        this.easy = false;
                        this.transitioning = true;
                        this.targetPage = 3;
                    }
                } else {
                    stroke(152);
                    fill(86);
                    rect(150, 300, 200, 100, 10);
                    noStroke();
                    fill(0);
                    text("Hard", 210, 360);
                }
            }
        }
        // Page 3 - main game, reset button
        if (this.page === 3) {
            if (mouseX > 150 && mouseX < 350 && mouseY > 450 && mouseY < 490) {
                cursor(HAND);
                stroke(252);
                fill(120);
                rect(150, 450, 200, 40, 10);
                noStroke();
                textSize(20);
                fill(255);
                text("Reset", 215, 480);
                if (mouseIsPressed) {
                    this.transitioning = true;
                    this.targetPage = 0;
                    game.reset();
                }
            } else {
                stroke(152);
                fill(86);
                rect(150, 450, 200, 40, 10);
                noStroke();
                textSize(20);
                fill(0);
                text("Reset", 215, 480);
            }
        }
        // Hiding box
        noStroke();
        fill(50, this.hidden);
        rect(5, 85, 490, 410);
        if (this.transitioning) {
            this.hidden += 5;
            if (this.hidden >= 250) {
                this.transitioning = false;
                this.page = this.targetPage;
                game.winScreen = false;
            }
        } else if (this.hidden > 0) {
            this.hidden -= 5;
        }
    };
}
