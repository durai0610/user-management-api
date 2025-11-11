import express from 'express'
import morgan from 'morgan'
import userRoutes from './routes/userRoutes.js'
import { initDB } from './db/db.js'
import { logger } from './utils/logger.js'

const app = express()
app.use(express.json())
app.use(morgan('combined'))
app.use('/', userRoutes)

app.use((err, req, res, next) => {
  logger.error(err.stack || err.toString())
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 3000
initDB()
  .then(() => {
    app.listen(PORT, () => console.log('✅ Database initialized\n🚀 Server running on port', PORT))
  })
  .catch((err) => {
    console.error('DB init failed', err)
    process.exit(1)
  })
