import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import Logging from 'lib/Logging'
import HttpStatusCode from 'lib/HttpStatusCode'
import ErrorResponse from 'interfaces/ErrorResponse'
import RequestValidators from 'interfaces/RequestValidators'

export const validateRequest =
	(validators: RequestValidators) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (validators.params) {
				req.params = await validators.params.parseAsync(req.params)
			}

			if (validators.body) {
				req.body = await validators.body.parseAsync(req.body)
			}

			if (validators.query) {
				req.query = await validators.query.parseAsync(req.query)
			}

			next()
		} catch (error) {
			if (error instanceof ZodError) {
				const httpStatusCode = validators.params
					? HttpStatusCode.BAD_REQUEST
					: HttpStatusCode.UNPROCESSABLE_ENTITY

				res.status(httpStatusCode)
			}
			next(error)
		}
	}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
	const error = new Error(`Not found - ${req.originalUrl}`)
	Logging.error(error)

	res.status(HttpStatusCode.NOT_FOUND)
	next(error) // If the next function is called with an error object, the errorHandler middleware will be called.
}

export const errorHandler = (
	error: Error,
	req: Request,
	res: Response<ErrorResponse>
) => {
	if (error instanceof ZodError) {
		// Format zod error and set as message.
	}

	const statusCode =
		res.statusCode !== HttpStatusCode.OK
			? res.statusCode
			: HttpStatusCode.INTERNAL_SERVER_ERROR

	res.status(statusCode)
	res.json({
		message: error.message,
		stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
	})
}
