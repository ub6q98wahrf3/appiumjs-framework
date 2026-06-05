import wdio from 'eslint-plugin-wdio';
import prettier from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                browser: 'readonly',
                $: 'readonly',
                $$: 'readonly',
                driver: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                after: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                global: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                console: 'readonly',
            },
        },
        plugins: { wdio },
        rules: {
            ...wdio.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'warn',
            'prefer-const': 'error',
        },
    },
    prettier,
    {
        ignores: ['node_modules/', 'reports/', 'logs/', 'screenshots/', 'apps/'],
    },
];
