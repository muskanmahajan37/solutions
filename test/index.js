import assert from 'assert';
import solutions from '../lib';

describe('solutions', function () {
  solutions('dist', 2);
  it('should have unit test!', function () {
    assert(true, 'we expected this package author to add actual unit tests.');
  });
});
