import js from '@eslint/js';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import * as sveltePlugin from 'eslint-plugin-svelte';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,svelte}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                window: true,
                console: true,
                confirm: true
            }
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': 'warn'
        }
    },
    {
        files: ['**/*.svelte'],
        plugins: {
            svelte: sveltePlugin
        },
        languageOptions: {
            parser: svelteParser
        }
    }
];