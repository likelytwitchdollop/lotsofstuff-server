import * as dotenv from 'dotenv'

dotenv.config()

const MONGO_USERNAME = process.env.MONGO_USERNAME || ''
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ''

export const MONGO_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.wpymslr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const SERVER_PORT = process.env.SERVER_PORT
	? Number(process.env.SERVER_PORT)
	: 1337

const config = {
	db: { uri: MONGO_URI },
	server: { port: SERVER_PORT },
	MONGO_URI,
}

export default config
