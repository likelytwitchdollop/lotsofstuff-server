import { Request, Response } from 'express'
import mongoose from 'mongoose'
import HttpStatusCode from 'lib/HttpStatusCode'
import Carts from './cart.model'
import * as constants from './cart.constants'

export const getCart = async (req: Request, res: Response) => {
	// eslint-disable-next-line no-useless-catch
	try {
		const { cartId } = req.cookies

		if (!cartId) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No cartId: ${cartId}`)
		}

		const cart = await Carts.findById(cartId)

		if (!cart) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No cart with id: ${cartId}`)
		}

		return cart
	} catch (error) {
		// There's nothing meaningful to do with the error, so re-throw.
		throw error
	}
}

export const getOrCreateCart = async (req: Request, res: Response) => {
	// eslint-disable-next-line no-useless-catch
	try {
		const { cartId } = req.cookies
		const expiresOn = new Date(
			Date.now() + constants.CART_LIFETIME_IN_MILLISECONDS
		)

		// If there is an existing cart, update expiry if needed.
		if (cartId) {
			const cart = await Carts.findById(cartId)

			if (cart) {
				// If the cart is expired, it will no longer exist because there is a cron job running remove expired carts.
				if (cart.expiresOn < new Date()) {
					await cart.updateOne({ expiresOn })
					await cart.save()
				}

				return cart
			}
		}

		// If there is no existing cart, create a new cart.
		const newCartId = new mongoose.Types.ObjectId()

		const newCart = new Carts({
			_id: newCartId,
			items: [],
			totalItems: 0,
			totalCost: 0,
			expiresOn,
		})

		await newCart.save()

		res.cookie('cartId', newCartId.toString(), {
			httpOnly: true,
			secure: true,
			expires: expiresOn,
		})

		return newCart
	} catch (error) {
		// There's nothing meaningful to do with the error, so re-throw.
		throw error
	}
}
