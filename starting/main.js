
/**
 * _author: gorpam22@gmail.com
 * do not use without explicit permission from the author
 */
const prompt = require('prompt-sync')({ sigint: true });
const message = 'which direction would you like to “move”?';


const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
    /**
     * @param{array} arr:two-dimensional array representing the “field” of the game.
     */
    constructor(field) {
        this.field = field;
        this.ox = this._x = field.startx || 0;
        this.oy = this._y = field.starty || 0;
        this.retraces = 0;
    }
    print() {
        this.field.forEach(
            (l) => {
                console.log(l.join("  "))
            }
        )
    }
   
    getUserMove() {
        const moves = { "l": 0, "r": 0, "u": 0, "d": 0, "U": 0, "D": 0, "L": 0, "R": 0 };
        let move = "s";
        while (!(move in moves)) {
            move = prompt(message);
        }
        return move

    }
    updateLocation(m) {
        let x = 0, y = 0;
        if (m === "l" || m === "L") {
            x--
        } else if (m === "r" || m === "R") {
            x++
        } else if (m === "d" || m === "D") {
            y++
        } else if (m === "u" || m === "U") {
            y--
        }
        //player should not retrace his steps
        if (this.field[this.y + y][this.x + x] === pathCharacter) return;

        this.x += x;
        this.y += y
    }
    /**
     * Method to test whether the current location results in a win (user is on the hat) 
     * or a loss (user is on a hole or out-of-bounds).
     */
    testLocation() {
        let v;
        v = this.field[this.y][this.x]
        if (v === hat) {
            console.log("you win!")
            return "win"
        } else if (v === hole) {
            console.log("you fell into a hole!\nyou lose!")
            return "lose"
        } else if (v === fieldCharacter) {
            return "continue"
        } else if (v === undefined) {
            console.log("you went out of bounds!\n you lose!")
            return "lose"
        } else {
            return (++this.retraces) > 3 ? (console.log("you retraced your steps more than 3 times!"), "lose") : "continue";

        }
    }
    gameloop() {
        let outcome = "continue", move;
        const instruction = "\nstart position indicated by '*'\n"+
            "to move:\n" +
            "Left: press l or L\n" +
            "Right: press r or R\n" +
            "Up: press u or U\n" +
            "Down: press d or D";
        console.log(instruction);
        while (outcome === "continue") {
            this.updateMap();
            this.print();
            move = this.getUserMove();
            this.updateLocation(move);
            outcome = this.testLocation();
        }
        console.log("game ended!")
    }
    updateMap() {
        this.field[this.oy][this.ox] = pathCharacter;
        this.field[this.y][this.x] = pathCharacter;
    }
    get y() {
        return this._y
    }
    get x() {
        return this._x
    }
    set x(v) {
        this.ox = this._x;
        this._x = v;
    }
    set y(v) {
        this.oy = this.y;
        this._y = v
    }
    /**
     * 
     * @param {number} h height of the game
     * @param {number} w width of the game 
     * @param {number} percentage percentage of holes relative to total size 
     * @returns {array} field
     */
    static generateField(h, w, percentage) {
        const total = h * w;
        const filledIndices = [];
        filledIndices.emptyY = new Array(h);
        for (var g = 0; g < h; g++) {
            filledIndices.emptyY[g] = g
        }
        filledIndices.items = 0;
        filledIndices.empty = new Array(h);
        filledIndices.update = function (y, x) {
            let intArr = this[y];
            if (intArr) intArr.push(x);
            else (intArr = this[y] = []).push(x)
            this.items++;
            if (intArr.length === w) {

                this.emptyY.splice(this.emptyY.findIndex(testwrapper(y)), 1)
            }
        }
        filledIndices.getempty = function (y) {
            var arr;
            if (this.empty[y]) return this.empty[y];
            else {
                arr = this.empty[y] = [];
                if (!this[y]) this[y] = [];
                for (var i = 0; i < w; i++) {

                    if (!this[y].some(testwrapper(i))) arr.push(i)
                }
                return arr
            }
        }
        filledIndices.getRanY = function () {
            return this.emptyY[getRI(this.emptyY.length)]
        }
        function getInternal() {
            return (new Array(w))
        }
        function getRI(l) {
            return Math.floor(Math.random() * l)
        }

        function getStartPos(x, y) {
            /**
             * @param{number} x: pos of hat
             * @param{number} y: pos of hat
             */
            let startx, starty;
            const forbidden = [[x, y]];
            function test([x, y]) {
                return (x === startx && y === starty)
            }
            do {
                startx = getRI(w);
                starty = getRI(h);
            } while (forbidden.some(test))
            return [startx, starty]
        }
        function testwrapper(x) {
            function test(v) {
                return v === x
            }
            return test
        }
        function placeItem(item, count) {
            count = count || 1;

            let emptyIndices, len, x, y, ranV, it = 0;

            while ((filledIndices.items < total) && (it++) < count) {
                y = filledIndices.getRanY();
                emptyIndices = filledIndices.getempty(y);
                len = emptyIndices.length;
                ranV = getRI(len);
                x = emptyIndices.splice(ranV, 1)[0]
                field[y][x] = item
                filledIndices.update(y, x);
            }
        }
        const field = new Array(h);

        for (var i = 0; i < h; i++) {
            field[i] = getInternal()
        }

        //place hat
        let hatx = getRI(w), haty = getRI(h);
        field[haty][hatx] = hat;
        filledIndices.update(haty, hatx);

        //place start position
        const [startx, starty] = getStartPos(hatx, haty);
        field[starty][startx] = pathCharacter;
        filledIndices.update(starty, startx);
        field.startx = startx;
        field.starty = starty;

        //place holes
        //max percent for holes is 30
        percentage = percentage || 30;
        percentage = (percentage > 30 || percentage < 0) ? 30 : percentage;
        const numHoles = Math.floor((percentage / 100) * total);
        placeItem(hole, numHoles)

        //place field
        const numField = total - 2 - numHoles;
        placeItem(fieldCharacter, numField)

        //log map
        //field.forEach(l => {
        //    console.log(l.join(" "))
        //})
        return field
    }
}

//Example: using given field
//const myField = new Field([
//  ['*', '░', 'O'],
//  ['░', 'O', '░'],
//  ['░', '^', '░'],
//]);
//myField.gameloop();

//example: using generated field
//generate game of size 10 x 10
const myField = new Field(Field.generateField(10, 10))
myField.gameloop();
