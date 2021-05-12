var field = []; //10x20
var temp = [];
var fieldLength = 10;
var fieldHeight = 20;
var game_width = 200;
var game_height = 400;

var score = 0;

var pixelHeight = game_height / fieldHeight;
var pixelWidth = game_width / fieldLength;
var i = 0;
var j = 0;
var r = 0;
var x = 0;
var isFilled = [];

var gameOver = false;

var mobile = true;

var isNewStone = false;
var dropDown = false;

var stoneI = ['0,4','1,4','2,4','3,4'];
var stoneJ = ['0,3','1,3','1,4','1,5'];
var stoneL = ['0,5','1,3','1,4','1,5'];
var stoneO = ['0,4','0,5','1,4','1,5'];
var stoneS = ['0,4','0,5','1,3','1,4'];
var stoneZ = ['0,3','0,4','1,4','1,5'];
var stoneT = ['0,4','1,3','1,4','1,5'];

var stoneIColor = "#01F0F1";
var stoneJColor = "#0101F0";
var stoneLColor = "#EFA000";
var stoneOColor = "#F0F001";
var stoneSColor = "#02EF00";
var stoneZColor = "#F00100";
var stoneTColor = "#A000F1";

var actColor = "";
var actStoneID = 0;

var fps = 1;
var fpsInterval, now, then, elapsed;

var actStoneType = 0;
var nextStoneType = 0;
var rotationType = 0;

var stone = [];

//Audio
var a_music = new Audio('res/tetris_theme_short.mp3');
a_music.loop = true;
a_music.volume = 0.15;
a_music.preload = 'auto';

var a_move = new Audio('res/move.mp3');
var a_spin = new Audio('res/rotate.mp3');
var a_land = new Audio('res/land.mp3');
var a_hardland = new Audio('res/drop.mp3');

var a_single = new Audio('res/1_single.mp3');
var a_double = new Audio('res/2_double.mp3');
var a_triple = new Audio('res/3_triple.mp3');
var a_tetris = new Audio('res/4_tetris.mp3');

var a_gameover = new Audio('res/gameover.mp3');
a_gameover.volume = 0.1;

//Init Field
function initField() {
    for(i=0;i<fieldHeight;i++) {
        temp = [];
        for(j=0;j<fieldLength;j++) {
            temp.push(0);
        }
        field.push(temp);
    }
}

//Maus und Touch
function onpress(evt) {
    var xPos;
    var yPos;

    if(mobile) {
        xPos = evt.touches[0].pageX;
        yPos = evt.touches[0].pageY;
    } else {
        xPos = evt.pageX;
        yPos = evt.pageY;
    }
    if(!gameOver) {
        if(xPos >= 150 && yPos <= game_height) {
            moveStoneInField(false);
        } else if(xPos <= 50 && xPos >= 0 && yPos <= game_height) {
            moveStoneInField(true);
        } else if(xPos <= 135 && yPos > game_height) {
            fps = 60;
            fpsInterval = 1000 / fps;
            dropDown = true;
        } else if(xPos >= 145 && yPos > game_height) {
            rotateStoneInField();
        }
    }
}

//Tatstur Down
function checkKeyDown(e) {
    e = e || window.event;

    if(!gameOver) {
        if (e.keyCode == '38') {
            // up arrow
            rotateStoneInField();
        }
        else if (e.keyCode == '40' && !isNewStone) {
            // down arrow
            fps = 60;
            fpsInterval = 1000 / fps;
            dropDown = true;
        }
        else if (e.keyCode == '37') {
            // left arrow
            moveStoneInField(true);
        }
        else if (e.keyCode == '39') {
            // right arrow
            moveStoneInField(false);
        }
        else if (e.keyCode == '77') {
            // right arrow
            a_music.play();
        }
    }
}

//Tastatur Up
function checkKeyUp(e) {
    e = e || window.event;

    if (e.keyCode == '40') {
        // down arrow
        fps = 2;
        fpsInterval = 1000 / fps;
        isNewStone = false;
        dropDown = false;
    }
}

