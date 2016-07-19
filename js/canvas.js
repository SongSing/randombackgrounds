"use strict";

// Canvas is make easy to draw //
// by brando //

function Canvas(canvas) {
	var self = this;
	this.canvas = canvas;
	this.translation = { "x": 0, "y": 0 };

	this.mouseMove = function () {};
	this.mouseDown = function () {};
	this.mouseUp = function () {};
	this.mouseLeave = function () {};

	this.canvas.addEventListener("mousemove", function (e) {
		var p = self.pos(e);
		self.mouseMove(p.x, p.y, e);
	});

	this.canvas.addEventListener("mousedown", function (e) {
		var p = self.pos(e);
		self.mouseDown(p.x, p.y, e);
	});

	this.canvas.addEventListener("mouseup", function (e) {
		var p = self.pos(e);
		self.mouseUp(p.x, p.y, e);
	});

	this.canvas.addEventListener("mouseleave", function (e) {
		var p = self.pos(e);
		self.mouseLeave(e);
	});

	this.canvas.addEventListener("touchmove", function (e) {
		var p = self.pos(e);
		self.mouseMove(p.x, p.y, e);
	});

	this.canvas.addEventListener("touchstart", function (e) {
		var p = self.pos(e);
		self.mouseDown(p.x, p.y, e);
	});

	this.canvas.addEventListener("touchend", function (e) {
		var p = self.pos(e);
		self.mouseUp(p.x, p.y, e);
	});

	this.canvas.addEventListener("touchcancel", function (e) {
		var p = self.pos(e);
		self.mouseLeave(e);
	});
}

Canvas.prototype.pos = function (e) {
	var x = e.clientX;
	var y = e.clientY;

	if (e.changedTouches) {
		x = e.changedTouches[0].clientX;
		y = e.changedTouches[0].clientY;
	}

	var d = this.canvas;

	x -= d.offsetLeft;
	y -= d.offsetTop;

	return { "x": x, "y": y };
};

Canvas.prototype.context = function (type) {
	if (type === undefined) {
		type = "2d";
	}

	return this.canvas.getContext(type);
};

Canvas.prototype.data = function () {
	return this.canvas.toDataURL();
};

Canvas.prototype.width = function () {
	return this.canvas.width;
};

Canvas.prototype.height = function () {
	return this.canvas.height;
};

Canvas.prototype.resize = function (w, h, redraw) {
	if (redraw === undefined) {
		redraw = true;
	}

	var data;

	if (redraw) {
		data = this.data();
	}

	this.clear();
	this.canvas.width = w;
	this.canvas.height = h;

	if (redraw) {
		this.drawData(data, 0, 0);
	}
};

Canvas.prototype.setOpacity = function (o) {
	this.context().globalAlpha = o;
};

Canvas.prototype.opacity = function () {
	return this.context().globalAlpha;
};

Canvas.prototype.translate = function (x, y) {
	this.context().translate(x, y);
	this.translation = { "x": this.translation.x + x, "y": this.translation.y + y };
};

Canvas.prototype.setTranslation = function (x, y) {
	this.context().translate(-this.translate.x, -this.translate.y);
	this.context().translate(x, y);
	this.translation = { "x": x, "y": y };
};

Canvas.prototype.currentTranslation = function () {
	return this.translation;
};

Canvas.prototype.setComposition = function (c) {
	this.context().globalCompositeOperation = c;
};

Canvas.prototype.composition = function () {
	return this.context().globalCompositeOperation;
};

Canvas.prototype.setStrokeStyle = function (s) {
	this.context().strokeStyle = s;
};

Canvas.prototype.strokeStyle = function () {
	return this.context().strokeStyle;
};

Canvas.prototype.setFillStyle = function (s) {
	this.context().fillStyle = s;
};

Canvas.prototype.fillStyle = function () {
	return this.context().fillStyle;
};

Canvas.prototype.setLineWidth = function (width) {
	this.context().lineWidth = width;
};

Canvas.prototype.lineWidth = function () {
	return this.context().lineWidth;
};

Canvas.prototype.setLineCap = function (cap) {
	// butt* round square
	this.context().lineCap = cap;
};

