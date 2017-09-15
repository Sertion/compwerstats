import { CompwerstatsDatabase } from '../database';

export class OverwatchMapType {
    public id: number;
    public title: string;
    public iconPath: string;

    static create(title: string, iconPath: string): OverwatchMapType {
        const type = new OverwatchMapType();

        type.title = title;
        type.iconPath = iconPath;

        return type;
    }

    static async load(id: number): Promise<OverwatchMapType> {
        const db = CompwerstatsDatabase.getInstance();

        return db.overwatchmaptype.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.overwatchmaptype.put(this, this.id);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.overwatchmaptype.delete(this.id);
    }

    getName(): string {
        return this.title;
    }

    getIcon(): string {
        return this.iconPath;
    }
}