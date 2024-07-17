import * as dotenv from 'dotenv'

dotenv.config()

const BASE_URL =
	process.env.NODE === 'development'
		? 'http://localhost:3000'
		: 'lotsofstuff.vercel.com'

const MONGO_USERNAME = process.env.MONGO_USERNAME || ''
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ''

export const MONGO_URI = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@ac-kwlr9yf-shard-00-00.wpymslr.mongodb.net:27017,ac-kwlr9yf-shard-00-01.wpymslr.mongodb.net:27017,ac-kwlr9yf-shard-00-02.wpymslr.mongodb.net:27017/?ssl=true&replicaSet=atlas-dl9fwt-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`

const SERVER_PORT = process.env.SERVER_PORT
	? Number(process.env.SERVER_PORT)
	: 1337

const config = {
	db: { uri: MONGO_URI },
	server: { port: SERVER_PORT },
	MONGO_URI,
	BASE_URL,
}

export default config