Canvas.prototype.lineCap = function () {
	return this.context().lineCap;
};

Canvas.prototype.setLineJoin = function (join) {
	// bevel round miter*
	this.context().lineJoin = join;
};

Canvas.prototype.lineJoin = function () {
	return this.context().lineJoin;
};

Canvas.prototype.setFont = function (font) {
	// css font property
	this.context().font = font;
};

Canvas.prototype.font = function () {
	return this.context().font;
};

Canvas.prototype.setFontSize = function (size) {
	var font = this.context().font;
	var args = font.substr(font.indexOf(" ") + 1);
	this.context().font = size + " " + args;
};

Canvas.prototype.fontSize = function () {
	return this.context().font.split(" ")[0];
};

Canvas.prototype.setTextAlign = function (align) {
	// start*, end, left, right, center
	this.context().textAlign = align;
};

Canvas.prototype.textAlign = function () {
	return this.context().textAlign;
};

Canvas.prototype.setTextBaseline = function (baseline) {
	// top, hanging, middle, alphabetic*, ideographic, bottom
	this.context().textBaseline = baseline;
};

Canvas.prototype.textBaseline = function () {
	return this.context().textBaseline;
};

Canvas.prototype.setDirection = function (direction) {
	// ltr, rtl, inherit*
	this.context().direction = direction;
};

Canvas.prototype.direction = function () {
	return this.context().direction;
};

Canvas.prototype.drawRect = function (x, y, w, h, color, lineWidth) {
	var _color, _lineWidth;

	if (color !== undefined) {
		_color = this.strokeStyle();
		this.setStrokeStyle(color);
	}

	if (lineWidth !== undefined) {
		_lineWidth = this.lineWidth();
		this.setLineWidth(lineWidth);
	}

	var ctx = this.context();
	ctx.strokeRect(x, y, w, h);

	if (color !== undefined) {
		this.setStrokeStyle(_color);
	}

	if (lineWidth !== undefined) {
		this.setLineWidth(_lineWidth);
	}
};

Canvas.prototype.fillRect = function (x, y, w, h, color) {
	var _color;

	if (color !== undefined) {
		_color = this.fillStyle();
		this.setFillStyle(color);
	}

	this.context().fillRect(x, y, w, h);

	if (color !== undefined) {
		this.setFillStyle(_color);
	}
};

Canvas.prototype.clearRect = function (x, y, w, h) {
	this.context().clearRect(x, y, w, h);
};

Canvas.prototype.fill = function (color) {
	this.fillRect(-this.translation.x, -this.translation.y, this.width(), this.height(), color);
};

Canvas.prototype.clear = function () {
	this.clearRect(-this.translation.x, -this.translation.y, this.width(), this.height());
};

Canvas.prototype.drawLine = function (x1, y1, x2, y2, color, lineWidth) {
	var _color, _lineWidth;

	if (color !== undefined) {
		_color = this.strokeStyle();
		this.setStrokeStyle(color);
	}

	if (lineWidth !== undefined) {
		_lineWidth = this.lineWidth();
		this.setLineWidth(lineWidth);
	}

	var ctx = this.context();
	var path = new Path2D();
	path.moveTo(x1, y1);
	path.lineTo(x2, y2);
	ctx.stroke(path);

	if (color !== undefined) {
		this.setStrokeStyle(_color);
	}

	if (lineWidth !== undefined) {
		this.setLineWidth(_lineWidth);
	}
};

Canvas.prototype.drawPath = function (pts, color, lineWidth) {
	// pts is array of [x, y] or { x: x, y: y }
	// we'll convert to array if object

	var _color, _lineWidth;

	if (color !== undefined) {
		_color = this.strokeStyle();
		this.setStrokeStyle(color);
	}

	if (lineWidth !== undefined) {
		_lineWidth = this.lineWidth();
		this.setLineWidth(lineWidth);
	}

	var p = [];

	if (pts[0].constructor !== Array && pts[0].constructor === Object) {
		for (var x in pts) {
			var pt = pts[x];
			p.push([pt.x, pt.y]);
		}
	} else if (pts[0].constructor === Array) {
		p = pts;
	} else {
		return;
	}

	if (p.length < 2) {
		return;
	}

	var ctx = this.context();
	var path = new Path2D();
	path.moveTo(p[0][0], p[0][1]);

	for (var i = 1; i < p.length; i++) {
		path.lineTo(p[i][0], p[i][1]);
	}

	ctx.stroke(path);

	if (color !== undefined) {
		this.setStrokeStyle(_color);
	}

	if (lineWidth !== undefined) {
		this.setLineWidth(_lineWidth);
	}
};

