import * as assert from 'assert';
import {MongoDB} from './utils/mongodb';
import {IUser} from './models/users';
import {ITeam} from './models/teams';
import {ApiServer} from './utils/apiserver';
import * as request from 'supertest';
import {Random} from './utils/random';

describe('Users resource', () => {

  let api: request.SuperTest;

  before(() => {
    api = request('http://localhost:' + ApiServer.Port);
  });

  describe('POST new user', () => {

    let user: IUser;
    let createdUser: IUser;
    let statusCode: number;
    let contentType: string;

    before((done) => {
      user = {
        userid: 'U' + Random.int(10000, 99999),
        name: 'Name_' + Random.str(5),
        modified: new Date
      };

      api.post('/users')
        .send({ userid: user.userid, name: user.name })
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          
          statusCode = res.status;
          contentType = res.header['content-type'];

          MongoDB.Users.findbyUserId(user.userid).then((user) => {
            createdUser = user;
            done();
          }).catch(done);
        });
    });

    it('should respond with status code 201 Created', () => {
      assert.strictEqual(statusCode, 201);
    });

    it('should return application/json content with charset utf-8', () => {
      assert.strictEqual(contentType, 'application/json; charset=utf-8');
    });

    it('should create the user with the expected ID and name', () => {
      assert.ok(createdUser, 'User not found');
      assert.strictEqual(createdUser.userid, user.userid);
      assert.strictEqual(createdUser.name, user.name);
    });

    after((done) => {
      MongoDB.Users.removeByUserId(user.userid).then(done).catch(done);
    });

  });

  describe('POST user with existing ID', () => {

    let user: IUser;
    let statusCode: number;

    before((done) => {
      user = {
        userid: 'U' + Random.int(10000, 99999),
        name: 'Name_' + Random.str(5),
        modified: new Date
      };

      MongoDB.Users.createUser(user).then(() => {
        api.post('/users')
          .send({ userid: user.userid, name: 'Name_' + Random.str(5) })
          .set('Accept', 'application/json')
          .end((err, res) => {
            if (err) return done(err);

            statusCode = res.status;
            done();
          });
      });
    });

    it('should respond with status code 409 Conflict', () => {
      assert.strictEqual(statusCode, 409);
    });

    after((done) => {
      MongoDB.Users.removeByUserId(user.userid).then(done).catch(done);
    });

  });

  describe('GET user by ID', () => {

    let user: IUser;
    let statusCode: number;
    let contentType: string;
    let body;

    before((done) => {
      user = {
        userid: 'U' + Random.int(10000, 99999),
        name: 'Name_' + Random.str(5),
        modified: new Date
      };
      
      MongoDB.Users.createUser(user).then(() => {
        api.get('/users/' + user.userid)
          .set('Accept', 'application/json')
          .end((err, res) => {
            if (err) return done(err);

            statusCode = res.status;
            contentType = res.header['content-type'];
            body = res.body;
            
            done();
          });
      });
    });

    it('should respond with status code 200 OK', () => {
      assert.strictEqual(statusCode, 200);
    });

    it('should return application/json content with charset utf-8', () => {
      assert.strictEqual(contentType, 'application/json; charset=utf-8');
    });

    it('should return the expected user', () => {
      assert.strictEqual(body.userid, user.userid);
      assert.strictEqual(body.name, user.name);
    });

    after((done) => {
      MongoDB.Users.removeByUserId(user.userid).then(done).catch(done);
    });

  });

  describe('GET missing user by ID', () => {

    let statusCode: number;

    before((done) => {
      api.get('/users/U' + Random.int(10000, 99999))
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);

          statusCode = res.status;
          
          done();
        });
    });

    it('should respond with status code 404 Not Found', () => {
      assert.strictEqual(statusCode, 404);
    });

  });

  describe('GET user by ID in team', () => {

    let user: IUser;
    let team: ITeam;
    let statusCode: number;
    let contentType: string;
    let body;

    before((done) => {
      user = {
        userid: 'U' + Random.int(10000, 99999),
        name: 'Name_' + Random.str(5),
        modified: new Date
      };
      
      MongoDB.Users.createUser(user).then((userId) => {
        team = {
          name: 'Team_' + Random.str(10),
          members: [userId]
        };
        return MongoDB.Teams.createTeam(team).then(() => {
          api.get('/users/' + user.userid)
            .set('Accept', 'application/json')
            .end((err, res) => {
              if (err) return done(err);

              statusCode = res.status;
              contentType = res.header['content-type'];
              body = res.body;
              
              done();
            });
        });
      }).catch(done);
    });

    it('should respond with status code 200 OK', () => {
      assert.strictEqual(statusCode, 200);
    });

    it('should return application/json content with charset utf-8', () => {
      assert.strictEqual(contentType, 'application/json; charset=utf-8');
    });

    it('should return the expected user', () => {
      assert.strictEqual(body.userid, user.userid);
      assert.strictEqual(body.name, user.name);
    });

    it('should return the team name for which this user is a member', () => {
      assert.strictEqual(body.team, team.name);
    });

    after((done) => {
      MongoDB.Users.removeByUserId(user.userid).then(done).catch(done);
    });

  });

});