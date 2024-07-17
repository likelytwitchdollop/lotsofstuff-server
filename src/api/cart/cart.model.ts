import * as z from 'zod'
import { WithId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'
import { ObjectIdString } from 'interfaces/ParamsWithId'
import * as constants from './cart.constants'

const CartItem = z.object({
	price: z.number().positive(),
	quantity: z.number().positive(),
})

export const CartItemWithObjectId = CartItem.extend({
	productId: z.instanceof(Schema.Types.ObjectId),
})

export const CartItemWithStringId = CartItem.extend({
	productId: ObjectIdString,
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type CartItemWithStringId = z.infer<typeof CartItemWithStringId>

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type CartItemWithObjectId = z.infer<typeof CartItemWithObjectId>

export const Cart = z.object({
	userId: ObjectIdString,
	items: z.array(CartItemWithObjectId).min(1),
	totalItems: z.number().min(1),
	totalCost: z.number().min(1),
	expiresOn: z.date(),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Cart = z.infer<typeof Cart>
export type CartWithId = WithId<Cart>

export const CartItemSchemaProperties = {
	productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
	quantity: { type: Number, required: true },
	price: { type: Number, required: true },
}

const CartItemSchema = new Schema(CartItemSchemaProperties, { _id: false })
CartItemSchema.virtual('product', {
	ref: 'Product',
	localField: 'productId',
	foreignField: '_id',
})

const CartSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		items: { type: [CartItemSchema], required: true },
		totalItems: { type: Number, required: true },
		totalCost: { type: Number, required: true },
		expiresOn: {
			type: Date,
			required: true,
			index: { expires: constants.CART_LIFETIME_IN_SECONDS },
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

const Carts = mongoose.model<Cart>('Cart', CartSchema, 'Carts')

export default Carts
