// For ignoring any troublesome ESM modules that throw import errors
const esmModules = [
].join('|');

module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!node_modules/**',
    ],
    coveragePathIgnorePatterns: [
        'src/index.ts',
        'src/dal/PokemonCollection.ts', // Pulled from another project, so no need to test here
        'src/dal/PokemonController.ts', // Pulled from another project, so no need to test here
        'src/services/AiPdfReader.ts',
        'src/services/PokeApi.ts',      // Pulled from another project, so no need to test here
    ],
    coverageThreshold: {
        './src/services/PerformanceMetricTracker': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    moduleFileExtensions: ['js', 'ts'],
    extensionsToTreatAsEsm: ['.ts'],
    resolver: 'ts-jest-resolver',
    transform: {
        '^.+\\.ts?$': [
            '@swc/jest',
        ],
    },
    transformIgnorePatterns: [
        `<rootDir>/node_modules/(?!${esmModules})`,
    ],
    moduleNameMapper: {
        '^discord\\.js$': '<rootDir>/__mocks__/discord.js.ts',
    },
};
