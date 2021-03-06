// Bisma Mods
// Sany Compiler
const fs = require('fs')
const { exit, memoryUsage } = require('process')
var hxcleo = []
var hxcleob = 0
var cleo_type = 'csa'

// Config Array
var conpig = []
var conpig_string = []

// Load Script
console.log('Load script tes.txt...')
var feb = fs.readFileSync("compile/tes.txt", 'ascii')
feb = feb.split('\r\n')

// Load Config
var fel = fs.readFileSync('config.ini', 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parseconf(fel2)
})

// searching cleo type
feb.forEach(fel2 => {
    var kaseni = cleotypesearch(fel2)
    if (kaseni != -1) {
        cleo_type = kaseni
        return
    }
})

// config var
var conpig_dirroot = conpig_string[conpig.indexOf('root_dir')]
var conpig_dirgta = conpig_string[conpig.indexOf('gta_dir')]
var conpig_dircleo = conpig_string[conpig.indexOf('cleo_dir')]
var conpig_dirsc = conpig_string[conpig.indexOf('source_dir')]
var conpig_mode = conpig_string[conpig.indexOf(cleo_type + '_compile')]

// opcode array
var cleo_opc = []
var opc_array = []
var opc_string = []
var opc_prity = []
var opc_condty = []
var opc_true = false

// label array
var cleo_labl = []
var labl_string = []

// Custom var names array
var cleo_csvar = []
var csvar_string = []
var glo_start = 4

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

// Models Array
var cleo_modls = []
var modls_string = []

// parsing sascm
console.log('Load SASCM.ini...')
var path_fel = "sannydata/" + conpig_mode + "/SASCM.ini"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parseop(fel2)
    })    
}

// parsing CustomVariables
console.log('Load CustomVariables.ini...')
path_fel = "sannydata/" + conpig_mode + "/CustomVariables.ini"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parsecusvar(fel2)
    })
}

// parsing keywords
console.log('Load keywords.txt...')
path_fel = "sannydata/" + conpig_mode + "/keywords.txt"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parsekeyop(fel2)
    })
}

// parsing models id
console.log('Load Models ID...')
path_fel = "sannydata/" + conpig_mode + "/vehicles.ide"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parsemodels(fel2)
    })
}

path_fel = "sannydata/" + conpig_mode + "/veh_mods.ide"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parsemodels(fel2)
    })
}

path_fel = "sannydata/" + conpig_mode + "/peds.ide"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parsemodels(fel2)
    })
}

path_fel = "sannydata/" + conpig_mode + "/default.ide"
if (fs.existsSync(path_fel)) {
    var fel = fs.readFileSync(path_fel, 'ascii')
    fel = fel.split('\r\n')
    fel.forEach(fel2 => {
        parsemodels(fel2)
    })
}

// Comment Hider
var febkc_true = false
for (let ajv = 0; ajv < feb.length; ajv++) {
    feb[ajv] = feb[ajv].replaceAll(`/*`, `{`)
    feb[ajv] = feb[ajv].replaceAll(`*/`, `}`)
}
for (let ajv = 0; ajv < feb.length; ajv++) {
    feb[ajv] = hidecomment(feb[ajv], `{`, `}`)
}

// String space fix
for (let ajv = 0; ajv < feb.length; ajv++) {
    feb[ajv] = strspacefix(feb[ajv], ' ', '%spc%')
}

// convert to low end
var feblow_lastop = ''
var febk = []
console.log('Converting to lowend...')
feb.forEach(feb2 => {
    compilelow(feb2)
})
feb = []

