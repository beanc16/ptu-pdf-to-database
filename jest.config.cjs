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
        'src/dal/PokemonController.ts',
        'src/services/AiPdfReader.ts',
        'src/services/Gen9PokemonParser.ts',
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
