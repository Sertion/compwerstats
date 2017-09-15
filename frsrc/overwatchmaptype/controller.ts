import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { OverwatchMapType } from './model';
import { CompwerstatsDatabase } from '../database';

export class OverwatchMapTypeController {
    static async getAll(): Promise<OverwatchMapType[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.overwatchmaptype;

        return table.toArray();
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Title',
                    model: 'title',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Map type title',
                    validators: validators.required
                },
                {
                    type: 'image',
                    label: 'Map type icon',
                    model: 'iconPath',
                    hideInput: true,
                    preview: true,
                    required: true
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