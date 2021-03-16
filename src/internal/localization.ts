import { dictionary, locale } from 'svelte-i18n';

export class Localization {
    public static init() {
        dictionary.set({
            en: {
                credaccessprompt: {
                    "login-msg": "Select one of the following options",
                    "please-choose": 'Please choose',
                    "your-did": 'Your DID',
                    "temp-did": "Create a temporary identity"
                },
            },
            fr: {
                credaccessprompt: {
                    "login-msg": "Choisissez l'une des options suivantes",
                    "please-choose": 'Veuillez choisir',
                    "your-did": 'Votre DID',
                    "temp-did": "Créer une identité temporaraire"
                },
            },
        });
        locale.set('en');
    }
}