//Game Loop
function main() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var evt = "touchstart";
    if (width >= 500) {
        width  = 320;
        height = 480;
        evt = "mousedown";
        mobile = false;
    }

    if(!mobile) {
        document.onkeydown = checkKeyDown;
        document.onkeyup = checkKeyUp;
    }
    document.addEventListener(evt, onpress);


    fpsInterval = 1000 / fps;
    then = Date.now();
    nextStoneType = Math.floor(Math.random() * 6);
    printUI();
    drawField();
    initField();
    spawnStone();
    a_music.play();
    run();
}

function run() {
    // request another frame
    window.requestAnimationFrame(run);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    if(!gameOver) {
        // if enough time has elapsed, draw the next frame
        if (elapsed > fpsInterval) {

            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);

            // Put your drawing code here
            updateField();
        }
        update();
    }
}

function update() {

}

function updateField() {
    updateStoneInField();
}

//Functions

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


//console.log(element);

function checkIfRowIsFull() {
    //Check for Full Rows
    var countRows = 0;
    for(i=0;i<fieldHeight;i++) {
        isFilled = true;
        for(j=0;j<fieldLength;j++) {
            if(field[i][j] == 0) {
                isFilled = false;
            }
        }
        //Full Row remove
        if(isFilled) {
            countRows++;
            //Remove Row
            for(j=0;j<fieldLength;j++) {
                field[i][j] = 0;
            }
            //Push Rows Down
            for(r=i;r>0;r--) {
                x = r-1;
                for(j=0;j<fieldLength;j++) {
                    field[r][j] = field[x][j];
                    redrawPixel(r,j,field[r][j]);
                }
            }
            for(j=0;j<fieldLength;j++) {
                field[0][j] = 0;
                redrawPixel(0,j);
            }
        }
    }
    if(countRows == 1) {
        score += 40;
        a_single.play();
        printUI();
    } else if(countRows == 2) {
        score += 100;
        a_double.play();
        printUI();
    } else if(countRows == 3) {
        score += 300;
        a_triple.play();
        printUI();
    } else if(countRows == 4) {
        score += 1200;
        a_tetris.play();
        printUI();
    }
}

function spawnStone(){
    actStoneType = nextStoneType;
    nextStoneType = Math.floor(Math.random() * 7);     // returns a random integer from 0 to 6
    rotationType = 0;
    fps = 2;
    fpsInterval = 1000 / fps;
    isNewStone = true;
    switch (actStoneType) {
        case 0:
            stone = [...stoneO];
            actColor = stoneOColor;
            actStoneID = 4;
            break;
        case 1:
            stone = [...stoneI];
            actColor = stoneIColor;
            actStoneID = 1;
            break;
        case 2:
            stone = [...stoneS];
            actColor = stoneSColor;
            actStoneID = 5;
            break;
        case 3:
            stone = [...stoneZ];
            actColor = stoneZColor;
            actStoneID = 6;
            break;
        case 4:
            stone = [...stoneT];
            actColor = stoneTColor;
            actStoneID = 7;
            break;
        case 5:
            stone = [...stoneL];
            actColor = stoneLColor;
            actStoneID = 3;
            break;
        case 6:
            stone = [...stoneJ];
            actColor = stoneJColor;
            actStoneID = 2;
            break;
    }

    stone.forEach(function(part, index) {
        temp = this[index].split(",");
        field[temp[0]][temp[1]] = actStoneID;
        redrawPixel(temp[0],temp[1],actStoneID);
    }, stone);
    printUI();
}

