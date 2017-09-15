import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { HeadSelectItem } from '../../../interface';

import './head-select.scss';

@Component({
    template: require('./head-select.html'),
    name: 'FormSelect',
    props: {
        items: Array,
        title: String,
        selected: String
    }
})
export default class FormSelect extends Vue {
    items: HeadSelectItem[];
    type: string;
    selected: string;

    mounted() {
        const [selectedIndex, selectedLabel] = this.items.map((item, index) => [index, item.value]).reduce((prev, current) => {
            if (prev[1] === this.selected) {
                return prev;
            }
            else if (current[1] === this.selected) {
                return current;
            }
        });
        this.updateValue(this.$el.childNodes[selectedIndex], this.selected)
    }

    updateValue(target, value) {
        target.classList.add('is-selected');
        Array.from(target.parentElement.children)
            .filter((el) => el !== target)
            .forEach((el: HTMLElement) => el.classList.remove('is-selected'));

        this.$emit('input', value);
    }
}