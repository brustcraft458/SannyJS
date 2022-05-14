// Bisma Mods
// Sany Compiler
const fs = require('fs')
const { exit } = require('process')
var hxcleo = Buffer.alloc(200000, '00', 'hex')
var hxcleob = 0

// Load Script
console.log('Load script tes.txt...')
var feb = fs.readFileSync("compile/tes.txt", 'ascii')
feb = feb.split('\r\n')

// opcode array
var cleo_opc = []
var opc_array = []
var opc_string = []
var opc_true = false

// label array
var cleo_labl = []
var labl_string = []

// Custom var names array
var cleo_csvar = []
var csvar_string = []

// Opcode keywords array
var cleo_keyop = []
var keyop_string = []

// Recalculating Jump Array
var cleo_lajmp = []
var lajmp_pos = []

// Recalculating Condition Array
var cleo_cond = []
var cond_string = []
var cond_pos = []
var cond_num = -1
var last_cond = -1
var last_condty = ''

// parsing sascm
console.log('Load SASCM.ini...')
var fel = fs.readFileSync("sannydata/sa_mobile/SASCM.ini", 'ascii')
fel = fel.split('\r\n')
fel.forEach(fel2 => {
    parseop(fel2)
})

// parsing CustomVariables
console.log('Load CustomVariables.ini...')
var fel = fs.readFileSync("sannydata/sa_mobile/CustomVariables.ini", 'ascii')
fel = fel.split('\r\n')
fel.forEach(fel2 => {
    parsecusvar(fel2)
})

// parsing keywords
console.log('Load keywords.txt...')
var fel = fs.readFileSync("sannydata/sa_mobile/keywords.txt", 'ascii')
fel = fel.split('\r\n')
fel.forEach(fel2 => {
    parsekeyop(fel2)
})

// compiling cleo
console.log('Compiling Script...')
feb.forEach(feb2 => {
    compilecs(feb2)
})

// ReCalculating jump
for (let adj = 0; adj < cleo_lajmp.length; adj++) {
    var adj2 = cleo_lajmp[adj]
    var adj3 = cleo_labl[labl_string.indexOf(adj2.toUpperCase())]
    if (typeof adj3 == 'undefined') {
        console.log('Compile Error: Label not found at @' + adj2)
        exit()
    }
    adj3 *= -1
    hxcleo.writeInt32LE(adj3, lajmp_pos[adj])
}

// ReCaltulating condition
for (let adj = 0; adj < cleo_cond.length; adj++) {
    var adj2 = cleo_cond[adj]
    adj2--
    var adj3 = cond_pos[adj]
    adj3--
    if (adj2 > 7) {
        console.log('Compile Error: Condition Max 8')
        exit()
    }
    if (adj2 > 1 && cond_string[adj] === '') {
        console.log('Compile Error: Single Condition, to much opcode')
        exit()
    }
    switch (cond_string[adj]) {
        case 'or':
            adj2 += 20
            hxcleo.writeInt8(adj2, adj3)
        break;
 
        case 'and':
            hxcleo.writeInt8(adj2, adj3)
        break;

        default:
        break;
    }
}

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
        cuyop = cuyop.toUpperCase()
        cleo_opc.push(cuyop)
        opc_array.push(parseInt(cyt2[1]))
        opc_string.push(cyt[1])
    } else {
        if (matchstr(cy, '[OPCODES]') == 9) {
            opc_true = true
        }
    }
}

function parsecusvar(cy) {
    if (cy === '') {return}
    var cyt = cy.split(' ')
    if (cyt[0] == ';') {return}
    cyt = cy.split(`=`)
    if (typeof cyt[1] == 'undefined') {return}
    if (typeof parseInt(cyt[0]) == 'number' && typeof cyt[1] == 'string') {
        cleo_csvar.push(parseInt(cyt[0]))
        var cyt2 = cyt[1]
        csvar_string.push(cyt2.toUpperCase())    
    }
}

function parsekeyop(cy) {
    if (cy === '') {return}
    var cyt = cy.split(' ')
    if (cyt[0] == ';') {return}
    cyt = cy.split(`=`)
    if (typeof cyt[1] == 'undefined') {return}
    if (typeof cyt[0] == 'string' && typeof cyt[1] == 'string') {
        var cyt2 = cyt[0]
        cleo_keyop.push(cyt2.toUpperCase())
        cyt2 = cyt[1]
        keyop_string.push(cyt2.toLowerCase())
    }
}


