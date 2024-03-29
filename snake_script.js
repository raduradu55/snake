

// time
const FPS = 90;
const FRAME_TIME = 1000 / FPS;  
var time_passed = 0;
const CELLS_PER_SECOND = 7;
const TIME_IN_CELL = 1 / CELLS_PER_SECOND;

// canvas
const CANVAS = document.getElementById("canvas");
const CANVAS_CTX = CANVAS.getContext("2d");

const CANV_WIDTH = CANVAS.width;
const CANV_HEIGHT = CANVAS.height;

// directions
const STOP = -1, UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3; 

// player
var SNAKE = {
    "ROW" : 3,
    "COL" : 3,
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
    "TAIL": [{
        "ROW" : SNAKE["ROW"],
        "COL" : SNAKE["COL"],
        "X": 0,
        "Y": 0,
        "DIRECTION" : STOP
    }]
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

            if(row == 0 || row == (MAP_ROWS-1) || col == 0 || col == (MAP_COLS-1)) {
                map_row.push(WALL);
            } else {
                map_row.push(0);
            }
        }    
        MAP.push(map_row);
    }
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
    }

    if(segment["COL"] == target["COL"] && segment["ROW"] != target["ROW"]) {
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
    }
}

function centerSegment(segment) {
    segment["Y"] = segment["ROW"] * WALL_HEIGHT;
    segment["X"] = segment["COL"] * WALL_WIDTH;
}

