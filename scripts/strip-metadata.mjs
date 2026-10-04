// Re-encodes every image under public/ so EXIF/XMP/ICC metadata is dropped.
// sharp discards metadata unless asked to keep it; rotate() bakes in EXIF orientation first.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'

const EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (EXT.has(extname(e.name).toLowerCase())) yield p
  }
}

for (const file of walk('public')) {
  writeFileSync(file, await sharp(readFileSync(file)).rotate().toBuffer())
  console.log('stripped', file)
}
