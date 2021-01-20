import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'test@email.com',
  password: 'password',
};

const testPodcast = {
  title: 'test title',
  category: 'test category',
};

const testEpisode = {
  title: 'test title',
  description: 'test description',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('Users Resolver', () => {
    describe('createAccount', () => {
      it('should create account', () => {
        return publicTest(`
          mutation{
            createAccount(input: {
              email: "${testUser.email}"
              password: "${testUser.password}"
              role: Listener
            }) {
              ok
              user {
                id
                email
                role
              }
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { createAccount },
              },
            } = res;
            expect(createAccount.ok).toBe(true);
            expect(createAccount.error).toBe(null);
            expect(createAccount.user).toStrictEqual({
              id: 1,
              email: testUser.email,
              role: 'Listener',
            });
          });
      });
      it('should fail if account already exists', () => {
        return publicTest(`
          mutation{
            createAccount(input: {
              email: "${testUser.email}"
              password: "${testUser.password}"
              role: Listener
            }) {
              ok
              user {
                id
                email
                role
              }
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { createAccount },
              },
            } = res;
            expect(createAccount.ok).toBe(false);
            expect(createAccount.error).toBe(
              'There is a user with that email alraedy.',
            );
            expect(createAccount.user).toBe(null);
          });
      });
    });
    describe('signIn', () => {
      it('should login with correct credentials', () => {
        return publicTest(`
          mutation {
            signIn(input: {
              email: "${testUser.email}"
              password: "${testUser.password}"
            }) {
              ok
              token
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { signIn },
              },
            } = res;
            expect(signIn.ok).toBe(true);
            expect(signIn.error).toBe(null);
            expect(signIn.token).toEqual(expect.any(String));
            jwtToken = signIn.token;
          });
      });
      it('should not be able to login with wrong password', () => {
        return publicTest(`
          mutation {
            signIn(input: {
              email: "${testUser.email}"
              password: "wrong.password"
            }) {
              ok
              token
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { signIn },
              },
            } = res;
            expect(signIn.ok).toBe(false);
            expect(signIn.error).toBe('Wrong password.');
            expect(signIn.token).toBe(null);
          });
      });
      it('should not be able to login with email not found', () => {
        return publicTest(`
          mutation {
            signIn(input: {
              email: "email@not.found"
              password: "${testUser.password}"
            }) {
              ok
              token
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { signIn },
              },
            } = res;
            expect(signIn.ok).toBe(false);
            expect(signIn.error).toBe('User not found.');
            expect(signIn.token).toBe(null);
          });
      });
    });
    describe('profile', () => {
      let userId: number;
      beforeAll(async () => {
        const [user] = await usersRepository.find();
        userId = user.id;
      });
      it("should see a user's profile", () => {
        return privateTest(`
          {
            profile(userId: ${userId}) {
              ok
              user {
                id
                email
                role
              }
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  profile: { ok, error, user },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(user).toStrictEqual({
              id: 1,
              email: testUser.email,
              role: 'Listener',
            });
          });
      });
      it('should not find a profile', () => {
        return privateTest(`
          {
            profile(userId:0){
              ok
              error
              user {
                id
                email
                role
              }
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  profile: { ok, error, user },
                },
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe('User not found.');
            expect(user).toBe(null);
          });
      });
    });
    describe('me', () => {
      it('should find my profile', () => {
        return privateTest(`
          {
            me {
              id
              email
              role
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { me },
              },
            } = res;
            expect(me).toStrictEqual({
              id: 1,
              email: testUser.email,
              role: 'Listener',
            });
          });
      });
      it('should not allow logged out user', () => {
        return publicTest(`
          {
            me {
              email
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: { errors },
            } = res;
            const [error] = errors;
            expect(error.message).toBe('Forbidden resource');
          });
      });
    });
    describe('updateProfile', () => {
      const NEW_EMAIL = 'new@email.com';
      const NEW_PASSWORD = 'new.password';
      const NEW_ROLE = 'Host';

      it('should change email', () => {
        return privateTest(`
          mutation {
            updateProfile(input:{
              email: "${NEW_EMAIL}"
            }) {
              ok
              user {
                id
                email
                role
              }
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  updateProfile: { ok, error, user },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(user).toStrictEqual({
              id: 1,
              email: NEW_EMAIL,
              role: 'Listener',
            });
          });
      });
      it('should have new email', () => {
        return privateTest(`
          {
            me {
              id
              email
              role
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { me },
              },
            } = res;
            expect(me).toStrictEqual({
              id: 1,
              email: NEW_EMAIL,
              role: 'Listener',
            });
          });
      });
      it('should change role', () => {
        return privateTest(`
          mutation {
            updateProfile(input:{
              role: ${NEW_ROLE}
            }) {
              ok
              user {
                id
                email
                role
              }
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  updateProfile: { ok, error, user },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(user).toStrictEqual({
              id: 1,
              email: NEW_EMAIL,
              role: NEW_ROLE,
            });
          });
      });
      it('should have new role', () => {
        return privateTest(`
          {
            me {
              id
              email
              role
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { me },
              },
            } = res;
            expect(me).toStrictEqual({
              id: 1,
              email: NEW_EMAIL,
              role: NEW_ROLE,
            });
          });
      });
      it('should change password', () => {
        return privateTest(`
          mutation {
            updateProfile(input: {
              password: "${NEW_PASSWORD}"
            }) {
              ok
              user {
                id
                email
                role
              }
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  updateProfile: { ok, error, user },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(user).toStrictEqual({
              id: 1,
              email: NEW_EMAIL,
              role: NEW_ROLE,
            });
          });
      });
      it('should sign in with new email, new password', () => {
        return publicTest(`
          mutation {
            signIn(input: {
              email: "${NEW_EMAIL}"
              password: "${NEW_PASSWORD}"
            }) {
              ok
              token
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { signIn },
              },
            } = res;
            expect(signIn.ok).toBe(true);
            expect(signIn.error).toBe(null);
            expect(signIn.token).toEqual(expect.any(String));
          });
      });
    });
  });

  describe('Podcasts Resolver', () => {
    const listenerUser = {
      email: 'listener@email.com',
      password: 'password',
      role: 'Listener',
    };
    const hostUser = {
      email: 'host@email.com',
      password: 'password',
      role: 'Host',
    };
    let listenerToken: string;
    let hostToken: string;
    beforeAll(async () => {
      await publicTest(`
        mutation{
          createAccount(input: {
            email: "${hostUser.email}"
            password: "${hostUser.password}"
            role: ${hostUser.role}
          }) {
            ok
            user {
              id
              email
              role
            }
            error
          }
        }
      `);
      await publicTest(`
        mutation{
          createAccount(input: {
            email: "${listenerUser.email}"
            password: "${listenerUser.password}"
            role: ${listenerUser.role}
          }) {
            ok
            user {
              id
              email
              role
            }
            error
          }
        }
      `);
      let result = await publicTest(`
        mutation {
          signIn(input: {
            email: "${hostUser.email}"
            password: "${hostUser.password}"
          }) {
            ok
            token
            error
          }
        }
      `);
      hostToken = result.body.data.signIn.token;

      result = await publicTest(`
        mutation {
          signIn(input: {
            email: "${listenerUser.email}"
            password: "${listenerUser.password}"
          }) {
            ok
            token
            error
          }
        }
      `);
      listenerToken = result.body.data.signIn.token;
    });
    describe('Podcast', () => {
      describe('createPodcast', () => {
        it('shoud create podcast', async () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              createPodcast(input: {
                title: "${testPodcast.title}"
                category: "${testPodcast.category}"
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { createPodcast },
                },
              } = res;
              expect(createPodcast.ok).toBe(true);
              expect(createPodcast.error).toBe(null);
              expect(createPodcast.podcast).toEqual({
                id: 1,
                title: testPodcast.title,
                category: testPodcast.category,
                rating: 0,
                episodes: [],
              });
            });
        });
        it('should fail if logged out user', () => {
          return publicTest(`
            mutation {
              createPodcast(input: {
                title: "${testPodcast.title}"
                category: "${testPodcast.category}"
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if sign in Listener user', async () => {
          jwtToken = listenerToken;
          return privateTest(`
            mutation {
              createPodcast(input: {
                title: "${testPodcast.title}"
                category: "${testPodcast.category}"
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
      });
      describe('getPodcasts', () => {
        it('should allow Host user', async () => {
          jwtToken = hostToken;
          return privateTest(`
            {
              getPodcasts {
                ok
                podcasts {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getPodcasts },
                },
              } = res;
              expect(getPodcasts.ok).toBe(true);
              expect(getPodcasts.error).toBe(null);
              expect(getPodcasts.podcasts).toHaveLength(1);
              expect(getPodcasts.podcasts).toEqual([
                {
                  id: 1,
                  title: testPodcast.title,
                  category: testPodcast.category,
                  rating: 0,
                  episodes: [],
                },
              ]);
            });
        });
        it('should allow Listener user', async () => {
          jwtToken = listenerToken;
          return privateTest(`
            {
              getPodcasts {
                ok
                podcasts {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getPodcasts },
                },
              } = res;
              expect(getPodcasts.ok).toBe(true);
              expect(getPodcasts.error).toBe(null);
              expect(getPodcasts.podcasts).toHaveLength(1);
              expect(getPodcasts.podcasts).toStrictEqual([
                {
                  id: 1,
                  title: testPodcast.title,
                  category: testPodcast.category,
                  rating: 0,
                  episodes: [],
                },
              ]);
            });
        });
        it('should fail if logged out user', async () => {
          return publicTest(`
            {
              getPodcasts {
                ok
                podcasts {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
      });
      describe('getPodcast', () => {
        it('should allow Host user', async () => {
          jwtToken = hostToken;
          return privateTest(`
            {
              getPodcast(input: {
                id: 1
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getPodcast },
                },
              } = res;
              expect(getPodcast.ok).toBe(true);
              expect(getPodcast.error).toBe(null);
              expect(getPodcast.podcast).toStrictEqual({
                id: 1,
                title: testPodcast.title,
                category: testPodcast.category,
                rating: 0,
                episodes: [],
              });
            });
        });
        it('should allow Listener user', async () => {
          jwtToken = listenerToken;
          return privateTest(`
            {
              getPodcast(input: {
                id: 1
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getPodcast },
                },
              } = res;
              expect(getPodcast.ok).toBe(true);
              expect(getPodcast.error).toBe(null);
              expect(getPodcast.podcast).toStrictEqual({
                id: 1,
                title: testPodcast.title,
                category: testPodcast.category,
                rating: 0,
                episodes: [],
              });
            });
        });
        it('should fail if logged out user', async () => {
          return publicTest(`
            {
              getPodcast(input: {
                id: 1
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                    createdAt
                    updatedAt
                  }
                  createdAt
                  updatedAt
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if podcast not found', async () => {
          return privateTest(`
            {
              getPodcast(input: {
                id: 2
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                    createdAt
                    updatedAt
                  }
                  createdAt
                  updatedAt
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getPodcast },
                },
              } = res;
              expect(getPodcast.ok).toBe(false);
              expect(getPodcast.podcast).toBe(null);
              expect(getPodcast.error).toBe('Podcast with ID 2 not found.');
            });
        });
      });
      describe('updatePodcast', () => {
        const newPodcast = {
          title: 'New title',
          category: 'New category',
          rating: 1,
        };
        it('should allow Host user', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              updatePodcast(input: {
                id: 1
                title: "${newPodcast.title}"
                category: "${newPodcast.category}"
                rating: ${newPodcast.rating}
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { updatePodcast },
                },
              } = res;
              expect(updatePodcast.ok).toEqual(true);
              expect(updatePodcast.error).toEqual(null);
              expect(updatePodcast.podcast).toEqual({
                id: 1,
                title: newPodcast.title,
                category: newPodcast.category,
                rating: newPodcast.rating,
                episodes: [],
              });
            });
        });
        it('should fail if podcast not found', () => {
          return privateTest(`
            mutation {
              updatePodcast(input: {
                id: 2
                title: "${newPodcast.title}"
                category: "${newPodcast.category}"
                rating: ${newPodcast.rating}
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                    createdAt
                    updatedAt
                  }
                  createdAt
                  updatedAt
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { updatePodcast },
                },
              } = res;
              expect(updatePodcast.ok).toBe(false);
              expect(updatePodcast.podcast).toBe(null);
              expect(updatePodcast.error).toBe('Podcast with ID 2 not found.');
            });
        });
        it('should fail if Listener user', () => {
          jwtToken = listenerToken;
          return privateTest(`
            mutation {
              updatePodcast(input: {
                id: 1
                title: "${newPodcast.title}"
                category: "${newPodcast.category}"
                rating: ${newPodcast.rating}
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                    createdAt
                    updatedAt
                  }
                  createdAt
                  updatedAt
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if logged out user', () => {
          return publicTest(`
            mutation {
              updatePodcast(input: {
                id: 1
                title: "${newPodcast.title}"
                category: "${newPodcast.category}"
                rating: ${newPodcast.rating}
              }) {
                ok
                podcast {
                  id
                  title
                  category
                  rating
                  episodes {
                    id
                    title
                    description
                    createdAt
                    updatedAt
                  }
                  createdAt
                  updatedAt
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
      });
      describe('deletePodcast', () => {
        it('should fail if logged out user', () => {
          return publicTest(`
            mutation {
              deletePodcast(input: {
                id: 1
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if Listener user', () => {
          jwtToken = listenerToken;
          return privateTest(`
            mutation {
              deletePodcast(input: {
                id: 1
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if podcast not found', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              deletePodcast(input: {
                id: 2
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { deletePodcast },
                },
              } = res;
              expect(deletePodcast.ok).toBe(false);
              expect(deletePodcast.error).toBe('Podcast with ID 2 not found.');
            });
        });
        it('should allow Host user', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              deletePodcast(input: {
                id: 1
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { deletePodcast },
                },
              } = res;
              expect(deletePodcast.ok).toEqual(true);
              expect(deletePodcast.error).toBe(null);
            });
        });
      });
    });
    describe('Episode', () => {
      let podcast;
      let episode;
      beforeAll(async () => {
        jwtToken = hostToken;
        const result = await privateTest(`
          mutation {
            createPodcast(input: {
              title: "${testPodcast.title}"
              category: "${testPodcast.category}"
            }) {
              ok
              podcast {
                id
                title
                category
                rating
                episodes {
                  id
                  title
                  description
                }
              }
              error
            }
          }
        `);
        podcast = result.body.data.createPodcast.podcast;
      });
      describe('createEpisode', () => {
        it('shoud create podcast', async () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              createEpisode(input: {
                podcastId: ${podcast.id}
                title: "${testEpisode.title}"
                description: "${testEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { createEpisode },
                },
              } = res;
              expect(createEpisode.ok).toBe(true);
              expect(createEpisode.error).toBe(null);
              expect(createEpisode.episode).toEqual({
                id: 1,
                title: testEpisode.title,
                description: testEpisode.description,
                podcast: {
                  id: podcast.id,
                },
              });
              episode = createEpisode.episode;
            });
        });
        it('should fail if podcast not found', () => {
          return privateTest(`
            mutation {
              createEpisode(input: {
                podcastId: 3
                title: "${testEpisode.title}"
                description: "${testEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { createEpisode },
                },
              } = res;
              expect(createEpisode.ok).toBe(false);
              expect(createEpisode.error).toBe('Podcast with ID 3 not found.');
              expect(createEpisode.episode).toEqual(null);
            });
        });
        it('should faile if sign in Listener user', async () => {
          jwtToken = listenerToken;
          return privateTest(`
            mutation {
              createEpisode(input: {
                podcastId: ${podcast.id}
                title: "${testEpisode.title}"
                description: "${testEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if logged out user', () => {
          return publicTest(`
            mutation {
              createEpisode(input: {
                podcastId: ${podcast.id}
                title: "${testEpisode.title}"
                description: "${testEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
      });
      describe('getEpisodes', () => {
        it('should allow Host user', async () => {
          jwtToken = hostToken;
          return privateTest(`
            {
              getEpisodes(input: {
                podcastId: ${podcast.id}
              }) {
                ok
                episodes {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisodes },
                },
              } = res;
              expect(getEpisodes.ok).toBe(true);
              expect(getEpisodes.error).toBe(null);
              expect(getEpisodes.episodes).toHaveLength(1);
              expect(getEpisodes.episodes).toEqual([
                {
                  id: 1,
                  title: testEpisode.title,
                  description: testEpisode.description,
                  podcast: {
                    id: podcast.id,
                  },
                },
              ]);
            });
        });
        it('should allow Listener user', async () => {
          jwtToken = listenerToken;
          return privateTest(`
            {
              getEpisodes(input: {
                podcastId: ${podcast.id}
              }) {
                ok
                episodes {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisodes },
                },
              } = res;
              expect(getEpisodes.ok).toBe(true);
              expect(getEpisodes.error).toBe(null);
              expect(getEpisodes.episodes).toHaveLength(1);
              expect(getEpisodes.episodes).toStrictEqual([
                {
                  id: 1,
                  title: testEpisode.title,
                  description: testEpisode.description,
                  podcast: {
                    id: podcast.id,
                  },
                },
              ]);
            });
        });
        it('should fail if podcast not found', async () => {
          return privateTest(`
            {
              getEpisodes(input: {
                podcastId: 0
              }) {
                ok
                episodes {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisodes },
                },
              } = res;
              expect(getEpisodes.ok).toBe(false);
              expect(getEpisodes.episodes).toBe(null);
              expect(getEpisodes.error).toBe('Podcast with ID 0 not found.');
            });
        });
        it('should fail if logged out user', async () => {
          return publicTest(`
            {
              getEpisodes(input: {
                podcastId: ${podcast.id}
              }) {
                ok
                episodes {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                  createdAt
                  updatedAt
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
      });
      describe('getEpisode', () => {
        it('should allow Host user', async () => {
          jwtToken = hostToken;
          return privateTest(`
            {
              getEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisode },
                },
              } = res;
              expect(getEpisode.ok).toBe(true);
              expect(getEpisode.error).toBe(null);
              expect(getEpisode.episode).toEqual({
                id: episode.id,
                title: testEpisode.title,
                description: testEpisode.description,
                podcast: {
                  id: podcast.id,
                },
              });
            });
        });
        it('should allow Listener user', async () => {
          jwtToken = listenerToken;
          return privateTest(`
            {
              getEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisode },
                },
              } = res;
              expect(getEpisode.ok).toBe(true);
              expect(getEpisode.error).toBe(null);
              expect(getEpisode.episode).toStrictEqual({
                id: 1,
                title: testEpisode.title,
                description: testEpisode.description,
                podcast: {
                  id: podcast.id,
                },
              });
            });
        });
        it('should fail if logged out user', async () => {
          return publicTest(`
            {
              getEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if podcast not found', async () => {
          return privateTest(`
            {
              getEpisode(input: {
                podcastId: 0
                episodeId: ${episode.id}
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisode },
                },
              } = res;
              expect(getEpisode.ok).toBe(false);
              expect(getEpisode.episode).toBe(null);
              expect(getEpisode.error).toBe('Podcast with ID 0 not found.');
            });
        });
        it('should fail if episode not found', async () => {
          return privateTest(`
            {
              getEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: 0
              }) {
                ok
                episode {
                  id
                  title
                  description
                  podcast {
                    id
                  }
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { getEpisode },
                },
              } = res;
              expect(getEpisode.ok).toBe(false);
              expect(getEpisode.episode).toBe(null);
              expect(getEpisode.error).toBe('Episode with ID 0 not found.');
            });
        });
      });
      describe('updateEpisode', () => {
        const newEpisode = {
          title: 'New title',
          description: 'New description',
        };
        it('should allow Host user', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              updateEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
                title: "${newEpisode.title}"
                description: "${newEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { updateEpisode },
                },
              } = res;
              expect(updateEpisode.ok).toEqual(true);
              expect(updateEpisode.error).toEqual(null);
              expect(updateEpisode.episode).toEqual({
                id: 1,
                title: newEpisode.title,
                description: newEpisode.description,
              });
            });
        });
        it('should fail if podcast not found', () => {
          return privateTest(`
            mutation {
              updateEpisode(input: {
                podcastId: 0
                episodeId: ${episode.id}
                title: "${newEpisode.title}"
                description: "${newEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { updateEpisode },
                },
              } = res;
              expect(updateEpisode.ok).toBe(false);
              expect(updateEpisode.episode).toBe(null);
              expect(updateEpisode.error).toBe('Podcast with ID 0 not found.');
            });
        });
        it('should fail if episode not found', () => {
          return privateTest(`
            mutation {
              updateEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: 0
                title: "${newEpisode.title}"
                description: "${newEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { updateEpisode },
                },
              } = res;
              expect(updateEpisode.ok).toBe(false);
              expect(updateEpisode.episode).toBe(null);
              expect(updateEpisode.error).toBe('Episode with ID 0 not found.');
            });
        });
        it('should fail if Listener user', () => {
          jwtToken = listenerToken;
          return privateTest(`
            mutation {
              updateEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
                title: "${newEpisode.title}"
                description: "${newEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if logged out user', () => {
          return publicTest(`
            mutation {
              updateEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
                title: "${newEpisode.title}"
                description: "${newEpisode.description}"
              }) {
                ok
                episode {
                  id
                  title
                  description
                }
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
      });
      describe('deleteEpisode', () => {
        it('should fail if logged out user', () => {
          return publicTest(`
            mutation {
              deleteEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if Listener user', () => {
          jwtToken = listenerToken;
          return privateTest(`
            mutation {
              deleteEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { errors },
              } = res;
              const [error] = errors;
              expect(error.message).toBe('Forbidden resource');
            });
        });
        it('should fail if podcast not found', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              deleteEpisode(input: {
                podcastId: 0
                episodeId: ${episode.id}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { deleteEpisode },
                },
              } = res;
              expect(deleteEpisode.ok).toBe(false);
              expect(deleteEpisode.error).toBe('Podcast with ID 0 not found.');
            });
        });
        it('should fail if episode not found', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              deleteEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: 0
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { deleteEpisode },
                },
              } = res;
              expect(deleteEpisode.ok).toBe(false);
              expect(deleteEpisode.error).toBe('Episode with ID 0 not found.');
            });
        });
        it('should allow Host user', () => {
          jwtToken = hostToken;
          return privateTest(`
            mutation {
              deleteEpisode(input: {
                podcastId: ${podcast.id}
                episodeId: ${episode.id}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: { deleteEpisode },
                },
              } = res;
              expect(deleteEpisode.ok).toEqual(true);
              expect(deleteEpisode.error).toBe(null);
            });
        });
      });
    });
  });
});
