'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _spdy = require('spdy');

var _spdy2 = _interopRequireDefault(_spdy);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fileStreamRotator = require('file-stream-rotator');

var _fileStreamRotator2 = _interopRequireDefault(_fileStreamRotator);

var _index = require('./routes/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// when index.js execute app/index.js
var rootDir = __dirname + '/..';
var viewPath = rootDir + '/app/views';

var port = 3000;
var app = (0, _express2.default)();
var options = {
    key: _fs2.default.readFileSync(rootDir + '/keys/private.key'), // private key
    cert: _fs2.default.readFileSync(rootDir + '/keys/server.crt'), // cert file
    passphrase: 'password'
};
var logDir = _path2.default.join(rootDir + '/app/log');
var accessLogOption = {
    date_format: 'YYYYMMDD',
    filename: _path2.default.join(logDir, 'production-%DATE%.log'),
    frequency: 'daily',
    verbose: false
};

app.use(_express2.default.static('app/views'));
app.use(_express2.default.static('app/public'));
app.use('/', _index2.default);

_fs2.default.existsSync(logDir) || _fs2.default.mkdirSync(logDir);
if (app.get('env') === 'production') {
    var accessLogStream = _fileStreamRotator2.default.getStream(accessLogOption);
    app.use((0, _morgan2.default)({ format: 'common', stream: accessLogStream }));
} else {
    app.use((0, _morgan2.default)({ format: 'dev', date: 'clf', immediate: true }));
    app.use((0, _morgan2.default)({ format: 'common' }));
}

_spdy2.default.createServer(options, app).listen(port, function (error) {
    if (error) {
        console.error(error);
        return process.exit(1);
    } else {
        console.log('Listening on port: ' + port + '.');
    }
});

module.exports = app;