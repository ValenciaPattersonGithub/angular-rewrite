import { HttpClient} from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MassUpdateService } from './mass-update.service';

describe('MassUpdateService', () => {
  let service: MassUpdateService;

  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [HttpClient,
              { provide: 'SoarConfig', useValue: {} },
          ]});
    service = TestBed.inject(MassUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
