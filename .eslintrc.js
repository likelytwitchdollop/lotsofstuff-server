module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		'airbnb-typescript/base',
		'plugin:node/recommended',
		'prettier',
	],
	parserOptions: {
		ecmaVersion: 'latest',
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		'node/no-unsupported-features/es-syntax': [
			'error',
			{ ignores: ['modules'] },
		],
		'node/no-missing-import': ['off'],
	},
}
