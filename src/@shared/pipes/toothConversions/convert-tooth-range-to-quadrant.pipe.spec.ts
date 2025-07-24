import { ConvertToothRangeToQuadrantOrArchCode } from './convert-tooth-range-to-quadrant.pipe';

const mockStaticDataService: any = {
    ToothRangeToCodeMap: () => new Promise((resolve, reject) => {
    })
};

describe('ConvertToothRangeToQuadrantOrArchCode', () => {
    it('create an instance', () => {
        const pipe = new ConvertToothRangeToQuadrantOrArchCode(mockStaticDataService);
        expect(pipe).toBeTruthy();
    });
});