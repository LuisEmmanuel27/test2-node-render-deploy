import mysql from 'mysql2/promise'
import { createMovieQ, deleteMovieQ, getAllMoviesQ, getGenreByNameQ, getMovieByIdQ, getMoviesByGenreQ, updateMovieQ } from '../../queries/queries.js'

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
    const [movie] = await connection.query(getMovieByIdQ, id)

    if (movie.length === 0) return []

    return movie
  }

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
      throw new Error('Error to create movie')
    }

    const [movies] = await connection.query(`
      SELECT TITLE, YEAR, DIRECTOR, DURATION, POSTER, RATE, BIN_TO_UUID(ID) ID
      FROM movie WHERE id = UUID_TO_BIN(?);`,
    [uuid]
    )

    return movies[0]
  }

  static async delete ({ id }) {
    try {
      await connection.query(deleteMovieQ, id)
      return [{ message: 'movie deleted' }]
    } catch (e) {
      throw new Error('Error on delete')
    }
  }

  static async update ({ id, input }) {
    const movie = this.getById({ id })

    if (movie.length === 0) return []

    const { title, year, director, duration, poster, rate } = input

    try {
      await connection.query(updateMovieQ, [
        title || null,
        year || null,
        director || null,
        duration || null,
        poster || null,
        rate || null,
        id
      ])
    } catch (e) {
      throw new Error('Error on edit')
    }
  }
}
