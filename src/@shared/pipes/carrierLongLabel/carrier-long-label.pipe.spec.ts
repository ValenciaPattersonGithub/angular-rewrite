import { CarrierLongLabelPipe } from "./carrier-long-label.pipe";

describe('CarrierLongLabelPipe', () => {
    const pipe = new CarrierLongLabelPipe();
    
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return value with available properies separated by commas', () => {
        const carrier = {
            Name: 'Carrier1', PayerId: '12345', AddressLine1: 'AddressLine1',
            AddressLine2: 'AddressLine2', State: 'Il', City: 'Effingham', Zip: '62401', PhoneNumbers: [{ PhoneNumber: '(217)-540-3725' }, { PhoneNumber: '(217)-540-3726' }]
        };
        expect(pipe.transform(carrier)).toEqual('Carrier1, 12345, AddressLine1, AddressLine2, Effingham, Il, 62401, (217)-540-3725');
    });

    it('should return empty value if carrier is not provided', () => {
        const carrier = null;
        expect(pipe.transform(carrier)).toEqual('');
    });
});

 