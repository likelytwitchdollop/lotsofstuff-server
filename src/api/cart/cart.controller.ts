/*
  Opted to store cart data on the database instead of local storage ultimately because of potential future analytics performed on the e-commerce platform, namely to collect data on cart abandonment rates, product popularity and user journey tracking.
*/

import { NextFunction, Request, Response } from 'express'
import HttpStatusCode from 'lib/HttpStatusCode'
import mongoose from 'mongoose'
import Carts, { CartItemWithObjectId, CartItemWithStringId } from './cart.model'
import * as middleware from './cart.middleware'

export const getCart = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { cartId } = req.cookies

		if (!cartId) {
			const newCart = await middleware.getOrCreateCart(req, res)
			return res.status(HttpStatusCode.OK).json(newCart)
		}

		const cart = await Carts.findById(cartId).populate({
			path: 'items',
			populate: {
				path: 'product',
				select: 'productName brand price images slug',
			},
		})

		if (!cart) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No cart with id: ${cartId}`)
		}

		return res.status(HttpStatusCode.OK).json(cart)
	} catch (error) {
		return next(error)
	}
}

export const addOrUpdateProductInCart = async (
	req: Request<{}, CartItemWithStringId, CartItemWithStringId>,
	res: Response,
	next: NextFunction
) => {
	try {
		const cart = await middleware.getOrCreateCart(req, res)

		const item = req.body

		let itemIndex = -1

		const cartItemExists = cart.items.find((cartItem, index) => {
			if (cartItem.productId.toString() === item.productId) {
				itemIndex = index
				return cartItem
			}

			return false
		})

		const newCartItem = {
			...item,
			productId: new mongoose.Types.ObjectId(
				item.productId
			) as unknown as mongoose.Schema.Types.ObjectId,
		}

		if (cartItemExists && itemIndex >= 0) {
			// If the item already exists, replace it.
			cart.items[itemIndex] = newCartItem

			// Difference in total items.
			const quantityDiff = newCartItem.quantity - cartItemExists.quantity
			const costDiff = quantityDiff * cartItemExists.price
			cart.totalItems += quantityDiff
			cart.totalCost += costDiff
		} else {
			// If the item doesn't exist, add it.
			cart.items.push(newCartItem)

			cart.totalItems += item.quantity
			cart.totalCost += item.quantity * item.price
		}

		cart.markModified('items')
		await cart.save()

		// Return single cart item to reduce bandwidth usage.
		return res.status(HttpStatusCode.CREATED).json(item)
	} catch (error) {
		return next(error)
	}
}

export const removeProductFromCart = async (
	req: Request<{}, CartItemWithObjectId, { productId: string }>,
	res: Response,
	next: NextFunction
) => {
	try {
		const cart = await middleware.getCart(req, res)

		const { productId } = req.body
		let removedCartItem: CartItemWithObjectId | undefined

		const newCartItems = cart.items.filter((cartItem) => {
			if (cartItem.productId.toString() === productId) {
				removedCartItem = cartItem
				cart.totalItems -= cartItem.quantity
				cart.totalCost -= cartItem.quantity * cartItem.price
			}

			return cartItem.productId.toString() !== productId
		})

		cart.items = newCartItems
		cart.markModified('items')
		await cart.save()

		// Return single cart item to reduce bandwidth usage.
		return res.status(HttpStatusCode.CREATED).json(removedCartItem)
	} catch (error) {
		return next(error)
	}
}