// compiling cleo
console.log('Compiling Script to ' + cleo_type + '...')
febk.forEach(feb2 => {
    feb2 = feb2.slice(1)
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
    updatedata(adj3, 4, 'int', lajmp_pos[adj])
}

// ReCaltulating condition
for (let adj = 0; adj < cleo_cond.length; adj++) {
    var adj2 = cleo_cond[adj]
    adj2--
    var adj3 = cond_pos[adj]
    if (adj2 > 7) {
        console.log('Compile Error: Condition Max 8')
        exit()
    }
    if (adj2 > 0 && cond_string[adj] != 'or' && cond_string[adj] != 'and') {
        console.log('Compile Error: Single Condition, to much opcode')
        exit()
    } else {
        if (cond_string[adj] == 'or' || cond_string[adj] == 'and') {
            if (1 > adj2) {
                console.log('Compile Error: Single Condition, wtf ' + cond_string[adj])
                exit()
            }
        }
    }
    switch (cond_string[adj]) {
        case 'or':
            adj2 += 20
            updatedata(adj2, 1, 'int', adj3)
        break;
 
        case 'and':
            updatedata(adj2, 1, 'int', adj3)
        break;

        default:
        break;
    }
}

// copy & limiting buf  
var hxsave = Buffer.alloc(hxcleob)
var hxnum = 0
hxcleo.forEach(komo => {
     komo.forEach(komo => {
         hxsave[hxnum] = komo
         hxnum++
     })
})

// Save to file
fs.writeFileSync("compile/tes." + cleo_type, hxsave)
console.log('Done')


// Function
// Maybee

// Parsing Config

function parseconf(cy) {
    if (cy === '') {return}
    var cyt = cy.split('')
    if (cyt[0] == `;`) {return}
    if (cyt[0] == `[`) {return}
    var cyt2 = cy.split(` = `)
    if (typeof cyt2[1] == 'undefined') {
        console.log('Config Error: corrupted')
        exit()
    }
    if (typeof cyt2[0] == 'undefined') {
        console.log('Config Error: corrupted')
        exit()
    }
    conpig.push(cyt2[0].toLowerCase())
    conpig_string.push(cyt2[1].replaceAll(`"`, ''))
}

// Parsing Opcode
function parseop(cy) {
    var pos = 0
    if (opc_true == true) {
        var cyt = cy.split(',')
        if (matchstr(cyt[0], ';') != -1) {return}
        if (cyt[0] === '') {return}
        var cyt2 = cyt[0]
        var cyt2 = cyt2.split(`=`)
        var cuyop = cyt2[0]
        var cyt_hr = cyt[1].split('')
        var cyt3 = parseopprt(cyt[1])
        cuyop = cuyop.toUpperCase()
        cleo_opc.push(cuyop)
        opc_array.push(parseInt(cyt2[1]))
        opc_string.push(cyt[1])
        opc_prity.push(cyt3)
        if (cyt_hr[0] == ' ' && cyt_hr[1] == ' ') {
            opc_condty.push(true)
            // not opcode
            cleo_opc.push('8'+ cuyop.slice(1))
            opc_array.push(parseInt(cyt2[1]))
            opc_string.push('not ' + cyt[1])
            opc_prity.push(cyt3)
            opc_condty.push(true)
        } else {
            opc_condty.push(false)
        }
    } else {
        if (matchstr(cy, '[OPCODES]') == 9) {
            opc_true = true
        }
    }
}

function parseopprt(cy) {
    var cyt = cy.split(' ')
    var cyt2 = []
    var cyskip = false
    cyt.forEach(cytt => {
        cytt = cytt.split('')
        var cytt2 = cytt.length - 1
        var cytt3 = cytt.length - 2
        if (cytt[cytt2] == `%`) {
            cyt2.push(cytt[cytt3].toLowerCase())
        }    
        
    })
    return cyt2
}

// Parsing Variable
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

// Parsing Keywords
function parsekeyop(cy) {
    if (cy === '') {return}
    var cyt = cy.split('')
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

// Parsing Models ID
function parsemodels(cy) {
    if (cy === '') {return}
    var cyt = cy.split('')
    cy = cy.replaceAll(' ', '')
    cy = cy.replace('\t', '')
    if (cyt[0] == `#`) {return}
    if (cyt[0] == `;`) {return}
    var cyt = cy.split(',')
    if (typeof cyt[1] == 'undefined') {return}
    var cyt2 = cyt[1].split('\t')
    cleo_modls.push(parseInt(cyt[0]))
    modls_string.push(cyt2[0].toUpperCase())
}

// Low End Sytank Compiler
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
        if (txtcs[0] != '00D6:' && opc_array[bvop] != -1) {
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
                    if (opc_condty[bvop] != true && cleo_opc[bvop] != '004D') {
                        console.log('Compile Error: Unkwon condition at ' + txtcs2)
                        exit()
                    }
                    cond_num++
                }
                bvtrue = true
                var bvsult = swapthis(cleo_opc[bvop])
                writedata(bvsult, 2, 'hex')

                // condition
                if (bvsult == 'D600') {
                    writedata('04', 1, 'hex')
                    last_cond = writedata('00', 1, 'hex')
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
            var bvsult_ty = opc_prity[bvop]
            var gj_num = gj - 1

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
                    writedata('01', 1, 'hex')
                    var hxclb = writedata(-2, 4, 'int')
                    cleo_lajmp.push(bvsult)
                    lajmp_pos.push(hxclb)
                break;

                // variable
                case 'loc':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`@`)
                    bvsult = parseInt(bvsult[0])
                    if (bvsult > 41) {
                        console.log('Compile Error: Local Variable to much at ' + bvcleo[gj])
                        exit()
                    }
                    writedata('03', 1, 'hex')
                    writedata(bvsult, 2, 'int')
                break;

                case 'loc_str':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`@s`)
                    bvsult = parseInt(bvsult[0])
                    if (bvsult > 41) {
                        console.log('Compile Error: Local Variable to much at ' + bvcleo[gj])
                        exit()
                    }
                    writedata('0B', 1, 'hex')
                    writedata(bvsult, 2, 'int')
                break;

                case 'loc_strlong':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`@v`)
                    bvsult = parseInt(bvsult[0])
                    if (bvsult > 41) {
                        console.log('Compile Error: Local Variable to much at ' + bvcleo[gj])
                        exit()
                    }
                    writedata('11', 1, 'hex')
                    writedata(bvsult, 2, 'int')
                break;

                case 'glo':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.split(`$`)
                    bvsult = parseInt(bvsult[1])
                    bvsult *= 4
                    writedata('02', 1, 'hex')
                    writedata(bvsult, 2, 'int')
                break;

                // number
                case 'int':
                    var bvsult = parseInt(bvcleo[gj])
                    if (127 >= bvsult) {
                        writedata('04', 1, 'hex')
                        writedata(bvsult, 1, 'int') 
                    } else {
                        if (32767 >= bvsult) {
                            writedata('05', 1, 'hex')
                            writedata(bvsult, 2, 'int')
                        } else {
                            if (2147483647 >= bvsult) {
                                writedata('01', 1, 'hex')
                                writedata(bvsult, 4, 'int') 
                            }
                        }
                    }

                break;

                case 'flt':
                    var bvsult = parseFloat(bvcleo[gj])
                    writedata('06', 1, 'hex')
                    writedata(bvsult, 4, 'flt')
                break;
                
                // Strings
                case 'shr_str':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.replaceAll(`%spc%`, ' ')
                    bvcleo[gj] = bvsult
                    if (bvsult_ty[gj_num] != 'h' && bvsult_ty[gj_num] != 's' && bvsult_ty[gj_num] != 'g') {
                        console.log('Compile Error: Short string not alowed at ' + bvcleo[gj])
                        exit()
                    }
                    bvsult = bvsult.split(`'`)
                    bvsult = fillstrhex(bvsult[1], 8)
                    if (bvsult.bin == -1) {
                        console.log('Compile Error: Unkwon Short string at ' + bvcleo[gj])
                        exit()
                    } else {
                        if (bvsult.lent > 6) {
                            writedata('0F', 1, 'hex')
                            writedata(bvsult.bin, 8, 'bin')
                            writedata('00', 8, 'hex')
                        } else {
                            writedata('09', 1, 'hex')
                            writedata(bvsult.bin, 8, 'bin')
                        }
                    }
                break;
                
                case 'lng_str':
                    var bvsult = bvcleo[gj]
                    bvsult = bvsult.replaceAll(`%spc%`, ' ')
                    bvcleo[gj] = bvsult
                    if (bvsult_ty[gj_num] == 'g') {
                        console.log('Compile Error: you cannot use Long string at ' + bvcleo[gj])
                        exit()
                    }
                    if (bvsult_ty[gj_num] != 'h' && bvsult_ty[gj_num] != 'k' && bvsult_ty[gj_num] != 's') {
                        console.log('Compile Error: Long string not alowed at ' + bvcleo[gj])
                        exit()
                    }
                    bvsult = bvsult.split(`"`)
                    if (bvsult_ty[gj_num] == 'k') {
                        bvsult = fillstrhex(bvsult[1], 128)
                        writedata(bvsult.bin, 128, 'bin') 
                    } else {
                        bvsult = fillstrhex(bvsult[1], -1)
                        writedata('0E', 1, 'hex')
                        writedata(bvsult.lent, 1, 'int')
                        writedata(bvsult.bin, bvsult.lent, 'bin')
                    }
                break;

                default:
                break;
            }
        }
    }

}

