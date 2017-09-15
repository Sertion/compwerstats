import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { MatchResult } from '../../../match';

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
        const target = <HTMLElement>ev.target;
        const resultElement = <HTMLElement>target.closest('.resultsLabel');
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