class Window {
    title = "";

    constructor() {
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.toggled = false;
    }

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.toggled = false;
    }

    constructor(width, height, x, y) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.toggled = false;
    }

    toggle() {
        this.toggled = !this.toggled;
    }

    draw() {
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
    }

    setTitle(title) {
        this.title = title;
    }

    drawTitle(title) {
        console.gotoxy(this.x + 1, this.y + 1);
        console.print(title);
    }

    dispWindow(staticGrid) {
        if (!this.toggled) {
            this.draw();
            this.drawTitle(this.title);
            return true;
        } else {
            this.redrawGrid(staticGrid);
            return false;
        }
    }

    redrawGrid(staticGrid) {
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
    }
}