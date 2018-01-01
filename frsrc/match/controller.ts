import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { Match } from './model';
import { CompwerstatsDatabase } from '../database';

import { MatchType, MatchResult } from '../interface';

import * as moment from 'moment';

import { Character, CharacterController } from '../character';
import { CharacterType, CharacterTypeController } from '../charactertype';
import { OverwatchMap, OverwatchMapController } from '../overwatchmap';
import { OverwatchMapType, OverwatchMapTypeController } from '../overwatchmaptype';
import { Rank, RankController } from '../rank';
import { Season, SeasonController } from '../season';

export class MatchController {
    static async getAll(): Promise<Match[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.match;

        return table.toArray();
    }

    static async getByType(type?: MatchType): Promise<Match[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.match;

        return table.where('type').equals(type).toArray();
    }

    static async getBySeason(seasonId: number, type: MatchType): Promise<Match[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.match;

        return table.where('[seasonId+type]').equals([seasonId, type]).sortBy('time');
    }

    static async hasPlacementsLeft(seasonId: number): Promise<boolean> {
        const placementMatches = await MatchController.getBySeason(seasonId, MatchType.Placement);

        return placementMatches.length < 10;
    }

    static async latestSeasonMatch(seasonId: number, type: MatchType = MatchType.Match): Promise<Match> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.match;

        const lastMatch = await table
            .where('[seasonId+type]').equals([seasonId, type])
            .limit(1).reverse().sortBy('time');

