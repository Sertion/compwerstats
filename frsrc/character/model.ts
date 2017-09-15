import { CompwerstatsDatabase } from '../database';

export class Character {
    public id: number;
    public typeId: number;
    public name: string;
    public iconPath: string;
    public imagePath: string;

    static create(typeId: number, name: string, iconPath: string, imagePath: string): Character {
        const character = new Character();

        character.typeId = typeId;
        character.name = name;
        character.iconPath = iconPath;
        character.imagePath = imagePath;

        return character;
    }

    static async load(id: number): Promise<Character> {
        const db = CompwerstatsDatabase.getInstance();

        return db.character.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.character.put(this);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.character.delete(this.id);
    }

    getUrlSafeName(): string {
        const nonsence = 'l4k5j6';
        return this.name.toLowerCase()
            .replace(/[áàâäå]/g, 'a')
            .replace(/[úùûü]/g, 'u')
            .replace(/[óòôö]/g, 'o')
            .replace(' ', nonsence)
            .replace(/\W/g, '')
            .replace(nonsence, '-');
    }

    getName(): string {
        return this.name;
    }

    getIcon(): string {
        return this.iconPath;
    }
}