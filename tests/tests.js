const db = require('./helpers/db');
const request = require('supertest');
const app = require('../app');
const agent = request.agent(app);
const data = require('./helpers/test-data');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');

const logout = async() => {
    const response = await agent.delete('/session');
    return response.status;
}

const login = async(password) => {
    const response = await agent.post('/session').send({password: password});
    return response.status;
}

before(async function() {
    await db.connect();
});

beforeEach(async function() {
    await logout();
    await db.reset();
});

after(async function () {
    await db.finnish();
});

describe('/session', () => {

    describe('POST', () => {

        it ('201 Created', async function() {
            const status = await login(data.password);
            expect(status).to.equal(201);
        });

        it ('401 Unauthorized', async function() {
            const status = await login('invalid');
            expect(status).to.equal(401);
        });
    });

    describe('DELETE', () => {

        it ('200 OK', async function() {
            await login(data.password);
            const status = await logout();
            expect(status).to.equal(200);
        });

        it ('404 Not found', async function() {
            const status = await logout();
            expect(status).to.equal(404);
        });
    });
});


describe('/credentials', () => {

    describe('PUT', () => {

        it ('200 OK', async function() {
            await login(data.password);
            const res = await agent.put('/credentials').send({"oldPassword": data.password, "newPassword": data.passwordUpdate});
            expect(res.status).to.equal(200);
            await logout();
            const res1 = await login(data.passwordUpdate);
            expect(res.status).to.equal(200);
        });
        
        describe('401 Unauthorized', async function () {

            it ('Not logged in', async function() {
                const res = await agent.put('/credentials').send({"oldPassword" : data.password, "newPassword": data.passwordUpdate });
                expect(res.status).to.equal(401);
            });

            it ('Invalid password', async function() {
                await login(data.password);
                const res = await agent.put('/credentials').send({"oldPassword" : "invalid", "newPassword": data.passwordUpdate });
                expect(res.status).to.equal(401);
            });
        });

        it('400 Bad Request', async function () {
            await login(data.password);
            const res = await agent.put('/credentials').send({'oldPassword' : data.password, "newPassword": '1234567'});
            expect(res.status).to.equal(400);
        });
    });
});


describe('/item', () => {

    describe ('POST', () => {

        it ('201 Created', async function() {
            await login(data.password);
            const res = await agent.post('/item').send(data.items[0]);
            expect(res.status).to.equal(201);
        });

        it ('401 Unauthorized', async function() {
            const res = await agent.post('/item').send(data.items[0]);
            expect(res.status).to.equal(401);
        });
    });

    describe ('GET', () => {

        describe ('200 OK', () => {

            it ('all', async function() {
                await login(data.password);
                await agent.post('/item').send(data.items[0]);
                await agent.post('/item').send(data.items[1]);
                await logout();

                const res = await agent.get('/item');
                expect(res.status).to.equal(200);
                expect(res.body.length).to.equal(2);

                expect(res.body[0].title).to.equal(data.items[0].title);
                expect(res.body[0].short_desc).to.equal(data.items[0].short_desc);
                expect(res.body[0].long_desc).to.equal(undefined); //long description is omitted by default when getting all.
                expect(res.body[0].tags.length).to.equal(0);

                expect(res.body[1].title).to.equal(data.items[1].title);
                expect(res.body[1].short_desc).to.equal(data.items[1].short_desc);
                expect(res.body[1].long_desc).to.equal(undefined);
                expect(res.body[1].tags.length).to.equal(0);
            });

            it ('by id', async function() {
                await login(data.password);
                await agent.post('/item').send(data.items[0]);
                const res0 = await agent.post('/item').send(data.items[1]);
                await logout();

                const res1 = await agent.get('/item/' + res0.body._id);
                expect(res1.status).to.equal(200);
                expect(res1.body.title).to.equal(data.items[1].title);
                expect(res1.body.short_desc).to.equal(data.items[1].short_desc);
                expect(res1.body.long_desc).to.equal(data.items[1].long_desc);
            });
        });

        it ('404 Not found', async function() {
            const res = await agent.get('/item/' + mongoose.Types.ObjectId());
            expect(res.status).to.equal(404);
        });

        it ('400 Bad request', async function() {
            await login(data.password);
            const res = await agent.get('/item/123');
            expect(res.status).to.equal(400);
        });
    });

    describe ('PUT', () => {

        it ('200 OK', async function() {
            await login(data.password);
            const res0 = await agent.post('/item').send(data.items[0]);
            const res1 = await agent.put('/item/' + res0.body._id).send(data.itemUpdate);
            expect(res1.status).to.equal(200);
            expect(res1.body.title).to.equal(data.itemUpdate.title);
            expect(res1.body.tags.length).to.equal(data.itemUpdate.tags.length);
            expect(res1.body.tags[0]).to.equal(data.itemUpdate.tags[0]);
        });

        it ('404 Not found', async function() {
            await login(data.password);
            const res = await agent.put('/item/' + mongoose.Types.ObjectId()).send(data.itemUpdate);
            expect(res.status).to.equal(404);
        });

        it ('401 Unauthorized', async function() {
            const res = await agent.put('/item/' + mongoose.Types.ObjectId()).send(data.itemUpdate);
            expect(res.status).to.equal(401);
        });

        it ('400 Bad request', async function() {
            await login(data.password);
            const res = await agent.put('/item/123').send(data.itemUpdate);
            expect(res.status).to.equal(400);
        });
    });

    describe ('DELETE', () => {

        it ('200 OK', async function() {
            await login(data.password);
            const res0 = await agent.post('/item').send(data.items[0]);
            const res1 = await agent.delete('/item/' + res0.body._id);
            expect(res1.status).to.equal(200);
        });

        it ('404 Not found', async function() {
            await login(data.password);
            const res0 = await agent.delete('/item/' + mongoose.Types.ObjectId());
            expect(res0.status).to.equal(404);
        });

        it ('401 Unauthorized', async function() {
            const res0 = await agent.delete('/item/' + mongoose.Types.ObjectId());
            expect(res0.status).to.equal(401);
        });

        it ('400 Bad request', async function() {
            await login(data.password);
            const res = await agent.delete('/item/123');
            expect(res.status).to.equal(400);
        });
    });
});


describe('/info', () => {

    describe('PUT', () => {

        it ('200 OK', async function() {
            await login(data.password);
            const res = await agent.put('/info').send(data.infoUpdate);
            expect(res.status).to.equal(200);
            expect(res.short_info, data.infoUpdate.short_info);
            expect(res.long_info, data.infoUpdate.long_info);
            expect(res.email, data.infoUpdate.email);
        });

        it ('401 Unauthorized', async function() {
            const res0 = await agent.put('/info').send(data.infoUpdate);
            expect(res0.status).to.equal(401);
        });

    });

    describe('GET', () => {

        describe('200 OK', () => {

            it('Empty', async function () {
                const res = await agent.get('/info');
                expect(res.status).to.equal(200);
                expect(res.short_info, '');
                expect(res.long_info, '');
                expect(res.email, '');
            });

            it('Not empty', async function () {
                await login(data.password);
                await agent.put('/info').send(data.infoUpdate);
                const res = await agent.get('/info');
                expect(res.status).to.equal(200);
                expect(res.short_info, data.infoUpdate.short_info);
                expect(res.long_info, data.infoUpdate.long_info);
                expect(res.email, data.infoUpdate.email);
            });
        });
    });
});

