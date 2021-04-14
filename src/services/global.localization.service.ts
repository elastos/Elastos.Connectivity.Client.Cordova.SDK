import { en } from '../assets/localidentity/languages/en';
import { fr } from '../assets/localidentity/languages/fr';
import { zh } from '../assets/localidentity/languages/zh';
import { getGlobalSingleton } from '../singleton';
import { format, getMessageFormatter, dictionary, locale } from "svelte-i18n";
import { globalLoggerService as logger } from "../services/global.logger.service";

class GlobalLocalizationService {
    private activeLanguage;
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
        locale.subscribe((lang)=>{
            this.activeLanguage = lang;
        });

        dictionary.set(this.currentLanguages);
        this.setLanguage('en');
    }

    /**
     * Sets the active language for all UI items.
     */
    public setLanguage(lang: string) {
        logger.log("Setting connectivity SDK language to: ", lang);
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

    public translateInstant(key: string): string {
        return getMessageFormatter(key).format() as string;
    }
}

export const globalLocalizationService = getGlobalSingleton<GlobalLocalizationService>("localization", ()=>new GlobalLocalizationService());

export {
    format as _,
    getMessageFormatter
};