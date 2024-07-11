import express from 'express'
import http from 'http'
import HttpStatusCode from 'lib/HttpStatusCode'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from 'config/config'
import Logging from 'lib/Logging'

const router = express()

const startServer = () => {
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
	router.use(cors())

	// router.use(routes)

	router.get('/ping', (_, res) => {
		res.status(HttpStatusCode.OK).json({
			success: true,
		})
	})

	router.use((_, res) => {
		const error = new Error('Not found.')
		Logging.error(error)

		return res.status(HttpStatusCode.NOT_FOUND).json({ message: error.message })
	})

	http.createServer(router).listen(config.server.port, () => {
		Logging.log(`Server is running on port ${config.server.port}.`)

		// Check if is in DEVELOPMENT_MODE.
		console.log('process.env.NODE_ENV: ', process.env.NODE_ENV)
	})
}

startServer()
