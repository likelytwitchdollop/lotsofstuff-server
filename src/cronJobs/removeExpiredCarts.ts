import cron from 'node-cron'
import Carts from 'api/cart/cart.model'
import Logging from 'lib/Logging'

const removeExpiredCarts = async () => {
	const cronJobName = '[removeExpiredCarts]'
	Logging.log(
		`${cronJobName} Started cron job: remove expired carts every 15 minutes.`
	)

	const currentTime = Date.now()

	try {
		const result = await Carts.deleteMany({ expiresOn: { $lt: currentTime } })
		Logging.log(`${cronJobName} Deleted ${result.deletedCount} expired carts.`)
	} catch (error) {
		Logging.error(`${cronJobName} Something went wrong: ${error}`)
	}
}

const EVERY_15_MINUTES = '*/15 * * * *'

const removeExpiredCartsCronJob = cron.schedule(
	EVERY_15_MINUTES,
	removeExpiredCarts
)

export default removeExpiredCartsCronJob
