import { CompwerstatsDatabase } from '../database';

export class CommentSuggestion {
    public id: number;
    public content: string;

    static create(content: string): CommentSuggestion {
        const suggestion = new CommentSuggestion();

        suggestion.content = content;

        return suggestion;
    }

    static async load(id: number): Promise<CommentSuggestion> {
        const db = CompwerstatsDatabase.getInstance();

        return db.commentsuggestion.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.commentsuggestion.put(this, this.id);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.commentsuggestion.delete(this.id);
    }

    getName(): string {
        return this.content;
    }
}