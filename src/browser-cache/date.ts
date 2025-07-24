import { Duration, DurationUnit } from "./duration";

/**
 * Returns a new date object with the current date plus the duration passed as parameter.
 * 
 * @param duration Object with the duration to add to the current date
 */
function fromNow(duration: Duration): Date;
/**
 * Returns a new date object with the current date plus the duration passed as parameter.
 * 
 * @param value Number with the value of the duration to add to the current date
 * @param unit Unit of the duration to add to the current date
 */
function fromNow(value: number, unit?: DurationUnit): Date;
function fromNow(value: Duration | number, unit: DurationUnit = 'milliseconds') {
    const now = new Date();
    const nowInMilliseconds = now.getTime();
    const valueInMilliseconds = value instanceof Duration ? value.toMilliseconds() : Duration.fromObject({ [unit]: value }).toMilliseconds();
    const resultInMilliseconds = nowInMilliseconds + valueInMilliseconds;
    return new Date(resultInMilliseconds);
}

export { fromNow };
