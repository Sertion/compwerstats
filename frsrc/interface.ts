export interface HeadSelectItem {
    value: string | number,
    label: string
}

export enum SeasonMode {
    Placements = 1,
    PlacementsComplete = 2,
    Matches = 3
}

export interface ButtonMode {
    label: string,
    shortLabel: string,
    path: string
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