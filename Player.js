var Graphic = load({}, "graphic.js"); // depends Graphic

function Player(activeUser, x, y) {
    this.isActiveUser = activeUser;
    this.playerGraphic = {"left": "☺︎/", "right": "\\☺︎"};
    this.x = x;
    this.y = y;
    this.prevx = x;
    this.prevy = y;
}

Player.prototype.setPosition = function(x, y) {
    this.prevx = this.x;
    this.prevy = this.y;
    this.x = x;
    this.y = y;
}

Player.prototype.draw = function(facing, tilemap) {   
    var playerFacing = facing/* || "left" */;
    var playerGraphic = this.playerGraphic[playerFacing];
    
    // Erase the player at the previous position
    tilemap.draw(this.prevx, this.prevy);
    
    // Draw the player at the new position ontop of the tilemap
    tilemap.draw(this.x, this.y);
    console.print(playerGraphic);
}

Player.prototype.move = function(x, y, tilemap) {
    var newX = this.x + x;
    var newY = this.y + y;
    
    if (tilemap.isWalkable(newX, newY)) {
        this.setPosition(newX, newY);
        this.draw("left", tilemap); // Assuming default facing is "left"
    }
}

Player.prototype.up = function(tilemap) {
    this.move(0, -1, tilemap);
}

Player.prototype.down = function(tilemap) {
    this.move(0, 1, tilemap);
}

Player.prototype.left = function(tilemap) {
    this.move(-1, 0, tilemap);
}

Player.prototype.right = function(tilemap) {
    this.move(1, 0, tilemap);
}