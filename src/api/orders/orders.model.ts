import {
	CartItemSchemaProperties,
	CartItemWithStringId,
} from 'api/cart/cart.model'
import { ObjectIdString } from 'interfaces/ParamsWithId'
import { WithId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'
import * as z from 'zod'

export const OrderStatus = z.enum([
	'processingPayment',
	'processingOrder',
	'shipped',
	'orderReceived',
	'cancelled',
])

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type OrderStatus = z.infer<typeof OrderStatus>

export const OrderPaymentMethod = z.enum(['card', 'thirdPartyGateway'])

export const OrderItem = CartItemWithStringId.extend({
	returned: z.boolean().optional(),
})

export const Order = z.object({
	userId: ObjectIdString,
	items: z.array(OrderItem).min(1),
	totalItems: z.number().min(1),
	totalCost: z.number().min(1),
	status: OrderStatus.default('processingPayment'),
	paymentMethod: OrderPaymentMethod,
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Order = z.infer<typeof Order>
export type OrderWithId = WithId<Order>

const OrderItemSchemaProperties = {
	...CartItemSchemaProperties,
	required: { type: Boolean },
}

const OrderItemSchema = new Schema(OrderItemSchemaProperties, { _id: false })
OrderItemSchema.virtual('product', {
	ref: 'Product',
	localField: 'productId',
	foreignField: '_id',
})

const OrderSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
		items: { type: [OrderItemSchema], required: true },
		totalItems: { type: Number, required: true },
		totalCost: { type: Number, required: true },
		status: { type: String },
		paymentMethod: { type: String, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const Orders = mongoose.model<Order>('Order', OrderSchema, 'Orders')

export default Orders
