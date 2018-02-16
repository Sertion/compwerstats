export default function percent(times: number, per: number): string {
    if (!per) {
        return '-.-';
    }

    return (times * 100 / per).toFixed(1);
}