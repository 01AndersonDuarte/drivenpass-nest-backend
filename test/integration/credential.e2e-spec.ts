import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TestsUtils } from '../utils/e2e-utils';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';
import { UsersFactory } from '../factories/user-factory';
import { CredentialFactory } from '../factories/credential-factory';
import { User } from '@prisma/client';

let app: INestApplication;
let prisma: PrismaService;
let auth: AuthService;

let firstUser: User;
let secondUser: User;
let usersFactory: UsersFactory;

beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get(PrismaService);
    auth = app.get(AuthService);

    await TestsUtils.cleanDB(prisma);

    await app.init();
});

describe('POST Credentials Tests (e2e)', () => {
    it('POST /credentials => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .post('/credentials')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /credentials => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .post('/credentials')
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /credentials => Should respond with status 400 when body is invalid', async () => {
        const data = await new UsersFactory(prisma).randomBuild(true);

        await request(app.getHttpServer())
            .post('/credentials')
            .set("Authorization", `Bearer ${(await auth.signIn(data)).token}`)
            .send({})
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /credentials => Should respond with status 409 when title is duplicated', async () => {
        const credential = new CredentialFactory(prisma);
        const user = await new UsersFactory(prisma)
            .setEmail("anderson@duarte.com")
            .setPassword("S3Nha-S3GuR4")
            .persist();
        const { token } = await auth.signIn({ email: "anderson@duarte.com", password: "S3Nha-S3GuR4" });
        const { title } = await credential.persist(user);
        const newCredential = credential.randomBuild();

        const response = await request(app.getHttpServer())
            .post('/credentials')
            .set("Authorization", `Bearer ${token}`)
            .send({ ...newCredential, title })
            .expect(HttpStatus.CONFLICT);
        expect(response.body.message).toEqual("A credential with this title already exists.");
    });

    it('POST /credentials => Should respond with status 201 when credential is created', async () => {
        const credential = new CredentialFactory(prisma).randomBuild();
        const { email, password } = await new UsersFactory(prisma).randomBuild(true);
        const { token } = await auth.signIn({ email, password });

        await request(app.getHttpServer())
            .post('/credentials')
            .set("Authorization", `Bearer ${token}`)
            .send(credential)
            .expect(HttpStatus.CREATED);
    });
});

describe('GET Credentials Tests (e2e)', () => {
    beforeEach(async () => {
        usersFactory = new UsersFactory(prisma);
        usersFactory.randomBuild();
        firstUser = await usersFactory.persist();
        usersFactory.randomBuild();
        secondUser = await usersFactory.persist();
    });

    it('GET /credentials => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .get('/credentials')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /credentials => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .get('/credentials')
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /credentials => Should respond with status 200 and an empty list', async () => {

        const response = await request(app.getHttpServer())
            .get('/credentials')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual([]);
    });

    it('GET /credentials => Should respond with status 200 and a list of credentials per token', async () => {
        const credential = await new CredentialFactory(prisma).persist(firstUser); //Credencial do primeiro usuário
        const { token } = auth.createToken(firstUser);
        await new CredentialFactory(prisma).persist(secondUser); //Credencial do segundo usuário

        const response = await request(app.getHttpServer())
            .get('/credentials')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual([{
            id: expect.any(Number),
            title: credential.title,
            url: credential.url,
            username: credential.username,
            password: credential.password
        }]);
    });

    it('GET /credentials => Should respond with status 404 when credential does not exist', async () => {
        const { token } = auth.createToken(firstUser);

        const response = await request(app.getHttpServer())
            .get('/credentials?id=1')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toEqual("Credential not found.");
    });

    it("GET /credentials => Should respond with status 403 if user doesn't have permission", async () => {
        const { token } = auth.createToken(firstUser);
        const secondUserCredential = await new CredentialFactory(prisma).persist(secondUser);

        //O primeiro usuário tenta acessar uma credencial que pertence ao segundo usuário
        const response = await request(app.getHttpServer())
            .get(`/credentials?id=${secondUserCredential.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
        expect(response.body.message).toEqual("You do not have permission to access this resource.");
    });

    it("GET /credentials => Should respond with status 200 and credential data", async () => {
        const { token } = auth.createToken(firstUser);
        const credential = await new CredentialFactory(prisma).persist(firstUser);

        const response = await request(app.getHttpServer())
            .get(`/credentials?id=${credential.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual({
            id: credential.id,
            title: credential.title,
            url: credential.url,
            username: credential.username,
            password: credential.password,
            userId: credential.userId
        });
    });
});

describe('DELETE Credentials Tests (e2e)', () => {
    beforeEach(async () => {
        usersFactory = new UsersFactory(prisma);
        usersFactory.randomBuild();
        firstUser = await usersFactory.persist();
        usersFactory.randomBuild();
        secondUser = await usersFactory.persist();
    });

    it('DELETE /credentials => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .del('/credentials/1')
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE /credentials => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .del('/credentials/1')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE /credentials => Should respond with status 404 when is is invalid', async () => {
        const response = await request(app.getHttpServer())
            .del('/credentials/1')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toEqual("Credential not found.");
    });

    it("DELETE /credentials => Should respond with status 403 if user doesn't have permission", async () => {
        const { token } = auth.createToken(firstUser);
        const secondUserCredential = await new CredentialFactory(prisma).persist(secondUser);

        //O primeiro usuário tenta apagar uma credencial que pertence ao segundo usuário
        const response = await request(app.getHttpServer())
            .del(`/credentials/${secondUserCredential.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
        expect(response.body.message).toEqual("You do not have permission to access this resource.");
    });

    it("DELETE /credentials => Should respond with status 200", async () => {
        const { token } = auth.createToken(firstUser);
        const credential = await new CredentialFactory(prisma).persist(firstUser);

        const response = await request(app.getHttpServer())
            .del(`/credentials/${credential.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
    });

});