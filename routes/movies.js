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
