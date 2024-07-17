import { WithId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'
import * as z from 'zod'

export const User = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type User = z.infer<typeof User>
export type UserWithId = WithId<User>

const UserSchema = new Schema<User>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
)

const Users = mongoose.model<User>('User', UserSchema, 'Users')

export default Users
