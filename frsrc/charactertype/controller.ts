import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { CharacterType } from './model';
import { CompwerstatsDatabase } from '../database';

export class CharacterTypeController {
    static async getAll(): Promise<CharacterType[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.charactertype;

        return table.toArray();
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Name',
                    model: 'title',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Character type name',
                    validator: validators.required
                },
                {
                    type: 'image',
                    label: 'Character type icon',
                    model: 'iconPath',
                    hideInput: true,
                    preview: true,
                    required: true
                },
                {
                    type: 'input',
                    inputType: 'number',
                    label: 'Character type order weight',
                    model: 'orderWeight',
                    required: true,
                    validator: validators.required
                },
                {
                    type: 'submit',
                    buttonText: create ? 'Create' : 'Save',
                    onSubmit: async (model) => {
                        await model.save();
                        if (typeof saveCallback === 'function') {
                            saveCallback();
                        }
                    }
                }
            ]
        }
    }
}