import baseConfig from '../../eslint.config.mjs';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	baseConfig,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			import: null // Disable the eslint-plugin-import
		},
		rules: {
			'import/no-named-as-default': 'off',
			'n/no-exports-assign': 'off',
			'@typescript-eslint/await-thenable': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	}
];
