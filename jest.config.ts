import { defineConfig } from 'jest'

export default defineConfig({
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: '.*\\.spec\\.ts$',
	moduleFileExtensions: ['ts', 'js', 'json']
})
