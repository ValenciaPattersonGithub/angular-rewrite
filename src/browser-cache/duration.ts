export type DurationUnit = 'hours' | 'minutes' | 'seconds' | 'milliseconds';
export type DurationValue = number;
export type DurationObject = Record<DurationUnit, DurationValue>;

/**
 * Duration class.
 */
export class Duration {
    hours: DurationValue;
    minutes: DurationValue;
    seconds: DurationValue;
    milliseconds: DurationValue;

    /**
     * Constructor.
     *
     * @param obj Duration object.
     */
    constructor(obj: Partial<DurationObject>) {
        const milliseconds = Duration.convertToMilliseconds(obj);
        const durationObject = Duration.convertToDurationObject(milliseconds);
        this.hours = durationObject.hours;
        this.minutes = durationObject.minutes;
        this.seconds = durationObject.seconds;
        this.milliseconds = durationObject.milliseconds;
    }

    /**
     * Create an instance from an object.
     *
     * @param obj Duration object.
     * @returns
     */
    static fromObject(obj: Partial<DurationObject>): Duration {
        return new Duration(obj);
    }

    /**
     * Create an instance from milliseconds.
     *
     * @param milliseconds Duration in milliseconds.
     * @returns
     */
    static fromMilliseconds(milliseconds: DurationValue): Duration {
        return new Duration(Duration.convertToDurationObject(milliseconds));
    }

    /**
     * Create an instance from seconds.
     *
     * @param seconds Duration in seconds.
     * @returns
     */
    static fromSeconds(seconds: DurationValue): Duration {
        return Duration.fromMilliseconds(seconds * 1000);
    }

    /**
     * Create an instance from minutes.
     *
     * @param minutes Duration in minutes.
     * @returns
     */
    static fromMinutes(minutes: DurationValue): Duration {
        return Duration.fromMilliseconds(minutes * 60000);
    }

    /**
     * Create an instance from hours.
     *
     * @param hours Duration in hours.
     * @returns
     */
    static fromHours(hours: DurationValue): Duration {
        return Duration.fromMilliseconds(hours * 3600000);
    }

    /**
     * Convert to milliseconds.
     *
     * @returns Duration in milliseconds.
     */
    toMilliseconds(): DurationValue {
        return Duration.convertToMilliseconds(this);
    }

    /**
     * Convert to milliseconds.
     *
     * @param value Duration object.
     * @returns
     */
    private static convertToMilliseconds(value: Partial<DurationObject>): DurationValue {
        return (value.hours ?? 0) * 3600000 + (value.minutes ?? 0) * 60000 + (value.seconds ?? 0) * 1000 + (value.milliseconds ?? 0);
    }

    /**
     * Convert to duration object.
     *
     * @param milliseconds Duration in milliseconds.
     * @returns
     */
    private static convertToDurationObject(milliseconds: DurationValue): DurationObject {
        return {
            hours: Math.floor(milliseconds / 3600000),
            minutes: Math.floor(milliseconds / 60000) % 60,
            seconds: Math.floor(milliseconds / 1000) % 60,
            milliseconds: milliseconds % 1000,
        };
    }
}
