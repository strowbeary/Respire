let SAND = 2;
let WALL = 1;
let NONE = 0;
let RESTING = 128;
let gameWidth, gameHeight, grid = [[]], particles = 0, pixData;

const materials = {
    space: {
        density: 0
    },
    wall: {
        color: [128, 128, 128]
    },
    sand: {
        color: [210, 180, 140],
        density: 100
    }
};

export function setup(details) {
    ({gameWidth, gameHeight, pixData} = details);
    grid = new Array(gameWidth);
    let x = 0;
    let y = 0;
    while (x < gameWidth) {
        grid[x] = new Array(gameHeight);
        y = 0;
        while (y < gameHeight + 1) {
            grid[x][y] = NONE;
            y++;
        }
        x++;
    }
    particles = 0;
}

export function update() {
    postMessage({name: "started"});

    emit();

    let y = 0;
    let x = 0;
    while (x < gameWidth - 1) {
        y = gameHeight;
        while (y >= 0) {
            pixel(x, y, 0, 0, 0, 0);
            let s = grid[x][y];

            if (s === NONE || s & RESTING) {
                y--;
                continue;
            }

            if (y === 0 || y === gameHeight) {
                if (y === 0) remove_obj(x, y);
                y--;
                continue;
            }

            let dbc = dot(x, y + 1),
                m = get_material(s);
            let color = m.color;

            pixel(x, y, color[0], color[1], color[2], 255);

            if (s & SAND) {
                if (!dbc) {
                    if (Math.random() < 0.8) {
                        move_obj(x, y + 1, x, y, s);
                    }
                } else if (dbc && !dot(x - 1, y + 1)) {
                    if (Math.random() < 0.5) {
                        move_obj(x - 1, y + 1, x, y, s);
                    }
                } else if (dbc && !dot(x + 1, y + 1)) {
                    if (Math.random() < 0.5) {
                        move_obj(x + 1, y + 1, x, y, s);
                    }
                }
            }

            let um = get_material(grid[x][y - 1]);
            if (um !== undefined) {
                if (typeof um.density !== 'undefined' && typeof m.density !== 'undefined') {
                    if (m.density < um.density) {
                        if (Math.random() < 0.7) {
                            swap(x, y - 1, x, y);
                        }
                    }
                }
            }

            y--;
        }

        x++;
        
        if (x === gameWidth - 1) {
            postMessage({name: "pixUpdate", details: {pixData, particles}});
        }
    }


}

const add_obj = function (x, y, type) {
    x = Math.round(x);
    if (grid[x][y] === NONE) {
        particles++;
    }
    grid[x][y] = type;
};

const remove_obj = function (x, y) {
    if (grid[x][y] !== NONE) {
        particles--;
    }
    grid[x][y] = NONE;
};

const swap = function (x, y, oldx, oldy) {
    let temp = grid[x][y];
    let temp1 = grid[oldx][oldy];
    grid[x][y] = temp1;
    grid[oldx][oldy] = temp;
};

const move_obj = function (x, y, oldx, oldy, type) {
    remove_obj(oldx, oldy);
    add_obj(x, y, type);
};

const dot = function (x, y) {
    if (x < 0 || x > gameWidth || y < 0 || y > gameHeight) {
        return WALL;
    }
    return grid[x][y];
};

const clear = function () {
    setup();
    particles = 0;
};

const fill_square = function (x, y, w, h, s) {
    for (let xx = x; xx < x + w; xx++) {
        for (let yy = y; yy < y + h; yy++) {
            add_obj(xx, yy, s);
        }
    }
};

const emit = function () {
    if (Math.random() < 0.5) {
        fill_square(gameWidth/3, 0, 10, 10, 2);
    }
    if (Math.random() < 0.5) {
        fill_square(0, 0, 20, 20, 2);
    }
    if (Math.random() < 0.5) {
        fill_square(gameWidth - 20, 0, 20, 20, 2);
    }
};

/*Game.prototype.handle_mouse = function() {
  if (this.mouse.is_down) {
    if (this.mouse.tool !== NONE) {
      this.fill_square(this.mouse.x, this.mouse.y, this.mouse.size, this.mouse.size, this.mouse.tool);
    } else {
      this.remove_obj(this.mouse.x, this.mouse.y);
    }
  }
};*/

const get_material = function (s) {
    if (s & NONE) {
        return materials.space
    }
    if (s & WALL) {
        return materials.wall
    }
    if (s & SAND) {
        return materials.sand
    }
};

const pixel = function(x, y, r, g, b, a) {
    /*this.context.fillStyle = "rgb("+r+","+g+","+b+")";
    this.context.fillRect(x, y, 1, 1);
    0,0 == i = 0
    300,300 = i = 300*300*/
    let i = x*4+y*(gameWidth*4);

    pixData[i] = r; 	// red
    pixData[i+1] = g; 	// green
    pixData[i+2] = b; 	// blue
    pixData[i+3] = a; 	// alpha
};