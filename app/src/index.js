import express from 'express';
import spdy from 'spdy';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import FileStreamRotator from 'file-stream-rotator';

import routes from './routes/index.js'

// when index.js execute app/index.js
const rootDir = __dirname + '/..';
const viewPath = `${rootDir}/app/views`;

const port = 3000;
const app = express();
const options = {
    key: fs.readFileSync(`${rootDir}/keys/private.key`), // private key
    cert: fs.readFileSync(`${rootDir}/keys/server.crt`), // cert file
    passphrase: 'password'
};
const logDir = path.join(`${rootDir}/app/log`);
const accessLogOption = {
    date_format: 'YYYYMMDD',
    filename: path.join(logDir, 'production-%DATE%.log'),
    frequency: 'daily',
    verbose: false
};

app.use(express.static('app/views'));
app.use(express.static('app/public'));
app.use('/', routes);

fs.existsSync(logDir) || fs.mkdirSync(logDir);
if(app.get('env') === 'production') {
    const accessLogStream = FileStreamRotator.getStream(accessLogOption);
    app.use(morgan({ format: 'common', stream: accessLogStream }));
} else {
    app.use(morgan({ format: 'dev', date: 'clf', immediate: true }));
    app.use(morgan({ format: 'common' }));
}

spdy.createServer(options, app)
    .listen(port, (error) => {
        if (error) {
            console.error(error);
            return process.exit(1);
        } else {
            console.log(`Listening on port: ${port}.`);
        }
    });

module.exports = app;
