const expect = require('chai').expect;
const sinon = require('sinon');

const fs = require('fs');

const service = require('../index');

let s;

describe('Generate()', function () {
  var readFileSyncStub, unlinkSyncStub, existsSyncStub;
  let output;

  const mockEnvFile = content => s.stub(fs, 'readFileSync').returns(content);
  const setFileExists = (file, exists) => existsSyncStub.withArgs(file).returns(exists);

  beforeEach(function() {
    output = '';
    process.env = {};
    s = sinon.sandbox.create();
    s.stub(fs, 'appendFileSync').callsFake(function fakeFn(path, data) {
      output += data;
    });
    unlinkSyncStub = s.stub(fs, 'unlinkSync');
    existsSyncStub = s.stub(fs, 'existsSync');
  });

  afterEach(function() {
    s.restore();
  });

  it('should take values from .env', function () {
    setFileExists('.env', true);
    mockEnvFile('test=val\ntest2=val2');
  
    service.generate();

    expect(output).to.equal(`module.exports = {\n  "test": "val",\n  "test2": "val2"\n}`);
  });

  it('should use the whitelisted values from process.env', function () {
    setFileExists('.env', false);
    mockEnvFile('');
    process.env.test='value';
    process.env.test2='value2';
    process.env.notWhitelistedKey='notWhitelistedValue';
    const options = {
      whitelist: ['test', 'test2'],
    };
    service.generate(options); 
    expect(output).to.equal('module.exports = {\n  "test": "value",\n  "test2": "value2"\n}');
  });

  it('should ignore whitelisted values that does not exist in the enviroment', function () {
    setFileExists('.env', false);
    mockEnvFile('');
    process.env.TEST='value';
    const options = {
      whitelist: ['TEST', 'VALUE_THAT_DOES_NOT_EXIST_IN_THE_ENV'],
    };
    service.generate(options); 
    expect(output).to.equal('module.exports = {\n  "TEST": "value"\n}');
  });

  it('should prioritize values from env over values read from the .env file', function () {
    setFileExists('.env', true);
    mockEnvFile('DUPE=valueFromFile\nVALUE_FILE=fileValue');
    process.env.DUPE='valueFromProcessEnv';
    process.env.ENV_VALUE='envValue';
    process.env.notWhitelistedKey='notWhitelistedValue';
    const options = {
      whitelist: ['DUPE', 'ENV_VALUE'],
    };
    service.generate(options); 
    expect(output).to.equal('module.exports = {\n  "DUPE": "valueFromProcessEnv",\n  "VALUE_FILE": "fileValue",\n  "ENV_VALUE": "envValue"\n}');
  });

  it('should delete the previous output file if it exists', function () {
    setFileExists('.env', false);
    setFileExists('config.js', true);
    service.generate(); 
    expect(unlinkSyncStub.called).to.be.true;
  });

  it('should not attempt to delete the previous output file if it does not exists', function () {
    setFileExists('.env', false);
    setFileExists('config.js', false);
    service.generate(); 
    expect(unlinkSyncStub.called).to.be.false;
  });

  it('should export a json file if the outFile option has a json file extension', function () {
    setFileExists('.env', false);
    setFileExists('config.js', false);
    process.env.TEST='value';

    const options = {
      whitelist: ['TEST'],
      outFile: 'config.json',
    };

    service.generate(options); 
    expect(output).to.equal('{\n  "TEST": "value"\n}');
  });

  it('should export a json file if the outFile option has a json file extension', function () {
    setFileExists('.env', false);
    setFileExists('config.js', false);
    process.env.TEST='value';

    const options = {
      whitelist: ['TEST'],
      outFile: 'config.json',
    };

    service.generate(options); 
    expect(output).to.equal('{\n  "TEST": "value"\n}');
  });

  it('should read from the specified readFile path if provided', function () {
    setFileExists('.mycustomfile', true);
    setFileExists('config.js', false);
    mockEnvFile('TEST=value');

    const options = {
      whitelist: ['TEST'],
      readFile: '.mycustomfile'
    };

    service.generate(options); 
    expect(output).to.equal('module.exports = {\n  "TEST": "value"\n}');
  });

  it('should output a ES6 module if the esm flag is set', function () {
    setFileExists('.env', false);
    setFileExists('config.js', false);
    process.env.TEST = 'value';

    const options = {
      whitelist: ['TEST'],
      esm: true,
    };

    service.generate(options); 
    expect(output).to.equal('export default {\n  "TEST": "value"\n}');
  });
});