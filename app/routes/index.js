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
var publicPath = '/';

var stremOption = {
    method: 'GET',
    request: {
        accept: '*/*'
    },
    response: {
        'content-type': ''
    }
};

var resourceScript = function resourceScript(line) {
    if (/<script/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
};

var resourceStyleseet = function resourceStyleseet(line) {
    if (/<link/.test(line) && /stylesheet/.test(line) && /href=/.test(line)) {
        return line.match(/href="([^"]*)"/)[1];
    }

    return false;
};

var resourceImage = function resourceImage(line) {
    if (/<img/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
};

var resourceFileList = function resourceFileList(filePath, option) {
    var result = [];
    var regFile = /\/.*?([\/\w\.]+)[\s\?]?.*/;
    var regExt = /\.(.*)/;

    _fs2.default.readFileSync(filePath, option).split(/\n/).filter(function (line) {
        var file = void 0;
        if (resourceScript(line)) {
            file = resourceScript(line);
        } else if (resourceStyleseet(line)) {
            file = resourceStyleseet(line);
        } else if (resourceImage(line)) {
            file = resourceImage(line);
        } else {
            return false;
        }

        var fileExtention = file.split(regExt)[1];

        result.push({
            path: file,
            mime: _mimeTypes2.default.lookup(fileExtention)
        });
    });

    return result;
};

var createResourcefileMap = function createResourcefileMap(viewFileDir) {
    var result = {};

    return new Promise(function (resolve, reject) {
        _fs2.default.readdir(viewFileDir, function (error, file) {
            if (error) {
                reject(error);
                return;
            }

            Promise.all(file.map(function (fileName) {
                var list = [];
                var viewfilePath = viewFileDir + '/' + fileName;
                var option = { encoding: 'utf8' };
                result[viewPath + '/' + fileName] = resourceFileList(viewfilePath, option);
                return result;
            })).then(resolve(result));
        });
    });

    // fs.readdir(viewFileDir, (error, file) => {
    //     file.forEach(fileName => {
    //         const list = [];
    //         const viewfilePath = `${viewFileDir}/${fileName}`;
    //         const option = { encoding: 'utf8' };
    //         result[`${viewPath}/${fileName}`] = resourceFileList(viewfilePath, option);
    //     });
    // });
    // return result;
};

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
    createResourcefileMap(viewPath + req.url).then(function (resorceFileMap) {
        var pushFiles = resorceFileMap[viewPath + '/index.html'];

        pushFiles.forEach(function (file) {
            var option = Object.assign(stremOption, { 'response': { 'content-type': file.mime } });
            // create push stream
            console.log('' + file.path);
            console.log(option);
            var stream = res.push('' + file.path, option);
            stream.on('error', function (error) {
                console.error(error);
            });
        });
        next();
    });
});

router.get('/', function (req, res) {
    var html = _fs2.default.readFileSync(viewPath + '/index.html');
    res.end(html);
});

// server send files (server push)
router.get('/push', function (req, res) {
    var html = _fs2.default.readFileSync(viewPath + '/push/index.html');
    res.end(html);
});

module.exports = router;