function cleotypesearch(txtcs) {
    if (txtcs === '') {return -1}
    var txtcsb2 = -1
    var txtcsb = txtcs.replaceAll(' ', '')
    if (txtcsb == `{$CLEO.csi}`) {
        txtcsb2 = 'csi'
    } else {
        if (txtcsb == `{$CLEO.csa}`) {
            txtcsb2 = 'csa'
        } else {
            if (txtcsb == `{$CLEO.cs}`) {
                txtcsb2 = 'cs'
            }
        }
    }
    return txtcsb2
}

// Convert to low end sytank
function compilelow(txtcs) {
    if (txtcs === '') {return}

    // convert procces
    txtcs = txtcs.split(' ')
    var bvf = ''
    for (let tic = 0; tic < txtcs.length; tic++) {
        var bv = checktype(txtcs[tic])
        switch (bv) {
            case 'glo':
                var bvsult = txtcs[tic]
                bvsult = bvsult.split(`$`)
                bvsult = bvsult[1].toUpperCase()
                if (isNaN(parseInt(bvsult)) == true) {
                    var bvsult2 = cleo_csvar[csvar_string.indexOf(bvsult)]
                    if (typeof bvsult2 == 'undefined') {
                        cleo_csvar.push(glo_start)
                        csvar_string.push(bvsult)
                        bvsult2 = glo_start
                        glo_start++
                    }
                    txtcs[tic] = `$` + bvsult2
                } else {
                    if (glo_start == 4) {
                        glo_start = parseInt(bvsult)
                        glo_start++
                    }
                }
            break;

            case 'op':
                var bvsult = txtcs[tic]
                feblow_lastop = bvsult
            break;

            case 'nul':
                if (tic == 0) {
                    var bvsult = txtcs[tic].toLowerCase()
                    bvsult = cleo_keyop[keyop_string.indexOf(bvsult)]
                    if (typeof bvsult == 'undefined') {
                    } else {
                        if (txtcs[tic] == 'if') {
                            txtcs[tic] = bvsult + ': if'
                        } else {
                            txtcs[tic] = bvsult + ': ' + txtcs[tic]
                        }
                        bv = 'op'
                        feblow_lastop = bvsult
                    }
                }
            break;

            case 'moid':
                var bvsult = txtcs[tic].split(`#`)
                bvsult = bvsult[1].toUpperCase()
                bvsult = cleo_modls[modls_string.indexOf(bvsult)]
                if (typeof bvsult == 'undefined') {
                    console.log('Compile Error: Model Name not found at ' + txtcs[tic])
                    exit()
                }
                txtcs[tic] = bvsult
            break;

            default:
            break;
        }
        bvf = bvf + ' ' + txtcs[tic]
    }
    febk.push(bvf)
}