function updateStoneInField() {
    if(!checkStoneToStop()) {
        //Remove Block und Update Position
        stone.forEach(function(part, index) {
            temp = this[index].split(",");
            field[temp[0]][temp[1]] = 0;
            redrawPixel(temp[0],temp[1]);
            temp[0]++;
            this[index] = temp[0] + ',' + temp[1];

        }, stone);

        //Place Block new Position
        stone.forEach(function(part, index) {
            temp = this[index].split(",");
            field[temp[0]][temp[1]] = actStoneID;
            redrawPixel(temp[0],temp[1],actStoneID);
        }, stone);
    } else {
        checkIfRowIsFull();
        temp = stone[0].split(",");
        if(temp[0] == 0) {
            var temp2 = parseInt(temp[0]+1);
            if(field[temp[0]][temp[1]] > 0 && field[temp2][temp[1]] > 0) {
                gameOver = true;
                a_music.pause();
                a_music.currentTime = 0;

                a_gameover.play();

                drawGameOver();
            }
        }

        if(dropDown) {
            a_hardland.play();
        } else {
            a_land.play();
        }

        if(!gameOver) {
            spawnStone();
        }
    }
}

function rotateStoneInField() {
    var rotateBlock;
    var first = true;
    var count = 1;
    var temp1, temp2, temp3;
    var temp1_2, temp2_2, temp3_2, temp4_2;
    var spinAllowed = true;
    switch (actStoneType) {
        case 0:
            //Stone O = no Rotation
            break;
        case 1: //I
            first = true;
            count = 1;

            temp1 = stone[0].split(",");
            temp2 = stone[1].split(",");
            temp3 = stone[2].split(",");
            var temp4 = stone[3].split(",");

            temp1_2 = stone[0].split(",");
            temp2_2 = stone[1].split(",");
            temp3_2 = stone[2].split(",");
            temp4_2 = stone[3].split(",");

            switch(rotationType) {
                case 0:
                    temp1[0] = parseInt(temp1[0]) + 2;
                    temp1[1] = parseInt(temp1[1]) + 1;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) + 0;

                    temp3[0] = parseInt(temp3[0]) + 0;
                    temp3[1] = parseInt(temp3[1]) - 1;

                    temp4[0] = parseInt(temp4[0]) - 1;
                    temp4[1] = parseInt(temp4[1]) - 2;
                    break;
                case 1:
                    temp1[0] = parseInt(temp1[0]) + 1;
                    temp1[1] = parseInt(temp1[1]) - 2;

                    temp2[0] = parseInt(temp2[0]) + 0;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) + 0;

                    temp4[0] = parseInt(temp4[0]) - 2;
                    temp4[1] = parseInt(temp4[1]) + 1;
                    break;
                case 2:
                    temp1[0] = parseInt(temp1[0]) - 2;
                    temp1[1] = parseInt(temp1[1]) - 1;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) + 0;

                    temp3[0] = parseInt(temp3[0]) + 0;
                    temp3[1] = parseInt(temp3[1]) + 1;

                    temp4[0] = parseInt(temp4[0]) + 1;
                    temp4[1] = parseInt(temp4[1]) + 2;
                    break;
                case 3:
                    temp1[0] = parseInt(temp1[0]) - 1;
                    temp1[1] = parseInt(temp1[1]) + 2;

                    temp2[0] = parseInt(temp2[0]) + 0;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) + 0;

                    temp4[0] = parseInt(temp4[0]) + 2;
                    temp4[1] = parseInt(temp4[1]) - 1;
                    break;
            }

            field[temp1_2[0]][temp1_2[1]] = 0;
            field[temp2_2[0]][temp2_2[1]] = 0;
            field[temp3_2[0]][temp3_2[1]] = 0;
            field[temp4_2[0]][temp4_2[1]] = 0;

            if(field[temp1[0]][temp1[1]] == 0 &&
                field[temp2[0]][temp2[1]] == 0 &&
                field[temp3[0]][temp3[1]] == 0 &&
                field[temp4[0]][temp4[1]] == 0) {
                spinAllowed = true;
            } else {
                spinAllowed = false;
                field[temp1_2[0]][temp1_2[1]] = 1;
                field[temp2_2[0]][temp2_2[1]] = 1;
                field[temp3_2[0]][temp3_2[1]] = 1;
                field[temp4_2[0]][temp4_2[1]] = 1;
            }

            if(spinAllowed) {
                //Delete old Position
                redrawPixel(temp1_2[0],temp1_2[1]);
                redrawPixel(temp2_2[0],temp2_2[1]);
                redrawPixel(temp3_2[0],temp3_2[1]);
                redrawPixel(temp4_2[0],temp4_2[1]);

                //Draw new Position
                field[temp1[0]][temp1[1]] = actStoneID;
                field[temp2[0]][temp2[1]] = actStoneID;
                field[temp3[0]][temp3[1]] = actStoneID;
                field[temp4[0]][temp4[1]] = actStoneID;
                redrawPixel(temp1[0],temp1[1],actStoneID);
                redrawPixel(temp2[0],temp2[1],actStoneID);
                redrawPixel(temp3[0],temp3[1],actStoneID);
                redrawPixel(temp4[0],temp4[1],actStoneID);
                stone[0] = temp1[0] + ',' + temp1[1];
                stone[1] = temp2[0] + ',' + temp2[1];
                stone[2] = temp3[0] + ',' + temp3[1];
                stone[3] = temp4[0] + ',' + temp4[1];

                rotationType++;
                if(rotationType > 3) {
                    rotationType = 0;
                }
            }
            break;
        case 2: //S
            first = true;
            count = 1;
            rotateBlock = stone[3].split(",");

            temp1 = stone[0].split(",");
            temp2 = stone[1].split(",");
            temp3 = stone[2].split(",");

            temp1_2 = stone[0].split(",");
            temp2_2 = stone[1].split(",");
            temp3_2 = stone[2].split(",");
            temp4_2 = stone[3].split(",");

            switch(rotationType) {
                case 0:
                case 2:
                    temp1[0] = parseInt(temp1[0]) + 1;
                    temp1[1] = parseInt(temp1[1]) + 1;

                    temp2[0] = parseInt(temp2[0]) + 2;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
                case 1:
                case 3:
                    temp1[0] = parseInt(temp1[0]) - 1;
                    temp1[1] = parseInt(temp1[1]) - 1;

                    temp2[0] = parseInt(temp2[0]) - 2;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
            }

            field[temp1_2[0]][temp1_2[1]] = 0;
            field[temp2_2[0]][temp2_2[1]] = 0;
            field[temp3_2[0]][temp3_2[1]] = 0;
            field[temp4_2[0]][temp4_2[1]] = 0;

            if(field[temp1[0]][temp1[1]] == 0 &&
                field[temp2[0]][temp2[1]] == 0 &&
                field[temp3[0]][temp3[1]] == 0) {
                spinAllowed = true;
                field[temp4_2[0]][temp4_2[1]] = 2;
            } else {
                spinAllowed = false;
                field[temp1_2[0]][temp1_2[1]] = 2;
                field[temp2_2[0]][temp2_2[1]] = 2;
                field[temp3_2[0]][temp3_2[1]] = 2;
                field[temp4_2[0]][temp4_2[1]] = 2;
            }

            if(spinAllowed) {
                //Delete old Position
                redrawPixel(temp1_2[0],temp1_2[1]);
                redrawPixel(temp2_2[0],temp2_2[1]);
                redrawPixel(temp3_2[0],temp3_2[1]);
                redrawPixel(temp4_2[0],temp4_2[1],actStoneID);

                field[temp1[0]][temp1[1]] = actStoneID;
                field[temp2[0]][temp2[1]] = actStoneID;
                field[temp3[0]][temp3[1]] = actStoneID;
                redrawPixel(temp1[0],temp1[1],actStoneID);
                redrawPixel(temp2[0],temp2[1],actStoneID);
                redrawPixel(temp3[0],temp3[1],actStoneID);
                stone[0] = temp1[0] + ',' + temp1[1];
                stone[1] = temp2[0] + ',' + temp2[1];
                stone[2] = temp3[0] + ',' + temp3[1];

                rotationType++;
                if(rotationType > 3) {
                    rotationType = 0;
                }
            }
            break;
        case 3: //Z
            first = true;
            count = 1;
            rotateBlock = stone[2].split(",");

            temp1 = stone[0].split(",");
            temp2 = stone[1].split(",");
            temp3 = stone[3].split(",");

            temp1_2 = stone[0].split(",");
            temp2_2 = stone[1].split(",");
            temp3_2 = stone[3].split(",");
            temp4_2 = stone[2].split(",");

            switch(rotationType) {
                case 0:
                case 2:
                    temp1[1] = parseInt(temp1[1]) + 2;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 1:
                case 3:
                    temp1[1] = parseInt(temp1[1]) - 2;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
            }

            field[temp1_2[0]][temp1_2[1]] = 0;
            field[temp2_2[0]][temp2_2[1]] = 0;
            field[temp3_2[0]][temp3_2[1]] = 0;
            field[temp4_2[0]][temp4_2[1]] = 0;

            if(field[temp1[0]][temp1[1]] == 0 &&
                field[temp2[0]][temp2[1]] == 0 &&
                field[temp3[0]][temp3[1]] == 0) {
                spinAllowed = true;
                field[temp4_2[0]][temp4_2[1]] = 3;
            } else {
                spinAllowed = false;
                field[temp1_2[0]][temp1_2[1]] = 3;
                field[temp2_2[0]][temp2_2[1]] = 3;
                field[temp3_2[0]][temp3_2[1]] = 3;
                field[temp4_2[0]][temp4_2[1]] = 3;
            }

            if(spinAllowed) {
                //Delete old Position
                redrawPixel(temp1_2[0],temp1_2[1]);
                redrawPixel(temp2_2[0],temp2_2[1]);
                redrawPixel(temp3_2[0],temp3_2[1]);
                redrawPixel(temp4_2[0],temp4_2[1],actStoneID);

                field[temp1[0]][temp1[1]] = actStoneID;
                field[temp2[0]][temp2[1]] = actStoneID;
                field[temp3[0]][temp3[1]] = actStoneID;
                redrawPixel(temp1[0], temp1[1], actStoneID);
                redrawPixel(temp2[0], temp2[1], actStoneID);
                redrawPixel(temp3[0], temp3[1], actStoneID);
                stone[0] = temp1[0] + ',' + temp1[1];
                stone[1] = temp2[0] + ',' + temp2[1];
                stone[3] = temp3[0] + ',' + temp3[1];

                rotationType++;
                if (rotationType > 3) {
                    rotationType = 0;
                }
            }
            break;
        case 4: // T
            first = true;
            count = 1;
            rotateBlock = stone[2].split(",");

            temp1 = stone[0].split(",");
            temp2 = stone[1].split(",");
            temp3 = stone[3].split(",");

            temp1_2 = stone[0].split(",");
            temp2_2 = stone[1].split(",");
            temp3_2 = stone[3].split(",");
            temp4_2 = stone[2].split(",");

            switch(rotationType) {
                case 0:
                    temp1[0] = parseInt(temp1[0]) + 1;
                    temp1[1] = parseInt(temp1[1]) + 1;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 1:
                    temp1[0] = parseInt(temp1[0]) + 1;
                    temp1[1] = parseInt(temp1[1]) - 1;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 2:
                    temp1[0] = parseInt(temp1[0]) - 1;
                    temp1[1] = parseInt(temp1[1]) - 1;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
                case 3:
                    temp1[0] = parseInt(temp1[0]) - 1;
                    temp1[1] = parseInt(temp1[1]) + 1;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
            }

            field[temp1_2[0]][temp1_2[1]] = 0;
            field[temp2_2[0]][temp2_2[1]] = 0;
            field[temp3_2[0]][temp3_2[1]] = 0;
            field[temp4_2[0]][temp4_2[1]] = 0;

            if(field[temp1[0]][temp1[1]] == 0 &&
                field[temp2[0]][temp2[1]] == 0 &&
                field[temp3[0]][temp3[1]] == 0) {
                spinAllowed = true;
                field[temp4_2[0]][temp4_2[1]] = 4;
            } else {
                spinAllowed = false;
                field[temp1_2[0]][temp1_2[1]] = 4;
                field[temp2_2[0]][temp2_2[1]] = 4;
                field[temp3_2[0]][temp3_2[1]] = 4;
                field[temp4_2[0]][temp4_2[1]] = 4;
            }

            if(spinAllowed) {
                //Delete old Position
                redrawPixel(temp1_2[0],temp1_2[1]);
                redrawPixel(temp2_2[0],temp2_2[1]);
                redrawPixel(temp3_2[0],temp3_2[1]);
                redrawPixel(temp4_2[0],temp4_2[1],actStoneID);

                field[temp1[0]][temp1[1]] = actStoneID;
                field[temp2[0]][temp2[1]] = actStoneID;
                field[temp3[0]][temp3[1]] = actStoneID;
                redrawPixel(temp1[0], temp1[1], actStoneID);
                redrawPixel(temp2[0], temp2[1], actStoneID);
                redrawPixel(temp3[0], temp3[1], actStoneID);
                stone[0] = temp1[0] + ',' + temp1[1];
                stone[1] = temp2[0] + ',' + temp2[1];
                stone[3] = temp3[0] + ',' + temp3[1];

                rotationType++;
                if (rotationType > 3) {
                    rotationType = 0;
                }
            }
            break;
        case 5: //L
            first = true;
            count = 1;
            rotateBlock = stone[2].split(",");

            temp1 = stone[0].split(",");
            temp2 = stone[1].split(",");
            temp3 = stone[3].split(",");

            temp1_2 = stone[0].split(",");
            temp2_2 = stone[1].split(",");
            temp3_2 = stone[3].split(",");
            temp4_2 = stone[2].split(",");

            switch(rotationType) {
                case 0:
                    temp1[0] = parseInt(temp1[0]) + 2;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 1:
                    temp1[1] = parseInt(temp1[1]) - 2;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 2:
                    temp1[0] = parseInt(temp1[0]) - 2;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
                case 3:
                    temp1[1] = parseInt(temp1[1]) + 2;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
            }

            field[temp1_2[0]][temp1_2[1]] = 0;
            field[temp2_2[0]][temp2_2[1]] = 0;
            field[temp3_2[0]][temp3_2[1]] = 0;
            field[temp4_2[0]][temp4_2[1]] = 0;

            if(field[temp1[0]][temp1[1]] == 0 &&
                field[temp2[0]][temp2[1]] == 0 &&
                field[temp3[0]][temp3[1]] == 0) {
                spinAllowed = true;
                field[temp4_2[0]][temp4_2[1]] = 5;
            } else {
                spinAllowed = false;
                field[temp1_2[0]][temp1_2[1]] = 5;
                field[temp2_2[0]][temp2_2[1]] = 5;
                field[temp3_2[0]][temp3_2[1]] = 5;
                field[temp4_2[0]][temp4_2[1]] = 5;
            }

            if(spinAllowed) {
                //Delete old Position
                redrawPixel(temp1_2[0],temp1_2[1]);
                redrawPixel(temp2_2[0],temp2_2[1]);
                redrawPixel(temp3_2[0],temp3_2[1]);
                redrawPixel(temp4_2[0],temp4_2[1],actStoneID);

                field[temp1[0]][temp1[1]] = actStoneID;
                field[temp2[0]][temp2[1]] = actStoneID;
                field[temp3[0]][temp3[1]] = actStoneID;
                redrawPixel(temp1[0], temp1[1], actStoneID);
                redrawPixel(temp2[0], temp2[1], actStoneID);
                redrawPixel(temp3[0], temp3[1], actStoneID);
                stone[0] = temp1[0] + ',' + temp1[1];
                stone[1] = temp2[0] + ',' + temp2[1];
                stone[3] = temp3[0] + ',' + temp3[1];

                rotationType++;
                if (rotationType > 3) {
                    rotationType = 0;
                }
            }
            break;
        case 6: //J
            first = true;
            count = 1;
            rotateBlock = stone[2].split(",");

            temp1 = stone[0].split(",");
            temp2 = stone[1].split(",");
            temp3 = stone[3].split(",");

            temp1_2 = stone[0].split(",");
            temp2_2 = stone[1].split(",");
            temp3_2 = stone[3].split(",");
            temp4_2 = stone[2].split(",");

            switch(rotationType) {
                case 0:
                    temp1[1] = parseInt(temp1[1]) + 2;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 1:
                    temp1[0] = parseInt(temp1[0]) + 2;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) + 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) - 1;
                    break;
                case 2:
                    temp1[1] = parseInt(temp1[1]) - 2;

                    temp2[0] = parseInt(temp2[0]) + 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) - 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
                case 3:
                    temp1[0] = parseInt(temp1[0]) - 2;

                    temp2[0] = parseInt(temp2[0]) - 1;
                    temp2[1] = parseInt(temp2[1]) - 1;

                    temp3[0] = parseInt(temp3[0]) + 1;
                    temp3[1] = parseInt(temp3[1]) + 1;
                    break;
            }

            field[temp1_2[0]][temp1_2[1]] = 0;
            field[temp2_2[0]][temp2_2[1]] = 0;
            field[temp3_2[0]][temp3_2[1]] = 0;
            field[temp4_2[0]][temp4_2[1]] = 0;

            if(field[temp1[0]][temp1[1]] == 0 &&
                field[temp2[0]][temp2[1]] == 0 &&
                field[temp3[0]][temp3[1]] == 0) {
                spinAllowed = true;
                field[temp4_2[0]][temp4_2[1]] = 6;
            } else {
                spinAllowed = false;
                field[temp1_2[0]][temp1_2[1]] = 6;
                field[temp2_2[0]][temp2_2[1]] = 6;
                field[temp3_2[0]][temp3_2[1]] = 6;
                field[temp4_2[0]][temp4_2[1]] = 6;
            }

            if(spinAllowed) {
                //Delete old Position
                redrawPixel(temp1_2[0],temp1_2[1]);
                redrawPixel(temp2_2[0],temp2_2[1]);
                redrawPixel(temp3_2[0],temp3_2[1]);
                redrawPixel(temp4_2[0],temp4_2[1],actStoneID);

                field[temp1[0]][temp1[1]] = actStoneID;
                field[temp2[0]][temp2[1]] = actStoneID;
                field[temp3[0]][temp3[1]] = actStoneID;
                redrawPixel(temp1[0],temp1[1],actStoneID);
                redrawPixel(temp2[0],temp2[1],actStoneID);
                redrawPixel(temp3[0],temp3[1],actStoneID);
                stone[0] = temp1[0] + ',' + temp1[1];
                stone[1] = temp2[0] + ',' + temp2[1];
                stone[3] = temp3[0] + ',' + temp3[1];

                rotationType++;
                if(rotationType > 3) {
                    rotationType = 0;
                }
            }
            break;
    }
    a_spin.play();
}

