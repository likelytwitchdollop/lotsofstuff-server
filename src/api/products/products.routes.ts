import * as z from 'zod'
import { Router } from 'express'
import { validateRequest } from 'middleware/middleware'
import { ParamsWithId } from 'interfaces/ParamsWithId'
import * as productsController from './products.controller'
import * as types from './products.types'
import { Product } from './products.model'

const router = Router()

// GET.
router.get('/slug/:slug', productsController.getProductBySlug)
router.get(
	'/search',
	validateRequest({
		query: types.SearchProductsQueryParams,
	}),
	productsController.searchProducts
)
router.get('/trending', productsController.getTrendingProducts)
router.get('/stock', productsController.getAllProductsStock)
router.get('/out-of-stock', productsController.getAllProductsOutOfStock)
router.get(
	'/max-price',
	validateRequest({ query: types.GetMaximumPriceQueryParams }),
	productsController.getMaximumPrice
)
router.get(
	'/:id/stock',
	validateRequest({ params: ParamsWithId }),
	productsController.getProductStock
)
router.get(
	'/:id',
	validateRequest({ params: ParamsWithId }),
	productsController.getProductById
)
router.get(
	'/',
	validateRequest({ query: types.GetProductsQueryParams }),
	productsController.getProducts
)

// POST.
router.post(
	'/:id/increase-stock',
	validateRequest({
		params: ParamsWithId,
		body: z.object({ quantity: z.number().positive() }),
	}),
	productsController.increaseProductStock
)
router.post(
	'/:id/decrease-stock',
	validateRequest({
		params: ParamsWithId,
		body: z.object({ quantity: z.number().positive() }),
	}),
	productsController.decreaseProductStock
)
router.post(
	'/',
	validateRequest({ body: Product }),
	productsController.createProduct
)

// PUT.
router.put(
	'/:id',
	validateRequest({ params: ParamsWithId, body: Product }),
	productsController.updateProduct
)

// DELETE.
router.delete(
	'/:id',
	validateRequest({ params: ParamsWithId }),
	productsController.deleteProduct
)

export default router
