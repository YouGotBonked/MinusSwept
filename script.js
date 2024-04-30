var w = 9, h = 9, bombs = 5, cellSize = 50
var canvas = document.getElementById('c')
canvas.width = w*cellSize; canvas.height = h*cellSize
var ctx = canvas.getContext('2d')

function Cell(x, y) {
    this.x = x; this.y = y; this.bomb = false; this.flagged = false; this.open = false;
}
Cell.prototype.draw = function(ctx, field) {
    ctx.save()
    ctx.translate(this.x*cellSize, this.y*cellSize)
    ctx.fillStyle = this.open ? '#eee' : '#bbb'
    ctx.fillRect(1, 1, cellSize-2, cellSize-2)
    var s = ''
    if (this.flagged) {
        ctx.fillStyle = '#00f'
        s = String.fromCharCode(9873)
    } else if (this.open) {
        var bombsAround = this.cellsAround(field).filter(c => c.bomb).length
        if (this.bomb) {
            ctx.fillStyle = '#f00'
            s = '*'
        } else if (bombsAround > 0) {
            ctx.fillStyle = '#000'
            s = bombsAround
        }
    }
    ctx.textAlign = 'center'
    ctx.font = '20px Verdana'
    ctx.fillText(s, cellSize/2, cellSize/2 + 10)
    ctx.restore()
}
Cell.prototype.cellsAround = function(field) {
    var c = []
    for (var yy = -1; yy <= 1; yy++) {
        var cy = this.y+yy
        if (cy < 0 || cy >= h) continue
        for (var xx = -1; xx <= 1; xx++) {
            if (xx == 0 && yy == 0) continue
            var cx = this.x+xx
            if (cx < 0 || cx >= w) continue
            c.push(field[cy][cx])
        }
    }
    return c
}
Cell.prototype.flag = function() {
    if (!this.open) this.flagged = !this.flagged
    return true
}
Cell.prototype.click = function(field) {
    if (this.open) return true
    if (this.bomb) return false
    this.open = true
    var cells = this.cellsAround(field)
    if (cells.filter(c => c.bomb).length == 0) cells.forEach(c => c.click(field));
    return true
}

var field = init()
function init() {
    var f = []
    for (var y = 0; y < h; y++) {
        var r = []
        for (var x = 0; x < w; x++) r.push(new Cell(x, y))
        f.push(r)
    }
    for (var i = 0; i <  bombs; i++) {
        while (true) {
            var x = Math.floor(w*Math.random()), y = Math.floor(h*Math.random())
            if (!f[y][x].bomb) {
                f[y][x].bomb = true
                break
            }
        }
    }
    return f
}
function draw() {
    eachCell(cell => cell.draw(ctx, field))
}
function openAll() {
    eachCell(cell => cell.open = true)
}
//  openAll()
function eachCell(fn) {
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) fn(field[y][x])
    }
}
function gameWon() {
    var found = 0
    eachCell(cell => { if (cell.bomb && cell.flagged) found++ })
    return bombs == found
}
function finishGame(text) {
    openAll()
    draw()
    setTimeout(function() {
        alert(text)
        window.location.reload()
    }, 50)
}
function processAction(x, y, fn) {
    var cell = field[Math.floor(y/cellSize)][Math.floor(x/cellSize)]
    var ok = fn(cell)
    draw()
    if (!ok) finishGame('Game over, you lost!')
    if (gameWon()) finishGame('You won!')
}
draw()
canvas.addEventListener('click', function(e) {
    processAction(e.clientX, e.clientY, (cell) => cell.click(field))
})
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault()
    processAction(e.clientX, e.clientY, (cell) => cell.flag())
})