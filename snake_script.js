

console.log("v1");

// -- TIME
const FPS = 90;
const FRAME_TIME = 1000 / FPS;  

// -- CANVAS
const CANVAS = document.getElementById("canvas");
const CANVAS_CTX = CANVAS.getContext("2d");

const CANV_WIDTH = CANVAS.width;
const CANV_HEIGHT = CANVAS.height;


// -- MAP
const TOT_ROWS = 16;
const TOT_COLS = 16;

const W = 1; // wall
var MAP = [];

// -- WALL
const WALL_WIDTH = 25;
const WALL_HEIGHT = WALL_WIDTH;
const WALL_COLOR = "#2e8f21";
var WALLS = [];     // [[wallx, wally] [...] ...]
const WALL_X = 0, WALL_Y = 1;

const SPACE_COLORS = ["#0a1f07", "#050f04"];

// -- EMPTY SPACE
var EMPTY_SPACES = [];   // [ [spacex, spacey] [...] ...]
const SPACE_X = 0, SPACE_Y = 1;
const INNER_SPACE_WIDTH = 5;
const INNER_SPACE_HEIGHT = INNER_SPACE_WIDTH;

// -- SNAKE
var HEAD_START_ROW = 2;
var HEAD_START_COL = 2;
const SNAKE_SEG_WIDTH = WALL_WIDTH;
const SNAKE_SEG_HEIGHT = SNAKE_SEG_WIDTH;
var HEAD_X = HEAD_START_COL * SNAKE_SEG_WIDTH;
var HEAD_Y = HEAD_START_ROW * SNAKE_SEG_HEIGHT;
const SNAKE_SPEED = 250;
const SNAKE_COLOR = "#d6132d";
var HEAD_NEXT_DIRECTION = -1;
const UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3;
// snake [ [row,col,x,y,direction], [...]]
const HEAD = 0, SEG_ROW = 0, SEG_COL = 1, SEG_X = 2, SEG_Y = 3, DIRECTION = 4;
var SNAKE = [ 
    [HEAD_START_ROW, HEAD_START_COL, HEAD_X, HEAD_Y, -1]
            ];


function createMap() {
    var row = [];
    var wall_arr = [];
    var space_arr = [];

    for(var rown = 0; rown < TOT_ROWS; rown++) {
        row = [];
        for(var coln = 0; coln < TOT_COLS; coln++) {
            // fill sides with walls
            if(rown == 0 || rown == (TOT_ROWS-1) || coln == 0 || coln == (TOT_COLS-1))  {
                row.push(W);

                // memorizes wall x and y positions 
                wall_arr[WALL_X] = (coln * WALL_WIDTH);
                wall_arr[WALL_Y] = (rown * WALL_HEIGHT);
                WALLS.push(wall_arr);
                wall_arr = [];
            }
            else {
                row.push(0);

                space_arr[SPACE_X] = (coln * WALL_WIDTH);
                space_arr[SPACE_Y] = (rown * WALL_HEIGHT);
                EMPTY_SPACES.push(space_arr);
                space_arr = [];
            }
        }
        MAP.push(row);
    }
}

function drawMap() {

    // CANVAS_CTX.fillRect(x, y, width, height)
    var space_color = 0;
    for(var row = 0; row<TOT_ROWS; row++) {

        if(space_color == 0) 
            space_color = 1;
        else
            space_color = 0;


        for(var col = 0; col<TOT_COLS; col++) {

            if(MAP[row][col] == W) {
                CANVAS_CTX.fillStyle = WALL_COLOR;
                CANVAS_CTX.fillRect((col * WALL_WIDTH),
                (row * WALL_HEIGHT),
                WALL_WIDTH,
                WALL_HEIGHT);
            }
                
            if(MAP[row][col] == 0) {
                CANVAS_CTX.fillStyle = SPACE_COLORS[space_color];
                if(space_color == 0) 
                    space_color = 1;
                else
                    space_color = 0;

                CANVAS_CTX.fillRect((col * WALL_WIDTH),
                (row * WALL_HEIGHT),
                WALL_WIDTH,
                WALL_HEIGHT);
            }
        }   
    }
}

function drawPlayer() {
    
    CANVAS_CTX.fillStyle = SNAKE_COLOR;
    for(var snake_segn = 0; snake_segn<SNAKE.length; snake_segn++) {
        
        CANVAS_CTX.fillRect(SNAKE[snake_segn][SEG_X],
        SNAKE[snake_segn][SEG_Y],
        SNAKE_SEG_WIDTH,
        SNAKE_SEG_HEIGHT);            
    }
}

function clearScreen() {
    CANVAS_CTX.fillStyle = "#000000";
    CANVAS_CTX.fillRect(0, 0 ,CANV_WIDTH, CANV_HEIGHT);
}

