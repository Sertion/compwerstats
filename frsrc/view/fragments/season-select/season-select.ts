import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Season, SeasonController } from '../../../season';

import './season-select.scss';

@Component({
    template: require('./season-select.html')
})
export default class SeasonSelect extends Vue {
    loading: boolean = true;
    seasons: Season[] = [];

    @Prop()
    selected: number;

    created() {
        this.fetchSeasons();
    }

    updateValue(to, from) {
        this.$emit('input', parseInt(to, 10));
    }

    async fetchSeasons() {
        this.seasons = await SeasonController.getAll();
        this.loading = false;
        const select = <HTMLSelectElement>this.$refs.select;

        this.$nextTick(() => {
            select.value = this.selected.toString();
        })
    }
}