var game;
var state;
var state2;
var state3;
var bg;

window.onload = function()
{
    game = new Game(document.getElementById("canvas"), 60, 1920 / 4, 1080 / 4);

    state = new State();
    state2 = new State();
    state3 = new State();

    game.addState(state, true);
    game.addState(state2, true);
    game.addState(state3, true);

    state2.canvas = new Canvas(document.getElementById("canvas2"));
    state2.canvas.resize(1920 / 8, 1080 / 8);

    state3.canvas = new Canvas(document.getElementById("canvas3"));
    state3.canvas.resize(1920 / 16, 1080 / 16);

    bg = new BackgroundLayer(state, 1);
    var bb = new BackgroundLayer(state2, 0.3);
    var dad = new BackgroundLayer(state3, 0.1);

    game.start();
};