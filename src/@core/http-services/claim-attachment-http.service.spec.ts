import { TestBed } from '@angular/core/testing';

import { ClaimAttachmentHttpService } from './claim-attachment-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ClaimAttachmentHttpService', () => {
  let service: ClaimAttachmentHttpService;
  
  beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [],
        providers: [ClaimAttachmentHttpService,
            { provide: 'SoarConfig', useValue: {} },
        ]
    });
    service = TestBed.inject(ClaimAttachmentHttpService);
  }));


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
