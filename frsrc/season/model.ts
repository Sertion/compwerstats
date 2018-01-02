import { CompwerstatsDatabase } from '../database';

export class Season {
    public id: number;
    public name: string;
    public placementRating: number;
    public archived: boolean;

    static create(name: string, placementRating?: number, archived: boolean = false): Season {
        const season = new Season();

        season.name = name;
        season.placementRating = placementRating;
        season.archived = archived;

        return season;
    }

    static async load(id: number): Promise<Season> {
        const db = CompwerstatsDatabase.getInstance();

        return db.season.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.season.put(this);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.season.delete(this.id);
    }

    getName(): string {
        const [name] = this.name.toString().match(/[\d]+/);
        return name;
    }
}