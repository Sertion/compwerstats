import { CompwerstatsDatabase } from '../database';

export class Rank {
    public id: number;
    public title: string;
    public iconPath: string;
    public ratingMin: number;
    public ratingMax: number;

    static create(title: string, ratingMin: number, ratingMax: number, iconPath: string): Rank {
        const rank = new Rank();

        rank.title = title;
        rank.ratingMin = ratingMin;
        rank.ratingMax = ratingMax;
        rank.iconPath = iconPath;

        return rank;
    }

    static async load(id: number): Promise<Rank> {
        const db = CompwerstatsDatabase.getInstance();

        return db.rank.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.rank.put(this, this.id);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.rank.delete(this.id);
    }

    getName(): string {
        return this.title;
    }

    getIcon(): string {
        return this.iconPath;
    }
}