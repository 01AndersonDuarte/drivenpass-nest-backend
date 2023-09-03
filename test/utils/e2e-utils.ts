import { PrismaService } from "../../src/prisma/prisma.service";

export class TestsUtils{
    static async cleanDB(prisma: PrismaService){
        await prisma.card.deleteMany();
        await prisma.note.deleteMany();
        await prisma.credential.deleteMany();
        await prisma.user.deleteMany();
    }
}