//Move Stone Left or Right
function moveStoneInField(left) {
        then = Date.now();
        var edgeColumn = (fieldLength-1);
        var edgeRows = [];

        var blocked = false;

    if(left) {
        //Find Leftmost Block
        stone.forEach(function(element) {
            var temp2 = element.split(",");
            if(edgeRows[temp2[0]]===undefined) {
                edgeRows[temp2[0]] = temp2[1];
            }
            if(edgeRows[temp2[0]] > temp2[1]) {
                edgeRows[temp2[0]] = temp2[1];
            }
        });
    } else {
        //Find Rightmost Block
        stone.forEach(function(element) {
            var temp2 = element.split(",");
            if(edgeRows[temp2[0]]===undefined) {
                edgeRows[temp2[0]] = temp2[1];
            }
            if(edgeRows[temp2[0]] < temp2[1]) {
                edgeRows[temp2[0]] = temp2[1];
            }
        });
    }
    edgeRows.forEach(function(part, index) {
        if(left) {
            x = parseInt(edgeRows[index]) - 1;
        } else {
            x = parseInt(edgeRows[index]) + 1;
        }
        if(field[index][x] > 0) {
            blocked = true;
        }
        if(x < 0 || x > (fieldLength-1)) {
            blocked = true;
        }
    }, edgeRows);
        if(blocked) {
            console.log('Border');
        } else {
            //Remove Block und Update Position
            stone.forEach(function(part, index) {
                temp = this[index].split(",");
                field[temp[0]][temp[1]] = 0;
                redrawPixel(temp[0],temp[1]);
                if(left) {
                    temp[1]--;
                } else {
                    temp[1]++;
                }

                this[index] = temp[0] + ',' + temp[1];

            }, stone);

            //Place Block new Position
            stone.forEach(function(part, index) {
                temp = this[index].split(",");
                field[temp[0]][temp[1]] = actStoneID;
                redrawPixel(temp[0],temp[1],actStoneID);
            }, stone);
        }
        a_move.play();
}

