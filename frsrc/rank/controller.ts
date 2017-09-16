import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { Rank } from './model';
import { CompwerstatsDatabase } from '../database';

export class RankController {
    static async getAll(): Promise<Rank[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.rank;

        return table.toArray();
    }

    static async getByRating(rating: number): Promise<Rank> {
        const allRanks = await RankController.getAll();

        return RankController.getByRatingFromRanks(allRanks, rating);
    }

    static getByRatingFromRanks(ranks: Rank[], rating: number): Rank {
        return ranks
            .sort((a, b) => a.ratingMin - b.ratingMin)
            .reduce((prev, curr): Rank => {
                if (curr.ratingMax >= rating && curr.ratingMin <= rating) {
                    return curr
                }
                else {
                    return prev;
                }
            });
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Title',
                    model: 'title',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Rank title',
                    validator: validators.required
                },
                {
                    type: 'image',
                    label: 'Rank icon',
                    model: 'iconPath',
                    hideInput: true,
                    preview: true,
                    required: true
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Minimum rating',
                    model: 'ratingMin',
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Maximum rating',
                    model: 'ratingMax',
                    required: true,
                    validator: validators.required
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