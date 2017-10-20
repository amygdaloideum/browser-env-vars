const expect = require('chai').expect;
const sinon = require('sinon');

const fs = require('fs');

const service = require('../index');

let s;

describe('Generate()', function () {
  var readFileSyncStub;
  let output;

  const mockEnvFile = content => s.stub(fs, 'readFileSync').returns(content);
  const setEnvFileExists = exists => s.stub(fs, 'existsSync').returns(exists);

  beforeEach(function() {
    output = '';
    process.env = {};
    s = sinon.sandbox.create();
    s.stub(fs, 'appendFileSync').callsFake(function fakeFn(path, data) {
      output += data;
    });
    s.stub(fs, 'unlinkSync').callsFake(() => {});
  });

  afterEach(function() {
    s.restore();
  });

  it('should take values from .env', function () {
    setEnvFileExists(true);
    mockEnvFile('test=val\ntest2=val2');
  
    service.generate();

    expect(output).to.equal('module.exports = {"test":"val","test2":"val2"}');
  });

  it('should use the whitelistet values from process.env', function () {
    setEnvFileExists(false);
    mockEnvFile('');
    process.env.test='value';
    process.env.test2='value2';
    process.env.notWhitelistedKey='notWhitelistedValue';
    const options = {
      whitelist: ['test', 'test2'],
    };
    service.generate(options); 
    expect(output).to.equal('module.exports = {"test":"value","test2":"value2"}');
  });

  it('should prioritize values from env over values read from the .env file', function () {
    setEnvFileExists(true);
    mockEnvFile('DUPE=valueFromFile\nVALUE_FILE=fileValue');
    process.env.DUPE='valueFromProcessEnv';
    process.env.ENV_VALUE='envValue';
    process.env.notWhitelistedKey='notWhitelistedValue';
    const options = {
      whitelist: ['DUPE', 'ENV_VALUE'],
    };
    service.generate(options); 
    expect(output).to.equal('module.exports = {"DUPE":"valueFromProcessEnv","VALUE_FILE":"fileValue","ENV_VALUE":"envValue"}');
  });
});