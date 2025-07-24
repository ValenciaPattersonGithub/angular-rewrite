import { OrderByFeelistPipe } from './order-by-feelist.pipe';

describe('OrderByFeelistPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByFeelistPipe();
    expect(pipe).toBeTruthy();
  });
});

describe('OrderByFeelistPipe', () => {
    let pipe: OrderByFeelistPipe;
    let items = [
        { 'colA': "test1", 'colB': 1 },
        { 'colA': "test3", 'colB': 3 },
        { 'colA': "test2", 'colB': 2 },
        { 'colA': "test5", 'colB': 5 },
        { 'colA': "test4", 'colB': 4 },
    ];

    beforeEach(() => {
        pipe = new OrderByFeelistPipe();
    })

    it('sort array correctly when sorting colA', () => {
        let col = 'colA';
        let args = { sortColumnName: col, sortDirection: 1 };
        let result = pipe.transform(items, args);

        expect(result[0][col]).toBe('test1');
        expect(result[4][col]).toBe('test5');
    });

    it('sort array correctly when sorting colB', () => {
        let col = 'colB';
        let args = { sortColumnName: col, sortDirection: 1 };
        let result = pipe.transform(items, args);

        expect(result[0][col]).toBe(1);
        expect(result[4][col]).toBe(5);
    });
});


