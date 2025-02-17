const request = require('supertest');
const app = require('../index.js');

describe('Authentication Tests', function() {
    it('should login successfully', function(done) {
        request(app)
            .post('/login')
            .send({ email: '123@abc', password: '123' })
            .expect(200)
            .expect(response => {
                if (response.body.message !== 'Login successful') {
                    throw new Error('Unexpected response message');
                }
            })
            .end(done);
    });

    it('should access protected route', function(done) {
        const agent = request.agent(app);

        agent
            .post('/login')
            .send({ email: '123@abc', password: '123' })
            .expect(200)
            .expect(response => {
                if (response.body.message !== 'Login successful') {
                    throw new Error('Unexpected response message');
                }
            })
            .end(err => {
                if (err) return done(err);

                agent
                    .get('/protected')
                    .expect(200)
                    .expect(response => {
                        if (response.body.message !== 'Protected route accessed') {
                            throw new Error('Unexpected response message');
                        }
                    })
                    .end(done);
            });
    });

    it('should fail to access protected route without login', function(done) {
        request(app)
            .get('/protected')
            .expect(401)
            .expect(response => {
                if (response.body.message !== 'Unauthorized') {
                    throw new Error('Unexpected response message');
                }
            })
            .end(done);
    });
});
