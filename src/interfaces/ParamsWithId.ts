import { ObjectId } from 'mongodb'
import * as z from 'zod'

export const ObjectIdString = z
	.string()
	.min(1)
	.refine(
		(value) => {
			try {
				return new ObjectId(value)
			} catch (error) {
				return false
			}
		},
		{ message: 'Invalid ObjectId' }
	)

export const ParamsWithId = z.object({
	id: ObjectIdString,
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ParamsWithId = z.infer<typeof ParamsWithId>
