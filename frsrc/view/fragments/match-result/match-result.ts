import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { MatchResult } from '../../../interface';

import './match-result.scss';

@Component({
    template: require('./match-result.html')
})
export default class MatchResultSelector extends Vue {
    selectedResult: MatchResult;

    @Prop()
    selected: MatchResult;

    created() {
        this.selectedResult = this.selected;
    }

    resultChange(ev) {
        const target = ev.target as HTMLElement;
        const resultElement = target.closest('.resultsLabel') as HTMLElement;
        const siblings = Array.from(resultElement.parentElement.children).filter((el) => {
            return el !== resultElement;
        });

        siblings.forEach((el) => {
            el.classList.remove('is-selected');
        });

        resultElement.classList.add('is-selected');

        this.$emit('input', resultElement.dataset.value);
    }
}