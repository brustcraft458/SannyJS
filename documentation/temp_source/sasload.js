// Bisma Mods
// SASCM parser
const fs = require('fs')

var fel = fs.readFileSync("sannydata/sa_mobile/SASCM.ini", 'ascii')

// opcode array
var cleo_opc = []
var opc_array = []
var opc_string = []
var opc_true = false

//split newline
fel = fel.split('\r\n')

// parsing sascm
fel.forEach(fel2 => {
    parseop(fel2)
});

// print sascm
console.log(cleo_opc)
console.log(opc_array)
console.log(opc_string)

function parseop(cy) {
    var pos = 0
    if (opc_true == true) {
        var cyt = cy.split(',')
        if (matchstr(cyt[0], ';') != -1) {return}
        if (cyt[0] === '') {return}
        var cyt2 = cyt[0]
        var cyt2 = cyt2.split(`=`)
        var cuyop = cyt2[0]
        cleo_opc.push(cuyop.toUpperCase())
        opc_array.push(parseInt(cyt2[1]))
        opc_string.push(cyt[1])
    } else {
        if (cy.search(`[[` + 'OPCODES' + `]]`) == 7) {
            opc_true = true
        }
    }
}

function matchstr(mactb, mactb2) {
    mactb = mactb.match(mactb2)
    if (mactb == null) {
        mactb = -1
    } else {
        mactb = mactb.index
    }
    return mactb
}