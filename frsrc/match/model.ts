import { CompwerstatsDatabase } from '../database';

export class Match {
    public id: number;
    public seasonId: number;
    public overwatchMapId: number;
    public time: number;
    public character: number[];
    public comment: string;
    public rating: number;
    public result: MatchResult;
    public groupsize: number;
    public type: MatchType;
    public redRating: number;
    public blueRating: number;

    static create(seasonId: number, overwatchMapId: number, time: number, character: number[], rating: number, type: MatchType, result: MatchResult, comment?: string, groupsize?: number, redRating?: number, blueRating?: number): Match {
        const match = new Match();

        match.seasonId = seasonId;
        match.overwatchMapId = overwatchMapId;
        match.time = time;
        match.character = character;
        match.rating = rating;
        match.comment = comment;
        match.groupsize = groupsize;
        match.result = result;
        match.type = type;
        match.redRating = redRating;
        match.blueRating = blueRating;

        return match;
    }

    static async load(id: number): Promise<Match> {
        const db = CompwerstatsDatabase.getInstance();

        return db.match.get(id);
    }

    async save(): Promise<number> {
        const db = CompwerstatsDatabase.getInstance();

        this.id = await db.match.put(this, this.id);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.match.delete(this.id);
    }

    getName(): string {
        const date = new Date(this.time);
        return date.toDateString() + ' ' + this.rating;
    }
}

export enum MatchType {
    Placement = 'placement',
    Match = 'match'
}

export enum MatchResult {
    Win = 'win',
    Loss = 'loss',
    Draw = 'draw'
}