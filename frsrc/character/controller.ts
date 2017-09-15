const { ipcRenderer } = require('electron');

import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { Character } from './model';
import { CompwerstatsDatabase } from '../database';

import { CharacterTypeController } from '../charactertype';


export class CharacterController {
    static async getAll(): Promise<Character[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.character;

        return table.toArray();
    }

    static async getExternalContent(): Promise<void> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.character;
        const dataUrlPrefix = 'data:image/png;base64,';
        const generateCharacterUrlByType = (char: Character, fileName: string): string => {
            return `https://blzgdapipro-a.akamaihd.net/hero/${ char.getUrlSafeName() }/${ fileName }`
        };

        database.transaction('rw', table, async () => {
            const iconlessCharacters = await table.where('iconPath').equals('').toArray();
            const types = [{
                    name: 'icon-portrait.png',
                    default: './static/img/temp-icon-portrait.png',
                    column: 'iconPath'
                }, {
                    name: 'hero-select-portrait.png',
                    default: './static/img/temp-hero-select-portrait.png',
                    column: 'imagePath'
                }];

            iconlessCharacters.forEach((character: Character) => {
                types.forEach((icon) => {
                    fetch(generateCharacterUrlByType(character, icon.name))
                        .then((response) => response.blob())
                        .then((blob) => {
                            const reader = new FileReader();
    
                            reader.readAsDataURL(blob);
                            reader.onloadend = () => {
                                const dataUrl = <string>reader.result;
                                if (dataUrl.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
                                    character[icon.column] = reader.result;
                                }
                                else {
                                    character[icon.column] = icon.default;
                                }
                                character.save();
                            }
                        });
                })
            });
        });
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        const characterTypes = await CharacterTypeController.getAll();

        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Name',
                    model: 'name',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Character name',
                    validators: validators.required
                },
                {
                    type: 'radios',
                    label: 'Character type',
                    model: 'typeId',
                    values: characterTypes,
                    radiosOptions: {
                        value: 'id',
                        name: 'title'
                    },
                    required: true,
                    validators: validators.required
                },
                {
                    type: 'image',
                    label: 'Character icon',
                    model: 'iconPath',
                    hideInput: true,
                    preview: true,
                    required: true
                },
                {
                    type: 'image',
                    label: 'Character portrait',
                    model: 'imagePath',
                    hideInput: true,
                    preview: true,
                    required: true
                },
                {
                    type: 'submit',
                    buttonText: create ? 'Create' : 'Save',
                    onSubmit: async (model) => {
                        await model.save();
                        CharacterController.getExternalContent();
                        if (typeof saveCallback === 'function') {
                            saveCallback();
                        }
                    }
                }
            ]
        }
    }
}