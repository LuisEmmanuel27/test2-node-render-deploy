`Se retoma lo realizado en el proyecto pasado`

# Despliegue en render.com

1. ignorar el `.yaml` realmente no es necesario pero lo dejamos
2. se modifica el package.json para poder hacer el deploy en `render.com`
3. tenemos que tener el build `npm run build`
4. tenemos que tener el start `npm start`
5. lo subirmos a un repositorio el proyecto
6. abrimos render.com y en crear web service vinculamos el repositorio y agregamos los comandos antes mencionados y la variable de entorno PORT
7. listo nos debera dar una url que es donde esta nuestro sevicio web que si revisamos podremos ver que funciona a como si hacemos `npm run dev` en nuestro editor

# Pasando a ESModules

1. pasaremos de usar commonJS a el ya moderno y recomendado ESModules (import/export)
2. en package.json agrega `"type": "module"`
3. modificamos el `app.js`:
```js
import express, { json } from 'express'
import { randomUUID } from 'node:crypto'
import cors from 'cors'
import { validateMovie, validatePartialMovie } from './schemas/moviesSchema.js'

// Una forma de leer el json después de pasar a ESModules
// import fs from 'node:fs'
// const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'))

// De forma recomendada de momento en ESModules para leer el json (creando nuestro propio require):
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const movies = require('./movies.json')

const app = express()

// middleware del cors
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.disable('x-powered-by')

app.use(json())

app.get('/', (req, res) => {
  res.json({ message: 'Hola Mundo' })
})

app.get('/movies', (req, res) => {
  const { genre } = req.query

  if (genre) {
    const moviesFiltered = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )

    if (moviesFiltered.length === 0) return res.status(404).json({ message: 'Genre not found' })

    return res.json(moviesFiltered)
  }

  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  // alternativa: if(!result.success)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: randomUUID(),
    ...result.data
  }

  // SIMULANDO el REST, por que ya sabemos que esto no es lo correcto de guardar el estado en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`listen on port http://localhost:${PORT}`)
})
```

4. modificamos el `moviesSchema.js`:
```js
import { z } from 'zod'

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2040),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Drama', 'Comedy', 'Fantasy', 'Romance', 'Horror', 'Thriller', 'Sci-Fi', 'Crime', 'Biography'], {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be an array of enum Genre'
    })
  )
})

export function validateMovie (object) {
  return movieSchema.safeParse(object)
}

export function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}
```

5. la forma de importar el JSON se separo la logica en `utils.js`

# Aplicando MVC

1. primero se crea la carpeta routes y dentro de esta `movies.js` que contendra todas las rutas referentes a movies, vease como el controller en java spring boot
2. separaremos la logica de `app.js` y la agregaremos a `movies.js` quedando de momento asi
```js
// app.js
import express, { json } from 'express'
import cors from 'cors'

const app = express()

// middleware del cors
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.disable('x-powered-by')

app.use(json())

app.get('/movies') // TODO

app.get('/movies/:id') // TODO

app.post('/movies') // TODO

app.patch('/movies/:id') // TODO

app.delete('/movies/:id') // TODO

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`listen on port http://localhost:${PORT}`)
})
```

---

```js
// routes/movies.js
import { Router } from 'express'
import { importJSON } from '../utils.js'
import { validateMovie, validatePartialMovie } from '../schemas/moviesSchema.js'
import { randomUUID } from 'node:crypto'

export const moviesRouter = Router()

const movies = importJSON('./movies.json')

// GET movies
moviesRouter.get('/', (req, res) => {
  const { genre } = req.query

  if (genre) {
    const moviesFiltered = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )

    if (moviesFiltered.length === 0) return res.status(404).json({ message: 'Genre not found' })

    return res.json(moviesFiltered)
  }

  res.json(movies)
})

// GET movie by ID
moviesRouter.get('/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

// POST movie
moviesRouter.post('/', (req, res) => {
  const result = validateMovie(req.body)

  // alternativa: if(!result.success)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: randomUUID(),
    ...result.data
  }

  // SIMULANDO el REST, por que ya sabemos que esto no es lo correcto de guardar el estado en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

// PATCH movie by ID
moviesRouter.patch('/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

// DELETE movie by ID
moviesRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})
```

3. Luego hacemos que app.js utilice el router:
```js
import express, { json } from 'express'
import cors from 'cors'
import { moviesRouter } from './routes/movies.js'

const app = express()

// middleware del cors
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.disable('x-powered-by')

app.use(json())

// app.get('/movies') // TODO

// app.get('/movies/:id') // TODO

// app.post('/movies') // TODO

// app.patch('/movies/:id') // TODO

// app.delete('/movies/:id') // TODO

app.use('/movies', moviesRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`listen on port http://localhost:${PORT}`)
})
```

4. Ya que estamos separamos la logica del cors, crea la carpeta middlewares y dentro de esta el archivo `cors.js`:
```js
import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'https://movies.com',
  'https://midu.dev'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})
