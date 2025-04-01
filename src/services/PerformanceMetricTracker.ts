export class PerformanceMetricTracker
{
    private static timestamps: Record<number, {
        startTime?: number;
        endTime?: number;
    }> = {};

    private static initialize(key: number)
    {
        if (!this.timestamps[key])
        {
            this.timestamps[key] = {};
        }
    }

    private static get totalDuration()
    {
        return Object.values(this.timestamps).reduce<number>((acc, { startTime, endTime }) =>
        {
            if (startTime && endTime)
            {
                const duration = endTime - startTime;
                acc += duration;
            }

            return acc;
        }, 0);
    }

    public static get averageDurationInMilliseconds()
    {
        return this.totalDuration / Object.keys(this.timestamps).length;
    }

    public static get averageDurationInSeconds()
    {
        return this.averageDurationInMilliseconds / 1000;
    }

    public static get averageDurationInMinutes()
    {
        return this.averageDurationInSeconds / 60;
    }

    public static start(key: number)
    {
        this.initialize(key);
        this.timestamps[key].startTime = performance.now();
    }

    public static end(key: number)
    {
        this.initialize(key);
        this.timestamps[key].endTime = performance.now();
    }
}
