import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { OverwatchMap, OverwatchMapController } from '../../../overwatchmap';
import { OverwatchMapType, OverwatchMapTypeController } from '../../../overwatchmaptype';

import './map-list.scss';

@Component({
    template: require('./map-list.html')
})
export default class MapList extends Vue {
    loading: boolean = true;
    maps: OverwatchMap[];
    mapTypes: OverwatchMapType[];
    list: Object[] = [];
    selectedId: number;

    created() {
        this.fetchMaps();
    }

    updateValue(to, from) {
        this.$emit('input', parseInt(to, 10));
    }

    async fetchMaps() {
        this.loading = true;
        this.maps = await OverwatchMapController.getAll();
        this.mapTypes = await OverwatchMapTypeController.getAll();

        const list = [];

        this.maps.sort((a, b) => {
            return a.getName() <= b.getName() ? -1 : 1;
        }).forEach((map) => {
            const mapType = this.mapTypes
                .reduce((prev, curr) => curr.id === map.overwatchMapTypeId ? curr: prev);

            list.push({
                map: map,
                type: mapType,
                selected: this.selectedId === map.id
            });
        });

        this.list = list;
        this.loading = false;

        const maps = <HTMLElement>this.$refs.maps;

        this.$nextTick(() => {
            Array.from(maps.querySelectorAll('.map')).forEach((el: HTMLElement) => {
                const selected = this.selectedId === parseInt(el.dataset.id, 10);
                el.classList.toggle('is-selected', selected);
            });
        })
    }

    clickHandler(ev: MouseEvent) {
        ev.preventDefault();
        const target = <HTMLElement>ev.target;
        const mapElement = <HTMLElement>target.closest('.map');
        const targetId = parseInt(mapElement.dataset.id, 10);
        const siblings = Array.from(mapElement.parentElement.children).filter((el) => {
            return el !== mapElement;
        });

        if (this.selectedId === targetId) {
            mapElement.classList.remove('is-selected');
            mapElement.closest('.mapList').classList.remove('is-selected');
            this.selectedId = null;
        }
        else {
            mapElement.classList.add('is-selected');
            mapElement.closest('.mapList').classList.add('is-selected');
            siblings.forEach((el) => {
                el.classList.remove('is-selected');
            });
            this.selectedId = targetId;
        }

        this.$emit('input', this.selectedId)
    }
}