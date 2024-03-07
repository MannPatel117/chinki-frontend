import { TestBed } from '@angular/core/testing';

import { StoreBillDataService } from './store-bill-data.service';

describe('StoreBillDataService', () => {
  let service: StoreBillDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreBillDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
