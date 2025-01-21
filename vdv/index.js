const bwipjs = require('bwip-js')
const fs = require('fs')

// Helper functions
function toHex(str) {
  return Buffer.from(str, 'ascii').toString('hex')
}

function toBinary(str) {
  return Buffer.from(str, 'ascii')
}

function padBuffer(buffer, length) {
  if (buffer.length < length) {
    const padding = Buffer.alloc(length - buffer.length, 0x00)
    return Buffer.concat([buffer, padding])
  }
  return buffer
}

// Example VDV data
const vdvData = {
  Berechtigung_ID: '1234567890',
  Referenz_ORG_ID: '5000',
  prodProdukt_ID: Buffer.from([0x27, 0x0f, 0x0b, 0xb8]), // Example product ID with OrgId
  berGueltigkeitsbeginn: '20250101',
  berGueltigkeitsende: '20251231',
  efsFahrgastGeschlecht: Buffer.from([0x00]),
  efsFahrgastGeburtsdatum: '19700101',
  efsFahrgastName: 'John Doe'
}

// Construct binary data according to specifications
const binaryData = Buffer.concat([
  padBuffer(toBinary(vdvData.Berechtigung_ID), 10),
  padBuffer(toBinary(vdvData.Referenz_ORG_ID), 4),
  vdvData.prodProdukt_ID,
  padBuffer(toBinary(vdvData.berGueltigkeitsbeginn), 8),
  padBuffer(toBinary(vdvData.berGueltigkeitsende), 8),
  vdvData.efsFahrgastGeschlecht,
  padBuffer(toBinary(vdvData.efsFahrgastGeburtsdatum), 8),
  padBuffer(toBinary(vdvData.efsFahrgastName), 32), // Assuming max length of 32 for name
  Buffer.from([0x0f]), // Typ-Definition
  Buffer.from([0x13, 0x88]), // Organisation_ID
  Buffer.from([0x00, 0x01]), // Liste-Flaeche-IDs
  Buffer.from([0x11]), // TerminalTyp
  Buffer.from([0x01]), // TerminalNummer
  Buffer.from([0x99, 0xd4]), // TerminalBetreiber
  Buffer.from([0xc9]), // OrtTyp
  Buffer.from([0x01]), // OrtNummer
  Buffer.from([0x99, 0xd4]), // OrtDomaene_ID
  Buffer.from([0x8a, 0x00]), // Tag "Transaktion Produktspezifischer Teil"
  Buffer.from([0x19, 0x00]), // Version
  toBinary('VDV') // Kennung "VDV"
])

// Ensure padding to make the total ticket at least 111 bytes long
const paddingBytes = 111 - binaryData.length
const padding = Buffer.alloc(paddingBytes, 0x00)
const finalBinaryString = Buffer.concat([binaryData, padding])

// Generate barcode
bwipjs.toBuffer(
  {
    bcid: 'azteccode', // Barcode type
    text: finalBinaryString.toString('binary'), // Binary string to encode
    scale: 2, // Scaling factor
    aztecfull: true, // Use full-range Aztec code
    azteclayers: 0 // Automatic layer selection
  },
  function (err, png) {
    if (err) {
      console.error('Error generating barcode:', err)
    } else {
      // Save barcode image
      fs.writeFile('vdv-barcode.png', png, function (err) {
        if (err) {
          console.error('Error saving barcode image:', err)
        } else {
          console.log('Barcode image saved as vdv-barcode.png')
        }
      })
    }
  }
)