function checkStoneToStop() {
    var collide = false;
    stone.forEach(function(part, index) {

        var isBottomBlock = true;
        temp = this[index].split(",");
        var row = parseInt(temp[0]);
        var column = parseInt(temp[1]);
        var searchRow = row;
        searchRow++;
        //Check if Block is under this
        stone.forEach(function(element) {
            var temp2 = element.split(",");
            if(searchRow == temp2[0] && column == temp2[1]) {
                isBottomBlock = false;
            }
        });
        if(isBottomBlock) {
            if(row != fieldHeight-1) {
                if(field[searchRow][column] > 0) {
                    collide = true;
                }
            } else {
                collide = true;
            }
        }
    }, stone);
    return collide;
}

function drawField() {
    ctx.beginPath();
    ctx.rect(-1, -1, game_width+2, game_height+2);
    ctx.stroke();

    ctx.fillStyle = '#8c8c8c';
    ctx.fillRect(5,game_height + 10, 130, 85);
    ctx.fillRect(145,game_height + 10, 130, 85);

    ctx.fillStyle = '#000000';
    ctx.font = "40px Arial";
    ctx.fillText("Drop", 28, game_height + 65);

    ctx.fillText("Spin", 175, game_height + 65);
}

function drawGameOver() {
    ctx.clearRect(0,0, 280, 500);

    ctx.fillStyle = '#000000';
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", 35, 55);
    ctx.font = "20px Arial";
    ctx.fillText("Score: "+score, 80, 90);

}

