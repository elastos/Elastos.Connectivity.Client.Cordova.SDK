import { getGlobalSingleton } from "../singleton";

class GlobalThemeService {
    public darkMode: boolean = false;

    constructor() {}

    public enableDarkMode(darkModeEnabled: boolean) {
        this.darkMode = darkModeEnabled;
    }
}

export const globalThemeService = getGlobalSingleton<GlobalThemeService>("theme", ()=>new GlobalThemeService());

