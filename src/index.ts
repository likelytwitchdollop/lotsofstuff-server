import Logging from 'lib/Logging'
import server from 'server'
import config from 'config/config'
import mongoose from 'mongoose'
import removeExpiredCartsCronJob from 'cronJobs/removeExpiredCarts'

// Connect to MongoDB.
mongoose.set('strictQuery', true)
// Include virtual fields in the JSON output, and remove the _id property from the resulting JSON object.
mongoose.set('toJSON', {
	virtuals: true,
	transform: (doc, converted) => {
		// eslint-disable-next-line no-underscore-dangle, no-param-reassign
		delete converted._id
	},
})

mongoose
	.connect(config.db.uri)
	.then(() => {
		Logging.log('Connected to DB.')

		// Start server.
		const { port } = config.server
		server.listen(port, () => {
			Logging.log(`Server is running on port ${port}.`)
			console.log('process.env.NODE_ENV: ', process.env.NODE_ENV)
		})

		// Run cron jobs.
		// This service is deployed on Render.io, and Render allows creation of independing cron jobs at a fee. The alternative is to run the cron job from the server. However, free-tier services on Render spin down after 30 minutes of inactivity.
		removeExpiredCartsCronJob.start()
	})
	.catch((error) => {
		Logging.error('Unable to connect to DB: ')
		Logging.error(error)
	})
