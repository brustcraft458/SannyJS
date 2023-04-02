// Bisma Mods
// Sany Compiler 2

const comjavmode = false // Java Mode
if (!comjavmode) {
    var fss = require('fs')
}

var fs = {
    'path_script': 'cleoscript',
    'path_asset': '',
    'path_sandat': 'sannydata',
    'callb': undefined,
    readFileScript(path, type) {
        return fss.readFileSync(`${this.path_script}/${path}`, type)
    },
    readFileAsset(path, type) {
        return fss.readFileSync(`${this.path_asset}/${path}`, type)
    },
    readFileSandat(path, type) {
        return fss.readFileSync(`${this.path_sandat}/${path}`, type)
    }
}

// Global Var
// mem opcode list
var memt_opclst = []

// mem opcode
var memt_opc = []
var opc_rdat = []
var opc_rmax = []

// mem keywords
var memt_keyw = []
var keyw_opc = []

// mem constant
var memt_consk = []
var consk_str = []

// mem global variable
var memt_varg = []
var varg_targ = []

// memg global variable
var memg_vargl = []
var vargl_targ = []
var vargl_num = 0

// mem models
var memt_modelid = []
var modelid_targ = []

// mem Classes
var memt_clast = []
var clast_topc = []

// memg label
var memg_labl = []
var labl_targ = []
var labl_stadr = 0

// cahche data
var memt_datcah = {}

// Module Data
module.exports = {loadsan, loadjavfunc, spruce_cleo, lowcompile_cleo, cleo_typescan, reset_datcah};

// debug
function reset_datcah(isdatcah) {
    if (isdatcah) {
        memt_datcah = null
    }
    memg_labl = []
    labl_targ = []
    labl_stadr = 0
    memg_vargl = []
    vargl_targ = []
    vargl_num = 0
}

// Assign java Func
function loadjavfunc(cal1) {
    fs.callb = cal1
}

