import { NextFunction, Request, Response } from 'express'
import HttpStatusCode from 'lib/HttpStatusCode'
import mongoose from 'mongoose'
import { ParamsWithId } from 'interfaces/ParamsWithId'
import Orders, { OrderStatus, OrderWithId } from './orders.model'

export const getAllOrders = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { status } = req.query

		if (status) {
			const orders = await Orders.find({ status })
			return res.status(HttpStatusCode.OK).json(orders)
		}

		const orders = await Orders.find()
		return res.status(HttpStatusCode.OK).json(orders)
	} catch (error) {
		return next(error)
	}
}

export const getOrder = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const order = await Orders.findById(id).populate({
			path: 'items',
			populate: {
				path: 'product',
				select: 'productName brand price images slug',
			},
		})

		if (!order) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No order with id: ${id}`)
		}

		return res.status(HttpStatusCode.OK).json(order)
	} catch (error) {
		return next(error)
	}
}

export const createOrder = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const order = req.body

		const newOrder = new Orders({
			_id: new mongoose.Types.ObjectId(),
			...order,
			status: 'processingPayment',
		} as OrderWithId)

		await newOrder.save()

		return res.status(HttpStatusCode.CREATED).json(newOrder)
	} catch (error) {
		return next(error)
	}
}

export const updateOrderStatus = async (
	req: Request<ParamsWithId, OrderWithId, { status: OrderStatus }>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { status } = req.body

		const order = await Orders.findByIdAndUpdate(id, { status }, { new: true })

		if (!order) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No order with id: ${id}`)
		}

		return res.status(HttpStatusCode.OK).json(order)
	} catch (error) {
		return next(error)
	}
}
