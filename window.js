function Window(width, height, x, y) {
    this.title = "DEBUG";
    this.width = typeof width !== 'undefined' ? width : 0;
    this.height = typeof height !== 'undefined' ? height : 0;
    this.x = typeof x !== 'undefined' ? x : 0;
    this.y = typeof y !== 'undefined' ? y : 0;
    this.toggled = false;
}

Window.prototype.toggle = function() {
    this.toggled = !this.toggled;
};

Window.prototype.setToggle = function(newToggle) {
    this.toggled = newToggle;
};

Window.prototype.draw = function() {
    console.gotoxy(this.x, this.y);
    console.print('+');
    for (var x = 1; x < this.width - 1; x++) {
        console.print('-');
    }
    console.print('+');
    for (var y = 1; y < this.height - 1; y++) {
        console.gotoxy(this.x, this.y + y);
        console.print('|');
        for (var x = 1; x < this.width - 1; x++) {
            console.print(' ');
        }
        console.print('|');
    }
    console.gotoxy(this.x, this.y + this.height - 1);
    console.print('+');
    for (var x = 1; x < this.width - 1; x++) {
        console.print('-');
    }
    console.print('+');
};

Window.prototype.setTitle = function(title) {
    this.title = title;
};

Window.prototype.drawTitle = function(title) {
    console.gotoxy(this.x + 1, this.y + 1);
    console.print(title);
};

Window.prototype.dispWindow = function(staticGrid) {
    if (!this.toggled) {
        this.draw();
        this.drawTitle(this.title);
        return true;
    } else {
        this.redrawGrid(staticGrid);
        return false;
    }
};

Window.prototype.redrawGrid = function(staticGrid) {
    for (var y = 0; y < this.height; y++) {
        console.gotoxy(this.x, this.y + y);
        for (var x = 0; x < this.width; x++) {
            if (staticGrid[y] && staticGrid[y][x]) {
                console.print(staticGrid[y][x]);
            } else {
                console.print(' ');
            }
        }
    }
};

/* Leave as last line for convenient load() usage: */
Window;