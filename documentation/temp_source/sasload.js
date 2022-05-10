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

console.log(cleo_opc)
console.log(opc_array)
console.log(opc_string)

function parseop(cy) {
    var pos = 0
    if (opc_true == true) {
        var cyt = cy.split(',')
        var cyt2 = cyt[0]
        var cyt2 = cyt2.split(`=`)
        var cuyop = cyt2[0]
        cleo_opc.push(cuyop.toUpperCase())
        opc_array.push(cyt2[1])
        opc_string.push(cyt[1])
    } else {
        cyb = cy.split('')
        if (cyb[0] == '[' && cyb[1] == 'O' && cyb[2] == 'P' && cyb[3] == 'C' && cyb[4] == 'O' && cyb[5] == 'D' && cyb[6] == 'E' && cyb[7] == 'S' && cyb[8] == ']') {
            opc_true = true
        }
    }
}