// Swapping [00 01] -> [01 00]
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

// Binary Data
function updatedata(bp, bp2, bp3, bp4) {
    var hxbb = Buffer.alloc(bp2, '00', 'hex')
    switch (bp3) {
        case 'int':
            switch (bp2) {
                case 1:
                    hxbb.writeInt8(bp, 0)
                    hxcleo[bp4] = hxbb
                break;
                case 2:
                    hxbb.writeInt16LE(bp, 0)
                    hxcleo[bp4] = hxbb
                break;
                case 4:
                    hxbb.writeInt32LE(bp, 0)
                    hxcleo[bp4] = hxbb
                break;

                default:
                break;
            }
        break;
        
        case 'flt':
            hxbb.writeFloatLE(bp, 0)
            hxcleo[bp4] = hxbb
            break;

        case 'hex':
            hxbb.write(bp, 'hex')
            hxcleo[bp4] = hxbb
            break;
        
        default:
        break;
    }
}

function writedata(bp, bp2, bp3) {
    var hxbb = Buffer.alloc(bp2, '00', 'hex')
    switch (bp3) {
        case 'int':
            switch (bp2) {
                case 1:
                    hxbb.writeInt8(bp, 0)
                    hxcleo.push(hxbb)
                    hxcleob += 1
                break;
                case 2:
                    hxbb.writeInt16LE(bp, 0)
                    hxcleo.push(hxbb)
                    hxcleob += 2
                break;
                case 4:
                    hxbb.writeInt32LE(bp, 0)
                    hxcleo.push(hxbb)
                    hxcleob += 4
                break;

                default:
                break;
            }
        break;
        
        case 'uint':
            switch (bp2) {
                case 1:
                    hxbb.writeUInt8(bp, 0)
                    hxcleo.push(hxbb)
                    hxcleob += 1
                break;
                case 2:
                    hxbb.writeUInt16LE(bp, 0)
                    hxcleo.push(hxbb)
                    hxcleob += 2
                break;
                case 4:
                    hxbb.writeUInt32LE(bp, 0)
                    hxcleo.push(hxbb)
                    hxcleob += 4
                break;

                default:
                break;
            }
        break;

        case 'flt':
            hxbb.writeFloatLE(bp, 0)
            hxcleo.push(hxbb)
            hxcleob += 4
        break;

        case 'hex':
            hxbb.write(bp, 'hex')
            hxcleo.push(hxbb)
            hxcleob += bp2
        break;
        
        case 'bin':
            hxcleo.push(bp)
            hxcleob += bp2
        break;
        
        default:
        return -1
        break;
    }
    var bp6 = hxcleo.length
    bp6 -= 1
    return bp6
}

