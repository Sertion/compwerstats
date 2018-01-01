import Dexie from 'dexie';

import { Character, CharacterController } from './character';
import { CharacterType } from './charactertype';
import { CommentSuggestion } from './commentsuggestion';
import { Match } from './match';
import { OverwatchMap, OverwatchMapController } from './overwatchmap';
import { OverwatchMapType } from './overwatchmaptype';
import { Rank } from './rank';
import { Season } from './season';


export class CompwerstatsDatabase extends Dexie {
    private static instance: CompwerstatsDatabase;

    public character: Dexie.Table<Character, number>;
    public charactertype: Dexie.Table<CharacterType, number>;
    public commentsuggestion: Dexie.Table<CommentSuggestion, number>;
    public match: Dexie.Table<Match, number>;
    public overwatchmap: Dexie.Table<OverwatchMap, number>;
    public overwatchmaptype: Dexie.Table<OverwatchMapType, number>;
    public rank: Dexie.Table<Rank, number>;
    public season: Dexie.Table<Season, number>;

    private constructor() {
        super("Compwerstats");
        this.setupStores();
        this.setupClassMap();
        this.on('populate', () => {
            this.populateDatabase();
        })
    }

    static getInstance(): CompwerstatsDatabase {
        if (!CompwerstatsDatabase.instance) {
            CompwerstatsDatabase.instance = new CompwerstatsDatabase();
        }

        return CompwerstatsDatabase.instance;
    }
    
    private setupStores() {
        this.version(1).stores({
            character: '++id, characterTypeId, &name, iconPath, imagePath',
            charactertype: '++id, &title, iconPath, orderWeight',
            commentsuggestion: '++id, &content',
            match: '++id, [seasonId+type], mapId, &time, *character, result, comment, rating, groupsize, redRating, blueRating',
            overwatchmap: '++id, overwatchMapTypeId, &name, imagePath',
            overwatchmaptype: '++id, &title, iconPath',
            rank: '++id, &title, iconPath, ratingMin, ratingMax',
            season: '++id, name, placementRating'
        });

        this.version(2).stores({
            season: '++id, name, placementRating, archived',
            match: '++id, [seasonId+type], mapId, &time, *character, result, comment, rating, groupsize, redRating, blueRating, steak',
        });
    }

    private setupClassMap() {
        this.character.mapToClass(Character);
        this.charactertype.mapToClass(CharacterType);
        this.commentsuggestion.mapToClass(CommentSuggestion);
        this.match.mapToClass(Match);
        this.overwatchmap.mapToClass(OverwatchMap);
        this.overwatchmaptype.mapToClass(OverwatchMapType);
        this.rank.mapToClass(Rank);
        this.season.mapToClass(Season);
    }

    clearDatabase() {
        this.delete();
    }

