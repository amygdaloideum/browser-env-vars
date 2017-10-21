const expect = require('chai').expect;
const sinon = require('sinon');

const fs = require('fs');

let s;

describe('Generate()', function () {
  
  beforeEach(function() {
    s = sinon.sandbox.create();
  });

  afterEach(function() {
    s.restore();
  });

  it('test', function () {
    module.parent = false;
    const service = require('../index');
  });
});