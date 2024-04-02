
// time
const FPS = 90;
const FRAME_TIME = 1000 / FPS;  
const FRAME_MSTIME = FRAME_TIME / 1000;
var time_passed = 0;
const CELLS_PER_SECOND = 10;
const TIME_IN_CELL = 1 / CELLS_PER_SECOND;
var gameStopped = false;

// canvas
const CANVAS = document.getElementById("canvas");
const CANVAS_CTX = CANVAS.getContext("2d");

const CANV_WIDTH = CANVAS.width;
const CANV_HEIGHT = CANVAS.height;

// directions
const STOP = -1, UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3; 

// player

var VIEW_BLUE = false, VIEW_RED = true;

var SNAKE = {
    "ROW" : 8,
    "COL" : 5,
    "WIDTH" : 0,
    "HEIGHT" : 0,
    "COLOR" : "#0e49eb",
    "DIRECTION" : STOP,
    "NEXT_DIRECTION": null,
    "CAN_CHANGE_DIR" : true,
    "TAIL" : [],
};

var SMOOTH_SNAKE = {
    "WIDTH": 0,
    "HEIGHT": 0,
    "COLOR": "#d6132d",
    // first element in this tail is the head
    "TAIL": [{
        "ROW" : SNAKE["ROW"],
        "COL" : SNAKE["COL"],
        "X": 0,
        "Y": 0,
        "DIRECTION" : STOP
    }],
    "EYE_COLOR": "#deeba0",
    "EYES": [{
        "X": 0,
        "Y": 0,
        "WIDTH": 0,
        "HEIGHT": 0
    }, {
        "X": 0,
        "Y": 0,
        "WIDTH": 0,
        "HEIGHT": 0
    }]
}

// fruit
var FRUIT = {
    "ROW": 1,
    "COL": 1,
    "RADIUS": 0,
    "COLOR": "#deeba0"
}


// map
const MAP_ROWS = 17, MAP_COLS = 19;
const WALL_WIDTH = CANV_WIDTH / MAP_COLS;
const WALL_HEIGHT = CANV_HEIGHT / MAP_ROWS;
const MAP = [];
SNAKE["WIDTH"] = WALL_WIDTH;
SNAKE["HEIGHT"] = WALL_HEIGHT;

const SMOOTH_XVELOCITY = CELLS_PER_SECOND * WALL_WIDTH;
const SMOOTH_YVELOCITY = CELLS_PER_SECOND * WALL_HEIGHT;

const WALL = 1;
const WALL_COLOR = "#2e8f21";
const SPACE_COLORS = ["#0a1f07", "#050f04"];

function createMap() {
    for(var row = 0; row<MAP_ROWS; row ++) {

        var map_row = [];
        for(var col = 0; col<MAP_COLS; col++) {

            if(row == 0 || row == (MAP_ROWS-1) || 
               col == 0 || col == (MAP_COLS-1)) {
                map_row.push(WALL);
            } else {
                map_row.push(0);
            }
        }    
        MAP.push(map_row);
    }
}   

function blueSnake() {
    if(VIEW_BLUE) {
        VIEW_BLUE = false;
        document.getElementById("blue").innerHTML = "SEE BLUE SNAKE";
    } else {
        VIEW_BLUE = true;
        document.getElementById("blue").innerHTML = "HIDE BLUE SNAKE";
    }
}

function redSnake() {
    if(VIEW_RED) {
        VIEW_RED = false;
        document.getElementById("red").innerHTML = "SEE RED SNAKE";
    } else {
        VIEW_RED = true;
        document.getElementById("red").innerHTML = "HIDE RED SNAKE";
    }
}

function updateLenghtHMTL () {
    document.getElementById("length").innerHTML = SMOOTH_SNAKE["TAIL"].length;
}

function goTo(segment, target) {

    if(segment["COL"] != target["COL"] && segment["ROW"] == target["ROW"]) {
        if(segment["COL"] > target["COL"]) {
            if(segment["DIRECTION"] != LEFT) {
                centerSegment(segment);
            }
            segment["DIRECTION"] = LEFT;
        } else {
            if(segment["DIRECTION"] != RIGHT) {
                centerSegment(segment);
            }
            segment["DIRECTION"] = RIGHT;
        }
    } else if(segment["COL"] == target["COL"] && 
              segment["ROW"] != target["ROW"]) {
        if(segment["ROW"] > target["ROW"]) {
            if(segment["DIRECTION"] != UP) {
                centerSegment(segment);
            }
            segment["DIRECTION"] = UP;
        } else {
            if(segment["DIRECTION"] != DOWN) {
                centerSegment(segment);
            }
            segment["DIRECTION"] = DOWN;
        }
    } else {
        segment["DIRECTION"] = STOP;
    }
        
}

