import { PrismaService } from '../prisma/prisma.service';
import { Note } from '@prisma/client';
export declare class NotesService {
    private prisma;
    constructor(prisma: PrismaService);
    createNote(title: string, content: string): Promise<Note>;
    getAllNotes(): Promise<Note[]>;
    deleteNote(id: string): Promise<Note>;
}
