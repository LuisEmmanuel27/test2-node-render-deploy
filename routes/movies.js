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
