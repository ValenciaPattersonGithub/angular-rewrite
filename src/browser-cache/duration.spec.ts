import { Duration } from './duration';

describe('Duration', () => {
    it('should create an instance', () => {
        expect(new Duration({ milliseconds: 0 })).toBeTruthy();
    });

    it('should create an instance from milliseconds', () => {
        let duration = Duration.fromMilliseconds(0);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromMilliseconds(1);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(1);

        duration = Duration.fromMilliseconds(1001);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(1);

        duration = Duration.fromMilliseconds(61001);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(1);

        duration = Duration.fromMilliseconds(3661001);
        expect(duration.hours).toEqual(1);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(1);

        duration = Duration.fromMilliseconds(864001);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(14);
        expect(duration.seconds).toEqual(24);
        expect(duration.milliseconds).toEqual(1);
    });

    it('should create an instance from seconds', () => {
        let duration = Duration.fromSeconds(0);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromSeconds(1);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromSeconds(61);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromSeconds(3661);
        expect(duration.hours).toEqual(1);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromSeconds(864);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(14);
        expect(duration.seconds).toEqual(24);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromSeconds(86400);
        expect(duration.hours).toEqual(24);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);
    });

    it('should create an instance from minutes', () => {
        let duration = Duration.fromMinutes(0);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromMinutes(1);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromMinutes(61);
        expect(duration.hours).toEqual(1);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromMinutes(1441);
        expect(duration.hours).toEqual(24);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);
    });

    it('should create an instance from hours', () => {
        let duration = Duration.fromHours(0);
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromHours(1);
        expect(duration.hours).toEqual(1);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromHours(25);
        expect(duration.hours).toEqual(25);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);
    });

    it('should convert to milliseconds', () => {
        let duration = Duration.fromMilliseconds(0);
        expect(duration.toMilliseconds()).toEqual(0);

        duration = Duration.fromMilliseconds(1);
        expect(duration.toMilliseconds()).toEqual(1);

        duration = Duration.fromMilliseconds(1001);
        expect(duration.toMilliseconds()).toEqual(1001);

        duration = Duration.fromMilliseconds(61001);
        expect(duration.toMilliseconds()).toEqual(61001);

        duration = Duration.fromMilliseconds(3661001);
        expect(duration.toMilliseconds()).toEqual(3661001);

        duration = Duration.fromMilliseconds(864001);
        expect(duration.toMilliseconds()).toEqual(864001);
    });

    it('should create an instance from object', () => {
        let duration = Duration.fromObject({});
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromObject({ milliseconds: 1 });
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(1);

        duration = Duration.fromObject({ seconds: 1 });
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromObject({ minutes: 1 });
        expect(duration.hours).toEqual(0);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromObject({ hours: 1 });
        expect(duration.hours).toEqual(1);
        expect(duration.minutes).toEqual(0);
        expect(duration.seconds).toEqual(0);
        expect(duration.milliseconds).toEqual(0);

        duration = Duration.fromObject({ hours: 1, minutes: 1, seconds: 1, milliseconds: 1 });
        expect(duration.hours).toEqual(1);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(1);

        duration = Duration.fromObject({ hours: 1, minutes: 61, seconds: 1 });
        expect(duration.hours).toEqual(2);
        expect(duration.minutes).toEqual(1);
        expect(duration.seconds).toEqual(1);
        expect(duration.milliseconds).toEqual(0);
    });
});
