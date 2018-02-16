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
        };
        const preFill = (from): object  => {
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
        };
        const add = (obj, key) => {
            if (!obj[key]) {
                obj[key] = 1;
            }
            else {
                obj[key] = obj[key] + 1;
            }
        };
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
        };
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

    static async calculateStatisticsOverview(seasonId: number): Promise<Object> {
        const seasonInfo = await SeasonController.getSeasonById(seasonId);
        const matches = await MatchController.getBySeason(seasonId, MatchType.Match);
        const SESSION_PAUSE_TIME = 2 * 60 * 60 * 1000;
        const stats = {
            currentSr: 0,
            highestSr: 0,
            lowestSr: 0,
            medianSr: 0,
            averageSr: 0,
            largestSrGain: 0,
            averageSrGain: 0,
            largestSrLoss: 0,
            averageSrLoss: 0,
            playedMatches: matches.length,
            wins: 0,
            draws: 0,
            losses: 0,
            sessions: 0,
            matchesPerSession: '0',
            winsLastTen: 0,
            playedMatchesLastTen: 0,
            averageSRChangeLastTen: 0
        };
        const allSRs = [];
        const allSRChanges = [];
        const allSRGains = [];
        const allSRLosses = [];
        let lastMatchSr = seasonInfo.placementRating;
        let lastMatchTime = 0;

        if (matches.length === 0) {
            return stats;
        }

        matches.forEach((match, index) => {
            allSRs.push(match.rating);

            if (match.result === MatchResult.Win) {
                stats.wins += 1;
                allSRGains.push(match.rating - lastMatchSr);
            }
            else if (match.result === MatchResult.Loss) {
                stats.losses += 1;
                allSRLosses.push(match.rating - lastMatchSr);
            }
            else {
                stats.draws += 1;
            }

            if (stats.playedMatches - index <= 10) {
                stats.playedMatchesLastTen += 1;
                if (match.result === MatchResult.Win) {
                    stats.winsLastTen += 1;
                }
            }

            allSRChanges.push(match.rating - lastMatchSr);

            if (lastMatchTime < match.time - SESSION_PAUSE_TIME) {
                // a new session has started
                stats.sessions += 1;
            }

            lastMatchTime = match.time;
            lastMatchSr = match.rating;
        });

        allSRs.sort((a, b) => a - b);

        stats.currentSr = matches[matches.length - 1].rating;
        stats.lowestSr = allSRs[0];
        stats.highestSr = allSRs[allSRs.length - 1];
        stats.medianSr = allSRs[Math.floor(allSRs.length / 2)];
        stats.averageSr = Math.floor(allSRs.reduce((sum, current) => sum + current, 0) / stats.playedMatches);

        stats.largestSrGain = Math.max(...allSRGains);
        stats.averageSrGain = Math.floor(allSRGains.reduce((sum, current) => sum + current, 0) / stats.wins);
        stats.largestSrLoss = Math.min(...allSRLosses);
        stats.averageSrLoss = Math.floor(allSRLosses.reduce((sum, current) => sum + current, 0) / stats.losses);

        stats.matchesPerSession = (stats.playedMatches / stats.sessions).toFixed(2);

        stats.averageSRChangeLastTen = Math.floor(allSRChanges.splice(-10).reduce((sum, current) => sum + current, 0) / stats.playedMatchesLastTen);

        return stats;
    }

    static async calculateCharactersWinPercentage(seasonId: number): Promise<{
        winPercentage: number,
        gamesPlayed: number,
        wins: number,
        character: Character
    }[]> {
        const characters = await CharacterController.getAll();
        const matches = await MatchController.getBySeason(seasonId, MatchType.Match);
        const placements = await MatchController.getBySeason(seasonId, MatchType.Placement);

        const results = characters.reduce((prev, character) => {
            prev[character.id] = {
                gamesPlayed: 0,
                wins: 0,
                winPercentage: 0,
                character
            };

            return prev;
        }, {});
        const games = placements.concat(matches);

        games.forEach((game) => {
            game.character.forEach((characterId) => {
                if (game.result === MatchResult.Win) {
                    results[characterId].wins += 1
                }

                results[characterId].gamesPlayed += 1;
            });
        });

        const resultValues = <{
            winPercentage: number,
            gamesPlayed: number,
            wins: number,
            character: Character
        }[]>Object.values(results);
        const winPercentages = resultValues.map((character) => {
            character.winPercentage = (character.wins / games.length) * 100;

            return character;
        });

        return winPercentages;
    }

    static async calculateMapsWinPercentage(seasonId: number): Promise<{
        winPercentage: number,
        gamesPlayed: number,
        wins: number,
        map: Character
    }[]> {
        const maps = await OverwatchMapController.getAll();
        const matches = await MatchController.getBySeason(seasonId, MatchType.Match);
        const placements = await MatchController.getBySeason(seasonId, MatchType.Placement);

        const results = maps.reduce((prev, map) => {
            prev[map.id] = {
                gamesPlayed: 0,
                wins: 0,
                winPercentage: 0,
                map
            };

            return prev;
        }, {});
        const games = placements.concat(matches);

        games.forEach((game) => {
            if (game.result === MatchResult.Win) {
                results[game.overwatchMapId].wins += 1
            }

            results[game.overwatchMapId].gamesPlayed += 1;
        });

        const resultValues = <{
            winPercentage: number,
            gamesPlayed: number,
            wins: number,
            map: Character
        }[]>Object.values(results);
        const winPercentages = resultValues.map((map) => {
            map.winPercentage = (map.wins / games.length) * 100;

            return map;
        });

        return winPercentages;
    }

    static async getFormSchema(create: boolean = false, saveCallback: (modelId) => void): Promise<Object> {
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
                    buttonText: create ? 'Create' : 'Save',
                    validateBeforeSubmit: true,
                    onSubmit: async (model) => {
                        const id = await model.save();
                        await MatchController.recalculateStreaks(model.seasonId, model.type);
                        if (typeof saveCallback === 'function') {
                            saveCallback(id);
                        }
                    }
                }
            ]
        }
    }
}