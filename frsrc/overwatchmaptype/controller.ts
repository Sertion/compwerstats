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

    static async getFormSchema(create: boolean = false, saveCallback: (modelId) => void): Promise<Object> {
        const oldMapTypes = await OverwatchMapTypeController.getAll();

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
                    validator:  [validators.required, (value: string): string[] => {
                        const duplicate = oldMapTypes.some((mapType: OverwatchMapType): boolean => {
                            return value && mapType.title && mapType.title.toLowerCase() === value.toLowerCase();
                        });

                        return duplicate ? ["Duplicate map type title"] : [];
                    }]
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
                    validateBeforeSubmit: true,
                    onSubmit: async (model) => {
                        const id = await model.save();
                        if (typeof saveCallback === 'function') {
                            saveCallback(id);
                        }
                    }
                }
            ]
        }
    }
}