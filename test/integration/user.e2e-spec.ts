import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TestsUtils } from '../utils/e2e-utils';
import { UsersFactory } from '../factories/user-factory';

let app: INestApplication;
let prisma: PrismaService;

beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get(PrismaService);

    await TestsUtils.cleanDB(prisma);

    await app.init();
});

describe('Sign-up Tests (e2e)', () => {
    it('POST /auth/sign-up => Should respond with status 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/auth/sign-up')
            .send({
                email: 'anderson@duarte.com',
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /auth/sign-up => Should reply with status 409 for email already registered', async () => {
        const { email, password } = await new UsersFactory(prisma)
            .setEmail("anderson@duarte.com")
            .setPassword("P4s2word-2tR0ng")
            .persist()

        await request(app.getHttpServer())
            .post('/auth/sign-up')
            .send({ email, password })
            .expect(HttpStatus.CONFLICT);
    });

    it('POST /auth/sign-up => Should respond with status 201 when the user is successfully registered', async () => {
        const user = new UsersFactory(prisma)
            .setEmail("anderson@duarte.com")
            .setPassword("P4s2word-2tR0ng")
            .build()

        await request(app.getHttpServer())
            .post('/auth/sign-up')
            .send(user)
            .expect(HttpStatus.CREATED);
    });

});
describe('Sign-in Tests (e2e)', () => {
    // beforeAll(()=>{
    //     const auth: AuthUsers;
    //     auth.
    // });

    it('POST /auth/sign-in => Should respond with status 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/auth/sign-in')
            .send({email: "anderson@duarte.com"})
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /auth/sign-in => Should respond with status 401 when user does not exist', async () => {
        const user = await new UsersFactory(prisma).randomBuild();
        await request(app.getHttpServer())
            .post('/auth/sign-in')
            .send(user)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /auth/sign-in => Should respond with status 401 when email or password is invalid', async () => {
        const user = await new UsersFactory(prisma).randomBuild(true);
        const response = await request(app.getHttpServer())
            .post('/auth/sign-in')
            .send({...user, password: "S3nh4+S3Gu54"})
            .expect(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toEqual("Something is wrong.");
    });

    it('POST /auth/sign-in => Should respond with status 200 when login is performed', async () => {
        const user = await new UsersFactory(prisma).randomBuild(true);        

        const loginUser = await request(app.getHttpServer())
            .post('/auth/sign-in')
            .send(user)
            .expect(HttpStatus.OK);
        expect(loginUser.body).toEqual({
            token: expect.any(String)
        });
    });
});