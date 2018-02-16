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
            }, null);
    }

    static async getFormSchema(create: boolean = false, saveCallback: (modelId) => void): Promise<Object> {
        const oldRanks = await RankController.getAll();

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
                    validator: [validators.required, (value: string): string[] => {
                        const duplicate = oldRanks.some((rank: Rank): boolean => {
                            return value && rank.title && rank.title.toLowerCase() === value.toLowerCase();
                        });

                        return duplicate ? ["Duplicate rank title"] : [];
                    }]
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
                    validator: [validators.required, (value: number, schema: Object, model: Rank): string[] => {
                        const overlap = RankController.getByRatingFromRanks(oldRanks, value);
                        return overlap ? [`Rating overlaps with ${ overlap.getName() }`] : [];
                    }, (value: number, schema: Object, model: Rank): string[] => {
                        if (model.ratingMax >= model.ratingMin) {
                            return ['Minimum rating has to be smaller than the maximum rating'];
                        }
                        else {
                            return [];
                        }
                    }]
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Maximum rating',
                    model: 'ratingMax',
                    required: true,
                    validator: [validators.required, (value: number, schema: Object, model: Rank): string[] => {
                        const overlap = RankController.getByRatingFromRanks(oldRanks, value);
                        return overlap ? [`Rating overlaps with ${ overlap.getName() }`] : [];
                    }, (value: number, schema: Object, model: Rank): string[] => {
                        if (model.ratingMax <= model.ratingMin) {
                            return ['Maximum rating has to be larger than the minimum rating'];
                        }
                        else {
                            return [];
                        }
                    }]
                },
                {
                    type: 'submit',
                    buttonText: create ? 'Create' : 'Save',
                    validateBeforeSubmit: true,
                    onSubmit: async (model) => {
                        const id = await model.save();
                        if (typeof saveCallback === 'function') {
                            saveCallback(id);
                        }
                    }
                }
            ]
        }
    }
}