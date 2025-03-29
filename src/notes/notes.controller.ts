import { Body, Controller, Post, Get, Delete, Param, NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Post('create')
    async createNote(@Body() body: {title: string, content: string}){
        return this.notesService.createNote(body.title, body.content);
    }

    @Get('viewall')
    async findAllNotes(){
        return this.notesService.getAllNotes();
    }

    @Delete('delete/:id')
    async deleteNote(@Param('id') id: string) {
        try {
            return await this.notesService.deleteNote(id);
        } catch (error) {
            if (error.code === 'P2025') { // Prisma error code for record not found
                throw new NotFoundException(`Note with ID ${id} not found`);
            }
            throw error; // Re-throw any other errors
        }
    }
}


