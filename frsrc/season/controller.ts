import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { Season } from './model';
import { CompwerstatsDatabase } from '../database';

export class SeasonController {
    static async getAll(): Promise<Season[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.season;

        return table.toArray();
    }

    static async getCurrent(): Promise<Season> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.season;

        return table.reverse().first();
    }

    static async getSeasonById(seasonId: number): Promise<Season> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.season;

        return table.where('id').equals(seasonId).first();
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Name',
                    model: 'name',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Season name (etc. Season 12)',
                    validators: validators.required
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