import { SafeUrlPipe } from './safeurl.pipe';

describe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
