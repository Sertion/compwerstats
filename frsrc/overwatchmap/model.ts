import { CompwerstatsDatabase } from '../database';

export class OverwatchMap {
    public id: number;
    public overwatchMapTypeId: number;
    public name: string;
    public imagePath: string;

    static create(overwatchMapTypeId: number, name: string, imagePath: string): OverwatchMap {
        const map = new OverwatchMap();

        map.overwatchMapTypeId = overwatchMapTypeId;
        map.name = name;
        map.imagePath = imagePath;

        return map;
    }

    static async load(id: number): Promise<OverwatchMap> {
        const db = CompwerstatsDatabase.getInstance();

        return db.overwatchmap.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        if (!this.imagePath) {
            this.imagePath = './static/img/no-map-image.jpg';
        }

        this.id = await db.overwatchmap.put(this);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.overwatchmap.delete(this.id);
    }

    getName(): string {
        return this.name;
    }

    getIcon(): string {
        return this.imagePath;
    }
}