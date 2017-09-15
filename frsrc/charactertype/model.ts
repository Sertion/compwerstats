import { CompwerstatsDatabase } from '../database';

export class CharacterType {
    public id: number;
    public title: string;
    public iconPath: string;
    public orderWeight: number;

    static create(title: string, orderWeight: number, iconPath: string): CharacterType {
        const type = new CharacterType();

        type.title = title;
        type.orderWeight = orderWeight;
        type.iconPath = iconPath;

        return type;
    }

    static async load(id: number): Promise<CharacterType> {
        const db = CompwerstatsDatabase.getInstance();

        return db.charactertype.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.charactertype.put(this);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.charactertype.delete(this.id);
    }

    getName(): string {
        return this.title;
    }

    getIcon(): string {
        return this.iconPath;
    }
}