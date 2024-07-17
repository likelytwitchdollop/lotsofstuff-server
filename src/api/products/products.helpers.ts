import { PipelineStage } from 'mongoose'

const formatFilter = (value: string) => {
	if (value.includes(',')) {
		return value.split(',')
	}

	return [value]
}

// eslint-disable-next-line import/prefer-default-export
export const filterBy = (
	pipeline: PipelineStage[],
	criteria: string,
	value: string | undefined
) => {
	if (value) {
		pipeline.push({
			$match: { [criteria]: { $in: formatFilter(value) } },
		})
	}
}