function compilecs(txtcs) {
    if (txtcs === '') {return}
    var bvnum = 0
    var bvcleo = []
    var bvcleoty = []
    var bvop = -1
    var skipln = 0
    var txtcs2 = txtcs
    var iscondop = false
    txtcs = txtcs.split(' ')
    txtcs.forEach(tc => {
        var bv = checktype(tc)
        if (bv != 'nul') {
            if (bv == 'skip') {
                skipln = 1
            }
            if (bv == 'op') {
                bvop = cleo_opc.indexOf(tc.replace(`:`, ''))
                bvcleo.push(tc)
                bvcleoty.push(bv)
                skipln = 0
            } else {
                if (skipln == 0) {
                    bvcleo.push(tc)
                    bvcleoty.push(bv)
                    bvnum++
                    if (bv == 'labl') {
                        bvop = -2
                        skipln = 1
                    }
                }
            }
        } else {
            tcb = tc.toLowerCase()
            if (iscondop == true) {
                if(tcb == 'and' || tcb == 'or') {
                    bv = 'condt'
                    bvcleo.push(tcb)
                    bvcleoty.push(bv)
                    bvnum++
                    iscondop = false    
                } else {
                    iscondop = false
                }
            } else {
                if (tcb == 'if') {iscondop = true}
            }
        }
    })

    // error checking
    if (skipln == 0) {
        if (bvop == -1) {
            console.log('Compile Error: Opcode not found at ' + txtcs[0])
            exit()
        }
        if (txtcs[0] != '00D6:' && txtcs[0] != '80D6:') {
            if (bvnum > opc_array[bvop]) {
                console.log('Compile Error: to much params at ' + txtcs2)
                exit()
            }
            if (opc_array[bvop] > bvnum) {
                console.log('Compile Error: Not enough params at ' + txtcs2)
                exit()
            }
        }
    }

    //compile procces
    var bvtrue = false

    for (let gj = 0; gj < bvcleoty.length; gj++) {
        if (bvtrue == false) {
            if (bvcleoty[gj] == 'labl') {
                var bvsult = bvcleo[gj]
                bvsult = bvsult.split(`:`)
                bvsult = bvsult[1]
                cleo_labl.push(hxcleob)
                labl_string.push(bvsult.toUpperCase())
            }
            if (bvcleoty[gj] == 'op') {
                if (last_cond != -1) {
                    cond_num++
                }
                bvtrue = true
                var bvsult = swapthis(cleo_opc[bvop])
                hxcleo.write(bvsult, hxcleob, 'hex')
                hxcleob += 2

                // condition
                if (bvsult == 'D600') {
                    hxcleo.write('04 00', hxcleob, 'hex')
                    hxcleob += 2
                    last_cond = hxcleob
                } else {
                    if (bvsult == '4D00') {
                        if (last_cond != -1) {
                            cleo_cond.push(cond_num)
                            cond_pos.push(last_cond)
                            cond_string.push(last_condty)
                        }
                        last_cond = -1
                        cond_num = -1
                        last_condty = ''
                    }
                }
            }
        } else {
            switch (bvcleoty[gj]) {
                
                // condition type
                case 'condt':
                    if (last_cond != -1) {
                        last_condty = bvcleo[gj]
                    }
                break;

                // label
                case 'labl_jmp':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`@`)
                    bvsult = bvsult[1]
                    hxcleo.write('01', hxcleob, 'hex')
                    hxcleob += 1
                    cleo_lajmp.push(bvsult)
                    lajmp_pos.push(hxcleob) 
                    hxcleo.writeInt32LE(-2, hxcleob)
                    hxcleob += 4
                break;

                // variable
                case 'loc':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`@`)
                    bvsult = parseInt(bvsult[0])
                    hxcleo.write('03', hxcleob, 'hex')
                    hxcleob += 1 
                    hxcleo.writeInt16LE(bvsult, hxcleob)
                    hxcleob += 2    
                break;

                // number
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
    
    if (cmx[0] == `/` || cmx[0] == `;`) {
        return 'skip'
    }

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

    // label
    if (cmx[0] == `:`) {
        return 'labl'
    }
    if (cmx[0] == `@`) {
        return 'labl_jmp'
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