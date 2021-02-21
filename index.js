var path = require('path');
var subProcess = require('child_process');
var chokidar = require('chokidar');

var CodePlay = function() {
  this.targets = [];
  this.cmdPtn = '';
  this.noneAsArgs = false;
  this.allAsArgs = false;

  this.watcher = null;
};
CodePlay.prototype = {
  'logger': console,
  'log': function() {
    this.logger.log.apply(this.logger, arguments);
  },
  'start': function(options, callback) {
    this.noneAsArgs = options.noneAsArgs;
    this.allAsArgs = options.allAsArgs;
    this.cmdPtn = options.cmdPtn;
    if (options.logger) {
      this.logger = options.logger;
    }

    var self = this;
    this.watcher = chokidar.watch(options.filesPtn);
    this.watcher
      .on('add', function(path) {
        self.targets.push(path);
      })
      .on('ready', function() {
        self.cmdPtn = self.composeCmdWithArgs(self.cmdPtn);
        self.log('start watching');
        self.log(self.targets);
        self.log();
        self.log('with command: ');
        self.log(self.cmdPtn);

        if (callback) {
          callback();
        }
      })
      .on('change', function(path) {
        try {
          self.callback(path);
        } catch (e) {
          self.log('[ERROR] ' + e);
          // self.stop();
        }
      });
  },
  'stop': function() {
    this.watcher.close();
  },
  'composeCmdWithArgs': function(cmdPtn) {
    if (this.noneAsArgs) {
      return cmdPtn;
    } else if (this.allAsArgs) {
      return [cmdPtn].concat(this.targets).join(' ');
    } else {
      return cmdPtn + ' !';
    }
  },
  'completeCmd': function(fn) {
    var cmdPtn = this.cmdPtn;
    if (cmdPtn.indexOf('?') !== -1) {
      cmdPtn = this.guessExecutable(cmdPtn, fn);
    }
    return cmdPtn.replace(/\!/g, fn);
  },
  'guessExecutable': function(cmd, fn) {
    var main = '';
    var ext = path.extname(fn);
    if (ext == '') {
      msg = 'no file extension. please give callback explicitly';
      throw msg;
    } else if (ext == '.py') {
      main = 'python';
    } else if (ext == '.php') {
      main = 'php -f';
    } else if (ext == '.js') {
      main = 'node';
    } else {
      msg = 'no corresponding executable for *' + ext + ' file. ' +
            'please give callback explicitly';
      throw msg;
    }
    return cmd.replace('?', main);
  },
  'callback': function(fn) {
    var self = this;
    var cmd = this.completeCmd(fn);
    subProcess.exec(cmd, function(error, stdout, stderr) {
      if (error) {
        self.log(error);
      } else {
        self.log(stdout);
        self.log(stderr);
      }
    });

    self.log();
    self.log('> (' + new Date().toISOString() + ') ' + cmd);
  }
};

module.exports.start = function(options, callback) {
  var codePlay = new CodePlay();
  codePlay.start(options, callback);
  return codePlay;
};
