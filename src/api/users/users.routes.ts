import { Router } from 'express'

import { validateRequest } from 'middleware/middleware'
import { ParamsWithId } from 'interfaces/ParamsWithId'
import * as usersController from './users.controller'
import { User } from './users.model'

const router = Router()

// GET.
router.get(
	'/:id/orders',
	validateRequest({ params: ParamsWithId }),
	usersController.getOrders
)
router.get(
	'/:id',
	validateRequest({ params: ParamsWithId }),
	usersController.getUser
)
router.get('/', usersController.getAllUsers)

// POST.
router.post('/', validateRequest({ body: User }), usersController.createUser)

// DELETE.
router.delete(
	'/:id',
	validateRequest({ params: ParamsWithId }),
	usersController.deleteUser
)

export default router
