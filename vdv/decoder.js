const fs = require('fs')
const ZebraCrossing = require('zebra-crossing')
const iconv = require('iconv-lite')

async function decodeAztecFromImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const result = await ZebraCrossing.read(imageBuffer, { pureBarcode: true })

    if (result?.raw) {
      const encodedData = iconv.decode(Buffer.from(result.raw), 'latin1')
      console.log('Decoded Aztec code content (raw):', encodedData)

      // Save the raw binary data to a file
      fs.writeFileSync('decoded_binary_data_2.bin', Buffer.from(result.raw, 'binary'))
      console.log('Binary data saved to decoded_binary_data.bin')

      return encodedData
    } else {
      console.log('No data could be decoded from the image.')
      return null
    }
  } catch (error) {
    console.error('Error decoding Aztec code:', error)
  }
}

async function main() {
  const imagePath = './vdv-barcode.png'
  await decodeAztecFromImage(imagePath)
}

main()
