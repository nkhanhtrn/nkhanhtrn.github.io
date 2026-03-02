/**
 * Create placeholder PNG icons for the PWA
 * This is a simple Node.js script that creates basic colored square icons
 * Run with: node scripts/create-placeholder-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple PNG creator (creates a minimal valid PNG)
function createPNG(size, color) {
  // For a proper production setup, use a real image library
  // This creates a basic placeholder
  const width = size;
  const height = size;

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk (simple solid color)
  const bytesPerPixel = 4;
  const rowData = bytesPerPixel * width + 1; // +1 for filter byte
  const imageData = Buffer.alloc(height * rowData);

  // Parse color (hex format: #RRGGBB or #RRGGBBAA)
  let r = 76, g = 175, b = 80, a = 255; // Default green (#4CAF50)
  if (color) {
    const hex = color.replace('#', '');
    if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      if (hex.length >= 8) {
        a = parseInt(hex.substring(6, 8), 16);
      }
    }
  }

  for (let y = 0; y < height; y++) {
    let offset = y * rowData;
    imageData[offset] = 0; // filter type (none)
    for (let x = 0; x < width; x++) {
      imageData[offset + 1 + x * 4] = r;
      imageData[offset + 2 + x * 4] = g;
      imageData[offset + 3 + x * 4] = b;
      imageData[offset + 4 + x * 4] = a;
    }
  }

  // Compress with zlib (Node.js built-in)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imageData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Simple CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create icons
const sizes = [16, 32, 192, 512];
const color = '#4CAF50';
const publicDir = path.join(__dirname, '..', 'public');

console.log('Creating placeholder PWA icons...');

sizes.forEach(size => {
  const png = createPNG(size, color);
  const filename = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created: icon-${size}.png (${size}x${size})`);
});

// Create apple-touch-icon.png
const applePng = createPNG(180, color);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), applePng);
console.log('Created: apple-touch-icon.png (180x180)');

console.log('\nPlaceholder icons created successfully!');
console.log('For production, use the scripts in the parent directory:');
console.log('  - scripts/generate-icons.sh (requires ImageMagick)');
console.log('  - scripts/generate-icons.py (requires cairosvg + pillow)');
