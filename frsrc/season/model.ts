import { CompwerstatsDatabase } from '../database';

export class Season {
    public id: number;
    public name: string;
    public placementRating: number;

    static create(name: string, placementRating?: number): Season {
        const season = new Season();

        season.name = name;
        season.placementRating = placementRating;

        return season;
    }

    static async load(id: number): Promise<Season> {
        const db = CompwerstatsDatabase.getInstance();

        return db.season.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.season.put(this, this.id);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.season.delete(this.id);
    }

    getName(): string {
        return this.name;
    }
}