function isPlayerColliding() {
    
    for(var walln = 0; walln<WALLS.length; walln++) {
        if(SNAKE[HEAD][SEG_X] < WALLS[walln][WALL_X] + WALL_WIDTH &&
            SNAKE[HEAD][SEG_X] + SNAKE_SEG_WIDTH > WALLS[walln][WALL_X] &&
            SNAKE[HEAD][SEG_Y] < WALLS[walln][WALL_Y] + WALL_HEIGHT &&
            SNAKE[HEAD][SEG_Y] + SNAKE_SEG_HEIGHT > WALLS[walln][WALL_Y]) {

                switch(SNAKE[HEAD][DIRECTION]) {
                    case UP:
                        SNAKE[HEAD][SEG_Y] += (WALLS[walln][WALL_Y] + WALL_HEIGHT) - SNAKE[HEAD][SEG_Y];
                        break;
                    case DOWN:
                        SNAKE[HEAD][SEG_Y] -= (SNAKE[HEAD][SEG_Y] + SNAKE_SEG_HEIGHT) - WALLS[walln][WALL_Y];
                        break;
                    case LEFT:
                        SNAKE[HEAD][SEG_X] += (WALLS[walln][WALL_X] + WALL_WIDTH) - SNAKE[HEAD][SEG_X];
                        break;
                    case RIGHT:
                        SNAKE[HEAD][SEG_X] -= (SNAKE[HEAD][SEG_X] + SNAKE_SEG_WIDTH) - WALLS[walln][WALL_X];
                        break;
                }
                SNAKE[HEAD][DIRECTION] = -1;
        }

    }
}

function isPlayerInCenter() {
    var inner_space_x, inner_space_y;
    var player_center_x = SNAKE[HEAD][SEG_X] + (SNAKE_SEG_WIDTH / 2);
    var player_center_y = SNAKE[HEAD][SEG_Y] + (SNAKE_SEG_HEIGHT / 2);

    for(var spacen = 0; spacen<EMPTY_SPACES.length; spacen++) {

        inner_space_x = EMPTY_SPACES[spacen][SPACE_X] + (WALL_WIDTH / 2 - (INNER_SPACE_WIDTH / 2));
        inner_space_y = EMPTY_SPACES[spacen][SPACE_Y] + (WALL_HEIGHT / 2 - (INNER_SPACE_HEIGHT / 2));

        if(player_center_x > inner_space_x &&
        player_center_x < inner_space_x + INNER_SPACE_WIDTH &&
        player_center_y > inner_space_y &&
        player_center_y < inner_space_y + INNER_SPACE_HEIGHT) {

            return true;
        }
    }
}

function addEventListener() {
    document.addEventListener("keypress", function(event) {
        
        var moved = false;
        switch(event.key) {
            case 'w':
                if(SNAKE[HEAD][DIRECTION] != DOWN) {
                    moved = true;
                    HEAD_NEXT_DIRECTION = UP;
                }
                break;
            case 's':
                if(SNAKE[HEAD][DIRECTION] != UP) {
                    moved = true;
                    HEAD_NEXT_DIRECTION = DOWN;
                }
                break;
            case 'a':
                if(SNAKE[HEAD][DIRECTION] != RIGHT) {
                    moved = true;
                    HEAD_NEXT_DIRECTION = LEFT;
                }
                break;
            case 'd':
                if(SNAKE[HEAD][DIRECTION] != LEFT) {
                    moved = true;
                    HEAD_NEXT_DIRECTION = RIGHT;
                }
                break;
        }

        if(moved && isPlayerInCenter())
            SNAKE[HEAD][DIRECTION] = HEAD_NEXT_DIRECTION;
    
    });
}


function update() {
    switch(SNAKE[HEAD][DIRECTION]) {
        case UP:
            SNAKE[HEAD][SEG_Y] -= (SNAKE_SPEED * (FRAME_TIME / 1000));
            break;
        case DOWN:
            SNAKE[HEAD][SEG_Y] += (SNAKE_SPEED * (FRAME_TIME / 1000));
            break;
        case LEFT:
            SNAKE[HEAD][SEG_X] -= (SNAKE_SPEED * (FRAME_TIME / 1000));
            break;
        case RIGHT:
            SNAKE[HEAD][SEG_X] += (SNAKE_SPEED * (FRAME_TIME / 1000));
            break;
    }
    isPlayerColliding();

    if(isPlayerInCenter() && HEAD_NEXT_DIRECTION != -1) {
        SNAKE[HEAD][DIRECTION] = HEAD_NEXT_DIRECTION;
        HEAD_NEXT_DIRECTION = -1;

        SNAKE[HEAD][SEG_X] = SNAKE[HEAD][SEG_COL] * WALL_WIDTH;
        SNAKE[HEAD][SEG_Y] = SNAKE[HEAD][SEG_ROW] * WALL_HEIGHT;
    }

    SNAKE[HEAD][SEG_ROW] = Math.trunc((SNAKE[HEAD][SEG_Y] + (SNAKE_SEG_HEIGHT / 2)) / WALL_HEIGHT);
    SNAKE[HEAD][SEG_COL] = Math.trunc((SNAKE[HEAD][SEG_X] + (SNAKE_SEG_WIDTH / 2)) / WALL_WIDTH);
}

function drawStuff() {
    clearScreen();
    drawMap();
    drawPlayer();
}

function gameLoop() {
    update();
    drawStuff();
    
    setTimeout(gameLoop, FRAME_TIME);
}

createMap()
addEventListener();
setTimeout(gameLoop, FRAME_TIME);


