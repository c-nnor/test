import { NotesService } from './notes.service';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    createNote(body: {
        title: string;
        content: string;
    }): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
    }>;
    findAllNotes(): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
    }[]>;
    deleteNote(id: string): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
    }>;
}
