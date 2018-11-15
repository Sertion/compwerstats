import { validators } from 'vue-form-generator';

import { OverwatchMap } from './model';
import { OverwatchMapTypeController } from '../overwatchmaptype';
import { CompwerstatsDatabase } from '../database';

export class OverwatchMapController {
    static getAll(): Promise<OverwatchMap[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.overwatchmap;

        return table.toArray();
    }

    static getExternalContent(): void {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.overwatchmap;
        const dataUrlPrefix = 'data:image/jpeg;base64,';

        database.transaction('rw', table, async () => {
            const onlineImagedMaps = await table.where('imagePath').startsWith('http').toArray();

            onlineImagedMaps.forEach((map) => {
                fetch(map.imagePath)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const reader = new FileReader();

                        reader.readAsDataURL(blob);
                        reader.onloadend = () => {
                            const dataUrl = <string>reader.result;
                            if (dataUrl.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
                                map.imagePath = dataUrl;
                            }
                            else {
                                map.imagePath = '';
                            }
                            map.save();
                        }
                    });
            });
        });
    }

    static async getFormSchema(create: boolean = false, saveCallback: (modelId) => void): Promise<Object> {
        const mapTypes = await OverwatchMapTypeController.getAll();
        const oldMaps = await OverwatchMapController.getAll();

        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Name',
                    model: 'name',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Map name',
                    validator: [validators.required, (value: string): string[] => {
                        const duplicate = oldMaps.some((map: OverwatchMap): boolean => {
                            return value && map.name && map.name.toLowerCase() === value.toLowerCase();
                        });

                        return duplicate ? ["Duplicate map name"] : [];
                    }]
                },
                {
                    type: 'radios',
                    label: 'Map type',
                    model: 'overwatchMapTypeId',
                    values: mapTypes,
                    radiosOptions: {
                        value: 'id',
                        name: 'title'
                    }
                },
                {
                    type: 'image',
                    label: 'Map screenshot',
                    model: 'imagePath',
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