function redrawPixel(row, column, color = 0) {
    if(field[row][column] > 0) {
        switch(color) {
            case 0:
                actColor = '#000000';
                break;
            case 1:
                actColor = stoneIColor;
                break;
            case 2:
                actColor = stoneJColor;
                break;
            case 3:
                actColor = stoneLColor;
                break;
            case 4:
                actColor = stoneOColor;
                break;
            case 5:
                actColor = stoneSColor;
                break;
            case 6:
                actColor = stoneZColor;
                break;
            case 7:
                actColor = stoneTColor;
                break;
        }
        ctx.fillStyle = actColor;
        ctx.fillRect(pixelHeight*column+1,pixelWidth*row+1, pixelHeight-2, pixelWidth-2);
    } else {
        ctx.clearRect(pixelHeight*column,pixelWidth*row, pixelHeight, pixelWidth);
    }
}

function printUI() {
    ctx.clearRect(game_width + 4,0, 80, 50);

    ctx.fillStyle = '#000000';
    ctx.font = "14px Arial";
    ctx.fillText("Score: " + score, game_width + 5, 15);
    var stoneName = "";
    switch(nextStoneType) {
        case 0:
            stoneName = "O";
            break;
        case 1:
            stoneName = "I";
            break;
        case 2:
            stoneName = "S";
            break;
        case 3:
            stoneName = "Z";
            break;
        case 4:
            stoneName = "T";
            break;
        case 5:
            stoneName = "L";
            break;
        case 6:
            stoneName = "J";
            break;
    }
    ctx.fillText("Next: " + stoneName, game_width + 5, 30);

}

// start and run the game
main();