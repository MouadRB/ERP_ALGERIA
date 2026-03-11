import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/env.js'
import { loggerMiddleware } from './middleware/logger.middleware.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import { indexRouter } from './routes/index.routes.js'
const app = express()
app.use(helmet())
app.use(cors({ origin: config.frontendUrl, credentials: true }))
app.use(express.json())
app.use(loggerMiddleware)
app.get('/health', (_, res) => res.json({ status: 'ok', mode: config.useMock ? 'MOCK' : 'REAL' }))
app.use('/bff', indexRouter)
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use(errorHandler)
app.listen(config.port, () => console.log(`\n🚀 FERZA BFF :${config.port} | ${config.useMock ? '🟡 MOCK' : '🟢 REAL'}\n`))