function addEventListener() {
    document.addEventListener("keypress", function(event) {

        switch(event.key.toLocaleLowerCase()) {
            case 'w':
                if(SNAKE["DIRECTION"] != DOWN) {
                    if(SNAKE["CAN_CHANGE_DIR"]) {
                        SNAKE["DIRECTION"] = UP;
                        SNAKE["CAN_CHANGE_DIR"] = false;
                    } else if (!SNAKE["CAN_CHANGE_DIR"] && SNAKE["NEXT_DIRECTION"] == null) {
                        SNAKE["NEXT_DIRECTION"] = UP;
                    }
                }
                break;
            case 's':
                if(SNAKE["DIRECTION"] != UP) {
                    if(SNAKE["CAN_CHANGE_DIR"]) {
                        SNAKE["DIRECTION"] = DOWN;
                        SNAKE["CAN_CHANGE_DIR"] = false;
                    } else if (!SNAKE["CAN_CHANGE_DIR"] && SNAKE["NEXT_DIRECTION"] == null) {
                        SNAKE["NEXT_DIRECTION"] = DOWN;
                    }
                }
                break;
            case 'a':
                if(SNAKE["DIRECTION"] != RIGHT) {
                    if(SNAKE["CAN_CHANGE_DIR"]) {
                        SNAKE["DIRECTION"] = LEFT;
                        SNAKE["CAN_CHANGE_DIR"] = false;
                    } else if (!SNAKE["CAN_CHANGE_DIR"] && SNAKE["NEXT_DIRECTION"] == null) {
                        SNAKE["NEXT_DIRECTION"] = LEFT;
                    }
                }
                break;
            case 'd':
                if(SNAKE["DIRECTION"] != LEFT) {
                    if(SNAKE["CAN_CHANGE_DIR"]) {
                        SNAKE["DIRECTION"] = RIGHT;
                        SNAKE["CAN_CHANGE_DIR"] = false;
                    } else if (!SNAKE["CAN_CHANGE_DIR"] && SNAKE["NEXT_DIRECTION"] == null) {
                        SNAKE["NEXT_DIRECTION"] = RIGHT;
                    }
                }
                break;
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
    // CANVAS_CTX.fillStyle = SNAKE["COLOR"];
    // CANVAS_CTX.fillRect(
    //     SNAKE["COL"] * WALL_WIDTH,
    //     SNAKE["ROW"] * WALL_HEIGHT,
    //     SNAKE["WIDTH"],  
    //     SNAKE["HEIGHT"]
    // );            

    // // draws tail
    // for(var tail_ind = 0; tail_ind<SNAKE["TAIL"].length; tail_ind++) {
    //     CANVAS_CTX.fillRect(
    //         SNAKE["TAIL"][tail_ind]["COL"] * WALL_WIDTH,
    //         SNAKE["TAIL"][tail_ind]["ROW"] * WALL_HEIGHT,
    //         SNAKE["WIDTH"],
    //         SNAKE["HEIGHT"]
    //     );
    // }

    // draws smooth snake
    CANVAS_CTX.fillStyle = SMOOTH_SNAKE["COLOR"];
    CANVAS_CTX.fillRect(
        SMOOTH_SNAKE["X"],
        SMOOTH_SNAKE["Y"],
        SMOOTH_SNAKE["WIDTH"],
        SMOOTH_SNAKE["HEIGHT"]
    ); 

    // draws smooth snake's tail
    for(var tail_ind = 0;tail_ind<SMOOTH_SNAKE["TAIL"].length; tail_ind++) {
        CANVAS_CTX.fillRect(
            SMOOTH_SNAKE["TAIL"][tail_ind]["X"],
            SMOOTH_SNAKE["TAIL"][tail_ind]["Y"],
            SMOOTH_SNAKE["WIDTH"],
            SMOOTH_SNAKE["HEIGHT"]
        ); 
    }   
}

function addTail() {
    SNAKE["TAIL"].push({"ROW": SNAKE["ROW"], "COL": SNAKE["COL"]});
    SMOOTH_SNAKE["TAIL"].push({
        "ROW" : SNAKE["ROW"],
        "COL" : SNAKE["COL"],
        "X": SNAKE["COL"] * WALL_WIDTH,
        "Y": SNAKE["ROW"] * WALL_HEIGHT,
        "DIRECTION" : STOP
    });
}

function update() {
    time_passed += FRAME_TIME / 1000;
    if(time_passed > TIME_IN_CELL) {

        // moves tail segmanets
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
        
        switch(SNAKE["DIRECTION"]) {
            case UP:
                if(SNAKE["ROW"] - 1 != 0) { 
                    SNAKE["ROW"] -= 1;
                }
                break;
            case DOWN:
                if(SNAKE["ROW"] + 1 != (MAP_ROWS-1)) { 
                    SNAKE["ROW"] += 1;
                }
                break;
            case LEFT:
                if(SNAKE["COL"] - 1 != 0) { 
                    SNAKE["COL"] -= 1;
                }
                break;
            case RIGHT:
                if(SNAKE["COL"] + 1 != (MAP_COLS-1)) { 
                    SNAKE["COL"] += 1;
                }
                break;
        }
        SNAKE["CAN_CHANGE_DIR"] = true;
        if(SNAKE["NEXT_DIRECTION"] != null) {
            SNAKE["DIRECTION"] = SNAKE["NEXT_DIRECTION"];
            SNAKE["NEXT_DIRECTION"] = null;
        }

        time_passed = 0;
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
                SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] -= SMOOTH_YVELOCITY * (FRAME_TIME / 1000);
                break;
            case DOWN:
                SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] += SMOOTH_YVELOCITY * (FRAME_TIME / 1000);
                break;
            case LEFT:
                SMOOTH_SNAKE["TAIL"][tail_ind]["X"] -= SMOOTH_XVELOCITY * (FRAME_TIME / 1000);
                break;
            case RIGHT:
                SMOOTH_SNAKE["TAIL"][tail_ind]["X"] += SMOOTH_XVELOCITY * (FRAME_TIME / 1000);
                break;
        }

        SMOOTH_SNAKE["TAIL"][tail_ind]["ROW"] = Math.trunc((SMOOTH_SNAKE["TAIL"][tail_ind]["Y"] + (SMOOTH_SNAKE["HEIGHT"]/2)) / WALL_HEIGHT); 
        SMOOTH_SNAKE["TAIL"][tail_ind]["COL"] = Math.trunc((SMOOTH_SNAKE["TAIL"][tail_ind]["X"] + (SMOOTH_SNAKE["WIDTH"]/2)) / WALL_WIDTH); 
    }
}

function setup() {
    createMap();

    SMOOTH_SNAKE["TAIL"][0]["X"] = SNAKE["COL"] * SNAKE["WIDTH"];
    SMOOTH_SNAKE["TAIL"][0]["Y"] = SNAKE["ROW"] * SNAKE["HEIGHT"];
    SMOOTH_SNAKE["WIDTH"] = SNAKE["WIDTH"];
    SMOOTH_SNAKE["HEIGHT"] = SNAKE["HEIGHT"];
}

function draw() {
    clearScreen();
    drawMap();
    drawSnake();
}


function gameLoop() {
    update();
    draw();

    setTimeout(gameLoop, FRAME_TIME);
}

setup();
addTail();
addTail();
addTail();
addEventListener();
setTimeout(gameLoop, FRAME_TIME);
