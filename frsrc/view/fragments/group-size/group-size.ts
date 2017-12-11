import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import './group-size.scss';

@Component({
    template: require('./group-size.html')
})
export default class GroupSize extends Vue {
    @Prop()
    value: number;

    resultChange(ev: Event) {
        ev.preventDefault();
        const target = <HTMLElement>ev.target;
        const resultElement = <HTMLElement>target.closest('.groupSizeButton');
        const siblings = Array.from(resultElement.parentElement.children).filter((el) => {
            return el !== resultElement;
        });

        siblings.forEach((el) => {
            el.classList.remove('is-selected');
        });

        const selected = resultElement.classList.toggle('is-selected');

        this.$emit('input', selected ? parseInt(resultElement.dataset.value, 10) : undefined);
    }
}