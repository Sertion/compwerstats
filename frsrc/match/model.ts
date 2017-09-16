import * as Moment from 'moment';
import { CompwerstatsDatabase } from '../database';

export class Match {
    public id: number;
    public seasonId: number;
    public overwatchMapId: number;
    public time: number;
    public timeDate: string;
    public timeTime: string;
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

        if (this.timeDate && this.timeTime) {
            const date = Moment(this.timeDate).format('YYYY-MM-DD');
            this.time = Moment(`${date}T${this.timeTime}:00`).valueOf();
            delete this.timeDate;
            delete this.timeTime;
        }

        this.id = await db.match.put(this, this.id);

        return this.id;
    }

    async delete(): Promise<void> {
        const db = CompwerstatsDatabase.getInstance();

        return db.match.delete(this.id);
    }

    splitTime() {
        const moment = Moment(this.time);
        this.timeDate = moment.format('YYYY-MM-DD');
        this.timeTime = moment.format('HH:mm');
    }

    getName(): string {
        const date = Moment(this.time);
        const when = date.format('YYYY-MM-DD HH:mm');
        if (this.rating) {
            return `${ when } - ${ this.type } - ${ this.rating }`;
        }
        else {
            return `${ when } - ${ this.type }`;
        }
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