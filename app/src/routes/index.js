import express from 'express';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const router = express.Router();

// when index.js execute app/index.js
const appDir = path.join(__dirname, '/..');
const viewPath = path.join(appDir, '/views');
const publicPath = path.join(appDir, '/public');;

const stremOption = {
        method: 'GET',
        request: {
            accept: '*/*'
        },
        response: {
            'content-type': ''
        }
    }

const resourceScript = (line) => {
    if(/<script/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
}

const resourceStyleseet = (line) => {
    if(/<link/.test(line) && /stylesheet/.test(line) && /href=/.test(line)) {
        return line.match(/href="([^"]*)"/)[1];
    }

    return false;
}

const resourceImage = (line) => {
    if(/<img/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
}

const resourceFileList = (filePath, option) => {
    let result = [];
    const regFile = /\/.*?([\/\w\.]+)[\s\?]?.*/;
    const regExt = /\.(.*)/;

    fs.readFileSync(filePath, option)
    .split(/\n/)
    .filter(line => {
        let file;
        if(resourceScript(line)) {
            file = resourceScript(line)
        }

        else if(resourceStyleseet(line)) {
            file = resourceStyleseet(line)
        }

        else if(resourceImage(line)) {
            file = resourceImage(line)
        }

        else {
            return false;
        }

        const fileExtention = file.split(regExt)[1];

        result.push(
            {
                path: file,
                mime: mime.lookup(fileExtention)
            }
        );
    });

    return result;
}

const createResourcefileMap = viewFileDir => {
    let result = {}

    return new Promise((resolve, reject) => {
        fs.readdir(viewFileDir, (error, file) => {
            if (error) {
                reject(error);
                return;
            }

            Promise.all(
                file.map(fileName => {
                    const list = [];
                    const viewfilePath = `${viewFileDir}/${fileName}`;
                    const option = { encoding: 'utf8' };
                    result[`${viewPath}/${fileName}`] = resourceFileList(viewfilePath, option);
                    return result;
                })
            ).then(resolve(result))
        });
    });
}

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
    createResourcefileMap(viewPath + req.url)
    .then((resorceFileMap) => {
        const pushFiles = resorceFileMap[`${viewPath}/index.html`];

        pushFiles.forEach(file => {
            const option = Object.assign(stremOption, {'response': {'content-type': file.mime}});
            // create push stream
            const stream = res.push(file.path, option);
            stream.on('error', error => {
                console.error(error);
            });
            stream.end(fs.readFileSync(`${publicPath}${file.path}`));
        });
        next();
    })
});

router.get('/', (req, res) => {
    const html = fs.readFileSync(`${viewPath}/index.html`);
    res.end(html);
});

// server send files (server push)
router.get('/push', (req, res) => {
    const html = fs.readFileSync(`${viewPath}/push/index.html`);
    res.end(html);
});

module.exports = router;
