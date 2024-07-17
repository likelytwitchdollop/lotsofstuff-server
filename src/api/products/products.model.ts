import { WithId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'
import * as z from 'zod'

export const ProductCategory = z.enum(['fashion', 'beauty', 'home'])

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ProductCategory = z.infer<typeof ProductCategory>

export const Product = z.object({
	productName: z.string().min(1),
	brand: z.string().min(1),
	description: z.string().min(1),
	category: ProductCategory,
	subCategory: z.string().min(1),
	productType: z.string().optional(),
	price: z.number().min(1),
	quantity: z.number().default(0),
	images: z.array(
		z.object({ url: z.string().url(), tag: z.string().optional() })
	),
	slug: z.string().min(1),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Product = z.infer<typeof Product>
export type ProductWithId = WithId<Product>

const ImageSchema = {
	url: { type: String, required: true },
	tag: { type: String },
}

const ProductSchema: Schema = new Schema<Product>(
	{
		productName: { type: String, required: true },
		brand: { type: String, required: true },
		description: { type: String, required: true },
		category: { type: String, required: true },
		subCategory: { type: String, required: true },
		productType: { type: String },
		price: { type: Number, required: true, index: true }, // Add index on price to further improve perfomance of getMaximumPrice() controller method.
		quantity: { type: Number, required: true },
		images: { type: [ImageSchema], required: true, _id: false },
		slug: { type: String, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const Products = mongoose.model<Product>('Product', ProductSchema, 'Products')

export default Products
