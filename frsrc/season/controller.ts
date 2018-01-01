import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { Season } from './model';
import { CompwerstatsDatabase } from '../database';

import { MatchController } from '../match';

import { MatchType } from '../interface';

import { SeasonMode } from '../interface';

export class SeasonController {
    static async getAll(): Promise<Season[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.season;

        return table.toArray();
    }

    static async getActive(): Promise<Season[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.season;
        const active = await table.toArray();

        return active.filter(season => !season.archived);
    }

    static async getCurrent(): Promise<Season> {
        const activeSeasons = await SeasonController.getActive();

        return activeSeasons.reverse()[0];
    }

    static async getSeasonById(seasonId: number): Promise<Season> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.season;
        
        if (seasonId) {
            return table.where('id').equals(seasonId).first();
        }
        else {
            return null;
        }
    }

    static async getMode(seasonId: number): Promise<SeasonMode> {
        const season = await SeasonController.getSeasonById(seasonId);

        if (!season) {
            return null;
        }

        const placements = await MatchController.getBySeason(seasonId, MatchType.Placement);
        const matches = await MatchController.getBySeason(seasonId, MatchType.Match);

        if (season.placementRating > 0 || matches.length) {
            return SeasonMode.Matches;
        }
        else if (placements.length >= 10) {
            return SeasonMode.PlacementsComplete;
        }
        else {
            return SeasonMode.Placements;
        }
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Season Number',
                    model: 'name',
                    max: 9999,
                    min: 0,
                    required: true,
                    placeholder: 'Season number (etc. 12)',
                    validator: validators.required
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Placement Skill Rating',
                    model: 'placementRating',
                    max: 5000,
                    min: 0,
                    placeholder: 'Placement SR',
                },
                {
                    type: 'checkbox',
                    label: 'Archive (an archived season will not be selectable in the season selector)',
                    model: 'archive'
                },
                {
                    type: 'submit',
                    buttonText: create ? 'Create' : 'Save',
                    onSubmit: async (model) => {
                        await model.save();
                        if (typeof saveCallback === 'function') {
                            saveCallback();
                        }
                    }
                }
            ]
        }
    }
}