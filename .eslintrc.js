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
			'off',
			{
				// Using 8.3.0 or above to allow support for spread syntax on arrays and objects.
				version: '>=10.0.0',
				ignores: ['modules'],
			},
		],
		'node/no-missing-import': ['off'],
	},
}
