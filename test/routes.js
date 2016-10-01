import request from 'supertest';
import should from 'should';
import app from '../app/index.js'

describe('GET /', () => {
    it('respond with html', (done) => {
        request(app)
            .get('/')
            .expect('Content-Type', /html/)
            .expect((res) => {
                res.statusCode === 200
                res.type.includes('text/html');
                res.text.match(/Hello Express width Http2/);
                res.text.match(/main\.js/);
                res.text.match(/app\.js/);
            })
            .expect(200, done)
            .end(done);
    })
});

describe('GET /push', () => {
    it('respond with html', (done) => {
        request(app)
            .get('/push')
            .expect('Content-Type', /html/)
            .expect((res) => {
                res.statusCode === 200
                res.type.includes('text/html');
                res.text.match(/Hello Express width Http2/);
                res.text.match(/main\.js/);
                res.text.match(/app\.js/);
            })
            .expect(200, done)
    })
});
