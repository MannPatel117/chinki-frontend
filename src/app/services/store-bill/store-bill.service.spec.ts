import { TestBed } from '@angular/core/testing';

import { StoreBillService } from './store-bill.service';

describe('StoreBillService', () => {
  let service: StoreBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
