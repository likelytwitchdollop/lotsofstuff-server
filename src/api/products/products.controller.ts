import mongoose, { PipelineStage } from 'mongoose'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCode from 'lib/HttpStatusCode'
import { ParamsWithId } from 'interfaces/ParamsWithId'
import * as types from './products.types'
import Products, { Product, ProductWithId } from './products.model'
import * as constants from './products.constants'
import * as helpers from './products.helpers'

const DOCUMENTS_PER_PAGE = 2

export const searchProducts = async (
	req: Request<{}, ProductWithId[], {}, types.SearchProductsQueryParams>,
	res: Response<types.SearchProductsReponse>,
	next: NextFunction
) => {
	try {
		const {
			search,
			category,
			subCategory,
			brand,
			sortBy,
			currentPage = 0,
			minPrice,
			maxPrice,
		} = req.query

		const pipeline: PipelineStage[] = []

		if (search) {
			pipeline.push({
				$match: { $text: { $search: search ? search.trim() : '' } },
			})
		}

		// Exclude all products which belong to the home category. Difference in product size images is causing an issue with the carousel.
		pipeline.push({ $match: { category: { $ne: 'home' } } })

		/* Filter products */
		helpers.filterBy(pipeline, 'category', category)
		helpers.filterBy(pipeline, 'subCategory', subCategory)
		helpers.filterBy(pipeline, 'brand', brand)

		/* Filter products by price range */
		if (minPrice && parseInt(minPrice, 10)) {
			pipeline.push({ $match: { price: { $gte: parseInt(minPrice, 10) } } })
		}

		if (maxPrice && parseInt(maxPrice, 10)) {
			pipeline.push({ $match: { price: { $lte: parseInt(maxPrice, 10) } } })
		}

		/* Sort products. */
		if (search) {
			pipeline.push({ $addFields: { score: { $meta: 'textScore' } } })

			if (!sortBy || sortBy === 'relevance') {
				pipeline.push({ $sort: { score: -1 } })
			}
		}

		if (sortBy === 'price-ascending') {
			pipeline.push({ $sort: { price: 1 } })
		}

		if (sortBy === 'price-descending') {
			pipeline.push({ $sort: { price: -1 } })
		}

		/* Count products found. */
		const totalProducts =
			(await Products.aggregate(pipeline).count('id'))?.[0]?.id || 0
		// eslint-disable-next-line no-nested-ternary
		const totalProductsSeen = totalProducts
			? currentPage
				? DOCUMENTS_PER_PAGE * (Number(currentPage) + 1)
				: DOCUMENTS_PER_PAGE
			: 0

		const hasMore = totalProducts > totalProductsSeen

		/* Paginate response using $skip and $limit. Large datasets (possibly ~150 000 and above) would experience a performance hit because of how $skip works. Sorting by some value (like _id) helps as MongoDB does not have to make a temporary index to sort data by first. Using this approach would require monitoring perfomance of the applicaton as the product catalogue grows. */
		if (currentPage) {
			pipeline.push({ $skip: DOCUMENTS_PER_PAGE * Number(currentPage) })
		}

		pipeline.push({ $limit: DOCUMENTS_PER_PAGE })

		const products = await Products.aggregate(pipeline)

		return res.status(HttpStatusCode.OK).json({
			count: totalProducts,
			totalProductsSeen,
			data: products,
			nextCursor: hasMore ? Number(currentPage) + 1 : undefined,
			hasMore,
		})
	} catch (error) {
		return next(error)
	}
}

export const getMaximumPrice = async (
	req: Request<{}, number, types.GetMaximumPriceQueryParams>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { category } = req.query

		// Using an aggregation pipeline.
		// This approach benefits from the $sort + $limit coalescence which allows the sort operation to only maintain the top n results as it progresses, where n is the specified limit, and MongoDB only needs to store n items in memory. This may provide better performance and scalability as your product catalog grows.
		const pipeline: PipelineStage[] = []

		if (category) {
			pipeline.push({ $match: { category } })
		}

		pipeline.push({ $group: { _id: null, maxPrice: { $max: '$price' } } })

		const result = await Products.aggregate(pipeline)

		return res
			.status(HttpStatusCode.OK)
			.json(result.length > 0 ? result[0].maxPrice : null)

		// Using sort.limit.
		// This approach might be slightly faster, especially for smaller datasets.
		/*
      const productWthMaximumPrice = await Products.find({})
        .select({ price: 1 })
        .sort({ price: -1 })
        .limit(1)

      return productWthMaximumPrice.length > 0 ? productWthMaximumPrice[0].price : null
    */
	} catch (error) {
		return next(error)
	}
}

export const getProductById = async (
	req: Request,
	res: Response<Product>,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const product = await Products.findById(id)

		if (!product) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No product with id: ${id}`)
		}

		return res.status(HttpStatusCode.OK).json(product)
	} catch (error) {
		return next(error)
	}
}

export const getProductBySlug = async (
	req: Request,
	res: Response<Product>,
	next: NextFunction
) => {
	try {
		const { slug } = req.params

		const product = await Products.findOne({ slug })

		if (!product) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No product with slug: ${slug}`)
		}

		return res.status(HttpStatusCode.OK).json(product)
	} catch (error) {
		return next(error)
	}
}