// Checking Sytank / Type
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

    // models id
    if (cmx[0] == `#`) {
        return 'moid'
    }

    // string
    if (cmx[0] == `'` && cmx[cmx2] == `'`) {
        return 'shr_str'
    }
    if (cmx[0] == `"` && cmx[cmx2] == `"`) {
        return 'lng_str'
    }
    
    return 'nul'
}

// String to buffer with zero fill
function fillstrhex(vi1, vi2) {
    if (vi2 == -1) {
        var vi3 = Buffer.from(vi1, 'ascii')
        var vi7 = vi3.length
    } else {
        var vi3 = Buffer.alloc(vi2)
        var vi6 = 0
        var vi7 = -1
        vi1 = vi1.split('')
        if (vi1.length > vi2) {return {'lent': -1, 'bin': -1}}
        for (let vi4 = 0; vi4 < vi1.length; vi4++) {
            if (typeof vi1[vi4] == 'string') {
                vi7++
                vi3.write(vi1[vi4], vi6, 'ascii')
                vi6++
            } else {
                vi3.write('00', vi6, 'hex')
                vi6++
            }
            
        }
    }
    return {'lent': vi7, 'bin': vi3}
}

// hide comment
function hidecomment(vi, vi1, vi2) {
    vi = vi.split('')
    var vic2 = ''
    vi.forEach(vic => {
        switch (vic) {
            case vi1:
                febkc_true = true    
            break;
            case vi2:
                febkc_true = false
            break;
            default:
                if (febkc_true == false) {
                    vic2 = vic2 + vic
                }
            break;
        }
    })
    return vic2 
}

// space fix
function strspacefix(vi, vi1, vi2) {
    vi = vi.split('')
    var vi_true = false
    var vic2 = ''
    vi.forEach(vic => {
        if (vi_true == true) {
            if (vic == `"` || vic == `'`) {
                vi_true = false
            } else {
                vic = replcstr(vic, vi1, vi2)
            }
        } else {
            if (vic == `"` || vic == `'`) {
                vi_true = true
            }
        }
        vic2 = vic2 + vic
    })
    return vic2
}

// replace string
function replcstr(vi, vi2, vi3) {
    if (vi == vi2) {
        return vi3
    }
    return vi
}

// Get Float from string
function persfloat(vi) {
    var vi2 = parseFloat(vi)
    var vi3 = parseInt(vi)
    if (vi2 + '' == vi3 + '') {
        vi2 = vi3 + '.0'
    }
    return vi2
}

// Check is same?
function stilsame(vi, vi2) {
    if (vi == vi2 + '') {
        return true
    }
    return false
}

// String Finder 
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