function centerSegment(segment) {
    segment["Y"] = segment["ROW"] * WALL_HEIGHT;
    segment["X"] = segment["COL"] * WALL_WIDTH;
}

function addEventListener() {
    document.addEventListener("keydown", function(event) {

        if(!gameStopped) {
            switch(event.key.toLocaleLowerCase()) {
                case 'w':
                    if(SNAKE["DIRECTION"] != DOWN) {
                        if(SNAKE["CAN_CHANGE_DIR"]) {
                            SNAKE["DIRECTION"] = UP;    
                            SNAKE["CAN_CHANGE_DIR"] = false;
                        } else if (!SNAKE["CAN_CHANGE_DIR"] && 
                                    SNAKE["NEXT_DIRECTION"] == null) {
                            SNAKE["NEXT_DIRECTION"] = UP;
                        }
                    }
                    break;
                case 's':
                    if(SNAKE["DIRECTION"] != UP) {
                        if(SNAKE["CAN_CHANGE_DIR"]) {
                            SNAKE["DIRECTION"] = DOWN;
                            SNAKE["CAN_CHANGE_DIR"] = false;
                        } else if (!SNAKE["CAN_CHANGE_DIR"] && 
                                    SNAKE["NEXT_DIRECTION"] == null) {
                            SNAKE["NEXT_DIRECTION"] = DOWN;
                        }
                    }
                    break;
                case 'a':
                    if(SNAKE["DIRECTION"] != RIGHT && SNAKE["DIRECTION"] != STOP) {
                        if(SNAKE["CAN_CHANGE_DIR"]) {
                            SNAKE["DIRECTION"] = LEFT;
                            SNAKE["CAN_CHANGE_DIR"] = false;
                        } else if (!SNAKE["CAN_CHANGE_DIR"] && 
                                    SNAKE["NEXT_DIRECTION"] == null) {
                            SNAKE["NEXT_DIRECTION"] = LEFT;
                        }
                    }
                    break;
                case 'd':
                    if(SNAKE["DIRECTION"] != LEFT) {
                        if(SNAKE["CAN_CHANGE_DIR"]) {
                            SNAKE["DIRECTION"] = RIGHT;
                            SNAKE["CAN_CHANGE_DIR"] = false;
                        } else if (!SNAKE["CAN_CHANGE_DIR"] && 
                                    SNAKE["NEXT_DIRECTION"] == null) {
                            SNAKE["NEXT_DIRECTION"] = RIGHT;
                        }
                    }
                    break;
            }
        }

        if(event.key.toLocaleLowerCase() == 'p') {
            if(gameStopped) {
                gameStopped = false;
                setTimeout(gameLoop, FRAME_TIME);
            } else {
                gameStopped = true;
            }
        }
    });
}

function clearScreen() {
    CANVAS_CTX.fillStyle = WALL_COLOR;
    CANVAS_CTX.fillRect(0, 0 ,CANV_WIDTH, CANV_HEIGHT);
}

function drawMap() {

    var space_color_ind = 0;

    for(var row = 0; row<MAP_ROWS; row++) {
        for(var col = 0; col<MAP_COLS; col++) {

            if(MAP[row][col] == WALL) {
                CANVAS_CTX.fillStyle = WALL_COLOR;
                CANVAS_CTX.fillRect((col * WALL_WIDTH),
                (row * WALL_HEIGHT),
                WALL_WIDTH,
                WALL_HEIGHT);
            }
                
            if(MAP[row][col] == 0) {
                CANVAS_CTX.fillStyle = SPACE_COLORS[space_color_ind];
                CANVAS_CTX.fillRect((col * WALL_WIDTH),
                (row * WALL_HEIGHT),
                WALL_WIDTH,
                WALL_HEIGHT);

                if(space_color_ind == 0) {
                    space_color_ind = 1;
                } else {
                    space_color_ind = 0;
                }
            }
        }   
    }
}