export const getProducts = async (
	req: Request<{}, ProductWithId[], {}, types.GetProductsQueryParams>,
	res: Response<types.GetProductsResponse>,
	next: NextFunction
) => {
	try {
		const { currentPage = 0 } = req.query

		const pipeline: PipelineStage[] = []

		const totalProducts =
			(await Products.aggregate(pipeline).count('id'))?.[0]?.id || 0
		// eslint-disable-next-line no-nested-ternary
		const totalProductsSeen = totalProducts
			? currentPage
				? DOCUMENTS_PER_PAGE * (Number(currentPage) + 1)
				: DOCUMENTS_PER_PAGE
			: 0

		const hasMore = totalProducts > totalProductsSeen

		if (currentPage) {
			pipeline.push({ $skip: DOCUMENTS_PER_PAGE * Number(currentPage) })
		}

		pipeline.push({ $limit: DOCUMENTS_PER_PAGE })

		const products = await Products.aggregate(pipeline)

		return res.status(HttpStatusCode.OK).json({
			count: totalProducts,
			totalProductsSeen,
			data: products,
			nextCursor: hasMore ? Number(currentPage) + 1 : undefined,
			hasMore,
		})
	} catch (error) {
		return next(error)
	}
}

export const getTrendingProducts = async (
	req: Request,
	res: Response<ProductWithId[]>,
	next: NextFunction
) => {
	try {
		const trendingProducts = constants.TRENDING_PRODUCTS.map(
			async (trendingProduct) => {
				const product = await Products.findById(trendingProduct.productId)

				if (!product) {
					res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
					throw new Error(
						`Could not find all trending products. No product with id: ${trendingProduct.productId}`
					)
				}
				return product
			}
		)

		const products = await Promise.all(trendingProducts)
		return res.status(HttpStatusCode.OK).json(products)
	} catch (error) {
		return next(error)
	}
}

export const createProduct = async (
	req: Request<{}, ProductWithId, Product>,
	res: Response<Product>,
	next: NextFunction
) => {
	try {
		const product = req.body

		const newProduct = new Products({
			id: new mongoose.Types.ObjectId(),
			...product,
		})

		await newProduct.save()

		return res.status(HttpStatusCode.CREATED).json(newProduct)
	} catch (error) {
		return next(error)
	}
}

export const updateProduct = async (
	req: Request<ParamsWithId, ProductWithId, Product>,
	res: Response<Product>,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const product = req.body

		const newProduct = await Products.findByIdAndUpdate(id, product, {
			new: true,
		})

		if (newProduct) {
			return res.status(HttpStatusCode.OK).json(newProduct)
		}

		res.status(HttpStatusCode.NOT_FOUND)
		throw new Error(`No product with id: ${id}`)
	} catch (error) {
		return next(error)
	}
}

export const deleteProduct = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const result = await Products.findOneAndDelete({ _id: id })

		if (result) {
			return res.status(HttpStatusCode.OK).json({ success: true })
		}

		res.status(HttpStatusCode.NOT_FOUND)
		throw new Error(`No product with id: ${id}`)
	} catch (error) {
		return next(error)
	}
}

/* Stock related methods. */
export const getProductStock = async (
	req: Request<ParamsWithId>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const product = await Products.findById(id)

		if (!product) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No product with id: ${id}`)
		}

		return res
			.status(HttpStatusCode.OK)
			.json({ productId: id, stock: product.quantity })
	} catch (error) {
		return next(error)
	}
}

export const getAllProductsStock = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const products = await Products.find()

		const productStock = products.map((product) => ({
			productId: product.id,
			stock: product.quantity,
		}))

		return res.status(HttpStatusCode.OK).json(productStock)
	} catch (error) {
		return next(error)
	}
}

export const getAllProductsOutOfStock = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const products = await Products.find({ quantity: { $eq: 0 } })

		const productStock = products.map((product) => ({
			productId: product.id,
			stock: product.quantity,
		}))

		return res.status(HttpStatusCode.OK).json(productStock)
	} catch (error) {
		return next(error)
	}
}

export const increaseProductStock = async (
	req: Request<ParamsWithId, ProductWithId, { quantity: number }>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { quantity } = req.body

		const product = await Products.findById(id)

		if (!product) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No product with id: ${id}`)
		}

		product.quantity += quantity
		await product.save()

		return res.status(HttpStatusCode.OK).json(product)
	} catch (error) {
		return next(error)
	}
}

export const decreaseProductStock = async (
	req: Request<ParamsWithId, ProductWithId, { quantity: number }>,
	res: Response<ProductWithId>,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { quantity } = req.body

		const product = await Products.findById(id)

		if (!product) {
			res.status(HttpStatusCode.NOT_FOUND)
			throw new Error(`No product with id: ${id}`)
		}

		if (quantity > product.quantity) {
			res.status(HttpStatusCode.UNPROCESSABLE_ENTITY)
			throw new Error(
				`Quantity (${quantity}) exceeds existing stock (${product.quantity})`
			)
		}

		product.quantity -= quantity
		await product.save()

		return res.status(HttpStatusCode.OK).json(product)
	} catch (error) {
		return next(error)
	}
}
