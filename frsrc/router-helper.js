import { SeasonMode } from './interface';

export function mainBasedOnMode (mode) {
    switch (mode) {
        case SeasonMode.Matches:
            return '/competitive';
        case SeasonMode.Placements:
            return '/placement';
        case SeasonMode.PlacementsComplete:
            return '/placement/placement-sr';
        default:
            return '/create-season';
    }
}