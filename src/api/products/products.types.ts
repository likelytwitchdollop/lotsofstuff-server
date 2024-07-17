import * as z from 'zod'
import { ProductCategory, ProductWithId } from './products.model'

export const SortBy = z.enum([
	'relevance',
	'price-ascending',
	'price-descending',
])

export const NumberAsStrng = z
	.string()
	.refine((str) => !Number.isNaN(Number(str)))

export const SearchProductsQueryParams = z.object({
	search: z.string().optional(),
	category: ProductCategory.optional(),
	subCategory: z.string().optional(),
	brand: z.string().optional(),
	sortBy: SortBy.optional(),
	minPrice: NumberAsStrng.optional(),
	maxPrice: NumberAsStrng.optional(),
	currentPage: NumberAsStrng.optional(),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type SearchProductsQueryParams = z.infer<
	typeof SearchProductsQueryParams
>

type PaginatedRequestResponse<T> = {
	count: number
	totalProductsSeen: number
	data: T[]
	nextCursor: number | undefined
	hasMore: boolean
}

export type SearchProductsReponse = PaginatedRequestResponse<ProductWithId>

export const GetMaximumPriceQueryParams = z.object({
	category: ProductCategory.optional(),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GetMaximumPriceQueryParams = z.infer<
	typeof GetMaximumPriceQueryParams
>

export const GetProductsQueryParams = z.object({
	currentPage: NumberAsStrng.optional(),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GetProductsQueryParams = z.infer<typeof GetProductsQueryParams>

export type GetProductsResponse = PaginatedRequestResponse<ProductWithId>
