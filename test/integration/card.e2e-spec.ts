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
import { User } from '@prisma/client';
import { NoteFactory } from '../factories/note-factory';
import { CardFactory } from '../factories/card-factory';

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

    usersFactory = new UsersFactory(prisma);
    usersFactory.randomBuild();
    firstUser = await usersFactory.persist();
    usersFactory.randomBuild();
    secondUser = await usersFactory.persist();

    await app.init();
});

describe('POST Cards Tests (e2e)', () => {
    it('POST /cards => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .post('/cards')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /cards => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .post('/cards')
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /cards => Should respond with status 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/cards')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .send({})
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /cards => Should respond with status 409 when title is duplicated', async () => {
        const card = new CardFactory(prisma);
        const { title } = await card.persist(firstUser);
        const { token } = auth.createToken(firstUser);
        const newCard = card.randomBuild();

        const response = await request(app.getHttpServer())
            .post('/cards')
            .set("Authorization", `Bearer ${token}`)
            .send({ ...newCard, title })
            .expect(HttpStatus.CONFLICT);
        expect(response.body.message).toEqual("A card with this title already exists.");
    });

    it('POST /cards => Should respond with status 201 when card is created', async () => {
        const card = new CardFactory(prisma).randomBuild();
        const { token } = auth.createToken(firstUser);

        await request(app.getHttpServer())
            .post('/cards')
            .set("Authorization", `Bearer ${token}`)
            .send(card)
            .expect(HttpStatus.CREATED);
    });
});

describe('GET Cards Tests (e2e)', () => {
    it('GET /cards => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .get('/cards')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /cards => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .get('/cards')
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /cards => Should respond with status 200 and an empty list', async () => {
        const response = await request(app.getHttpServer())
            .get('/cards')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual([]);
    });

    it('GET /cards => Should respond with status 200 and a list of cards per token', async () => {
        const card = await new CardFactory(prisma).persist(firstUser); //Cartão do primeiro usuário
        const { token } = auth.createToken(firstUser);
        await new CardFactory(prisma).persist(secondUser); //Cartão do segundo usuário

        const response = await request(app.getHttpServer())
            .get('/cards')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual([{
            id: card.id,
            title: card.title,
            number: card.number,
            name: card.name,
            code: card.code,
            date: card.date.toISOString(),
            password: card.password,
            virtual: card.virtual,
            type: card.type,
            userId: card.userId,
        }]);
    });

    it('GET /cards => Should respond with status 404 when card does not exist', async () => {
        const { token } = auth.createToken(firstUser);

        const response = await request(app.getHttpServer())
            .get('/cards?id=1')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toEqual("Card not found.");
    });

    it("GET /cards => Should respond with status 403 if user doesn't have permission", async () => {
        const { token } = auth.createToken(firstUser);
        const secondUserCard = await new CardFactory(prisma).persist(secondUser);

        //O primeiro usuário tenta acessar um cartão que pertence ao segundo usuário
        const response = await request(app.getHttpServer())
            .get(`/cards?id=${secondUserCard.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
        expect(response.body.message).toEqual("You do not have permission to access this resource.");
    });

    it("GET /cards => Should respond with status 200 and card data", async () => {
        const { token } = auth.createToken(firstUser);
        const card = await new CardFactory(prisma).persist(firstUser);

        const response = await request(app.getHttpServer())
            .get(`/cards?id=${card.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual({
            id: card.id,
            title: card.title,
            number: card.number,
            name: card.name,
            code: card.code,
            date: card.date.toISOString(),
            password: card.password,
            virtual: card.virtual,
            type: card.type,
            userId: card.userId
        });
    });
});

describe('DELETE Cards Tests (e2e)', () => {
    it('DELETE /cards => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .del('/cards/1')
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE /cards => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .del('/cards/1')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE /cards => Should respond with status 404 when id is invalid', async () => {
        const response = await request(app.getHttpServer())
            .del('/cards/1')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toEqual("Card not found.");
    });

    it("DELETE /cards => Should respond with status 403 if user doesn't have permission", async () => {
        const { token } = auth.createToken(firstUser);
        const secondUserCard = await new CardFactory(prisma).persist(secondUser);

        //O primeiro usuário tenta apagar uma nota que pertence ao segundo usuário
        const response = await request(app.getHttpServer())
            .del(`/cards/${secondUserCard.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
        expect(response.body.message).toEqual("You do not have permission to access this resource.");
    });

    it("DELETE /cards => Should respond with status 200", async () => {
        const { token } = auth.createToken(firstUser);
        const card = await new CardFactory(prisma).persist(firstUser);

        const response = await request(app.getHttpServer())
            .del(`/cards/${card.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
    });

});