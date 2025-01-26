var Tilesheet = load({}, "Tilesheet.js"); // Depends Tilesheet

function Tilemap(width, height, filename, tilesheet) {
    
    this.width = width;
    this.height = height;
    this.filename = filename;
    this.tilesheet = new Tilesheet(tilesheet["w"], tilesheet["h"], tilesheet["f"]);
    this.grid = this.loadGrid(filename);
}

Tilemap.prototype.draw = function(startx, starty, endx, endy) {
    for (var y = startx; y < endy; y++) {
        for (var x = starty; x < endx; x++) {
			alert("Drawing tile: " + x + ", " + y + "?: " + this.grid[y][x]);
            this.tilesheet.draw(x*4, y*2, this.grid[y][x]);
        }
    }
}

Tilemap.prototype.loadGrid = function(filename) {
	var grid = [];

    for (var y = 0; y < this.height; y++) {
		grid[y] = [];
		for (var x = 0; x < this.width; x++) {
			grid[y][x] = '.';
		}
	}

	var file = new File(js.exec_dir + filename);
	if (!file.open("r")) {
		alert("Failed to open " + filename);
		return;
	}

	var y = 0;
	var charx = 0;
	while (!file.eof && y < grid.length) {
		var line = file.readln();
		for (var x = 0; x < line.length && x < grid[y].length; x++) {
			grid[y][x] = line.charAt(charx)+line.charAt(charx+1);
			charx+=2;
		}
		y++;
	}

	file.close();
	return grid;
}

/* Leave as last line for convenient load() usage: */
Tilemap;