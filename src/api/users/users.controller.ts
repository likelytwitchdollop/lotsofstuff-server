/* For testing purposes. */

import { NextFunction, Request, Response } from 'express'
import HttpStatusCode from 'lib/HttpStatusCode'
import { ParamsWithId } from 'interfaces/ParamsWithId'
import mongoose from 'mongoose'
import Orders from 'api/orders/orders.model'
import Users, { User, UserWithId } from './users.model'

export const getAllUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const users = await Users.find()
		return res.status(HttpStatusCode.OK).json(users)
	} catch (error) {
		return next(error)
	}
}

export const getUser = async (
	req: Request<ParamsWithId>,
	res: Response<UserWithId>,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const user = await Users.findById(id)

		if (!user) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No user with id: ${id}`)
		}

		return res.status(HttpStatusCode.OK).json(user)
	} catch (error) {
		return next(error)
	}
}

export const createUser = async (
	req: Request<{}, UserWithId, User>,
	res: Response<UserWithId>,
	next: NextFunction
) => {
	try {
		const user = req.body

		const newUser = new Users({
			_id: new mongoose.Types.ObjectId(),
			...user,
		})

		await newUser.save()
		return res.status(HttpStatusCode.CREATED).json(newUser)
	} catch (error) {
		return next(error)
	}
}

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const result = await Users.findByIdAndDelete(id)

		if (!result) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No user with id: ${id}`)
		}

		return res.status(HttpStatusCode.OK).json(result)
	} catch (error) {
		return next(error)
	}
}

export const getOrders = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		// A user could be deleted so their record will not be found, but the orders they created may still be available for historical data for analysis.
		/*
      const user = await Users.findById(id)

      if (!user) {
        res.status(HttpStatusCode.NOT_FOUND)
        throw new Error(`No user with id: ${id}`)
      }
    */

		const orders = await Orders.find({ userId: id })
		return res.status(HttpStatusCode.OK).json(orders)
	} catch (error) {
		return next(error)
	}
}
