var Graphic = load({}, "graphic.js"); // depends Graphic

function Player(activeUser, x, y) {
    this.isActiveUser = activeUser;
    this.playerGraphic = {"left": "☺︎/", "right": "\\☺︎"};
    this.x = x;
    this.y = y;
}

Player.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
}

Player.prototype.draw = function(facing, tilemap) {   
    var playerFacing = facing || "left";
    var playerGraphic = this.playerGraphic[playerFacing];
    console.gotoxy(this.x, this.y);
    console.print(playerGraphic)
}