```

5. quedando el app.js de esta manera:
```js
import express, { json } from 'express'
import { moviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

const app = express()

app.disable('x-powered-by')

// middleware del cors
app.use(corsMiddleware())

// middleware del json
app.use(json())

app.use('/movies', moviesRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`listen on port http://localhost:${PORT}`)
})
```

6. Se crean las carpetas controllers, models y views
7. Dentro de `models` se crea el modelo para pelicula, `movie.js` y se le pasa la logica de las `routes/movies.js`:
```js
// /models/movie.js
import { importJSON } from '../utils.js'
import { randomUUID } from 'node:crypto'

const movies = importJSON('./movies.json')

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      return movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
    }

    return movies
  }

  static async getById ({ id }) {
    const movie = movies.find(movie => movie.id === id)
    return movie
  }

  static async create (input) {
    const newMovie = {
      id: randomUUID(),
      ...input
    }

    movies.push(newMovie)

    return newMovie
  }

  static async delete ({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) return false

    movies.splice(movieIndex, 1)
    return true
  }

  static async update ({ id, input }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) return false

    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input
    }

    return movies[movieIndex]
  }
}
```

---

```js
// /routes/movies.js
import { Router } from 'express'
import { validateMovie, validatePartialMovie } from '../schemas/moviesSchema.js'
import { MovieModel } from '../models/move.js'

export const moviesRouter = Router()

// GET movies
moviesRouter.get('/', async (req, res) => {
  const { genre } = req.query
  const movies = await MovieModel.getAll({ genre })
  res.json(movies)
})

// GET movie by ID
moviesRouter.get('/:id', async (req, res) => {
  const { id } = req.params
  const movie = await MovieModel.getById({ id })
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

// POST movie
moviesRouter.post('/', async (req, res) => {
  const result = validateMovie(req.body)

  // alternativa: if(!result.success)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = await MovieModel.create({ input: result.data })

  res.status(201).json(newMovie)
})

// PATCH movie by ID
moviesRouter.patch('/:id', async (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params

  const updatedMovie = await MovieModel.update({ id, input: result.data })

  return res.json(updatedMovie)
})

// DELETE movie by ID
moviesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const state = await MovieModel.delete({ id })

  if (!state) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  return res.json({ message: 'Movie deleted' })
})
```

8. Se simplifica aun más la logica, en controllers crea `movies.js` y se le agregara la logica de `/routes/movies.js`:
```js
// /controllers/movies.js
import { MovieModel } from '../models/movie.js'
import { validateMovie, validatePartialMovie } from '../schemas/moviesSchema.js'

export class MovieController {
  static async getAll (req, res) {
    const { genre } = req.query
    const movies = await MovieModel.getAll({ genre })
    res.json(movies)
  }

  static async getById (req, res) {
    const { id } = req.params
    const movie = await MovieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
  }

  static async create (req, res) {
    const result = validateMovie(req.body)

    // alternativa: if(!result.success)
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = await MovieModel.create({ input: result.data })

    res.status(201).json(newMovie)
  }

  static async delete (req, res) {
    const { id } = req.params
    const state = await MovieModel.delete({ id })

    if (!state) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    return res.json({ message: 'Movie deleted' })
  }

  static async edit (req, res) {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updatedMovie = await MovieModel.update({ id, input: result.data })

    return res.json(updatedMovie)
  }
}
```

---

```js
// /routes/movies.js
import { Router } from 'express'
import { MovieController } from '../controllers/movies.js'

export const moviesRouter = Router()

// GET movies
moviesRouter.get('/', MovieController.getAll)

// GET movie by ID
moviesRouter.get('/:id', MovieController.getById)

// POST movie
moviesRouter.post('/', MovieController.create)

// DELETE movie by ID
moviesRouter.delete('/:id', MovieController.delete)

// PATCH movie by ID
moviesRouter.patch('/:id', MovieController.edit)
```

9. hacemos commit de todos los cambios hasta el momento (y después de comprobar que todo esta en orden)
10. Se agrega en models la carpeta `local-file-system`, mueve ahi el archivo de movies.js y tambien crea la carpeta mysql