function drawSnake() {

    if(VIEW_BLUE) {
        // draws block snake 
        CANVAS_CTX.fillStyle = SNAKE["COLOR"];
        CANVAS_CTX.fillRect(
            SNAKE["COL"] * WALL_WIDTH,
            SNAKE["ROW"] * WALL_HEIGHT,
            SNAKE["WIDTH"],  
            SNAKE["HEIGHT"]
        );            

        // draws block snake's tail
        for(var tail_ind = 0; tail_ind<SNAKE["TAIL"].length; tail_ind++) {
            CANVAS_CTX.fillRect(
                SNAKE["TAIL"][tail_ind]["COL"] * WALL_WIDTH,
                SNAKE["TAIL"][tail_ind]["ROW"] * WALL_HEIGHT,
                SNAKE["WIDTH"],
                SNAKE["HEIGHT"]
            );
        }
    }
    
    if(VIEW_RED) {
        // draws smooth snake
        CANVAS_CTX.fillStyle = SMOOTH_SNAKE["COLOR"];
        for(var tail_ind = 0;tail_ind<SMOOTH_SNAKE["TAIL"].length; tail_ind++) {
            CANVAS_CTX.fillRect(
                SMOOTH_SNAKE["TAIL"][tail_ind]["X"],
                SMOOTH_SNAKE["TAIL"][tail_ind]["Y"],
                SMOOTH_SNAKE["WIDTH"],
                SMOOTH_SNAKE["HEIGHT"]
            );
        }  

        // draws extra segments to fill gaps (not the actual snake)
        for(var tail_ind = 0; tail_ind<SNAKE["TAIL"].length; tail_ind++) {
            CANVAS_CTX.fillRect(
                SNAKE["TAIL"][tail_ind]["COL"] * WALL_WIDTH,
                SNAKE["TAIL"][tail_ind]["ROW"] * WALL_HEIGHT,
                SNAKE["WIDTH"],
                SNAKE["HEIGHT"]
            );
        }

        // draws snake's eyes
        CANVAS_CTX.fillStyle = SMOOTH_SNAKE["EYE_COLOR"];
        for(var eye_ind = 0; eye_ind<SMOOTH_SNAKE["EYES"].length; eye_ind++) {
            CANVAS_CTX.fillRect(
                SMOOTH_SNAKE["EYES"][eye_ind]["X"],
                SMOOTH_SNAKE["EYES"][eye_ind]["Y"],
                SMOOTH_SNAKE["EYES"][eye_ind]["WIDTH"],
                SMOOTH_SNAKE["EYES"][eye_ind]["HEIGHT"]
            );
        }
        
    }
}

function drawFruit() {
    
	CANVAS_CTX.fillStyle = FRUIT["COLOR"];
	
	CANVAS_CTX.beginPath();
	//arc(x, y, radius, startAngle, endAngle, counterclockwise)
	CANVAS_CTX.arc(
        FRUIT["COL"] * WALL_WIDTH + (WALL_WIDTH / 2), 
        FRUIT["ROW"] * WALL_HEIGHT + (WALL_HEIGHT / 2), 
        FRUIT["RADIUS"], 
        0,
        2 * Math.PI);
	CANVAS_CTX.fill();
}

function addTail() {

    // TODO: sistemare sta roba
    if(SNAKE["DIRECTION"] == STOP && SNAKE["TAIL"].length == 0) {
        SNAKE["TAIL"].push({
            "ROW": SNAKE["ROW"], 
            "COL": SNAKE["COL"]-1
        });
        SMOOTH_SNAKE["TAIL"].push({
            "ROW" : SNAKE["ROW"],
            "COL" : SNAKE["COL"]-1,
            "X": (SNAKE["COL"]-1) * WALL_WIDTH,
            "Y": SNAKE["ROW"] * WALL_HEIGHT,
            "DIRECTION" : STOP
        });
    } else if (SNAKE["DIRECTION"] == STOP 
                && SNAKE["TAIL"].length != 0) {
        

        SMOOTH_SNAKE["TAIL"].push({
            "ROW" : SNAKE["ROW"],
            "COL" : SNAKE["TAIL"][SNAKE["TAIL"].length-1]["COL"]-1,
            "X": (SNAKE["TAIL"][SNAKE["TAIL"].length-1]["COL"] -1) * WALL_WIDTH,
            "Y": SNAKE["ROW"] * WALL_HEIGHT,
            "DIRECTION" : STOP
        });
        SNAKE["TAIL"].push({
            "ROW": SNAKE["ROW"], 
            "COL": SNAKE["TAIL"][SNAKE["TAIL"].length-1]["COL"]-1
        });
    } else {

        var last_tail_segment = SMOOTH_SNAKE["TAIL"][SMOOTH_SNAKE["TAIL"].length-1]; 
        SNAKE["TAIL"].push({
            "ROW": last_tail_segment["ROW"], 
            "COL": last_tail_segment["COL"]
        });
        SMOOTH_SNAKE["TAIL"].push({
            "ROW" : last_tail_segment["ROW"],
            "COL" : last_tail_segment["COL"],
            "X": last_tail_segment["COL"] * WALL_WIDTH,
            "Y": last_tail_segment["ROW"] * WALL_HEIGHT,
            "DIRECTION" : STOP
        });
    }

    updateLenghtHMTL();

}

