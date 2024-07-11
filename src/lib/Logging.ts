/* eslint-disable no-console */
import chalk from 'chalk'

import * as dotenv from 'dotenv'

dotenv.config()

export default class Logging {
	static debug = (args: any) => {
		if (process.env.NODE_ENV === 'development') {
			console.log(args)
		}
	}

	static createLog = (
		logType: 'INFO' | 'WARNING' | 'ERROR',
		color: 'blue' | 'yellow' | 'red',
		args: any
	) => {
		const currentTime = new Date().toLocaleString()

		console.log(
			chalk[color](`[${currentTime}] [${logType}] `),
			typeof args === 'string' ? chalk[`${color}Bright`](args) : args
		)
	}

	static info = (args: any, color: 'blue' | 'yellow' = 'blue') => {
		this.createLog('INFO', color, args)
	}

	static warn = (args: any) => {
		this.createLog('WARNING', 'yellow', args)
	}

	static error = (args: any) => {
		this.createLog('ERROR', 'red', args)
	}

	static log = (args: any) => {
		this.info(args)
	}
}
