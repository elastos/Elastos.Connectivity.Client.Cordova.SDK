import { dictionary, locale } from 'svelte-i18n';
import { en } from '../assets/localidentity/languages/en';
import { fr } from '../assets/localidentity/languages/fr';
import { zh } from '../assets/localidentity/languages/zh';

class GlobalLocalizationService {
    private baseLanguages = {
        en: en,
        fr: fr,
        zh: zh
    }
    private currentLanguages = this.baseLanguages;

    constructor() {
        this.init();
    }

    private init() {
        dictionary.set(this.currentLanguages);
        this.setLanguage('en');
    }

    /**
     * Sets the active language for all UI items.
     */
    public setLanguage(lang: string) {
        locale.set(lang);
    }

    /**
     * Adds a new language to the available languages. After that, this language can be used by calling
     * setLanguage().
     *
     * @param lang Short language name such as "en", "fr", "it", "es".
     * @param translations List of key:value which are the translation string key -> display string.
     */
    public addLanguage(lang: string, translations: [{string:string}]) {
        this.currentLanguages[lang] = translations;
        dictionary.set(this.currentLanguages);
    }
}

export const globalLocalizationService = new GlobalLocalizationService();