    populateDatabase() {
        this.transaction('rw', [this.character, this.charactertype, this.commentsuggestion, this.match, this.overwatchmap, this.overwatchmaptype, this.rank, this.season], async () => {
            Rank.create('Bronze', 0, 1499, './static/img/rank_bronze.png').save();
            Rank.create('Silver', 1500, 1999, './static/img/rank_silver.png').save();
            Rank.create('Gold', 2000, 2499, './static/img/rank_gold.png').save();
            Rank.create('Platinum', 2500, 2999, './static/img/rank_platinum.png').save();
            Rank.create('Diamond', 3000, 3499, './static/img/rank_diamond.png').save();
            Rank.create('Master', 3500, 3999, './static/img/rank_master.png').save();
            Rank.create('Grandmaster', 4000, 5000, './static/img/rank_grandmaster.png').save();

            CommentSuggestion.create('Good communication').save();
            CommentSuggestion.create('Great teamwork').save();
            CommentSuggestion.create('Filled').save();
            CommentSuggestion.create('Got told I played well').save();
            
            const ctOffence = await CharacterType.create('Offence', 0, './static/img/charactertype_icon_offence.svg').save();
            const ctDefence = await CharacterType.create('Defence', 1, './static/img/charactertype_icon_defence.svg').save();
            const ctTank = await CharacterType.create('Tank', 2, './static/img/charactertype_icon_tank.svg').save();
            const ctSupport = await CharacterType.create('Support', 3, './static/img/charactertype_icon_support.svg').save();

            const mtAssult = await OverwatchMapType.create('Assult', './static/img/maptype-assult.svg').save();
            const mtControl = await OverwatchMapType.create('Control', './static/img/maptype-control.svg').save();
            const mtElimination = await OverwatchMapType.create('Elimination', './static/img/maptype-elimination.svg').save();
            const mtEscort = await OverwatchMapType.create('Escort', './static/img/maptype-escort.svg').save();
            const mtHybrid = await OverwatchMapType.create('Hybrid', './static/img/maptype-hybrid.svg').save();

            Character.create(ctOffence, 'Doomfist', '', '').save();
            Character.create(ctOffence, 'Genji', '', '').save();
            Character.create(ctOffence, 'McCree', '', '').save();
            Character.create(ctOffence, 'Pharah', '', '').save();
            Character.create(ctOffence, 'Reaper', '', '').save();
            Character.create(ctOffence, 'Soldier: 76', '', '').save();
            Character.create(ctOffence, 'Sombra', '', '').save();
            Character.create(ctOffence, 'Tracer', '', '').save();

            Character.create(ctDefence, 'Bastion', '', '').save();
            Character.create(ctDefence, 'Hanzo', '', '').save();
            Character.create(ctDefence, 'Junkrat', '', '').save();
            Character.create(ctDefence, 'Mei', '', '').save();
            Character.create(ctDefence, 'Torbjörn', '', '').save();
            Character.create(ctDefence, 'Widowmaker', '', '').save();

            Character.create(ctTank, 'D.Va', '', '').save();
            Character.create(ctTank, 'Orisa', '', '').save();
            Character.create(ctTank, 'Reinhardt', '', '').save();
            Character.create(ctTank, 'Roadhog', '', '').save();
            Character.create(ctTank, 'Winston', '', '').save();
            Character.create(ctTank, 'Zarya', '', '').save();

            Character.create(ctSupport, 'Ana', '', '').save();
            Character.create(ctSupport, 'Lúcio', '', '').save();
            Character.create(ctSupport, 'Mercy', '', '').save();
            // Character.create(ctSupport, 'Moira', '', '').save();
            Character.create(ctSupport, 'Symmetra', '', '').save();
            Character.create(ctSupport, 'Zenyatta', '', '').save();

            OverwatchMap.create(mtAssult, 'Hanamura', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/xw/XWD59FMGI6KG1497480252023.jpg').save();
            OverwatchMap.create(mtAssult, 'Horizon Lunar Colony', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/9a/9AE0ARWHZE7S1497480542404.jpg').save();
            OverwatchMap.create(mtAssult, 'Temple of Anubis', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/pb/PBW0LRJT9XFB1497479758741.jpg').save();
            OverwatchMap.create(mtAssult, 'Volskaya Industries', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/j2/J29ICNBO32QF1497481130795.jpg').save();

            OverwatchMap.create(mtHybrid, 'Eichenwalde', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/bh/BHEFPR35C1JM1497480094760.jpg').save();
            OverwatchMap.create(mtHybrid, 'Hollywood', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/sn/SNFN7H4IKSXB1497480310825.jpg').save();
            OverwatchMap.create(mtHybrid, 'King\'s Row', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/1n/1N4T9SV42PEZ1497480670407.jpg').save();
            OverwatchMap.create(mtHybrid, 'Numbani', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/sa/SAWJZIV2C8O01497480910941.jpg').save();

            OverwatchMap.create(mtControl, 'Ilios', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/m1/M1HBN0EWTLNH1497480605870.jpg').save();
            OverwatchMap.create(mtControl, 'Lijiang Tower', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/iv/IV5O9C45P5WZ1497480735641.jpg').save();
            OverwatchMap.create(mtControl, 'Nepal', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/l9/L933MRWMZF051497480865371.jpg').save();
            OverwatchMap.create(mtControl, 'Oasis', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/mn/MNNHA2I8CTIG1497480960107.jpg').save();

            OverwatchMap.create(mtEscort, 'Dorado', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/fn/FNBIVXUVWF6X1497480004798.jpg').save();
            OverwatchMap.create(mtEscort, 'Junkertown', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/3EDBV89EVDZG1504724220173.jpg').save();
            OverwatchMap.create(mtEscort, 'Route 66', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/hj/HJDM6SIEAIGO1497481024426.jpg').save();
            OverwatchMap.create(mtEscort, 'Watchpoint: Gibraltar', 'https://bnetcmsus-a.akamaihd.net/cms/page_media/x0/X0WORICQ092M1497480184004.jpg').save();
        }).then(() => {
            CharacterController.getAllExternalContent();
            OverwatchMapController.getExternalContent();
        }, (reason) => {
            console.error(reason);
        })
    }
}