function BackgroundLayer(state, opacity)
{
    this.state = state;
    this.grid = [];
    this.colors = [];
    this.transX = undefined;
    this.transY = undefined;
    this.counter = 0;
    this.ycounter = 0;
    this.threshX = undefined;
    this.threshY = undefined;
    this.opacity = opacity;

    this.init();

    var self = this;

    state.hookPreDraw(function(canvas)
    {
        self.draw.call(self, canvas);
    });

    state.hookPreUpdate(function(elapsed)
    {
        self.update.call(self, elapsed);
    });
}

BackgroundLayer.prototype.init = function()
{
    var w = this.state.__game.width;
    var h = this.state.__game.height;

    w /= 2;
    h /= 2;

    var c = new Canvas(document.createElement("canvas"));
    c.resize(w, h);
    c.fill("white");

    var ptamt = randomInt(1, 15);

    var pts = [ [-randomInt(0, w) - w, -randomInt(0, h) - h] ];

    for (var i = 0; i < ptamt; i++)
    {
        pts.push([randomInt(0, w), randomInt(0, h)]);
    }

    pts.push([randomInt(0, w) + w + w, randomInt(0, h) + h + h]);

    c[randomInt(0, 2) ? "drawPath" : "curvePath"](pts, "black", h / 8); // this is why javascript is wonderful

    var pixels = c.getPixels();
    var g = [];

    var cw = c.width();
    var ch = c.height();

    for (var y = 0; y < ch; y++)
    {
        g.push([]);

        for (var x = 0; x < cw; x++)
        {
            g[y].push(+(pixels[(y * cw + x) * 4] == 0));
            //console.log(c.getPixel(x, y));
        }

        g[y] = g[y].concat(JSON.parse(JSON.stringify(g[y])).reverse());
    }

    g = g.concat(JSON.parse(JSON.stringify(g)).reverse());

    this.grid = g;

    this.colors[0] = [ randomInt(0, 255), randomInt(0, 255), randomInt(0, 255) ];
    this.colors[1] = [ randomInt(0, 255), randomInt(0, 255), randomInt(0, 255) ];

    var r = randomInt(0, 100);

    this.threshX = randomInt(20, 50);
    this.speedX = randomInt(50, 300) * [-1, 1].randomItem();
    this.speedY = randomInt(50, 500) * [-1, 1].randomItem();
    this.intensity = randomInt(1, 10) * [-1, 1].randomItem();
    this.tanY = randomInt(1, 10);

    this.transX = function(x, y, height)
    {
        return Math.round(x + (Math.sin(y / height * Math.PI * this.intensity) * this.counter));
    };

    this.transY = function(y)
    {
        return Math.round(y + this.ycounter + Math.cos(this.counter * Math.PI / (10 * this.tanY)));
    };
};

BackgroundLayer.prototype.draw = function(canvas)
{
    var imageData = canvas.getData();
    var buf = new ArrayBuffer(imageData.data.length);
    var buf8 = new Uint8ClampedArray(buf);
    var data = new Uint32Array(buf);

    var canvasHeight = canvas.height();
    var canvasWidth = canvas.width();
    var opacity = Math.floor(this.opacity * 255) << 24;

    var g = this.grid;
    var cs = this.colors;

    for (var y = 0; y < canvasHeight; y++)
    {
        for (var x = 0; x < canvasWidth; x++)
        {
            var _x = this.transX.call(this, x, y, canvasHeight);
            var _y = this.transY.call(this, y);

            while (_x < 0)
            {
                _x += canvasWidth;
            }

            while (_x >= canvasWidth)
            {
                _x -= canvasWidth;
            }

            while (_y < 0)
            {
                _y += canvasHeight;
            }

            while (_y >= canvasHeight)
            {
                _y -= canvasHeight;
            }

            var c = cs[g[y][x]];

            data[_y * canvasWidth + _x] = (opacity) | (c[2] << 16) | (c[1] << 8) | c[0];
        }
    }


    imageData.data.set(buf8);
    canvas.putData(imageData);

    if (!this.aa)
    {
        console.log(data);
        this.aa = true;
    }
    //console.log(imageData.data);
};

BackgroundLayer.prototype.update = function(elapsed)
{
    var amt = elapsed / this.speedX;
    amt *= (1 - Math.abs(this.counter) / this.threshX) * 0.9 + 0.1;

    if (this.neg)
    {
        this.counter -= amt;
        if (-Math.abs(this.counter) <= -this.threshX)
        {
            this.neg = false;
            this.counter += amt / 2;
            this.threshX += amt / Math.abs(amt) * elapsed / 100 * randomInt(0, 1000) / 1000 * [-1, 1].randomItem();
        }
    }
    else
    {
        this.counter += amt;
        if (Math.abs(this.counter) >= this.threshX)
        {
            this.neg = true;
            this.counter -= amt / 2;
            this.threshX -= amt / Math.abs(amt) * elapsed / 100 * randomInt(0, 1000) / 1000 * [-1, 1].randomItem();
        }
    }

    this.ycounter += elapsed / this.speedY;
    this.ycounter %= this.state.__game.height;

    (function()
    {
        var c = randomInt(0, 2);
        var s = this.colors[c];

        s = s.map(function(v)
        {
            return clamp(parseInt(v) + Math.floor(randomInt(0, 1200) / 1000) * [-1, 1].randomItem(), 0, 255);
        }, this);

        this.colors[c] = s;
    }).call(this);

    this.speedX += randomInt(0, 1000) / 1000 * elapsed / 100 * [-1, 1].randomItem();
    this.speedY += randomInt(0, 1000) / 1000 * elapsed / 100 * [-1, 1].randomItem();
};