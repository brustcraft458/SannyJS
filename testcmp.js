// Bisma Mods
// Unit tes

const sanjs = require('./src/kompil2.js')
const fs = require('fs')

// Load Data
const datapath = "sannydata/sa"
var dataread = fs.readFileSync(`${datapath}/SASCM.ini`, 'ascii')
sanjs.loadsan(dataread, 'sascm')
dataread = fs.readFileSync(`${datapath}/keywords.txt`, 'ascii')
sanjs.loadsan(dataread, 'keyw')
dataread = fs.readFileSync(`${datapath}/classes.db`, 'ascii')
sanjs.loadsan(dataread, 'class')
dataread = fs.readFileSync(`${datapath}/CustomVariables.ini`, 'ascii')
sanjs.loadsan(dataread, 'varg')
dataread = fs.readFileSync(`${datapath}/constants.txt`, 'ascii')
sanjs.loadsan(dataread, 'consk')
dataread = fs.readFileSync(`${datapath}/peds.ide`, 'ascii')
sanjs.loadsan(dataread, 'modelid_first')
dataread = fs.readFileSync(`${datapath}/vehicles.ide`, 'ascii')
sanjs.loadsan(dataread, 'modelid_add')
dataread = fs.readFileSync(`${datapath}/veh_mods.ide`, 'ascii')
sanjs.loadsan(dataread, 'modelid_add')
dataread = fs.readFileSync(`${datapath}/default.ide`, 'ascii')
sanjs.loadsan(dataread, 'modelid_add')

// Compile Cleo
const scriptpath = 'cleoscript'
dataread = fs.readFileSync(`${scriptpath}/scriptes.txt`, 'ascii')
var dinc = sanjs.cleo_typescan(dataread, 'scriptes', true, -1)
dinc = sanjs.spruce_cleo()

console.log(dinc)
//console.log(JSON.stringify(dinc, null, 4))