function positionEyes() {
    switch(SNAKE["DIRECTION"]) {
        case UP:
            
            SMOOTH_SNAKE["EYES"][0]["X"] = SMOOTH_SNAKE["TAIL"][0]["X"] + (SMOOTH_SNAKE["WIDTH"] / 10);
            SMOOTH_SNAKE["EYES"][0]["Y"] = SMOOTH_SNAKE["TAIL"][0]["Y"] + (SMOOTH_SNAKE["HEIGHT"] / 2 - SMOOTH_SNAKE["EYES"][0]["HEIGHT"]);

            SMOOTH_SNAKE["EYES"][1]["Y"] = SMOOTH_SNAKE["EYES"][0]["Y"];
            SMOOTH_SNAKE["EYES"][1]["X"] = 
                SMOOTH_SNAKE["TAIL"][0]["X"] + 
                ((SMOOTH_SNAKE["WIDTH"] - SMOOTH_SNAKE["EYES"][1]["WIDTH"]) - 
                (SMOOTH_SNAKE["EYES"][0]["X"] - SMOOTH_SNAKE["TAIL"][0]["X"])); 
            break;
        case DOWN:

            SMOOTH_SNAKE["EYES"][0]["X"] = SMOOTH_SNAKE["TAIL"][0]["X"] + (SMOOTH_SNAKE["WIDTH"] / 10);
            SMOOTH_SNAKE["EYES"][0]["Y"] = SMOOTH_SNAKE["TAIL"][0]["Y"] + (SMOOTH_SNAKE["HEIGHT"] / 2);

            SMOOTH_SNAKE["EYES"][1]["Y"] = SMOOTH_SNAKE["EYES"][0]["Y"];
            SMOOTH_SNAKE["EYES"][1]["X"] = 
                SMOOTH_SNAKE["TAIL"][0]["X"] + 
                ((SMOOTH_SNAKE["WIDTH"] - SMOOTH_SNAKE["EYES"][1]["WIDTH"]) - 
                (SMOOTH_SNAKE["EYES"][0]["X"] - SMOOTH_SNAKE["TAIL"][0]["X"])); 
            break;
        case LEFT:
            
            SMOOTH_SNAKE["EYES"][0]["X"] = SMOOTH_SNAKE["TAIL"][0]["X"] + (SMOOTH_SNAKE["WIDTH"] / 2 - SMOOTH_SNAKE["EYES"][0]["WIDTH"]);
            SMOOTH_SNAKE["EYES"][0]["Y"] = SMOOTH_SNAKE["TAIL"][0]["Y"] + (SMOOTH_SNAKE["HEIGHT"] / 10);

            SMOOTH_SNAKE["EYES"][1]["X"] = SMOOTH_SNAKE["EYES"][0]["X"];
            SMOOTH_SNAKE["EYES"][1]["Y"] = 
                SMOOTH_SNAKE["TAIL"][0]["Y"] + 
                ((SMOOTH_SNAKE["HEIGHT"] - SMOOTH_SNAKE["EYES"][1]["HEIGHT"]) - 
                (SMOOTH_SNAKE["EYES"][0]["Y"] - SMOOTH_SNAKE["TAIL"][0]["Y"])); 
            
            break;
        case RIGHT:
                    
            SMOOTH_SNAKE["EYES"][0]["X"] = SMOOTH_SNAKE["TAIL"][0]["X"] + (SMOOTH_SNAKE["WIDTH"] / 2);
            SMOOTH_SNAKE["EYES"][0]["Y"] = SMOOTH_SNAKE["TAIL"][0]["Y"] + (SMOOTH_SNAKE["HEIGHT"] / 10);

            SMOOTH_SNAKE["EYES"][1]["X"] = SMOOTH_SNAKE["EYES"][0]["X"];
            SMOOTH_SNAKE["EYES"][1]["Y"] = 
                SMOOTH_SNAKE["TAIL"][0]["Y"] + 
                ((SMOOTH_SNAKE["HEIGHT"] - SMOOTH_SNAKE["EYES"][1]["HEIGHT"]) - 
                (SMOOTH_SNAKE["EYES"][0]["Y"] - SMOOTH_SNAKE["TAIL"][0]["Y"])); 
            break;
            
    }
}

