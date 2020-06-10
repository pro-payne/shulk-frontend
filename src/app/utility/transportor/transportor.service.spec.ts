import { TestBed } from '@angular/core/testing';

import { TransportorService } from './transportor.service';

describe('TransportorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransportorService = TestBed.get(TransportorService);
    expect(service).toBeTruthy();
  });
});
