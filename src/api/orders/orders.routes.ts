import * as z from 'zod'
import { Router } from 'express'
import { validateRequest } from 'middleware/middleware'
import { ParamsWithId } from 'interfaces/ParamsWithId'
import * as ordersController from './orders.controller'
import { Order, OrderStatus } from './orders.model'

const router = Router()

// GET.
router.get(
	'/:id',
	validateRequest({ params: ParamsWithId }),
	ordersController.getOrder
)
router.get(
	'/',
	validateRequest({ query: z.object({ status: OrderStatus.optional() }) }),
	ordersController.getAllOrders
)

// POST.
router.post('/', validateRequest({ body: Order }), ordersController.createOrder)

// PATCH.
router.patch(
	'/:id/status',
	validateRequest({
		params: ParamsWithId,
		body: z.object({ status: OrderStatus }),
	}),
	ordersController.updateOrderStatus
)

export default router
