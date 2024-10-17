`Se retoma lo realizado en el proyecto pasado - 4`

1. En la carpeta /models/mysql crea el archivo `movie.js`
2. En MySQL crea una nueva BD de nombre `movies_database`
3. Creamos la tabla movies basados en el json de movies
```sql
CREATE TABLE MOVIE(
  ID BINARY(16) NOT NULL PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())) COMMENT 'Primary Key',
  TITLE VARCHAR(255) NOT NULL,
  YEAR INT NOT NULL,
  DIRECTOR VARCHAR(255) NOT NULL,
  DURATION INT NOT NULL,
  POSTER TEXT,
  RATE DECIMAL(2, 1) UNSIGNED NOT NULL
);

CREATE TABLE GENRE(
  ID INT AUTO_INCREMENT PRIMARY KEY,
  NAME VARCHAR(255) NOT NULL UNIQUE
);

-- relacion entre peliculas y generos
CREATE TABLE MOVIE_GENRE(
  MOVIE_ID BINARY(16) REFERENCES MOVIE(ID),
  GENRE_ID INT REFERENCES GENRE(ID),
  PRIMARY KEY (MOVIE_ID, GENRE_ID)
);

-- agregando info al MOVIE_GENRE
INSERT INTO GENRE (
  NAME
) VALUES (
  'Drama'
),
(
  'Action'
),
(
  'Crime'
),
(
  'Adventure'
),
(
  'Sci-Fi'
),
(
  'Romance'
),
(
  'Biography'
),
(
  'Fantasy'
),
(
  'Animation'
);

-- agregando un par de peliculas
INSERT INTO MOVIE (
  ID,
  TITLE,
  YEAR,
  DIRECTOR,
  DURATION,
  POSTER,
  RATE
) VALUES (
  UUID_TO_BIN(UUID()),
  "Interstellar",
  2014,
  "Christopher Nolan",
  169,
  "https://m.media-amazon.com/images/I/91obuWzA3XL._AC_UF1000,1000_QL80_.jpg",
  8.6
),
(
  UUID_TO_BIN(UUID()),
  "The Shawshank Redemption",
  1994,
  "Frank Darabont",
  142,
  "https://i.ebayimg.com/images/g/4goAAOSwMyBe7hnQ/s-l1200.webp",
  9.3
),
(
  UUID_TO_BIN(UUID()),
  "The Dark Knight",
  2008,
  "Christopher Nolan",
  152,
  "https://i.ebayimg.com/images/g/yokAAOSw8w1YARbm/s-l1200.jpg",
  9.0
),
(
  UUID_TO_BIN(UUID()),
  "Inception",
  2010,
  "Christopher Nolan",
  148,
  "https://m.media-amazon.com/images/I/91Rc8cAmnAL._AC_UF1000,1000_QL80_.jpg",
  8.8
),
(
  UUID_TO_BIN(UUID()),
  "Pulp Fiction",
  1994,
  "Quentin Tarantino",
  154,
  "https://www.themoviedb.org/t/p/original/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
  8.9
);

-- agregando los generos de las peliculas
INSERT INTO MOVIE_GENRE(
  MOVIE_ID,
  GENRE_ID
) VALUES
 -- Interstellar
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Interstellar'),
  (SELECT ID FROM GENRE WHERE NAME = 'Adventure')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Interstellar'),
  (SELECT ID FROM GENRE WHERE NAME = 'Drama')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Interstellar'),
  (SELECT ID FROM GENRE WHERE NAME = 'Sci-Fi')
),
 -- The Shawshank Redemption
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'The Shawshank Redemption'),
  (SELECT ID FROM GENRE WHERE NAME = 'Drama')
),
 -- The Dark Knight
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'The Dark Knight'),
  (SELECT ID FROM GENRE WHERE NAME = 'Action')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'The Dark Knight'),
  (SELECT ID FROM GENRE WHERE NAME = 'Crime')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'The Dark Knight'),
  (SELECT ID FROM GENRE WHERE NAME = 'Drama')
),
 -- Inception
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Inception'),
  (SELECT ID FROM GENRE WHERE NAME = 'Action')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Inception'),
  (SELECT ID FROM GENRE WHERE NAME = 'Adventure')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Inception'),
  (SELECT ID FROM GENRE WHERE NAME = 'Sci-Fi')
),
 -- Pulp Fiction
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Pulp Fiction'),
  (SELECT ID FROM GENRE WHERE NAME = 'Crime')
),
(
  (SELECT ID FROM MOVIE WHERE TITLE = 'Pulp Fiction'),
  (SELECT ID FROM GENRE WHERE NAME = 'Drama')
);
```

