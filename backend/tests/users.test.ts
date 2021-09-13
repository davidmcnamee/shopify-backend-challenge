import { assert } from 'chai';
import { httpServerPromise } from '../src/server';
import request from 'supertest';
import { db } from '../src/db';

let app = null;
before(async () => app = await httpServerPromise);
beforeEach(() => Promise.all([db.user.deleteMany(), db.image.deleteMany()]));

async function createTestUser() {
  const response = await request(app)
    .post('/graphql')
    .send({
      query: `
        mutation RegisterNewUser($input: RegisterInput!) {
          users {
            register(input: $input) {
              id
              username
              email
            }
          }
        }        
      `,
      variables: {
        input: { username: "david", email: "david@email.com", password: "password" },
      }
    });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.users.register.username, "david");
  assert.equal(response.body.data.users.register.email, "david@email.com");
}

describe('users', function() {
  this.timeout(5000);
  describe('register()', function() {
    it('should create a user when run normally', createTestUser);
    it('should fail when the provided email already exists', async () => {
      await createTestUser();
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation RegisterNewUser($input: RegisterInput!) {
              users {
                register(input: $input) {
                  id
                  username
                  email
                }
              }
            }        
          `,
          variables: {
            input: { username: "david2", email: "david@email.com", password: "password2" },
          }
        });
      assert.equal(response.statusCode, 401);
    })
  });
  describe('login()', function() {
    it('should work normally', async function() {
      await createTestUser();
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation UserLogin($input: LoginInput!) {
              users {
                login(input: $input) {
                  id
                  username
                  email
                }
              }
            }        
          `,
          variables: {
            input: { username: "david", password: "password" },
          }
        });
      assert.equal(response.status, 200);
      assert.equal(response.body.data.users.login.username, "david");
      assert.equal(response.body.data.users.login.email, "david@email.com");
    });
  });
});

after(async () => app.close());
