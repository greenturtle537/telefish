var Tilesheet = load({}, "Tilesheet.js"); // Depends Tilesheet

function Tilemap(width, height, filename, tilesheet) {
    
    this.width = width;
    this.height = height;
    this.filename = filename;
    this.tilesheet = new Tilesheet(80, 200, tilesheet);
    this.grid = this.loadGrid(filename);
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
	while (!file.eof && y < grid.length) {
		var line = file.readln();
		for (var x = 0; x < line.length && x < grid[y].length; x+=2) {
			// grid[y][x] = line.charAt(x)+line.charAt(x+1);
            grid[y][x] = line.charAt(x+1);
		}
		y++;
	}

	file.close();
	return grid;
}

/* Leave as last line for convenient load() usage: */
Tilemap;