4. De momento en /models/mysql/movie.js agregamos
```js
export class MovieModel {
  static async getAll ({ genre }) {

  }

  static async getById ({ id }) {

  }

  static async create (input) {

  }

  static async delete ({ id }) {

  }

  static async update ({ id, input }) {

  }
}
```

5. Instalamos la dependencia `npm install --save mysql2`
6. Modificaremos `/models/mysql/movie.js`:
```js
import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: 'Pantera09?',
  database: 'movies_database'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static async getAll ({ genre }) {
    // retorna las movies y la info de la tabla, se desestructura para solo tener las movies
    const [movies] = await connection.query(
      'SELECT *, BIN_TO_UUID(ID) ID, TITLE, YEAR, DIRECTOR, DURATION, POSTER, RATE FROM MOVIE;'
    )

    return movies
  }

  static async getById ({ id }) {

  }

  static async create (input) {

  }

  static async delete ({ id }) {

  }

  static async update ({ id, input }) {

  }
}
```

7. Modificamos el /controllers/movies.js
```js
// import { MovieModel } from '../models/local-file-system/movie.js'
import { MovieModel } from '../models/mysql/movie.js'
.
.
```

8. Probamos que todo este en orden
9. Modificamos el getAll:
```js
export class MovieModel {
  static async getAll ({ genre }) {
    // obtener peliculas por genero ?genre=GENRE
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()

      const [genres] = await connection.query(getGenreByNameQ, [lowerCaseGenre])

      if (genres.length === 0) return []

      const [{ ID }] = genres

      // obtener todas id de las peliculas, query a movie_genre, join y devolver el resultado
      const [movies] = await connection.query(getMoviesByGenreQ, [ID])

      return movies
    }

    // retorna las movies y la info de la tabla, se desestructura para solo tener las movies
    const [movies] = await connection.query(getAllMoviesQ)

    return movies
  }

  static async getById ({ id }) {

  }

  static async create (input) {

  }

  static async delete ({ id }) {

  }

  static async update ({ id, input }) {

  }
}
```

10. las queries estan en su propio archivo /queries/queries.js
11. recuperar pelicula por id:
```js
static async getById ({ id }) {
  const [movie] = await connection.query(getMovieByIdQ, id)

  if (movie.length === 0) return []

  return movie
}
```

12. la querie:
```sql
export const getMovieByIdQ = `
SELECT
  BIN_TO_UUID(M.ID) AS ID,
  M.TITLE,
  M.YEAR,
  M.DIRECTOR,
  M.DURATION,
  M.POSTER,
  M.RATE,
  GROUP_CONCAT(G.NAME ORDER BY G.NAME SEPARATOR ', ') AS GENRES
FROM
  MOVIE M
  LEFT JOIN MOVIE_GENRE MG ON M.ID = MG.MOVIE_ID
  LEFT JOIN GENRE G ON MG.GENRE_ID = G.ID
WHERE
  M.ID = UUID_TO_BIN(?)
GROUP BY
  M.ID;
`
```

13. crear una pelicula (falta los generos):
```js
  static async create ({ input }) {
    const {
      // eslint-disable-next-line no-unused-vars
      genre: genreInput,
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input

    const [uuiResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuiResult

    try {
      await connection.query(createMovieQ, [uuid, title, year, director, duration, poster, rate])
    } catch (e) {
      console.log(e)
    }

    const [movies] = await connection.query(`
      SELECT TITLE, YEAR, DIRECTOR, DURATION, POSTER, RATE, BIN_TO_UUID(ID) ID
      FROM movie WHERE id = UUID_TO_BIN(?);`,
    [uuid]
    )

    return movies[0]
  }
```

