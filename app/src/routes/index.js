import express from 'express';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const router = express.Router();

// when index.js execute app/index.js
const appDir = path.join(__dirname, '/..');
const viewPath = path.join(appDir, '/views');
const publicPath = path.join(appDir, '/public');
const jsPath = path.join(appDir, '/public/js');

const stremOption = {
        status: 200,
        method: 'GET',
        request: {
            accept: '*/*'
        },
        response: {
            'content-type': ''
        }
    }

const resourceFileList = (filePath, option) => {
    const result = [];
    const regExp = /src=["|'](.*)["|']/;
    fs.readFileSync(filePath, option)
    .split(/\n/)
    .filter(line => line.search(regExp) !== -1)
    .forEach(line => {
        const resourceFile = line.match(regExp)[1];
        const length = resourceFile.split(/\./).length;
        const fileExtention = resourceFile.split(/\./)[length - 1];
        
        result.push(
            {
                path: resourceFile,
                mime: mime.lookup(fileExtention)
            }
        );
    });

    return result;
}

const createResourcefileMap = viewFileDir => {
    let result = {}

    fs.readdir(viewFileDir, (error, file) => {
        file.forEach(fileName => {
            const list = [];
            const viewfilePath = `${viewFileDir}/${fileName}`;
            const option = { encoding: 'utf8' };
            result[`${viewPath}/${fileName}`] = resourceFileList(viewfilePath, option);
        });
    });

    return result;
}

const resorceFileMap = createResourcefileMap(viewPath);

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
    const pushFiles = resorceFileMap[`${viewPath}/index.html`];
    pushFiles.forEach( file => {
        const option = Object.assign(stremOption, {'response': {'content-type': file.mime}});
        // create push stream
        const stream = res.push(`${publicPath}${file.path}`, option);
        stream.on('error', error => {
            console.error(error);
        });
        stream.end();
    });
    next();
});

router.get('/', (req, res) => {
    res.sendFile(`${viewPath}/index.html`);
});

// server send files (server push)
router.get('/push', (req, res) => {
    const html = fs.readFileSync(`${viewPath}/index.html`);
    res.end(html);
});

module.exports = router;
