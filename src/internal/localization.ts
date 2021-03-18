import { dictionary, locale } from 'svelte-i18n';
import { en } from '../assets/localidentity/languages/en';
import { fr } from '../assets/localidentity/languages/fr';
import { zh } from '../assets/localidentity/languages/zh';

export class Localization {
    public static init() {
        dictionary.set({
            en: en,
            fr: fr,
            zh: zh
        });
        locale.set('en'); // TODO: PUBLIC API TO SET LANGUAGE
    }
}