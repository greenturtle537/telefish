load("utils.js"); // depends base64ToInt()
var Graphic = load({}, "graphic.js"); // depends Graphic

function Tilesheet(width, height, filename) {
    this.width = width;
    this.height = height;
    this.filename = filename;
    this.tileGraphic = this.loadGraphicsFromANSI(filename, width, height);
}

// Tilesheet.prototype.init = function() {
//     const default_width = 80;
//     const default_height = 200;
//     var tilesheet_locations = directory("/assets/tilesheets/*.ans");
//     for (var i = 0; i < tilesheet_locations.length; i++) {
//         tileGraphic = this.loadGraphicsFromANSI(tilesheet_locations[i], default_width, default_height);     
//     }
// }

Tilesheet.prototype.loadGraphicsFromANSI = function(filename, width, height) {
	var dir = directory(filename);
	filename = dir[random(dir.length)]; // No one knows what this does
	var tileGraphic = new Graphic(width, height);
	tileGraphic.load(filename);
	return tileGraphic;
}

Tilesheet.prototype.draw = function(x, y, base64Code) {
	var graphicAddress = base64ToInt(base64Code);
    alert("Drawing tile: " + graphicAddress + "?: " + Math.floor(graphicAddress / this.width));
	var graphicxoff = graphicAddress % this.width;
	var graphicyoff = Math.floor(graphicAddress / this.width);

	this.tileGraphic.draw(
		xpos = x,
		ypos = y,
		width = 4,
		height = 2,
		xoff = 0,
		yoff = 0
	);
}

/* Leave as last line for convenient load() usage: */
Tilesheet;