Canvas.prototype.fillPath = function (pts, color) {
	// pts is array of [x, y] or { x: x, y: y }
	// we'll convert to array if object

	var _color;

	if (color !== undefined) {
		_color = this.fillStyle();
		this.setFillStyle(color);
	}

	var p = [];

	if (pts[0].constructor !== Array && pts[0].constructor === Object) {
		for (var x in pts) {
			var pt = pts[x];
			p.push([pt.x, pt.y]);
		}
	} else if (pts[0].constructor === Array) {
		p = pts;
	} else {
		return;
	}

	if (p.length < 2) {
		return;
	}

	var ctx = this.context();
	var path = new Path2D();
	path.moveTo(p[0][0], p[0][1]);

	for (var i = 1; i < p.length; i++) {
		path.lineTo(p[i][0], p[i][1]);
	}

	ctx.fill(path);

	if (color !== undefined) {
		this.setFillStyle(_color);
	}
};

Canvas.prototype.curvePath = function (pts, color, lineWidth) // http://stackoverflow.com/a/7058606
{
	var _color, _lineWidth;

	if (color !== undefined) {
		_color = this.strokeStyle();
		this.setStrokeStyle(color);
	}

	if (lineWidth !== undefined) {
		_lineWidth = this.lineWidth();
		this.setLineWidth(lineWidth);
	}

	var p = [];

	if (pts[0].constructor !== Array && pts[0].constructor === Object) {
		for (var x in pts) {
			var pt = pts[x];
			p.push([pt.x, pt.y]);
		}
	} else if (pts[0].constructor === Array) {
		p = pts;
	} else {
		return;
	}

	if (p.length < 2) {
		return;
	}

	var ctx = this.context();
	var path = new Path2D();
	path.moveTo(p[0][0], p[0][1]);

	var i;

	for (i = 1; i < p.length - 2; i++) {
		var xc = (p[i][0] + p[i + 1][0]) / 2;
		var yc = (p[i][1] + p[i + 1][1]) / 2;
		path.quadraticCurveTo(p[i][0], p[i][1], xc, yc);
	}

	path.quadraticCurveTo(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]);

	ctx.stroke(path);

	if (color !== undefined) {
		this.setStrokeStyle(_color);
	}

	if (lineWidth !== undefined) {
		this.setLineWidth(_lineWidth);
	}
};

Canvas.prototype.drawCircle = function (cx, cy, r, color, lineWidth) {
	var _color, _lineWidth;

	if (color !== undefined) {
		_color = this.strokeStyle();
		this.setStrokeStyle(color);
	}

	if (lineWidth !== undefined) {
		_lineWidth = this.lineWidth();
		this.setLineWidth(lineWidth);
	}

	var ctx = this.context();
	var path = new Path2D();
	path.arc(cx, cy, r, 0, 2 * Math.PI, false);
	ctx.stroke(path);

	if (color !== undefined) {
		this.setStrokeStyle(_color);
	}

	if (lineWidth !== undefined) {
		this.setLineWidth(_lineWidth);
	}
};

Canvas.prototype.fillCircle = function (cx, cy, r, color) {
	var _color;

	if (color !== undefined) {
		_color = this.fillStyle();
		this.setFillStyle(color);
	}

	var ctx = this.context();
	var path = new Path2D();
	path.arc(cx, cy, r, 0, 2 * Math.PI, false);
	ctx.fill(path);

	if (color !== undefined) {
		this.setFillStyle(_color);
	}
};

Canvas.prototype.drawCircleInSquare = function (x, y, s, color, lineWidth) {
	this.drawCircle(x + s / 2, y + s / 2, s / 2, color, lineWidth);
};

