import { fromNow } from './date';
import { Duration } from './duration';

describe('Date', () => {
    it('should create a date from now', () => {
        const now = new Date();
        const result = fromNow(1, 'milliseconds');
        expect(result.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should create a date from a duration', () => {
        const now = new Date();
        const result = fromNow(Duration.fromObject({ milliseconds: 1 }));
        expect(result.getTime()).toBeGreaterThan(now.getTime());
    });
});