        return lastMatch[0];
    }

    static async latestSeasonMatchRating(seasonId: number): Promise<number> {
        const match = await MatchController.latestSeasonMatch(seasonId);

        if (match) {
            return match.rating;
        }
        else {
            const season = await SeasonController.getSeasonById(seasonId);
            return season ? season.placementRating : -1;
        }

    }

    static ratingToResult(ratingA: number, ratingB: number): MatchResult {
        if (ratingA === ratingB) {
            return MatchResult.Draw;
        }
        else if (ratingA > ratingB) {
            return MatchResult.Win;
        }
        else {
            return MatchResult.Loss;
        }
    }

    static async recalculateStreaks(seasonId: number, type: MatchType): Promise<void> {
        const matches = await MatchController.getBySeason(seasonId, type);
        if (matches.length) {
            let lastResult = matches[0].result;
            let currentStreak = 0;

            matches.forEach((match) => {
                if (lastResult === match.result) {
                    currentStreak = currentStreak + 1;
                    match.streak = currentStreak;
                }
                else {
                    lastResult = match.result;
                    currentStreak = 1;
                    match.streak = currentStreak;
                }

                match.save();
            });
        }
    }

    /**
     * Statistics
     */
    static async calculateStatistics(seasonId: number) {
        const idToKey = (result, item) => {
            result[item.id] = item;
            return result;
        }
        const preFill = (from) => {
            return Object.keys(from)
                .map((key) => from[key])
                .reduce((result, current) => {
                    result[current.id] = {
                        total: 0,
                        win: 0,
                        draw: 0,
                        loss: 0
                    };
                    return result;
                }, {});
        }
        const add = (obj, key) => {
            if (!obj[key]) {
                obj[key] = 1;
            }
            else {
                obj[key] = obj[key] + 1;
            }
        }
        const wld = (obj, id, key) => {
            if (!obj || !id) {
                return;
            }
            if (!obj[id]) {
                obj[id] = {
                    total: 0,
                    win: 0,
                    draw: 0,
                    loss: 0
                };
            }

            obj[id].total += 1;
            obj[id][key] += 1;
        }
        const data = {
            characters: (await CharacterController.getAll()).reduce(idToKey, {}),
            characterTypes: (await CharacterTypeController.getAll()).reduce(idToKey, {}),
            maps: (await OverwatchMapController.getAll()).reduce(idToKey, {}),
            mapTypes: (await OverwatchMapTypeController.getAll()).reduce(idToKey, {}),
            matches: (await MatchController.getBySeason(seasonId, MatchType.Match)).concat(await MatchController.getBySeason(seasonId, MatchType.Placement))
        };
        const stats = {
            totalNumberOfMatches: 0,
            totals: {},
            character: preFill(data.characters),
            characterType: preFill(data.characterTypes),
            map: preFill(data.maps),
            mapType: preFill(data.mapTypes),
            dayOfTheWeek: {},
            timeRange: {},
            groupSize: {},
            data: data
        };

        var lastResult;

        stats.totalNumberOfMatches = data.matches.length;

        data.matches.forEach((match) => {
            const characterTypes = new Set;

            // Totals
            add(stats.totals, match.result);

            if (match.character) {
                match.character.forEach((charId) => {
                    const char = <Character>data.characters[charId];

                    // Character
                    wld(stats.character, charId, match.result);

                    // Character Types
                    characterTypes.add(char.typeId);
                });
            }

            // Character Types
            characterTypes.forEach((typeId) => {
                wld(stats.characterType, typeId, match.result);
            });

            // Maps
            wld(stats.map, match.overwatchMapId, match.result);

            // Map types
            if (data.maps[match.overwatchMapId]) {
                wld(stats.mapType, data.maps[match.overwatchMapId].overwatchMapTypeId, match.result);
            }

            // Time
            const momentTime = moment(match.time);

            wld(stats.timeRange, momentTime.hour(), match.result);
            wld(stats.dayOfTheWeek, momentTime.isoWeekday(), match.result);

            // Groupsize
            wld(stats.groupSize, match.groupsize, match.result);
        });

        return stats;
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        const sortByName = (a, b) => {
            const nameA = a.getName();
            const nameB = b.getName();
            if (nameA === nameB) {
                return 0
            }
            else {
                return nameA >= nameB ? 1 : -1;
            }
        };
        const characters = await CharacterController.getAll();
        const maps = await OverwatchMapController.getAll();
        const seasons = await SeasonController.getAll();

        characters.sort(sortByName);
        maps.sort(sortByName);

        return {
            fields: [
                {
                    type: 'radios',
                    label: 'Match type',
                    model: 'type',
                    values: [
                        {
                            value: MatchType.Match,
                            name: 'Match'
                        },
                        {
                            value: MatchType.Placement,
                            name: 'Placement'
                        }
                    ],
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'select',
                    label: 'Season',
                    model: 'seasonId',
                    values: seasons,
                    selectOptions: {
                        value: 'id'
                    },
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Rating',
                    model: 'rating',
                    hint: 'rating is ignored for placements',
                    maxlength: 50,
                    max: 5000,
                    min: 0,
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'radios',
                    label: 'Match result',
                    model: 'result',
                    values: [
                        {
                            value: MatchResult.Win,
                            name: 'Win'
                        },
                        {
                            value: MatchResult.Draw,
                            name: 'Draw'
                        },
                        {
                            value: MatchResult.Loss,
                            name: 'Loss'
                        }
                    ]
                },
                {
                    type: 'input',
                    inputType: 'date',
                    label: 'Date',
                    model: 'timeDate',
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'input',
                    inputType: 'time',
                    label: 'Time',
                    model: 'timeTime',
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'select',
                    label: 'Map',
                    model: 'overwatchMapId',
                    values: maps,
                    selectOptions: {
                        value: 'id'
                    }
                },
                {
                    type: 'checklist',
                    label: 'Played Characters',
                    model: 'character',
                    listBox: true,
                    values: characters,
                    checklistOptions: {
                        value: 'id'
                    }
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Group size',
                    max: 6,
                    min: 1,
                    model: 'groupsize'
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Blue team rating',
                    hint: "Your team",
                    max: 5000,
                    min: 0,
                    model: 'blueRating'
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Red team rating',
                    hint: 'Opposing team',
                    max: 5000,
                    min: 0,
                    model: 'redRating',
                },
                {
                    type: 'textArea',
                    label: 'Comment',
                    model: 'comment'
                },
                {
                    type: 'submit',
                    validateBeforeSubmit: true,
                    buttonText: create ? 'Create' : 'Save',
                    onSubmit: async (model) => {
                        await model.save();
                        await MatchController.recalculateStreaks(model.seasonId, model.type);
                        if (typeof saveCallback === 'function') {
                            saveCallback();
                        }
                    }
                }
            ]
        }
    }
}