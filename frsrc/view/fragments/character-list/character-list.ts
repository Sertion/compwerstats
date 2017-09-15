import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Character, CharacterController } from '../../../character';
import { CharacterType, CharacterTypeController } from '../../../charactertype';

import './character-list.scss';

@Component({
    template: require('./character-list.html')
})
export default class CharacterList extends Vue {
    loading: boolean = true;
    characters: Character[];
    characterTypes: CharacterType[];
    list: Object[] = [];
    selectedIds: number[];

    @Prop({ default: () => [] })
    selected: number[];

    created() {
        this.selectedIds = this.selected;
        this.fetchMaps();
    }

    updateValue(to, from) {
        this.$emit('input', parseInt(to, 10));
    }

    async fetchMaps() {
        this.loading = true;
        this.characters = await CharacterController.getAll();
        this.characterTypes = await CharacterTypeController.getAll();

        const list = [];

        this.characterTypes.sort((a, b) => a.orderWeight - b.orderWeight)
            .forEach((type) => {
                const characters = this.characters
                    .filter((character) => character.typeId === type.id)
                    .sort((a, b) => a.getName() >= b.getName() ? 1 : -1)
                    .map((character) => {
                        return {
                            character: character,
                            selected: this.selectedIds.includes(character.id),
                            background: `background-image: url(${ character.iconPath }), url(${ character.imagePath })`
                        }
                    });

                list.push({
                    characters: characters,
                    type: type
                });
            });

        this.list = list;
        this.loading = false;

        const characters = <HTMLElement>this.$refs.characters;

        this.$nextTick(() => {
            Array.from(characters.querySelectorAll('.character')).forEach((el: HTMLElement) => {
                const selected = this.selectedIds.includes(parseInt(el.dataset.id, 10));
                el.classList.toggle('is-selected', selected);
            });
        })
    }

    clickHandler(ev: MouseEvent) {
        ev.preventDefault();
        const target = <HTMLElement>ev.target;
        const characterElement = <HTMLElement>target.closest('.character');
        const targetId = parseInt(characterElement.dataset.id, 10);

        characterElement.classList.toggle('is-selected');

        const selectedElements = (<HTMLElement>this.$refs.characters).querySelectorAll('.character.is-selected')
        this.selectedIds = Array.from(selectedElements).map((el: HTMLElement) => parseInt(el.dataset.id, 10));

        this.$emit('input', this.selectedIds)
    }
}