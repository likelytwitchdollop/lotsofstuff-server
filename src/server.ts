import express from 'express'
import HttpStatusCode from 'lib/HttpStatusCode'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import Logging from 'lib/Logging'

import * as middlewares from 'middleware/middleware'
import routes from 'api/routes'
import config from 'config/config'

const router = express()

// Start server: setup routes and logs.
router.use((req, res, next) => {
	const request = `Incoming -> Method: [${req.method}] - Url: [${req.url}] IP: [${req.socket.remoteAddress}]`

	Logging.log(request)

	res.on('finish', () => {
		const response = `Outgoing -> Method: [${req.method}] - Url: [${req.url}] IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`

		Logging.info(response, 'yellow')
	})

	next()
})

router.use(cookieParser())

router.use(express.urlencoded({ limit: '25mb', extended: true }))
router.use(express.json({ limit: '25mb' }))

const CORS_OPTIONS: CorsOptions = {
	origin: config.BASE_URL,
	credentials: true,
	optionsSuccessStatus: 200,
}

router.use(cors(CORS_OPTIONS))

// Main routes.
router.use('/api/v1', routes)

// Health check.
router.get('/ping', (_, res) => {
	res.status(HttpStatusCode.OK).json({
		success: true,
	})
})

// Middleware to handle errors.
router.use(middlewares.notFound)
router.use(middlewares.errorHandler)

export default router