14. la querie:
```sql
export const createMovieQ = `
INSERT INTO MOVIE (
  ID,
  TITLE,
  YEAR,
  DIRECTOR,
  DURATION,
  POSTER,
  RATE
) VALUES(
  UUID_TO_BIN(?),
  ?,
  ?,
  ?,
  ?,
  ?,
  ?
);
`
```

15. se hace el delete y el update

# Inyeccion de dependencias
1. Modificamos primero el /controllers/movies.js:
```js
import { validateMovie, validatePartialMovie } from '../schemas/moviesSchema.js'

export class MovieController {
  constructor ({ movieModel }) {
    this.movieModel = movieModel
  }

  getAll = async (req, res) => {
    const { genre } = req.query
    const movies = await this.movieModel.getAll({ genre })
    res.json(movies)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const movie = await this.movieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
  }

  create = async (req, res) => {
    const result = validateMovie(req.body)

    // alternativa: if(!result.success)
    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = await this.movieModel.create({ input: result.data })

    res.status(201).json(newMovie)
  }

  delete = async (req, res) => {
    const { id } = req.params
    const state = await this.movieModel.delete({ id })

    if (!state) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    return res.json({ message: 'Movie deleted' })
  }

  edit = async (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updatedMovie = await this.movieModel.update({ id, input: result.data })

    return res.json(updatedMovie)
  }
}
```

2. Modificamos el /routes/movies.js
```js
import { Router } from 'express'
import { MovieController } from '../controllers/movies.js'

export const createMovieRouter = ({ movieModel }) => {
  const moviesRouter = Router()

  const movieController = new MovieController({ movieModel })

  // GET movies
  moviesRouter.get('/', movieController.getAll)

  // POST movie
  moviesRouter.post('/', movieController.create)

  // GET movie by ID
  moviesRouter.get('/:id', movieController.getById)

  // DELETE movie by ID
  moviesRouter.delete('/:id', movieController.delete)

  // PATCH movie by ID
  moviesRouter.patch('/:id', movieController.edit)

  return moviesRouter
}
```

3. Modificamos app.js
```js
import express, { json } from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'
import { MovieModel } from './models/mysql/movie.js'

const app = express()

app.disable('x-powered-by')

// middleware del cors
app.use(corsMiddleware())

// middleware del json
app.use(json())

app.use('/movies', createMovieRouter({ movieModel: MovieModel }))

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`listen on port http://localhost:${PORT}`)
})
```

4. Probamos que todo funcione
5. Se lleva más lejos esto, se modifica el app.js:
```js
import express, { json } from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({ movieModel }) => {
  const app = express()

  app.disable('x-powered-by')

  // middleware del cors
  app.use(corsMiddleware())

  // middleware del json
  app.use(json())

  app.use('/movies', createMovieRouter({ movieModel }))

  const PORT = process.env.PORT ?? 3000

  app.listen(PORT, () => {
    console.log(`listen on port http://localhost:${PORT}`)
  })
}
```

6. se crea en la raiz el archivo `server-with-mysql.js` y se agrega:
```js
import { createApp } from './app.js'
import { MovieModel } from './models/mysql/movie.js'

createApp({ movieModel: MovieModel })
```

7. se crea en la raiz el archivo `server-with-local.js` y se agrega:
```js
import { createApp } from './app.js'
import { MovieModel } from './models/local-file-system/movie.js'

createApp({ movieModel: MovieModel })
```

8. se modifica el package.json:
```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev:mysql": "node --watch server-with-mysql.js",
  "dev:local": "node --watch server-with-local.js",
  "start": "node app.js",
  "build": "npm install"
},
```

9. ahora solo desde la terminal y el comando correspondiente podemos cambiar entre usar mysql y el localhost
   1.  `npm run dev:mysql`
   2.  `npm run dev:local`