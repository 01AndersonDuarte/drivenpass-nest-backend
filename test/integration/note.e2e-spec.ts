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

describe('POST Notes Tests (e2e)', () => {
    it('POST /notes => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .post('/notes')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /notes => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /notes => Should respond with status 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .send({})
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /notes => Should respond with status 409 when title is duplicated', async () => {
        const note = new NoteFactory(prisma);
        const { title } = await note.persist(firstUser);
        const { token } = auth.createToken(firstUser);
        const newNote = note.randomBuild();

        const response = await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send({ ...newNote, title })
            .expect(HttpStatus.CONFLICT);
        expect(response.body.message).toEqual("A note with this title already exists.");
    });

    it('POST /notes => Should respond with status 201 when note is created', async () => {
        const note = new NoteFactory(prisma).randomBuild();
        const { token } = auth.createToken(firstUser);

        await request(app.getHttpServer())
            .post('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send(note)
            .expect(HttpStatus.CREATED);
    });
});

describe('GET Notes Tests (e2e)', () => {
    it('GET /notes => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .get('/notes')
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /notes => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .get('/notes')
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /notes => Should respond with status 200 and an empty list', async () => {
        const response = await request(app.getHttpServer())
            .get('/notes')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual([]);
    });

    it('GET /notes => Should respond with status 200 and a list of notes per token', async () => {
        const note = await new NoteFactory(prisma).persist(firstUser); //Nota do primeiro usuário
        const { token } = auth.createToken(firstUser);
        await new NoteFactory(prisma).persist(secondUser); //Nota do segundo usuário

        const response = await request(app.getHttpServer())
            .get('/notes')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual([{
            title: note.title,
            note: note.note
        }]);
    });

    it('GET /notes => Should respond with status 404 when credential does not exist', async () => {
        const { token } = auth.createToken(firstUser);

        const response = await request(app.getHttpServer())
            .get('/notes?id=1')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toEqual("Note not found.");
    });

    it("GET /notes => Should respond with status 403 if user doesn't have permission", async () => {
        const { token } = auth.createToken(firstUser);
        const secondUserNote = await new NoteFactory(prisma).persist(secondUser);

        //O primeiro usuário tenta acessar uma nota que pertence ao segundo usuário
        const response = await request(app.getHttpServer())
            .get(`/notes?id=${secondUserNote.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
        expect(response.body.message).toEqual("You do not have permission to access this resource.");
    });

    it("GET /notes => Should respond with status 200 and note data", async () => {
        const { token } = auth.createToken(firstUser);
        const note = await new NoteFactory(prisma).persist(firstUser);

        const response = await request(app.getHttpServer())
            .get(`/notes?id=${note.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
        expect(response.body).toEqual({
            title: note.title,
            note: note.note,
            userId: note.userId
        });
    });
});

describe('DELETE Notes Tests (e2e)', () => {
    it('DELETE /notes => Should respond with status 401 if no token is given', async () => {
        await request(app.getHttpServer())
            .del('/notes/1')
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE /notes => Should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.words();

        await request(app.getHttpServer())
            .del('/notes/1')
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE /notes => Should respond with status 404 when id is invalid', async () => {
        const response = await request(app.getHttpServer())
            .del('/notes/1')
            .set("Authorization", `Bearer ${(auth.createToken(firstUser)).token}`)
            .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toEqual("Note not found.");
    });

    it("DELETE /notes => Should respond with status 403 if user doesn't have permission", async () => {
        const { token } = auth.createToken(firstUser);
        const secondUserNote= await new NoteFactory(prisma).persist(secondUser);

        //O primeiro usuário tenta apagar uma nota que pertence ao segundo usuário
        const response = await request(app.getHttpServer())
            .del(`/notes/${secondUserNote.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.FORBIDDEN);
        expect(response.body.message).toEqual("You do not have permission to access this resource.");
    });

    it("DELETE /notes => Should respond with status 200", async () => {
        const { token } = auth.createToken(firstUser);
        const note = await new NoteFactory(prisma).persist(firstUser);

        const response = await request(app.getHttpServer())
            .del(`/notes/${note.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(HttpStatus.OK);
    });

});