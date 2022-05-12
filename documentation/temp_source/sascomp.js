// Bisma Mods
// Sany Compiler
const fs = require('fs')
const { exit } = require('process')
var hxcleo = Buffer.alloc(200000, '00', 'hex')
var hxcleob = 0
console.log('Load sascm.ini & script tes.txt...')
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

console.log('Compiling Script...')
// compiling cleo
feb.forEach(feb2 => {
    compilecs(feb2)
})

// copy & limiting buf
var hxsave = Buffer.alloc(hxcleob)
for (let yus = 0; yus < hxcleob; yus++) {
    hxsave.writeUInt8(parseInt(hxcleo[yus]), yus)
}

// Save to file
fs.writeFileSync("compile/tes.csi", hxsave)
console.log('Done')

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
    if (txtcs === '') {return}
    var bvnum = 0
    var bvcleo = []
    var bvcleoty = []
    var bvop = -1
    var txtcs2 = txtcs
    txtcs = txtcs.split(' ')
    txtcs.forEach(tc => {
        // print optype
        var bv = checktype(tc)
        if (bv != 'nul') {
            if (bv == 'op') {
                bvop = cleo_opc.indexOf(tc.replace(`:`, ''))
                bvcleo.push(tc)
                bvcleoty.push(bv)
            } else {
                bvcleo.push(tc)
                bvcleoty.push(bv)
                bvnum++
            }
        }
    })

    // error checking
    if (bvop == -1) {
        console.log('Compile Error: Opcode not found at ' + txtcs[0])
        exit()
    }
    if (bvnum > opc_array[bvop]) {
        console.log('Compile Error: to much params at ' + txtcs2)
        exit()
    }
    if (opc_array[bvop] > bvnum) {
        console.log('Compile Error: Not enough params at ' + txtcs2)
        exit()
    }

    //compile procces
    var bvtrue = false

    for (let gj = 0; gj < bvcleoty.length; gj++) {
        if (bvtrue == false) {
            if (bvcleoty[gj] == 'op') {
                bvtrue = true
                var bvsult = swapthis(cleo_opc[bvop])
                hxcleo.write(bvsult, hxcleob, 'hex')
                hxcleob += 2
            }
        } else {
            switch (bvcleoty[gj]) {
                case 'loc':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`@`)
                    bvsult = parseInt(bvsult[0])
                    hxcleo.write('03', hxcleob, 'hex')
                    hxcleob += 1 
                    hxcleo.writeInt16LE(bvsult, hxcleob)
                    hxcleob += 2    
                break;

                case 'int':
                    var bvsult = parseInt(bvcleo[gj])
                    if (127 >= bvsult) {
                        hxcleo.write('04', hxcleob, 'hex')
                        hxcleob += 1 
                        hxcleo.writeInt8(bvsult, hxcleob)
                        hxcleob += 1    
                    } else {
                        if (32767 >= bvsult) {
                            hxcleo.write('05', hxcleob, 'hex')
                            hxcleob += 1 
                            hxcleo.writeInt16LE(bvsult, hxcleob)
                            hxcleob += 2    
                        } else {
                            if (2147483647 >= bvsult) {
                                hxcleo.write('01', hxcleob, 'hex')
                                hxcleob += 1 
                                hxcleo.writeInt32LE(bvsult, hxcleob)
                                hxcleob += 4    
                            }
                        }
                    }

                break;

                case 'flt':
                    var bvsult = parseFloat(bvcleo[gj])
                    hxcleo.write('06', hxcleob, 'hex')
                    hxcleob += 1 
                    hxcleo.writeFloatLE(bvsult, hxcleob)
                    hxcleob += 4    
                break;

                
                default:
                break;
            }
        }
    }

}

function swapthis(vi) {
    var vi2 = 0
    var vi4 = ''
    var vi5 = ''
    vi = vi.split('')
    vi.forEach(vi3 => {
        if (vi2 >= 2) {
            vi4 = vi4 + vi3 + ''
        } else {
            vi5 = vi5 + vi3 + ''
        }
        vi2++
    })
    vi = vi4 + vi5 + ''
    return vi
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
    if (matchstr(cmxs, '.') == -1) {
        if (stilsame(cmxs, parseInt(cmxs)) == true) {
            return 'int'
        }
    } else {
        if (stilsame(cmxs, persfloat(cmxs)) == true) {
            return 'flt'
        }
    }

    return 'nul'
}

function persfloat(vi) {
    var vi2 = parseFloat(vi)
    var vi3 = parseInt(vi)
    if (vi2 + '' == vi3 + '') {
        vi2 = vi3 + '.0'
    }
    return vi2
}

function stilsame(vi, vi2) {
    if (vi == vi2 + '') {
        return true
    }
    return false
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