function isOverItself() {
    
    for(var tail_ind = 0; tail_ind<SNAKE["TAIL"].length; tail_ind++) {
        if(SNAKE["ROW"] == SNAKE["TAIL"][tail_ind]["ROW"] &&
           SNAKE["COL"] == SNAKE["TAIL"][tail_ind]["COL"]) {
            return true;
        }
    }
    return false;
}

function isOnFruit() {
    if(FRUIT["COL"] == SNAKE["COL"] && 
       FRUIT["ROW"] == SNAKE["ROW"]) {
        return true;
    }
    return false;
}

function placeFruit() {
    
    var good = false;
    
    while(!good) {
        FRUIT["COL"] = Math.floor(Math.random() * ((MAP_COLS-1) - 1) + 1);
        FRUIT["ROW"] = Math.floor(Math.random() * ((MAP_ROWS-1) - 1) + 1);
        good = true;

        if(FRUIT["COL"] == SNAKE["COL"] && 
           FRUIT["ROW"] == SNAKE["ROW"]) {
            good = false;
            continue;
        }
        for(var tail_ind = 0; tail_ind<SNAKE["TAIL"].length; tail_ind++) {
            if(FRUIT["COL"] == SNAKE["TAIL"][tail_ind]["COL"] && 
               FRUIT["ROW"] == SNAKE["TAIL"][tail_ind]["ROW"]) {
                good = false;
                break;
            }
        }
    }
}


function update() {
    time_passed += FRAME_TIME / 1000;
    if(time_passed > TIME_IN_CELL) {

        // moves blocky snake's tail segmanets
        if(SNAKE["DIRECTION"] != STOP) {
            for(var tail_ind = (SNAKE["TAIL"].length-1); tail_ind>=0; tail_ind--) {
                
                if(tail_ind > 0) { 
                    SNAKE["TAIL"][tail_ind]["ROW"] = SNAKE["TAIL"][tail_ind-1]["ROW"];    
                    SNAKE["TAIL"][tail_ind]["COL"] = SNAKE["TAIL"][tail_ind-1]["COL"];
                }
                if(tail_ind == 0) {
                    SNAKE["TAIL"][tail_ind]["ROW"] = SNAKE["ROW"];    
                    SNAKE["TAIL"][tail_ind]["COL"] = SNAKE["COL"];    
                }
            }
        }

        switch(SNAKE["DIRECTION"]) {
            case UP:
                if(SNAKE["ROW"] - 1 != 0) { 
                    SNAKE["ROW"] -= 1;
                } else {
                    SNAKE["DIRECTION"] = STOP;
                }
                break;
            case DOWN:
                if(SNAKE["ROW"] + 1 != (MAP_ROWS-1)) { 
                    SNAKE["ROW"] += 1;
                } else {
                    SNAKE["DIRECTION"] = STOP;
                }
                break;
            case LEFT:
                if(SNAKE["COL"] - 1 != 0) { 
                    SNAKE["COL"] -= 1;
                } else {
                    SNAKE["DIRECTION"] = STOP;
                }
                break;
            case RIGHT:
                if(SNAKE["COL"] + 1 != (MAP_COLS-1)) { 
                    SNAKE["COL"] += 1;
                } else {
                    SNAKE["DIRECTION"] = STOP;
                }
                break;
        }

        SNAKE["CAN_CHANGE_DIR"] = true;
        if(SNAKE["NEXT_DIRECTION"] != null) {
            SNAKE["DIRECTION"] = SNAKE["NEXT_DIRECTION"];
            SNAKE["CAN_CHANGE_DIR"] = false;
            SNAKE["NEXT_DIRECTION"] = null;
        }
        
        time_passed = 0;
    }

    if(isOverItself()) {
        console.log("ouch");
        gameStopped = true;
    }

    if(isOnFruit()) {
        addTail();
        placeFruit();
    }
    
    // moves smooth snake
    for(var tail_ind = 0; tail_ind<SMOOTH_SNAKE["TAIL"].length; tail_ind++) {
        
        if(tail_ind == 0) {
            goTo(SMOOTH_SNAKE["TAIL"][tail_ind], SNAKE);
        } else {
            goTo(SMOOTH_SNAKE["TAIL"][tail_ind], SNAKE["TAIL"][tail_ind-1]);
        }

        switch(SMOOTH_SNAKE["TAIL"][tail_ind]["DIRECTION"]) {
            case UP:
                SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] -= SMOOTH_YVELOCITY * FRAME_MSTIME;
                SMOOTH_SNAKE["TAIL"][tail_ind]["ROW"] = 
                    Math.trunc((SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] + SMOOTH_SNAKE["HEIGHT"] - 1) / WALL_HEIGHT);
                break;
            case DOWN:
                SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] += SMOOTH_YVELOCITY * FRAME_MSTIME;
                SMOOTH_SNAKE["TAIL"][tail_ind]["ROW"] = 
                    Math.trunc((SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] + 1) / WALL_HEIGHT);
                break;
            case LEFT:
                SMOOTH_SNAKE["TAIL"][tail_ind]["X"] -= SMOOTH_XVELOCITY * FRAME_MSTIME;
                SMOOTH_SNAKE["TAIL"][tail_ind]["COL"] = 
                    Math.trunc((SMOOTH_SNAKE["TAIL"][tail_ind]["X"] + SMOOTH_SNAKE["WIDTH"] - 1) / WALL_WIDTH);
                break;
            case RIGHT:
                SMOOTH_SNAKE["TAIL"][tail_ind]["X"] += SMOOTH_XVELOCITY * FRAME_MSTIME;
                SMOOTH_SNAKE["TAIL"][tail_ind]["COL"] = 
                    Math.trunc((SMOOTH_SNAKE["TAIL"][tail_ind]["X"] + 1) / WALL_WIDTH);
                break;
        }

        positionEyes();
    }
}

