import { validators } from 'vue-form-generator';

import { Dexie } from 'dexie';
import { CommentSuggestion } from './model';
import { CompwerstatsDatabase } from '../database';

export class CommentSuggestionController {
    static async getAll(): Promise<CommentSuggestion[]> {
        const database = CompwerstatsDatabase.getInstance();
        const table = database.commentsuggestion;

        return table.toArray();
    }

    static async getFormSchema(create: boolean = false, saveCallback: () => void): Promise<Object> {
        return {
            fields: [
                {
                    type: 'input',
                    inputType: 'text',
                    label: 'Suggestion',
                    model: 'content',
                    maxlength: 50,
                    required: true,
                    placeholder: 'Suggestion goes here',
                    validators: validators.required
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