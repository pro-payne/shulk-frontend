import { TestBed } from '@angular/core/testing';

import { CustomPreloadService } from './custom-preload.service';

describe('CustomPreloadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomPreloadService = TestBed.get(CustomPreloadService);
    expect(service).toBeTruthy();
  });
});
