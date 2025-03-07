load("utils.js"); // depends base64ToInt()
var Graphic = load({}, "graphic.js"); // depends Graphic

function Tilesheet(width, height, filename) {
    this.width = width;
    this.height = height;
    this.filename = filename;
    this.tileGraphic = this.loadGraphicsFromANSI(filename, width, height);
}

Tilesheet.prototype.loadGraphicsFromANSI = function(filename, width, height) {
	var dir = directory(filename);
	filename = dir[random(dir.length)]; // No one knows what this does
	var tileGraphic = new Graphic(width, height);
	tileGraphic.load(filename);
	return tileGraphic;
}

Tilesheet.prototype.draw = function(x, y, base64Code) {
	var graphicAddress = base64ToInt(base64Code);
    
	var spriteWidth = 4;
	var spriteHeight = 2;

	var graphicxoff = Math.floor((graphicAddress * spriteWidth) % this.tileGraphic.width);
	var graphicyoff = Math.floor((graphicAddress / (this.tileGraphic.width / spriteWidth)) * spriteHeight);

	//alert("Drawing tile: " + graphicAddress + "?: " + graphicxoff + ", " + graphicyoff);

	this.tileGraphic.draw(
		xpos = x-3, // Handle an offset
		ypos = y+2, // Handle another offset
		width = 4,
		height = 2,
		xoff = graphicxoff,
		yoff = graphicyoff
	);
}

/* Leave as last line for convenient load() usage: */
Tilesheet;