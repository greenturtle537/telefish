var Graphic = load({}, "graphic.js"); // depends Graphic

function Player(activeUser, x, y) {
    this.isActiveUser = activeUser;
    //Ref: ascii(1) = "☺︎" (To play nicely with localities)
    this.playerGraphic = {"left": ascii(1)+"/", "right": "\\"+ascii(1)};
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
    //var playerGraphic = ":)";

    // Erase the player at the previous position
    tilemap.draw(this.prevx, this.prevy);
    
    // Draw the player at the new position ontop of the tilemap
    tilemap.draw(this.x, this.y);
    console.gotoxy(this.x, this.y);
    console.print(playerGraphic);
}

Player.prototype.move = function(x, y, tilemap) {
    var newX = this.x + x;
    var newY = this.y + y;
    
    this.x = newX;
    this.y = newY;
    this.draw("left", tilemap); // Assuming default facing is "left"
    this.setPosition(newX, newY);
}

Player.prototype.up = function(tilemap) {
    this.move(0, -1, tilemap);
}

Player.prototype.down = function(tilemap) {
    this.move(0, 1, tilemap);
}

Player.prototype.left = function(tilemap) {
    this.move(-2, 0, tilemap);
}

Player.prototype.right = function(tilemap) {
    this.move(2, 0, tilemap);
}

/* Leave as last line for convenient load() usage: */
Player;