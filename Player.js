var Graphic = load({}, "graphic.js"); // depends Graphic

function Player(activeUser, x, y) {
    this.isActiveUser = activeUser;
    //Ref: ascii(1) = "☺︎" (To play nicely with localities)
    //TODO: ascii(1) is broken, but ascii(2) works. WHY?
    this.playerGraphic = {"left": ascii(2)+"/", "right": "\\"+ascii(1)};
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
    tilemap.draw(this.prevx, this.prevy, 20,10);
    //tilemap.draw(0,0,20,10); //nuclear option
    
    // Draw the player at the new position ontop of the tilemap
    tilemap.draw(this.x, this.y);
    console.gotoxy(this.x, this.y);
    console.print(playerGraphic);
    console.gotoxy(0, 20);
    console.print("Player position: " + this.x + ", " + this.y + "; Previous position: " + this.prevx + ", " + this.prevy); 
}

Player.prototype.move = function(x, y, tilemap) {
    var newX = this.x + x;
    var newY = this.y + y;
    
    this.setPosition(newX, newY);
    this.draw("left", tilemap); // Assuming default facing is "left"
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