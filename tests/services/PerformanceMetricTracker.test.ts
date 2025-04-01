import { PerformanceMetricTracker } from '../../src/services/PerformanceMetricTracker.js';

describe('PerformanceMetricTracker', () =>
{
    beforeEach(() =>
    {
        // Reset timestamps before each test
        PerformanceMetricTracker['timestamps'] = {};
    });

    describe('initialize', () =>
    {
        test('should initialize empty object', () =>
        {
            const key = 1;
            PerformanceMetricTracker['initialize'](key);
            expect(PerformanceMetricTracker['timestamps'][key]).toEqual({});
        });

        test('should overwrite existing empty object', () =>
        {
            const key = 1;
            const expectedResult = { startTime: 1, endTime: 2 };

            PerformanceMetricTracker['initialize'](key);
            PerformanceMetricTracker['timestamps'][key] = expectedResult;
            PerformanceMetricTracker['initialize'](key);

            expect(PerformanceMetricTracker['timestamps'][key]).toEqual(expectedResult);
        });
    })

    describe('start', () =>
    {
        test('should initialize start time for a key', () =>
        {
            const key = 1;
            PerformanceMetricTracker.start(key);
            expect(PerformanceMetricTracker['timestamps'][key].startTime).toBeDefined();
        });
    });

    describe('end', () =>
    {
        test('should initialize end time for a key', () =>
        {
            const key = 1;
            PerformanceMetricTracker.end(key);
            expect(PerformanceMetricTracker['timestamps'][key].endTime).toBeDefined();
        });
    });

    describe('totalDuration', () =>
    {
        test('should calculate total duration correctly with one key', () =>
        {
            const startTime = 1000;
            const endTime = 2000;
            jest.spyOn(global.performance, 'now')
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            const key = 1;
            PerformanceMetricTracker.start(key);
            PerformanceMetricTracker.end(key);

            expect(PerformanceMetricTracker['totalDuration']).toEqual(endTime - startTime);
        });

        test('should calculate total duration correctly with two keys', () =>
        {
            const startTimeOne = 1000;
            const endTimeOne = 2000;
            const startTimeTwo = 3000;
            const endTimeTwo = 4000;
            jest.spyOn(global.performance, 'now')
                .mockReturnValueOnce(startTimeOne)
                .mockReturnValueOnce(endTimeOne)
                .mockReturnValueOnce(startTimeTwo)
                .mockReturnValueOnce(endTimeTwo);

            const keyOne = 1;
            const keyTwo = 2;
            PerformanceMetricTracker.start(keyOne);
            PerformanceMetricTracker.end(keyOne);
            PerformanceMetricTracker.start(keyTwo);
            PerformanceMetricTracker.end(keyTwo);

            expect(PerformanceMetricTracker['totalDuration']).toEqual(
                (endTimeOne - startTimeOne)
                + (endTimeTwo - startTimeTwo),
            );
        });
    });

    describe('averageDuration', () =>
    {
        test('should calculate average duration correctly with one key', () =>
        {
            const startTime = 1000;
            const endTime = 2000;
            jest.spyOn(global.performance, 'now')
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);

            const key = 1;
            PerformanceMetricTracker.start(key);
            PerformanceMetricTracker.end(key);

            expect(PerformanceMetricTracker.averageDuration).toEqual(endTime - startTime);
        });

        test('should calculate average duration correctly with two keys', () =>
        {
            const startTimeOne = 1000;
            const endTimeOne = 2000;
            const startTimeTwo = 3000;
            const endTimeTwo = 4000;
            jest.spyOn(global.performance, 'now')
                .mockReturnValueOnce(startTimeOne)
                .mockReturnValueOnce(endTimeOne)
                .mockReturnValueOnce(startTimeTwo)
                .mockReturnValueOnce(endTimeTwo);

            const keyOne = 1;
            const keyTwo = 2;
            PerformanceMetricTracker.start(keyOne);
            PerformanceMetricTracker.end(keyOne);
            PerformanceMetricTracker.start(keyTwo);
            PerformanceMetricTracker.end(keyTwo);

            expect(PerformanceMetricTracker.averageDuration).toEqual(
                (
                    (endTimeOne - startTimeOne)
                    + (endTimeTwo - startTimeTwo)
                ) / 2,
            );
        });
    });
});