function setup() {
    createMap();

    SMOOTH_SNAKE["TAIL"][0]["X"] = SNAKE["COL"] * SNAKE["WIDTH"];
    SMOOTH_SNAKE["TAIL"][0]["Y"] = SNAKE["ROW"] * SNAKE["HEIGHT"];
    SMOOTH_SNAKE["WIDTH"] = SNAKE["WIDTH"];
    SMOOTH_SNAKE["HEIGHT"] = SNAKE["HEIGHT"];
    
    for(var eye_ind = 0; eye_ind<SMOOTH_SNAKE["EYES"].length; eye_ind++) {
        SMOOTH_SNAKE["EYES"][eye_ind]["WIDTH"] = SMOOTH_SNAKE["WIDTH"] / 4;
        SMOOTH_SNAKE["EYES"][eye_ind]["HEIGHT"] = SMOOTH_SNAKE["HEIGHT"] / 4;    
    }

    // eye positioning when direcrion is right
    SMOOTH_SNAKE["EYES"][0]["X"] = SMOOTH_SNAKE["TAIL"][0]["X"] + (SMOOTH_SNAKE["WIDTH"] / 2);
    SMOOTH_SNAKE["EYES"][0]["Y"] = SMOOTH_SNAKE["TAIL"][0]["Y"] + (SMOOTH_SNAKE["HEIGHT"] / 10);

    SMOOTH_SNAKE["EYES"][1]["X"] = SMOOTH_SNAKE["EYES"][0]["X"];
    SMOOTH_SNAKE["EYES"][1]["Y"] = 
        SMOOTH_SNAKE["TAIL"][0]["Y"] + 
        ((SMOOTH_SNAKE["HEIGHT"] - SMOOTH_SNAKE["EYES"][1]["HEIGHT"]) - 
        (SMOOTH_SNAKE["EYES"][0]["Y"] - SMOOTH_SNAKE["TAIL"][0]["Y"])); 

    // furit
    if(WALL_HEIGHT > WALL_WIDTH) {
        FRUIT["RADIUS"] = WALL_WIDTH / 2;
    } else {
        FRUIT["RADIUS"] = WALL_HEIGHT / 2;    
    }

    addTail();
    addTail();
    addTail();
    
    placeFruit();
}

function draw() {
    clearScreen();
    drawMap();
    drawFruit();
    drawSnake();
}


function gameLoop() {
    update();
    draw();

    if(!gameStopped) {
        setTimeout(gameLoop, FRAME_TIME);
    }
}

setup();
addEventListener();
setTimeout(gameLoop, FRAME_TIME);
