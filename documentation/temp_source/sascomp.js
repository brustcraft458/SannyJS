// Bisma Mods
// Sany Compiler
const fs = require('fs')
var hxcleo = Buffer.alloc(200000, '00', 'hex')
var hxcleob = 0
var fel = fs.readFileSync("sannydata/sa_mobile/SASCM.ini", 'ascii')
var feb = fs.readFileSync("compile/tes.txt", 'ascii')

// opcode array
var cleo_opc = []
var opc_array = []
var opc_string = []
var opc_true = false

//split newline
fel = fel.split('\r\n')
feb = feb.split('\r\n')

// parsing sascm
fel.forEach(fel2 => {
    parseop(fel2)
})

// compiling cleo
feb.forEach(feb2 => {
    compilecs(feb2)
})

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
        if (matchstr(cy, '[OPCODES]') == 9) {
            opc_true = true
        }
    }
}

function compilecs(txtcs) {
    txtcs = txtcs.split(' ')
    txtcs.forEach(tc => {
        // print optype
        console.log(tc + ' -> ' + checktype(tc))
    })
}

function checktype(cmx) {
    var cmxs = cmx
    cmx = cmx.split('')
    var cmx2 = cmx.length
    cmx2--
    
    // opcode
    if (cmx[4] == `:`) {
        return 'op'
    }

    // local variable
    if (cmx[cmx2] == `@`) {
        return 'loc'
    }
    if (cmx[cmx2] == `s`) {
        var cmx3 = cmx2 - 1
        if (cmx[cmx3] == `@`) {
            return 'loc_str'
        }
    }
    if (cmx[cmx2] == `v`) {
        var cmx3 = cmx2 - 1
        if (cmx[cmx3] == `@`) {
            return 'loc_strlong'
        }
    }

    // global variable
    if (cmx[0] == `$`) {
        return 'glo'
    }
    if (cmx[0] == `s`) {
        if (cmx[1] == `$`) {
            return 'glo_str'
        }
    }
    if (cmx[0] == `v`) {
        if (cmx[1] == `$`) {
            return 'glo_strlong'
        }
    }

    // number
    if (!isNaN(parseFloat(cmxs)) == true) {
        if (matchstr(cmxs, '.') == 0) {
            return 'flt'
        }
    }
    if (!isNaN(parseInt(cmxs)) == true) {
        if (matchstr(cmxs, '.') == -1) {
            return 'int'
        }
    }
    return 'nul'
}

function matchstr(mactb, mactb2) {
    mactb = mactb.split('')
    mactb2 = mactb2.split('')
    var mach = -1
    for (let ho = 0; ho < mactb.length; ho++) {
        for (let ho2 = 0; ho2 < mactb2.length; ho2++) {
            var hoc = ho + ho2
            if (mactb[hoc] == mactb2[ho2]) {mach++}
        }
    }
    return mach
}