import { getGlobalSingleton } from "../singleton";

// TODO: IMPLEMENT / IMPROVE
class GlobalThemeService {
    public darkMode: boolean = false;

    constructor() {}

    public enableDarkMode(darkModeEnabled: boolean) {
        this.darkMode = darkModeEnabled;
    }
}

export const globalThemeService = getGlobalSingleton("theme", ()=>new GlobalThemeService());

