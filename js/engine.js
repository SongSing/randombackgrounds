// requires: canvas.js

// credits: me, stack overflow, some articles i read on game loops, not rina

var Key =
{
    _pressed: {},

    left: 37,
    up: 38,
    right: 39,
    down: 40,
    space: 32,
    esc: 27,
    enter: 13,

    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,

    alphabet: "abcdefghijklmnopqrstuvwxyz",

    char: function(c)
    {
        var ind = this.alphabet.indexOf(c.toLowerCase());

        if (ind !== -1)
        {
            return 65 + ind;
        }

        return -1;
    },
    isDown: function(keyCode)
    {
        return this._pressed.hasOwnProperty(keyCode);
    },
    onKeyDown: function onKeyDown(event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function onKeyUp(event) {
        delete this._pressed[event.keyCode];
    }
};


var __emptyfn = function() {};

window.addEventListener("keydown", function(e)
{
    Key.onKeyDown(e);
}, false);

window.addEventListener("keyup", function(e)
{
    Key.onKeyUp(e);
}, false);

function WARN(warning)
{
    console.log("WARN: " + warning);
}

// game //

function Game(c, fps, w, h)
{
    this.canvas = new Canvas(c);
    this.width = w;
    this.height = h;
    this.canvas.resize(w, h);
    this.states = [];
    this.activeStates = [];
    this.lastUpdate = getCurrentTime();
    this.fps = fps;
    this.step = 1000 / fps;
    this.frame = undefined;
    this.runningFps = fps;
    this.fpsCounter = 0;
    this.fpsTime = 0;
    this.started = false;
    this.elapsed = 0;
    this.__assetQueue = [];
    this.__assetCount = 0;
    this.__assetsLoaded = 0;

    this.keys =
    {
        primary:    [ Key.z ],
        secondary:  [ Key.x ],
        up:         [ Key.w, Key.up ],
        down:       [ Key.s, Key.down ],
        left:       [ Key.a, Key.left ],
        right:      [ Key.d, Key.right ],
        start:      [ Key.enter ],
        quit:       [ Key.esc ]
    };
}

Game.prototype.keyDown = function(keyType)
{
    for (var i = 0; i < this.keys[keyType].length; i++)
    {
        if (Key.isDown(this.keys[keyType][i]))
        {
            return true;
        }
    }

    return false;
};

Game.prototype.prepareAsset = function(src, fn, callback)
{
    // src needs to be src obv
    // fn is a loading function that takes a src arg and a callback arg -- "callback" IS that callback arg
    // callback should be a fn that takes an asset arg, basically what do u want to do with this asset once it's loaded
    this.__assetQueue.push({ src: src, fn: fn, callback: callback });

    /*

    example:

    prepareAsset("img/thing.png", loadImage, function(img)
    {
        entityOrWhatever.sprite = img;
    });

    custom fn arg:

    prepareAsset("bla/jio.num", function(src, callback)
    {
        // load your shit here with src, and call callback with your loaded thing as the param when youre done
    }, function(num)
    {
        // THIS FUNCTION IS CALLED FROM THE PREV ONE, IT'S "CALLBACK"
    });

    sorry i got confused even tho i made it lol & felt it needed more extensive documentation

    */
};

Game.prototype.loadAssets = function(callback, progress)
{
    // callback should be a function to execute once all of the assets are loaded (eg starting the level)
    // progress should be a function that takes a % done param, for loading bars n shit

    this.__assetCount = this.__assetQueue.length;
    this.__assetsLoaded = 0;

    var self = this;

    for (var i = 0; i < this.__assetCount; i++)
    {
        let a = this.__assetQueue[i];

        let cb = function(asset)
        {
            a.callback(asset);
            self.__assetsLoaded++;

            if (progress) progress(self.__assetsLoaded / self.__assetCount);

            if (self.__assetsLoaded === self.__assetCount)
            {
                self.__assetQueue = [];
                self.__assetCount = 0;
                self.__assetsLoaded = 0;
                callback.call(self);
            }
        };

        a.fn(a.src, cb);
    }
};

Game.prototype.start = function()
{
    if (this.started)
    {
        WARN("game already started");
        return;
    }

    var self = this;

    this.frame = requestAnimationFrame(function(time)
    {
        self.draw(self.canvas, 0);
        self.started = true;
        self.lastUpdate = time;

        self.frame = requestAnimationFrame(function(time)
        {
            self.loop.call(self, time);
        });
    });
};

Game.prototype.stop = function()
{
    tihs.started = false;
    cancelAnimationFrame(this.frame);
};

Game.prototype.resize = function(w, h)
{
    this.width = w;
    this.height = h;
    this.canvas.resize(w, h);
};

Game.prototype.update = function(elapsed)
{
    var self = this;

    this.activeStates.forEach(function(state)
    {
        state.update(elapsed);
    });
};

Game.prototype.draw = function(inter)
{
    inter = inter || 0;
    var self = this;

    this.activeStates.forEach(function(state)
    {
        return state.draw(inter);
    });
};

Game.prototype.loop = function(time)
{
    var self = this;

    this.elapsed += time - this.lastUpdate;

    if (this.fps === -1) // makes it so a -1 fps will make it just go as it goes. prob not good but its an option now lol
    {
        this.step = this.elapsed;
    }

    /*while (this.elapsed >= this.step)
    {
        this.update(this.step);
        this.elapsed -= this.step;
    }*/

    this.update(this.elapsed);
    this.elapsed = 0;

    this.draw(this.elapsed / this.step);

    this.fpsCounter++;
    this.fpsTime += this.elapsed;

    while (this.fpsTime >= 1000)
    {
        this.runningFps = 0.25 * this.fpsCounter + 0.75 * this.runningFps;
        this.fpsTime -= 1000;
        this.fpsCounter = 0;
    }

    this.lastUpdate = time;

    this.frame = requestAnimationFrame(function(time)
    {
        self.loop.call(self, time);
    });
};

Game.prototype.addState = function(state, makeActive)
{
    state.__game = this;
    state.canvas = this.canvas;
    this.states.push(state);

    if (makeActive)
    {
        this.makeStateActive(state);
    }
};

Game.prototype.removeState = function(state)
{
    if (this.states.contains(state))
    {
        this.makeStateInactive(state);
        this.states.remove(this.states.indexOf(state));
    }
    else
    {
        WARN("tried to remove non-added state");
    }
};

Game.prototype.makeStateActive = function(state)
{
    if (!this.states.contains(state))
    {
        this.addState(state);
        WARN("made non-added state active");
    }

    this.activeStates.push(state);
};

Game.prototype.makeStateInactive = function(state)
{
    if (!this.states.contains(state))
    {
        this.addState(state);
        WARN("made non-added state inactive");
        return;
    }

    if (!this.activeStates.contains(state))
    {
        WARN("made inactive state inactive");
        return;
    }

    this.activeStates.remove(this.activeStates.indexOf(state));
};

Game.prototype.makeStateOnlyActive = function(state)
{
    if (!this.states.contains(state))
    {
        this.addState(state);
        WARN("made non-added state only active");
    }

    this.activeStates = [ state ];
};

Game.prototype.stateIsActive = function(state)
{
    return this.activeStates.contains(state);
};

Game.prototype.hasInBounds = function(e)
{
    return !(e.right() <= 0 || e.x >= this.width || e.bottom() <= 0 || e.y >= this.height);
};

// state //

function State()
{
    this.entities = [];
    this.paused = false;
    this.isUpdating = false;
    this.removeQueue = [];
    this.preUpdates = [];
    this.postUpdates = [];
    this.preDraws = [];
    this.postDraws = [];
    this.canvas = undefined;

    this.__preUpdateRemoveQueue = [];
    this.__postUpdateRemoveQueue = [];
}

State.prototype.hookPreUpdate = function(fn)
{
    this.preUpdates.push(fn);
};

State.prototype.unhookPreUpdate = function(fn)
{
    if (this.preUpdating)
    {
        this.__preUpdateRemoveQueue.push(fn);
    }
    else
    {
        this.preUpdates.remove(fn);
    }
};

State.prototype.hookPostUpdate = function(fn)
{
    this.postUpdates.push(fn);
};

State.prototype.unhookPostUpdate = function(fn)
{
    if (this.postUpdating)
    {
        this.__postUpdateRemoveQueue.push(fn);
    }
    else
    {
        this.postUpdates.remove(fn);
    }
};

State.prototype.hookPreDraw = function(fn)
{
    this.preDraws.push(fn);
};

State.prototype.unhookPreDraw = function(fn)
{
    this.preDraws.remove(fn);
};

State.prototype.hookPostDraw = function(fn)
{
    this.postDraws.push(fn);
};

State.prototype.unhookPostDraw = function(fn)
{
    this.postDraws.remove(fn);
};

State.prototype.preDraw = function(inter)
{
    var canvas = this.canvas || self.__game.canvas;

    for (var i = 0; i < this.preDraws.length; i++)
    {
        this.preDraws[i](canvas, inter);
    }
};

State.prototype.postDraw = function(inter)
{
    var canvas = this.canvas || self.__game.canvas;

    for (var i = 0; i < this.postDraws.length; i++)
    {
        this.postDraws[i](canvas, inter);
    }
};

State.prototype.preUpdate = function(elapsed)
{
    var self = this;

    this.preUpdating = true;
    this.preUpdates.forEach(function(fn)
    {
        if (fn(elapsed) === false)
        {
            unhookPreUpdate(fn);
        }
    });
    this.preUpdating = false;

    this.__preUpdateRemoveQueue.forEach(function(fn)
    {
        this.unhookPreUpdate(fn);
    });
};

State.prototype.postUpdate = function(elapsed)
{
    var self = this;

    this.postUpdating = true;
    this.postUpdates.forEach(function(fn)
    {
        if (fn(elapsed) === false)
        {
            unhookPostUpdate(fn);
        }
    });
    this.postUpdating = false;

    this.__postUpdateRemoveQueue.forEach(function(fn)
    {
        this.unhookPostUpdate(fn);
    });
};

State.prototype.addEntity = function(entity)
{
    entity.__state = this;

    if (this.entities.length === 0)
    {
        this.entities.push(entity);
        return;
    }

    if (entity.zIndex > this.entities.lastItem().zIndex)
    {
        this.entities.push(entity);
        return;
    }

    var len = this.entities.length;

    for (var i = 0; i < len; i++)
    {
        if (entity.zIndex <= this.entities[i].zIndex)
        {
            this.entities.insert(entity, i);
            break;
        }
    }
};

State.prototype.removeEntity = function(entity)
{
    if (this.entities.contains(entity))
    {
        if (this.isUpdating)
        {
            this.removeQueue.push(entity);
        }
        else
        {
            this.entities.remove(entity);
        }
    }
    else
    {
        WARN("tried to remove non-added entity");
    }
};

State.prototype.clearEntities = function()
{
    this.entities = [];
};

State.prototype.pause = function()
{
    this.paused = true;
};

State.prototype.unpause = function()
{
    this.paused = false;
};

State.prototype.setPaused = function(paused)
{
    this.paused = paused;
};

State.prototype.update = function(elapsed)
{
    if (!this.paused)
    {
        var self = this;
        this.preUpdate(elapsed);

        this.isUpdating = true;
        this.entities.forEach(function(entity)
        {
            if (entity.update(elapsed) === false)
            {
                self.removeQueue.push(entity);
            }
        });
        this.isUpdating = false;

        this.removeQueue.forEach(function(entity)
        {
            self.entities.remove(entity);
        });

        this.removeQueue = [];

        this.postUpdate(elapsed);
    }
};

State.prototype.draw = function(inter)
{
    canvas = this.canvas || this.__game.canvas;
    inter = inter || 0;

    this.preDraw(canvas);

    this.entities.forEach(function(entity)
    {
        entity.draw(canvas, inter);
    });

    this.postDraw(canvas);
};

// entity //

function Entity(x, y, w, h, z)
{
    z = z || 0;

    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.zIndex = z;
    this.sprite = undefined;
    /*this.spriteWidth = undefined; // these are used for spritesheets
    this.spriteHeight = undefined;
    this.spriteRow = 0;
    this.spriteColumn = 0;*/
    this.updateHooks = [];
    this.drawHooks = [];
}

Entity.prototype.hookUpdate = function(fn)
{
    this.updateHooks.push(fn);
};

Entity.prototype.unhookUpdate = function(fn)
{
    this.updateHooks.remove(fn);
};

Entity.prototype.hookDraw = function(fn)
{
    this.drawHooks.push(fn);
};

Entity.prototype.unhookDraw = function(fn)
{
    this.drawHooks.remove(fn);
};

/*Entity.prototype.setSprite = function(src, width, height, callback, autodraw)
{
    var self = this;
    var img;

    if (typeof(src) === "string")
    {
        loadImage(src, function(_img)
        {
            img = _img;
        });
    }
    else
    {
        img = src;
    }

    this.sprite = img;
    this.spriteWidth = width || img.width;
    this.spriteHeight = height || img.height;
    this.spriteRow = 0;
    this.spriteColumn = 0;

    if (autodraw)
    {
        self.draw = function(canvas)
        {
            canvas.drawCroppedImage
            (
                self.sprite,
                Math.round(self.x),
                Math.round(self.y),
                self.spriteColumn * self.spriteWidth,
                self.spriteRow * self.spriteHeight,
                self.spriteWidth,
                self.spriteHeight,
                self.width,
                self.height
            );
        };
    }

    if (callback) callback.call(this);
};*/

Entity.prototype.update = function(elapsed)
{
    var self = this;

    this.updateHooks.forEach(function(fn)
    {
        fn.call(self, elapsed);
    });
};

Entity.prototype.draw = function(canvas, inter)
{
    var self = this;

    this.drawHooks.forEach(function(fn)
    {
        fn.call(self, canvas, inter);
    });
};

Entity.prototype.top = function()
{
    return this.y;
};

Entity.prototype.left = function()
{
    return this.x;
};

Entity.prototype.bottom = function()
{
    return this.y + this.height;
};

Entity.prototype.right = function()
{
    return this.x + this.width;
};

Entity.prototype.isCollidingWith = function(entity)
{
    return !(entity.x >= this.right() || entity.right() <= this.x || entity.y >= this.bottom() || entity.bottom() <= this.y);
};

Entity.prototype.willCollideWith = function(entity, _x, _y, _ox, _oy)
{
    return !(entity.x + _ox >= this.right() + _x || entity.right() + _ox <= this.x + _x || entity.y + _oy >= this.bottom() + _y || entity.bottom() + _oy <= this.y + _y);
};

Entity.prototype.isOnScreen = function()
{
    return !(0 >= this.right() || this._state._game.width <= this.x || 0 >= this.bottom() || this._state._game.height <= this.y);
};

/*Entity.prototype.setSpriteRow = function(row)
{
    this.spriteRow = row;
};

Entity.prototype.setSpriteColomn = function(column)
{
    this.spriteColumn = column;
};*/

// utils //

function loadImage(src, callback)
{
    var img = new Image();

    img.onload = function()
    {
        callback(this);
    };

    img.src = src;
}

function getCurrentTime()
{
    return Date.now();
}

function randomInt(min, max)
{
    return parseInt(Math.random() * (max - min) + min);
}

function clamp(val, min, max)
{
    return val > max ? max : val < min ? min : val;
}

function sign(n)
{
    if (n >= 0)
    {
        return 1;
    }

    return -1;
}

function pointIsInRect(px, py, x, y, w, h)
{
    if (h === undefined) // gave a point instead of x and y values
    {
        h = w;
        w = y;
        y = x;
        x = py;
        py = px.y;
        px = px.x;
    }

    return !(px <= x || px >= x + w || py <= y || py >= y + h);
}

Number.prototype.roundToZero = function()
{
    return this <= 0 ? Math.floor(this) : Math.ceil(this);
};

Array.prototype.contains = function(item)
{
    return this.indexOf(item) !== -1;
};

String.prototype.contains = function(str)
{
    return this.indexOf(str) !== -1;
};

Array.prototype.remove = function(item)
{
    this.splice(this.indexOf(item), 1);
    return this;
};

Array.prototype.insert = function(item, index)
{
    this.splice(index, 0, item);
    return item;
};

Array.prototype.lastItem = function()
{
    return this[this.length - 1];
};

Array.prototype.randomItem = function()
{
    return this[randomInt(0, this.length)];
};

function vectorFromAngle(angle, magnitude)
{
    magnitude = magnitude | 1;
    return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}

Function.prototype.extends = function(c)
{
    // songsing, why don't we just set them equal to eachother?
    // because, dumbass, then mutating the child prototype would also mutate the parent's
    for (var key in c.prototype)
    {
        this.prototype[key] = c.prototype[key];
    }
};