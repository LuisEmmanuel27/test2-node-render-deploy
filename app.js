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
