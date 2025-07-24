import { TestBed } from '@angular/core/testing';

import { SoarTransactionHistoryHttpService } from './soar-transaction-history-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SoarTransactionHistoryHttpService', () => {
    let service: SoarTransactionHistoryHttpService;
    const mockSoarConfig = {
        domainUrl: 'https://localhost:35440',
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ SoarTransactionHistoryHttpService,
                { provide: 'SoarConfig', useValue: mockSoarConfig },
            ],
            imports: [HttpClientTestingModule],
            declarations: [],
        });
        service = TestBed.inject(SoarTransactionHistoryHttpService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
