'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// when index.js execute app/index.js
var appDir = _path2.default.join(__dirname, '/..');
var viewPath = _path2.default.join(appDir, '/views');
var publicPath = _path2.default.join(appDir, '/public');
var jsPath = _path2.default.join(appDir, '/public/js');

var stremOption = {
    status: 200,
    method: 'GET',
    request: {
        accept: '*/*'
    },
    response: {
        'content-type': ''
    }
};

var resourceFileList = function resourceFileList(filePath, option) {
    var result = [];
    var regExp = /src=["|'](.*)["|']/;
    _fs2.default.readFileSync(filePath, option).split(/\n/).filter(function (line) {
        return line.search(regExp) !== -1;
    }).forEach(function (line) {
        var resourceFile = line.match(regExp)[1];
        var length = resourceFile.split(/\./).length;
        var fileExtention = resourceFile.split(/\./)[length - 1];

        result.push({
            path: resourceFile,
            mime: _mimeTypes2.default.lookup(fileExtention)
        });
    });

    return result;
};

var createResourcefileMap = function createResourcefileMap(viewFileDir) {
    var result = {};

    _fs2.default.readdir(viewFileDir, function (error, file) {
        file.forEach(function (fileName) {
            var list = [];
            var viewfilePath = viewFileDir + '/' + fileName;
            var option = { encoding: 'utf8' };
            result[viewPath + '/' + fileName] = resourceFileList(viewfilePath, option);
        });
    });

    return result;
};

var resorceFileMap = createResourcefileMap(viewPath);

// using server push middlewear
router.get('/push', function (req, res, next) {
    // resorceFileMap = {
    //      'filename': [
    //          {
    //              'path': 'file/to/path',
    //              'mime': 'file-mime-type'
    //          }
    //      ]
    //  }
    var pushFiles = resorceFileMap[viewPath + '/index.html'];
    pushFiles.forEach(function (file) {
        var option = Object.assign(stremOption, { 'response': { 'content-type': file.mime } });
        // create push stream
        var stream = res.push('' + publicPath + file.path, option);
        stream.on('error', function (error) {
            console.error(error);
        });
        stream.end();
    });
    next();
});

router.get('/', function (req, res) {
    res.sendFile(viewPath + '/index.html');
});

// server send files (server push)
router.get('/push', function (req, res) {
    var html = _fs2.default.readFileSync(viewPath + '/index.html');
    res.end(html);
});

module.exports = router;