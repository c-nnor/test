import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {} 

  async createNote(title: string, content: string): Promise<Note> {
    return this.prisma.note.create({
      data: { title, content },
    });
  }

  async getAllNotes(): Promise<Note[]> {
    return this.prisma.note.findMany();
  }

  async deleteNote(id: string): Promise<Note> {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
