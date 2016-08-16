import * as Utils from '../loader/utils';

describe('The merge utility', () => {

    it('should deep copy objects properties and concatenate arrays', () => {
        let obj1 = { a: { b: 1, c: [1, 2], d: 3 } };
        let obj2 = { a: { d: 2, c: [3, 4] }, d: 4 };

        Utils.merge(obj1, obj2);

        expect(obj1).toEqual({
            a: { b: 1, d: 2, c: [1, 2, 3, 4] },
            d: 4
        })
    });
    
});