import { dictionary, locale } from 'svelte-i18n';
import { en } from '../assets/localidentity/languages/en';
import { fr } from '../assets/localidentity/languages/fr';
import { zh } from '../assets/localidentity/languages/zh';

console.log("localization import");

class GlobalLocalizationService {
    private activeLanguage;
    private baseLanguages = {
        en: en,
        fr: fr,
        zh: zh
    }
    private currentLanguages = this.baseLanguages;
    rand = Math.random();

    constructor() {
        window["localizationtest"] = window["localizationtest"] ? window["localizationtest"]+1 : 0;
        console.log("localization constructor", window["localizationtest"], this.rand);
        this.init();
    }

    private init() {
        console.log("localization init", this.rand);
        locale.subscribe((lang)=>{
            console.log("LANG CHANGED:", lang, this.rand);
            this.activeLanguage = lang;
        });

        dictionary.set(this.currentLanguages);
        this.setLanguage('en');
    }

    /**
     * Sets the active language for all UI items.
     */
    public setLanguage(lang: string) {
        console.log("Setting connectivity SDK language to: ", lang, this.rand);
        locale.set(lang);
    }

    public getLanguage(): string {
        return null; // TODO
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