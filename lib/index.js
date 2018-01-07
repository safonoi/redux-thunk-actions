'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createActionThunk = createActionThunk;

var _reduxActions = require('redux-actions');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Creates an async action creator
 *
 * @param  {String} TYPE    the type of the action
 * @param  {Function} fn    the function to be called async
 * @return {Funtion}        the action creator
 */
function createActionThunk(type, fn) {
  var _actionCreators;

  var TYPE_START = type + '_STARTED';
  var TYPE_SUCCEEDED = type + '_SUCCEEDED';
  var TYPE_FAILED = type + '_FAILED';
  var TYPE_ENDED = type + '_ENDED';
  var actionCreators = (_actionCreators = {}, _defineProperty(_actionCreators, TYPE_START, (0, _reduxActions.createAction)(TYPE_START)), _defineProperty(_actionCreators, TYPE_SUCCEEDED, (0, _reduxActions.createAction)(TYPE_SUCCEEDED, function (data) {
    return data;
  }, function (data, args) {
    return args;
  })), _defineProperty(_actionCreators, TYPE_FAILED, (0, _reduxActions.createAction)(TYPE_FAILED, function (err) {
    return err;
  }, function (err, args) {
    return args;
  })), _defineProperty(_actionCreators, TYPE_ENDED, (0, _reduxActions.createAction)(TYPE_ENDED, function (stat) {
    return stat;
  }, function (stat, args) {
    return args;
  })), _actionCreators);

  var factory = function factory() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return function (dispatch, getState, extra) {
      var result = void 0;
      var startedAt = new Date().getTime();
      dispatch(actionCreators[TYPE_START](args));
      var succeeded = function succeeded(data) {
        dispatch(actionCreators[TYPE_SUCCEEDED](data, args));
        var endedAt = new Date().getTime();
        dispatch(actionCreators[TYPE_ENDED]({
          elapsed: endedAt - startedAt
        }));
        return data;
      };
      var failed = function failed(err) {
        var endedAt = new Date().getTime();
        dispatch(actionCreators[TYPE_FAILED](err, args));
        dispatch(actionCreators[TYPE_ENDED]({
          elapsed: endedAt - startedAt
        }, args));
        throw err;
      };
      try {
        result = fn.apply(undefined, [{ getState: getState, dispatch: dispatch, extra: extra }].concat(args));
      } catch (error) {
        failed(error);
      }
      // in case of async (promise), use success and fail callbacks.
      if (isPromise(result)) {
        return result.then(succeeded, failed);
      }
      return succeeded(result);
    };
  };

  factory.NAME = type;
  factory.START = actionCreators[TYPE_START].toString();
  factory.SUCCEEDED = actionCreators[TYPE_SUCCEEDED].toString();
  factory.FAILED = actionCreators[TYPE_FAILED].toString();
  factory.ENDED = actionCreators[TYPE_ENDED].toString();

  return factory;
}

//helpers
function isPromise(p) {
  return p && p.then && p.catch;
}