Canvas.prototype.fillCircleInSquare = function (x, y, s, color) {
	//if (y % 1 === 0) console.log(y);
	this.fillCircle(x + s / 2, y + s / 2, s / 2, color);
};

Canvas.prototype.drawText = function (text, x, y, color, font, align) {
	var _color, _font, _align;

	if (color !== undefined) {
		_color = this.strokeStyle();
		this.setStrokeStyle(color);
	}

	if (font !== undefined) {
		_font = this.font();
		this.setFont(font);
	}

	if (align !== undefined) {
		_align = this.textAlign();
		this.setTextAlign(align);
	}

	var ctx = this.context();
	ctx.strokeText(text, x, y);

	if (color !== undefined) {
		this.setStrokeStyle(_color);
	}

	if (font !== undefined) {
		this.setFont(_font);
	}

	if (align !== undefined) {
		this.setTextAlign(_align);
	}
};

Canvas.prototype.fillText = function (text, x, y, color, font, align) {
	var _color, _font, _align;

	if (color !== undefined) {
		_color = this.fillStyle();
		this.setFillStyle(color);
	}

	if (font !== undefined) {
		_font = this.font();
		this.setFont(font);
	}

	if (align !== undefined) {
		_align = this.textAlign();
		this.setTextAlign(align);
	}

	var ctx = this.context();
	ctx.fillText(text, x, y);

	if (color !== undefined) {
		this.setFillStyle(_color);
	}

	if (font !== undefined) {
		this.setFont(_font);
	}

	if (align !== undefined) {
		this.setTextAlign(_align);
	}
};

Canvas.prototype.textWidth = function (text, font) {
	var _font;

	if (font !== undefined) {
		_font = this.font();
		this.setFont(font);
	}

	var ret = this.context().measureText(text).width;

	if (font !== undefined) {
		this.setFont(_font);
	}

	return ret;
};

Canvas.prototype.drawImage = function (image, x, y, w, h) {
	if (w === undefined) w = image.width;
	if (h === undefined) h = image.height;

	this.context().drawImage(image, x, y, w, h);
};

Canvas.prototype.drawRotatedImage = function (image, x, y, w, h, rotate) {
	if (rotate === undefined) rotate = 0;
	if (w === undefined) w = image.width;
	if (h === undefined) h = image.height;

	this.context().save();
	this.context().translate(x + w / 2, y + h / 2);
	this.context().rotate(rotate);
	this.context().drawImage(image, -w / 2, -h / 2, w, h);
	this.context().restore();
};

Canvas.prototype.drawCroppedImage = function (image, x, y, cx, cy, cw, ch, w, h) {
	if (w === undefined) w = cw;
	if (h === undefined) h = ch;
	//if (rotate === undefined) rotate = 0;

	//this.context().save();
	//this.context().translate(x, y);
	//this.context().rotate(rotate);
	this.context().drawImage(image, cx, cy, cw, ch, x, y, w, h);
	//this.context().restore();
};

Canvas.prototype.drawData = function (data, x, y, w, h, callback) {
	var img = new Image();
	var self = this;

	img.onload = function () {
		self.drawImage(this, x, y, w, h);

		if (callback !== undefined) {
			callback();
		}
	};

	img.src = data;
};

Canvas.prototype.drawCanvas = function (canvas, x, y, w, h, callback) {
	this.drawData(canvas.data(), x, y, w, h, callback);
};

Canvas.prototype.getPixel = function (x, y) {
	var d = this.context().getImageData(x, y, 1, 1).data;
	return d;
};

Canvas.prototype.getPixels = function () {
	return this.context().getImageData(0, 0, this.width(), this.height()).data;
};

Canvas.prototype.getData = function ()
{
	return this.context().getImageData(0, 0, this.width(), this.height());
};

Canvas.prototype.putData = function (data, x, y) {
	x = x || 0;
	y = y || 0;
	
	this.context().putImageData(data, x, y);
};

Canvas.prototype.toImage = function (cb) {
	var ret = new Image();
	ret.onload = function () {
		cb(this);
	};

	ret.src = this.data();
};