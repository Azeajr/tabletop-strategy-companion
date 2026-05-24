// Generates PWA icons at public/icons/icon-192.png and icon-512.png.
// Uses only Node.js built-ins — no canvas package needed.
// Icon: golden diamond on dark background.
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function uint32BE(n) {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(n)
  return buf
}

function crc32(data) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const crcBuf = uint32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([uint32BE(data.length), typeBytes, data, crcBuf])
}

function makePNG(size) {
  const BG = [0x0d, 0x0b, 0x08] // #0D0B08 dark
  const FG = [0xc8, 0xa9, 0x51] // #C8A951 golden

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB color type

  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  const c = (size - 1) / 2
  const r = size * 0.32

  for (let y = 0; y < size; y++) {
    const off = y * rowSize
    raw[off] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      // Diamond: |x - cx| + |y - cy| <= r
      const inside = Math.abs(x - c) + Math.abs(y - c) <= r
      const [pr, pg, pb] = inside ? FG : BG
      raw[off + 1 + x * 3] = pr
      raw[off + 2 + x * 3] = pg
      raw[off + 3 + x * 3] = pb
    }
  }

  const idat = deflateSync(raw)
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', makePNG(192))
writeFileSync('public/icons/icon-512.png', makePNG(512))
console.log('Generated public/icons/icon-192.png and icon-512.png')
