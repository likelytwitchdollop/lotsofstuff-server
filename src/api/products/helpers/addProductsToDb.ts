import fs from 'fs'
import request from 'request'

import mongoose from 'mongoose'
import config from 'config/config'
import Logging from 'lib/Logging'
import products from './Products.json'
import Products, { Product } from '../products.model'

const BRANDS = ['WE MAKE CUTE THINGS', 'we make cute things too']
const STOCK_LEVELS = [1000, 5, 500, 0, 25]

const getRandomBrand = (): string => {
	const randomIndex = Math.floor(Math.random() * BRANDS.length)
	return BRANDS[randomIndex]
}

const getRandomStockLevel = () => {
	const randomIndex = Math.floor(Math.random() * STOCK_LEVELS.length)
	return STOCK_LEVELS[randomIndex]
}

const createSlug = (product: Product): string => {
	let slug = ''

	slug = product.brand.split(' ').join('-')
	slug += `-${product.productName.split(' ').join('-')}`

	return slug.toLowerCase()
}

/* Add products to DB. */
const addProductsToDb = async () => {
	// eslint-disable-next-line no-restricted-syntax, no-unreachable-loop
	for await (const product of products) {
		const formattedProduct = { ...product } as unknown as Product

		formattedProduct.productName = product.productName.toLowerCase()
		formattedProduct.images = product.images.map((image) => ({ url: image }))
		formattedProduct.quantity = getRandomStockLevel()

		if (product.category === 'home') {
			formattedProduct.brand = 'Home + Decor'
		} else {
			formattedProduct.brand = getRandomBrand()
		}

		formattedProduct.slug = createSlug(formattedProduct)

		const newProduct = new Products({
			_id: new mongoose.Types.ObjectId(),
			...formattedProduct,
		})

		await newProduct.save()
	}

	// Not necessary. Just an eslint error.
	return {}
}

/* Download images for products and update urls. */
const downloadImage = (imageUrl: string, fileName: string) => {
	let success = false

	request(imageUrl)
		.pipe(fs.createWriteStream(fileName))
		.on('close', () => {
			success = true
			console.log('Image downloaded successfully!')
		})
		.on('error', (err) => {
			success = false
			console.error('Error downloading the image:', imageUrl, err)
		})

	return success
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const downloadProductImages = (
	productsWithId: (Product & { id: string })[]
) => {
	const failedToDownload = []

	const BASE_URL = 'C:/Users/cynth/Desktop/lots-of-stuff-resources/products/'
	const FILE_FORMAT = 'jpeg'

	productsWithId.forEach((product) => {
		product.images.forEach((image) => {
			const imageUrl = image.url
			const destination = `${BASE_URL}/${FILE_FORMAT}_${product.id}.${FILE_FORMAT}`

			const success = downloadImage(imageUrl, destination)

			if (!success) {
				failedToDownload.push({ productName: product.productName, imageUrl })
			}
		})
	})
}

// Run script: ts-node -r tsconfig-paths/register src/api/products/products.helpers.ts
mongoose
	.connect(config.db.uri)
	.then(() => {
		Logging.log('Connected to DB.')

		// Start script.
		addProductsToDb()

		// Stop script.
		return {}
		// downloadProductImages()
	})
	.catch((error) => {
		Logging.error('Unable to connect to DB: ')
		Logging.error(error)
	})
