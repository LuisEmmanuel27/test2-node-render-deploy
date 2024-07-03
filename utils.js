// De forma recomendada de momento en ESModules para leer el json (creando nuestro propio require):
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

export const importJSON = (path) => require(path)
