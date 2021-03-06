var _ = require('underscore');
var shellwords = require('shellwords');
var spawn = require('child_process').spawn;

module.exports = (function() {

  /**
   *
   * @param {Object} args
   * @param {String} args.app
   * @param {String} args.env
   * @param {String} [args.task]
   * @param {Array} [args.pulsarOptions]
   * @param {Array} [args.capistranoOptions]
   * @constructor
   */
  function PulsarExec(args) {
    var defaults = {
      task: null,
      pulsarOptions: [],
      capistranoOptions: []
    };
    args = _.defaults({}, args, defaults);
    PulsarExec.validate(args);
    this._args = args;
  }

  PulsarExec.validate = function(args) {
    var errors = [].concat(
      PulsarExec._validateRequired(args.app, 'app'),
      PulsarExec._validateRequired(args.env, 'env'),
      PulsarExec._validatePulsarOptions(args.pulsarOptions)
    );
    if (errors.length) {
      throw new ValidationError(errors.join('; '));
    }
  };

  PulsarExec._validateRequired = function(field, fieldName) {
    if (!field || !_.isString(field) || !field.trim()) {
      return '[' + fieldName + '] param must be not empty string to create Pulsar Command';
    }
    return [];
  };

  PulsarExec._validatePulsarOptions = function(pulsarOptions) {
    var errors = [];
    for (var i = pulsarOptions.length - 1; i >= 0; i--) {
      try {
        var opt = shellwords.split(pulsarOptions[i]);
        if (opt.length > 2) {
          errors.push('Pulsar option [' + pulsarOptions[i] + '] can\'t have more than two(2) parts');
        }
        if (opt[0].charAt(0) !== '-') {
          errors.push('Pulsar option [' + pulsarOptions[i] + '] must have dash(-) or double-dash(--) prefix.');
        }
      } catch (err) {
        errors.push(pulsarOptions[i] + ' has error: ' + err.message);
      }
    }
    return errors;
  };

  PulsarExec.prototype.getArgs = function() {
    return this._args;
  };

  PulsarExec.prototype.getCommandArgs = function() {
    var args = [];
    var pulsarOptions = this._parseOptions(this._args.pulsarOptions);
    args = args.concat(pulsarOptions, this.getCapistranoCommandArgs());
    return _.without(args, null);
  };

  PulsarExec.prototype.getCapistranoCommandArgs = function() {
    var options = this._parseOptions(this._args.capistranoOptions);
    return [this._args.app, this._args.env, this._args.task].concat(options);
  };

  PulsarExec.prototype._parseOptions = function(options) {
    return _.reduce(options, function(memo, opt) {
      return memo.concat(shellwords.split(opt));
    }, []);
  };

  PulsarExec.prototype.run = function() {
    return spawn('pulsar', this.getCommandArgs());
  };

  PulsarExec.prototype.toString = function() {
    return 'pulsar ' + this.getCommandArgs().join(' ');
  };

  return PulsarExec;
}());
