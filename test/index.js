var subProcess = require('child_process');
var expect = require('chai').expect;
var sinon = require('sinon');
var codeplay = require('../index');

function getFixturePath(fn) {
  return __dirname + '/fixtures/' + fn;
}
function changeFixture(fn, callback) {
  var cmd = 'touch ' + getFixturePath(fn);
  subProcess.exec(cmd, function(error, stdout, stderr) {
    setTimeout(function() {
      callback();
    }, 250);
  });

}

var silentLogger = {
  'log': function() {}
};

describe('codeplay', function() {
  describe('argument processor', function() {
    it('should append nothing to the command if argument, --no-append, is given.', function(done) {
      var watcher = codeplay.start({
        noneAsArgs: true,
        allAsArgs: false,
        filesPtn: getFixturePath('*'),
        cmdPtn: 'pwd',
        logger: silentLogger
      }, function() {
        changeFixture('a.txt', function() {
          expect(spy.returnValues[0]).to.equal('pwd');
          done();
        });
      });
      var spy = sinon.spy(watcher, 'completeCmd');
    });

    it('should append all matched files to the command if argument, --all-append, is given.', function(done) {
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: true,
        filesPtn: getFixturePath('*.txt'),
        cmdPtn: 'cat',
        logger: silentLogger
      }, function() {
        changeFixture('a.txt', function() {
          expect(spy.returnValues[0]).to.equal(
            [ 'cat',
              getFixturePath('a.txt'),
              getFixturePath('b.txt')
            ].join(' ')
          );
          done();
        });
      });
      var spy = sinon.spy(watcher, 'completeCmd');
    });

    it('should append changing file to the command if no argument is given.', function(done) {
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: false,
        filesPtn: getFixturePath('*.txt'),
        cmdPtn: 'ls',
        logger: silentLogger
      }, function() {
        changeFixture('a.txt', function() {
          expect(spy.returnValues[0]).to.equal(
            [ 'ls',
              getFixturePath('a.txt')
            ].join(' ')
          );
          done();
        });
      });
      var spy = sinon.spy(watcher, 'completeCmd');
    });
  });

  describe('executable processor', function() {
    it('should replace undecided executable with `python` if python file is changing', function(done) {
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: false,
        filesPtn: getFixturePath('*'),
        cmdPtn: '?',
        logger: silentLogger
      }, function() {
        changeFixture('a.py', function() {
          expect(spy.returnValues[0]).to.equal(
            [ 'python',
              getFixturePath('a.py')
            ].join(' ')
          );
          done();
        });
      });
      var spy = sinon.spy(watcher, 'completeCmd');
    });

    it('should abort the watcher if changing file has no extension and executable is not given', function(done) {
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: false,
        filesPtn: getFixturePath('a'),
        cmdPtn: '?',
        logger: silentLogger
      }, function() {
        changeFixture('a', function() {
          expect(spy.calledOnce).to.be.true;
          done();
        });
      });
      var spy = sinon.spy(watcher, 'stop');
    });

    it('should abort the watcher if extension of changing file is not support and executable is not given', function(done) {
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: false,
        filesPtn: getFixturePath('a.ext'),
        cmdPtn: '?',
        logger: silentLogger
      }, function() {
        changeFixture('a.ext', function() {
          expect(spy.calledOnce).to.be.true;
          done();
        });
      });
      var spy = sinon.spy(watcher, 'stop');
    });
  });

  describe('execution', function() {
    it('should log stdout', function(done) {
      var logger = {
        log: function() {
          var args = [].slice.call(arguments);
          return args.join(' ');
        }
      };
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: false,
        filesPtn: getFixturePath('*'),
        cmdPtn: '?',
        logger: logger
      }, function() {
        changeFixture('a.py', function() {
          var result = spy.returnValues.join(' ');
          expect(result.indexOf('a.py is executed')).to.not.be.equal(-1);
          done();
        });
      });
      var spy = sinon.spy(logger, 'log');
    });

    it('should log stderr', function(done) {
      var logger = {
        log: function() {
          var args = [].slice.call(arguments);
          return args.join(' ');
        }
      };
      var watcher = codeplay.start({
        noneAsArgs: false,
        allAsArgs: false,
        filesPtn: getFixturePath('*'),
        cmdPtn: '?',
        logger: logger
      }, function() {
        changeFixture('b.py', function() {
          var result = spy.returnValues.join(' ');
          expect(result.indexOf('b.py is aborted')).to.not.be.equal(-1);
          done();
        });
      });
      var spy = sinon.spy(logger, 'log');
    });
  });
});
