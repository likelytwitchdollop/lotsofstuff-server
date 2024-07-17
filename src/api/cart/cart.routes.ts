import * as z from 'zod'
import { Router } from 'express'
import { validateRequest } from 'middleware/middleware'
import { ObjectIdString } from 'interfaces/ParamsWithId'
import * as cartsController from './cart.controller'
import { CartItemWithStringId } from './cart.model'

const router = Router()

// GET.
router.get('/', cartsController.getCart)

// POST.
router.post(
	'/add-item',
	validateRequest({ body: CartItemWithStringId }),
	cartsController.addOrUpdateProductInCart
)
router.post(
	'/remove-item',
	validateRequest({ body: z.object({ productId: ObjectIdString }) }),
	cartsController.removeProductFromCart
)

export default router
