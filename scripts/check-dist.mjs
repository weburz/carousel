// Fails when the module builder emitted an empty declaration file. mkdist
// writes a 0-byte .d.ts instead of erroring when TypeScript cannot name a
// component's inferred type (TS2883), which silently strips every prop type
// from the published components.
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const walk = dir =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

const empty = walk('dist').filter(
  path => /\.d\.(?:m|c)?ts$|\.d\.vue\.ts$/.test(path) && statSync(path).size === 0,
)

if (empty.length) {
  console.error(`Empty declaration files in dist/:\n${empty.map(p => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log('dist/ declarations OK')