// Load
function loadsan(mstr, mtype) {
    switch (mtype) {
        case 'sascm':
            // sascm parse
            mstr = parser_sascm(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_scm'}}
            memt_opc = mstr.opc
            opc_rdat = mstr.rdat
            opc_rmax = mstr.rmax
        break;
        case 'class':
            // classes parse
            mstr = parser_class(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_clas'}}
            memt_clast = mstr[0]
            clast_topc = mstr[1]
        break;
        case 'opcodelst':
            // opcodes list parser
            mstr = parser_opcodelst(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_opclst'}}
            memt_opclst = mstr
        break;
        case 'keyw':
            // keywords parse
            mstr = parser_keyw(mstr, memt_opc)
            if (mstr == -1) {throw {err: 'err_sdat_keyw'}}
            memt_keyw = mstr.keyw
            keyw_opc = mstr.opc
        break;
        case 'varg':
            // Global Variable parse
            mstr = parser_varg(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_varg'}}
            memt_varg = mstr.varg
            varg_targ = mstr.targ
        break;
        case 'consk':
            // const/alias parse
            mstr = parser_consk(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_conk'}}
            memt_consk = mstr.consk
            consk_str = mstr.str
        break;
        case 'modelid_first':
            // models id & name parse
            mstr = parser_modelid(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_molid'}}
            memt_modelid = mstr.modelid
            modelid_targ = mstr.targ
        break;
        case 'modelid_add':
            // models id & name parse
            mstr = parser_modelid(mstr)
            if (mstr == -1) {throw {err: 'err_sdat_molid'}}
            memt_modelid = array_combin([memt_modelid, mstr.modelid])
            modelid_targ = array_combin([modelid_targ, mstr.targ])
        break;
    
        default:
        break;
    }
}

// Parser
function parser_sascm(str) {
    var opc_tre = false
    str = str.trim()
    str = str.split(/\r?\n/)
    var opc = []
    var rdat = []
    var rmax = []
    for (let fj = 0; fj < str.length; fj++) {
        var stdat = string_splid(str[fj], `,`, 'right')
        sajk: {
            if (stdat[0] == '[OPCODES]') {
                opc_tre = true
                break sajk
            }
            if (opc_tre == false) {break sajk}
            if (empty_yet(stdat[0])) {break sajk}
            if (stdat[0][0] == `;`) {break sajk}
            if (empty_yet(stdat[1])) {return -1}
            // opcode
            var opcdt = string_splid(stdat[0], `=`, 'right')
            if (empty_yet(opcdt[1]) || isNaN(opcdt[1])) {return -1}
            opcdt[0] = opcdt[0].toUpperCase() + `:`
            if (opcdt[0].length != 5) {return -1}
            opc.push(opcdt[0])
            // opcode dat
            var opcdat = stdat[1].split(' ')
            var opcdat2 = []
            var nuc2 = parseInt(opcdt[1])
            if (-1 > nuc2) {return -1}
            sajb: {
                if (nuc2 == 0) {
                    rdat.push(-1)
                    rmax.push(nuc2)
                    break sajb
                }
                for (let fj2 = 0; fj2 < opcdat.length; fj2++) {
                    sajk2: {
                        var opcdt2 = opcty_transl(opcdat[fj2])
                        var opcdat_ty = search_count2(opcdt2)
                        // scm data
                        if (opcdat_ty.cmnt) {break sajk2}
                        if (opcdat_ty.scmdat && opcdat_ty.scmdat2) {
                            var opcdat_len = opcdt2.length - 1
                            // get num
                            var nuc = opcdt2.slice(1, opcdat_len - 1)
                            if (isNaN(nuc)) {return -1}
                            // get datatype
                            var dtuc = opcdt2.slice(opcdat_len - 1, opcdat_len)
                            if (!opcty_isdat(dtuc)) {return -1}
                            opcdat2.push({'num': nuc, 'ty': dtuc})
                        }
                    }
                }
                if (opcdat2.length != 0) {
                    if (nuc2 == -1) {
                        rmax.push(nuc2)
                        rdat.push(opcdat2)
                        break sajb
                    }
                    if (nuc2 != opcdat2.length) {
                        rdat.push(-1)
                        rmax.push(-1)
                    } else {
                        rmax.push(nuc2)
                        rdat.push(opcdat2)
                    }
                } else {
                    rdat.push(-1)
                    rmax.push(-1)
                }
            }
        }
    }
    if (opc.length == 0 || rmax.length == 0 || rdat.length == 0) {
        return -1
    }
    return {'opc': opc, 'rmax': rmax, 'rdat': rdat}
}

function parser_class(str) {
    str = str.split(/\r?\n/)
    var rstate = false
    var rdat = []
    var rdat2 = []
    var clmain = ''
    var clmain_state = false

    for (let nj = 0; nj < str.length; nj++) {
        var stnj = str[nj].trim()

        njbrk: {
            if (stnj == '') {break njbrk}
            if (stnj[0] == ';') {break njbrk}
            if (stnj == '#CLASSES' && rstate == false) {rstate = true; break njbrk}
    
            if (stnj == '$BEGIN') {
                clmain_state = true
                break njbrk
            }

            if (stnj == '$END') {
                clmain_state = false
                break njbrk
            }

            if (clmain_state) {
                // Parsing data class
                stnj = splidd(stnj, ',')
                var stype = []
                var sopc = ''
                var lfopc = ''
                var rfopc = ''
                var isprop = false
                var smath = ''
                if (stnj[0][0] == '^') {
                    // Constructor
                    stnj[0] = stnj[0].slice(1, stnj[0].length)
                    var stnj2 = [dextrac(stnj[1]), dextrac(stnj[2]), dextrac(stnj[3])]
                    
                    for (let sn = 0; sn < stnj2.length; sn++) {
                        var sntyp = stnj2[sn]
                        if (sntyp == -1) {break}
                        sopc = sntyp[0].toUpperCase()
                        if (isNaN(sntyp[2])) {return -1}
                        sntyp[2] = parseInt(sntyp[2])
                        sntyp[3] = parseInt(sntyp[3])
                        smath = sntyp[1]

                        if (sntyp[3] == 2) {
                            isprop = true
                        }
                        switch (sntyp[2]) {
                            case 1:
                                stype['left'] = sopc + ':'
                                stype['lmath'] = smath
                            break;
                            case 2:
                                stype['right'] = sopc + ':'
                                stype['rmath'] = smath
                            break;
                        
                            default:
                            break;
                        }

                    }

                    // is properties
                    if (isprop && typeof stype['normal'] == 'undefined') {
                        if (typeof stype['left'] != 'undefined') {
                            stype['normal'] = stype['left']
                        } else {
                            if (typeof stype['right'] != 'undefined') {
                                stype['normal'] = stype['right']
                            }
                        }
                    }

                } else {
                    sopc = stnj[1].toUpperCase() + ':'
                    stype['normal'] = sopc
                }

                rdat.push(`${clmain}.${stnj[0].toUpperCase()}`)
                rdat2.push(stype)
            } else {
                // Add Main Class
                clmain = stnj.slice(1, stnj.length).toUpperCase()
                break njbrk
            }
            
        }
    }

    function splidd(str, sblck) {
        var str2 = ''
        var sret = []
        var insd_aray = false
        var insd_brackt = false
        var insd_str = false

        for (let ch = 0; ch < str.length; ch++) {
            switch (str[ch]) {
                case sblck:
                    if (insd_brackt != true && insd_aray != true) {
                        sret.push(str2)
                        str2 = ''
                    } else {
                        str2 += str[ch]
                    }
                break;
                case '(':
                    insd_brackt = true
                    str2 += str[ch]
                break;
                case ')':
                    if (insd_brackt) {
                        insd_brackt = false
                    }
                    str2 += str[ch]
                break;
                case '[':
                    insd_aray = true
                    str2 += str[ch]
                break;
                case ']':
                    if (insd_aray) {
                        insd_aray = false
                    }
                    str2 += str[ch]
                break;
            
                default:
                    str2 += str[ch]
                break;
            }
        }

        // Ending
        if (str2 != '') {
            sret.push(str2)
        }

        return sret
    }

    function dextrac(str) {
        try {
            if ((str[0] == '[' && str[str.length - 1] == ']') == false) {
                return -1
            }
        } catch(e) {return -1}

        str = str.slice(1, str.length - 1).split(',')
        return str
    }

    return [rdat, rdat2]
}

function parser_modelid(str) {
    str = str.trim()
    str = str.split(/\r?\n/)
    var str2 = []
    var str3 = []
    for (let fj = 0; fj < str.length; fj++) {
        mlk: {
            var stmid = str[fj]
            if (empty_yet(stmid)) {break mlk}
            if (stmid[0] == `;` || stmid[0] == `#`) {break mlk}
            stmid = stmid.split(`,`)
            if (empty_yet(stmid[1])) {break mlk}
            var nuc = stmid[0].trim()
            if (isNaN(nuc)) {break mlk}
            nuc = parseInt(nuc)
            var stv = stmid[1].trim().toUpperCase().split(`\t`)
            str2.push(nuc)
            str3.push(`#` + stv[0])
        }
    }
    if (str3.length != str2.length) {return -1}
    if (str3.length == 0 || str2.length == 0) {return -1}
    return {'modelid': str3, 'targ': str2}
}

function parser_keyw(str, opcvalid) {
    str = str.trim()
    str = str.split(/\r?\n/)
    var str3 = []
    var str4 = []
    for (let fj = 0; fj < str.length; fj++) {
        rval: {
            if (str[fj][0] == `;`) {break rval}
            var str2 = string_splid(str[fj], `=`, 'right')
            if (empty_yet(str2[0]) || empty_yet(str2[1])) {break rval}
            str2[0] = str2[0].toUpperCase() + `:`
            if (opcvalid.indexOf(str2[0]) == -1) {return -1}
            str3.push(str2[1].toLowerCase())
            str4.push(str2[0])
        }
    }
    if (str3.length == 0 || str4.length == 0) {return -1}
    return {'keyw': str3, 'opc': str4}
}

function parser_varg(str) {
    str = str.trim()
    str = str.split(/\r?\n/)
    var str3 = []
    var str4 = []
    for (let fj = 0; fj < str.length; fj++) {
        rval: {
            if (str[fj][0] == `;`) {break rval}
            var str2 = string_splid(str[fj], `=`, 'right')
            if (empty_yet(str2[0]) || empty_yet(str2[1])) {break rval}
            if (isNaN(str2[0])) {return -1}
            str3.push(parseInt(str2[0]))
            str4.push(str2[1].toUpperCase().trim())
        }
    }
    return {'varg': str4, 'targ': str3}
}

function parser_consk(str) {
    str = str.trim().toLowerCase()
    str = str.split(/\r?\n/)
    var str_fond = false
    var str3 = []
    var str4 = []
    pconb: {
        for (let fj = 0; fj < str.length; fj++) {
            pconk: {
                if (str[fj] == 'const') {
                    str_fond = true
                    break pconk
                }
                if (str_fond == true) {
                    if (str[fj] == 'end') {
                        str_fond = false
                        break pconb
                    }
                    var str2 = string_splid(str[fj], `=`, 'right')
                    if (empty_yet(str2[0]) || empty_yet(str2[1])) {break pconk}
                    str3.push(str2[0])
                    str4.push(str2[1])
                }
            }
        }
    }
    return {'consk': str3, 'str': str4}
}

// addditionanl
function string_splid(str, spl, type) {
    str = str.split(spl)
    var str2 = []
    var str_len = str.length - 1
    switch (type) {
        case 'left':

        break;
        case 'right':
            str2.push(str[0])
            var str3 = ''
            for (let gy = 1; gy < str.length; gy++) {
                if (str3 === '') {
                    str3 = str[gy]
                } else {
                    str3 = str3 + spl + str[gy]
                }
            }
            str2.push(str3)
        break;
        
        default:
            str2 = -1
        break;
    }
    return str2
}

function string_splited(str, splidi, skipempty, errcheck) {
    var str2 = ''
    var insd_str = false
    var insd_bstr = false
    var insd_brackt = false
    var stret = []

    for (let ch = 0; ch < str.length; ch++) {
        switch (str[ch]) {
            case splidi:
                // Data Append
                if (insd_str == false && insd_bstr == false && insd_brackt == false) {
                    var strim = str2.trim()
                    if (strim != '' || skipempty == false) {
                        stret.push(strim)
                    }
                    str2 = ''
                } else {
                    str2 += str[ch]
                }
            break;
            case '"':
                if (insd_str == true) {
                    insd_str = false
                } else {
                    insd_str = true
                }

                str2 += str[ch]
            break;
            case "'":
                if (insd_bstr == true) {
                    insd_bstr = false
                } else {
                    insd_bstr = true
                }

                // Fix Long string symbol '
                if (insd_str == true) {
                    insd_bstr = false
                }

                str2 += str[ch]
            break;
            case "(":
                insd_brackt = true

                str2 += str[ch]
            break;
            case ")":
                if (insd_brackt == true) {
                    insd_brackt = false
                }

                str2 += str[ch]
            break;
        
            default:
                str2 += str[ch]
            break;
        }
    }

    // Akhir
    if (errcheck) {
        if (insd_brackt == true) {return -1}
        if (insd_str == true) {return -2}
        if (insd_bstr == true) {return -2}
    }

    if (str2 != '') {
        stret.push(str2.trim())
    }

    return stret
}

function empty_yet(str) {
    if (typeof str == 'undefined') {return true}
    if (str === '') {return true}
    if (str.length == 0) {return true}
    return false
}

// translating unkwon opcode type
function opcty_transl(str) {
    switch (str) {
        case '%1buserdir/rootdir%':
        return '%1d%';
        case `%7%`:
        return `%7d%`;
        case `%9d%spawn_policeB_at`:
        return `%9d%`;

        default:
        return str;
    }
}

function search_count2(str) {
    var str2 = []
    var str_cmnt = false
    var str_cmt = false
    var str_cmt2 = false
    var str_scmdat = false
    var str_scmdat2 = false
    var str_len = str.length - 1
    for (let ib = 0; ib < str.length; ib++) {
        switch (str[ib]) {
            case `/`:
                if (str[ib + 1] == `/`) {
                    str_cmnt = true
                } 
            break;
            case `;`:
                str_cmnt = true
            break;
            case `{`:
                if (ib == 0) {
                    str_cmt = true
                }
            break;
            case `}`:
                if (ib == str_len) {
                    str_cmt2 = true
                }
            break;
            case `%`:
                switch (ib) {
                    case 0:
                        str_scmdat = true
                    break;
                    case str_len:
                        str_scmdat2 = true
                    break;

                    default:
                    break;
                }
            break;

            default:
            break;
        }
    }
    return {'cmnt': str_cmnt, 'cmt': str_cmt, 'cmt2': str_cmt2, 'scmdat': str_scmdat, 'scmdat2': str_scmdat2}
}

// is opcode type
function opcty_isdat(str) {
    switch (str) {
        case 'h':
        return true;
        case 'd':
        return true;
        case 'b':
        return true;
        case 'p':
        return true;
        case 'o':
        return true;
        case 'm':
        return true;
        case 's':
        return true;
        case 'g':
        return true;
        case 'x':
        return true;
        case 'k':
        return true;

        default:
        return false;
    }
}

// Scanning Datatype
function datacomp_scan(str, dline) {
    var stend = str.length - 1

    // Variable & Global Variable
    var stsearch = str.search('(\\@)|(\\$)')
    if (stsearch != -1) {
        if (str[stsearch] == '@') {
            switch (stsearch) {
                case 0:
                    // Label Jump
                    var stdat = str.slice(1, str.length).toUpperCase()
                return {'ty': 'jmp', 'dat': stdat};
                case stend:
                    // Local Variable
                    var stdat = str.slice(0, stend)
                    if (isNaN(stdat)) {throw {'err': 'err_var_inde', 'line': dline, 'data': str}}
                    stdat = parseInt(stdat)
                return {'ty': 'var', 'dat': stdat};
            
                default:
                throw {'err': 'err_var_inde', 'line': dline, 'data': str};
            }
        } else {
            // Global Variable
            if (stsearch == 0) {
                var stdat = str.slice(1, str.length)
                stdat = parseInt(stdat)
                return {'ty': 'varg', 'dat': stdat}
            }
            throw {'err': 'err_varg_not', 'line': dline, 'data': str};
        }
    }
    
    // Strings Long & Short
    var stsearch = str.search(`(")|(')`)
    if (stsearch != -1) {
        // Long
        if (str[0] == '"' && str[stend] == '"') {
            return {'ty': 'stril', 'dat': str.slice(1, stend)}
        }
        // Short
        if (str[0] == `'` && str[stend] == `'`) {
            return {'ty': 'strht', 'dat': str.slice(1, stend)}
        }

        throw {'err': 'err_str_not', 'line': dline, 'data': str}
    }

    // Opcode & Label
    var stsearch = str.search(':')
    if (stsearch != -1) {
        switch (stsearch) {
            case 0:
                // Label Target
                var stdat = str.slice(1, str.length).toUpperCase()
            return {'ty': 'labl', 'dat': stdat};
            case stend:
                // Opcode
                var stdat = str.slice(0, stend).toUpperCase()
            return {'ty': 'opc', 'dat': stdat};

            default:
            throw {'err': 'err_colon_not', 'line': dline, 'data': str};
        }
    }

    // Float or Integer
    var dregex = new RegExp("(\\d+)(.|)(\\d+)", '').exec(str)
    if (dregex == null) {
        dregex = new RegExp("(\\d+)", '').exec(str)
    }
    if (dregex != null) {
        var stdat = str
        if (dregex[2] == '.') {
            // Float
            if (isNaN(stdat)) {throw {'err': 'err_flt_not', 'line': dline, 'data': str}}
            stdat = parseFloat(stdat)
            return {'ty': 'flt', 'dat': stdat}
        } else {
            // Integer
            if (isNaN(stdat)) {throw {'err': 'err_int_not', 'line': dline, 'data': str}}
            stdat = parseInt(stdat)
            return {'ty': 'int', 'dat': stdat}
        }
    }

    return {'ty': 'str', 'dat': str}
}

function string_mixno(str, str2) {
    var stret = '_'
    var stret2 = '_'
    if (typeof str == 'string') {
        stret = str
    }
    if (typeof str2 == 'string') {
        stret2 = str2
    }
    
    return stret + stret2
}

function array_combin(str) {
    var str2 = []
    str = str2.concat(...str)
    return str
}

// Sannydata Search
function memfind_opc(str) {
    if (str[0] == '8') {
        str = `0${str.slice(1 ,str.length)}`
    }
    var oid = memt_opc.indexOf(str)
    if (oid == -1) {return -1}

    return oid
}

// Scanning data
function cleo_typescan(datatx, filename, firstscan, curline) {
    
    // Per char scan
    var sline = 0
    var sdatatx = ''
    var scomment = ''
    var snlcomment = ''
    var snlcomment_state = false
    var sformat = ''
    var sinclude = null
    var sdataret = []
    var sdataline = []
    
    for (let ch = 0; ch < datatx.length; ch++) {
        const datsn = datatx[ch];
        daskp: {
            if (snlcomment_state == true) {
                if (datsn != '\n') {
                    break daskp
                }
            }

            switch (datsn) {
                case '{':
                    scomment += datsn
                break;
                case '}':
                    scomment += datsn
                    // End Comment
                    formatcheck(scomment)
                break;
                case '/':
                    if (datatx[ch + 1] == '/') {
                        snlcomment_state = true
                    }
                break;
                case '\n':
                    if (sinclude != null) {
                        sdataline[sline] = sinclude
                    } else {
                        sdataline[sline] = {'type': 'str', 'dat': sdatatx.trim()}
                    }
                    sdatatx = ''
                    sinclude = null
                    sline++
                    snlcomment_state = false
                break;
                case '\r':
                break;
                case '\t':
                    sdatatx += '    '
                break;
            
                default:
                    if (scomment != '') {
                        scomment += datsn
                        sdatatx += ' '
                    } else {
                        sdatatx += datsn
                    }
                break;
            }
        }
    }

    // Ending
    if (sinclude != null) {
        sdataline[sline] = sinclude
    } else {
        if (sdatatx != '') {
            sdataline[sline] = {'type': 'str', 'dat': sdatatx.trim()}
        }
    }
    
    if (sformat.length == 0 && firstscan == true) {throw({err: 'err_scan_formt', 'line': -1})}

    if (firstscan) {
        memt_datcah = {'name': filename, 'data': sdataline, 'formt': sformat, 'line': curline}
        return {'name': filename, 'formt': sformat}
    } else {
        return {'name': filename, 'data': sdataline}
    }
    

    // Func Worker
    function formatcheck(str) {
        str = str.slice(1, str.length - 1).toLowerCase()
        str = str.split(' ')
        scomment = ''

        switch (str[0]) {
            case '$include':
                // Load Include File
                sinclude = null
                try {
                    var sdinc = cleo_typescan(fs.readFileScript(str[1], 'ascii'), str[1], false, sline)
                    sinclude = {'type': 'inc', 'name': sdinc.name, 'dat': sdinc.data}
                } catch(e) {
                    if (typeof e.err != 'undefined') {
                        throw {'err': e.err, 'filename': str[1], 'incname': e.incname, 'line': e.line, 'data': e.data}
                    } else {
                        throw {'err': e, 'filename': filename, 'incname': str[1], 'line': sline}
                    }
                }
            break;
            case '$cleo':
                // Cleo Format
                if (firstscan != true) {return -1}
                switch (str[1]) {
                    case '.csa':
                    break;
                    case '.csi':
                    break;
                    case '.cs':
                    break;
                
                    default:
                    return -1;
                }
                sformat = str[1]
            break;
        
            default:
            return -1;
        }
    }
}

function spruce_cleo(filecmp) {
    if (typeof filecmp == 'undefined') {
        var filecmp = memt_datcah.data
        reset_datcah(true)
        memg_vargl = memt_varg
        vargl_targ = varg_targ
    }

    var filebuf = []
    var clasi_regex = new RegExp("(^.)(\\w+)(.)(\\w+)(\\()(.*)(\\))", '')

    // Compiling
    for (let line = 0; line < filecmp.length; line++) {
        var filecmlin = filecmp[line]
        lbrk: {
            var estr = ''
            var isopnot = false
            if (filecmlin.type == 'inc') {
                // Compiling Imported file
                try {
                    estr = spruce_cleo(filecmlin.dat)
                } catch(e) {
                    if (typeof e.err != 'undefined') {
                        if (typeof e.name == 'string') {
                            throw {'err': e.err, 'line': e.line, 'data':e.data, 'name': e.name}
                        } else {
                            throw {'err': e.err, 'line': e.line, 'data':e.data, 'name': filecmlin.name}
                        }
                    } else {
                        throw {'err': e, 'line': line, 'name': filecmlin.name}
                    }
                }
                break lbrk;
            }

            estr = string_splited(filecmlin.dat, ' ', true, true)
            if (estr == -1) {throw {'err': 'err_brackt_end', 'line': line}}
            if (estr == -2) {throw {'err': 'err_str_blk', 'line': line}}
            
            for (let step = 0; step < estr.length; step++) {
                if (estr[step].toLowerCase() == 'not') {
                    // fix not operation
                    estr.splice(step, 1)
                    isopnot = true
                }
                if (step == 0) {
                    var evdt = estr[step]
                    if (evdt.search(':') == evdt.length - 1) {
                        // only opcode
                        var oid = memfind_opc(evdt.toUpperCase())
                        if (oid == -1) {throw {'err': 'err_opc_cod', 'line': line, 'data': evdt}}
                        break
                    }
                }
                // Classes to Opcode
                var evdt = classies(estr[step], line, step)
                if (evdt != -1) {estr = evdt; break}
                // Math Operator to Opcode
                evdt = mathopr(estr[step], line, step)
                if (evdt != -1) {estr = evdt; break}

                // Symbol Translate
                estr[step] = symbolies(estr[step], line, step)
            }

            if (typeof estr != 'string') {
                estr = estr.join(' ')
            }

        }

        filecmp[line] = {'type': filecmlin.type, 'dat': estr}
    }
    

    // Translate Classes to Opcode
    function classies(str, dline, dstep) {
        var dats = {
            'cid': null,
            'data': null,
            'ClassHead': function() {
                return `${this.data[1]}${this.data[2]}${this.data[3]}${this.data[4]}`
            },
            'ClassType': function() {
                if (typeof estr[dstep - 1] != 'undefined' && typeof estr[dstep - 2] != 'undefined') {return {'type': 'right', 'var': estr[dstep - 2], 'math': estr[dstep - 1]}}
                if (typeof estr[dstep + 1] != 'undefined' && typeof estr[dstep + 2] != 'undefined') {return {'type': 'left', 'var': estr[dstep + 2], 'math': estr[dstep + 1]}}
                return {'type': 'normal'}
            },
            'Component': function() {
                return string_splited(this.data[6], ',', false, true)
            }
        }

        if (str.search('(.*)(\\()') != -1) {
            dats.data = clasi_regex.exec(str)
            if (dats.data == null) {throw {'err': 'err_clas_inva', 'line': dline, 'data': str}}
        }

        if (dats.data != null) {
            // Fix if placement
            str = ''
            var ifjmp = estr[dstep - 1]
            if (typeof ifjmp != 'undefined') {
                ifjmp = ifjmp.toLowerCase()
                if (ifjmp == '00d6: if') {
                    str = `${ifjmp}\n`
                }
            }
            // Classes To Opcode
            var cldat = dats.Component()
            if (cldat == -1 || cldat == -2) {throw {'err': 'err_clas_datr', 'line': dline, 'data': dats.data}}
            var clhead = dats.ClassHead().toUpperCase()
            var clhead2 = dats.ClassHead().replaceAll('.', '_')

            // Find Opcode from Classes
            dats.cid = memt_clast.indexOf(clhead)
            if (dats.cid == -1) {throw {'err': 'err_clas_not', 'line': dline, 'data': dats.ClassHead()}}
            var cltype = dats.ClassType()
            var ctres = clast_topc[dats.cid][cltype.type]
            if (typeof ctres == 'undefined') {throw {'err': 'err_clas_inva', 'line': dline}}
            if (isopnot == true) {
                ctres = `8${ctres.slice(1, ctres.length)} not`
            }

            switch (cltype.type) {
                case 'left':
                    str += `${ctres} ${clhead2} ${symbolies(cldat[0], dline)} ${cltype.math} ${cltype.var}`
                break;
                case 'right':
                    str += `${ctres} ${cltype.var} ${cltype.math} ${clhead2}`
                    for (let cv = 0; cv < cldat.length; cv++) {
                        str += ` ${symbolies(cldat[cv], dline)}`
                    }
                break;
            
                default:
                    str += `${ctres} ${clhead2}`
                    for (let cv = 0; cv < cldat.length; cv++) {
                        str += ` ${symbolies(cldat[cv], dline)}`
                    }
                break;
            }

            return str
        }

        return -1
    }

    // Translate Math Operator to Opcode
    function mathopr(str, dline, dstep) {
        var cdata = estr[dstep + 1]
        var cvariable = estr[dstep - 1]
        if (empty_yet(cdata) || empty_yet(cvariable)) {return -1}

        switch (str) {
            case '+=':
                var cld = datacomp_scan(cvariable, dline)
                var cld2 = datacomp_scan(cdata, dline)
                if (cld.ty == 'var') {return mathopc(cld2.ty, {'int': '000A:', 'flt': '000B:'})}
                if (cld.ty == 'varg') {return mathopc(cld2.ty, {'int': '0008:', 'flt': '0009:'})}
            break;
            case '-=':
                var cld = datacomp_scan(cvariable, dline)
                var cld2 = datacomp_scan(cdata, dline)
                if (cld.ty == 'var') {return mathopc(cld2.ty, {'int': '000E:', 'flt': '000F:'})}
                if (cld.ty == 'varg') {return mathopc(cld2.ty, {'int': '000C:', 'flt': '000D:'})}
            break;
            case '=':
                if (cdata.search('(.*)(\\()') != -1) {break}
                var cld = datacomp_scan(cvariable, dline)
                var cld2 = datacomp_scan(cdata, dline)
                if (cld.ty == 'var') {return mathopc(cld2.ty, {'int': '0006:', 'flt': '0007:'})}
                if (cld.ty == 'varg') {return mathopc(cld2.ty, {'int': '0004:', 'flt': '0005:'})}
            break;
        
            default:
            return -1;
        }

        function mathopc(etype, eopc) {
            switch (etype) {
                case 'int':
                return `${eopc.int} ${cvariable} ${str} ${cdata}`;
                case 'flt':
                return `${eopc.flt} ${cvariable} ${str} ${cdata}`;
            
                default:
                throw {'err': 'err_matop_datip', 'line': dline};
            }
        }

        // Ending
        return -1
    }
    
    // Transalate Symbol
    function symbolies(str, dline, dstep) {
        switch (str[0]) {
            case '#':
                // ModelsID
                var lid = memt_modelid.indexOf(str.toUpperCase())
                if (lid == -1) {throw {'err': 'err_molid_not', 'line': dline, 'data': str}}
            return `${modelid_targ[lid]}`;
            case '$':
                // Global Variable
                var lstr = str.slice(1, str.length).toUpperCase()
                var lid = memg_vargl.indexOf(lstr)
                if (lid == -1) {
                    // New Global Variable
                    if (!isNaN(lstr) && vargl_num == 0) {
                        vargl_num = parseInt(lstr)
                    } else {
                        vargl_num++
                    }
                    var lnum = vargl_num
                    memg_vargl.push(lstr)
                    varg_targ.push(lnum)
                    return `$${lnum}`
                } else {
                    var lnum = vargl_targ[lid]
                    if (vargl_num == 0) {
                        vargl_num = lnum
                    }
                    return `$${lnum}`
                }
            break;

            default:
                if (dstep == 0) {
                    // keyword to opcode
                    var lid = memt_keyw.indexOf(str.toLowerCase())
                    if (lid != -1) {return `${keyw_opc[lid]} ${str}`}
                }
            break;
        }

        return str
    }

    return filecmp
}

// Compiling low end opcode
function lowcompile_cleo(filecmp) {
    for (let line = 0; line < filecmp.length; line++) {
        switch (filecmp[line].type) {
            case 'str':
                // Code to Buffer
                if (filecmp[line].dat == '') {
                    // Skip
                    filecmp[line] = Buffer.from('')
                    break
                }
                if (filecmp[line].dat.search('\n') != -1) {
                    // Multi
                    var filecmlin = filecmp[line].dat.split('\n')
                    for (let line2 = 0; line2 < filecmlin.length; line2++) {
                        filecmlin[line2] = lowcompile(filecmlin[line2], line)
                        labl_stadr += filecmlin[line2].length
                    }

                    filecmp[line] = array_combin(filecmlin)
                } else {
                    // Single
                    var filecmlin = filecmp[line].dat
                    filecmp[line] = lowcompile(filecmlin, line)
                    labl_stadr += filecmlin[line].length
                }
            break;
            case 'inc':
                // Included File
                filecmp[line] = lowcompile_cleo(filecmp[line].dat)
                filecmp[line] = Buffer.concat(array_combin(filecmp[line]))
            break;
        
            default:
                filecmp[line] = Buffer.from('')
            break;
        }
    }

    // Compile to Buffer
    function lowcompile(str, dline) {
        str = str.split(' ')
        var head = datacomp_scan(str[0], dline)
        var component = str.splice(1)
        switch (head.ty) {
            case 'opc':
                // Opcode
                var opcid = memt_opc.indexOf(`${head.dat}:`)
                var component2 = []
                if (opcid == -1) {throw {'err': 'err_opc_cod', 'line': dline, 'data': `${head.dat}:`}}
                
                // Component
                component = compextr(component, dline, opc_rdat[opcid])
                console.log('all comp', head, component)
            break;
            case 'labl':
                if (memg_labl.indexOf(head.dat) != -1) {
                    throw {'err': 'err_lab_dupc', 'line': dline, 'data': `:${head.dat}`}
                }
                memg_labl.push(head.dat)
                labl_targ.push(labl_stadr)
            break;
        
            default:
            break;
        }

        return Buffer.from('')
    }

    // Skip useless & extrac data type & relocating
    function compextr(str, dline, rdat) {
        var str2 = []
        var dpos = 0
        for (let stp = 0; stp < str.length; stp++) {
            var comp = datacomp_scan(str[stp], dline)
            if (comp.ty != 'str') {
                var codat = rdat[dpos]
                if (typeof codat == 'undefined') {throw {'err': 'err_opc_max', 'line': dline, 'data': compeskip(str.splice(0, stp), dline).join(' ')}}
                comp = {...comp, 'tyd': codat.ty}
                str2[codat.num - 1] = comp
                dpos++
            }
        }

        return str2
    }

    // Skip useless
    function compeskip(str, dline) {
        var str2 = []
        for (let stp = 0; stp < str.length; stp++) {
            if (datacomp_scan(str[stp], dline).ty != 'str') {
                str2.push(str[stp])
            }
        }

        return str2
    }


    return filecmp
}