export function getGlobalSingleton(context: string, onSingletonCreation: ()=>any): any {
    if (!window["elastosconnectivity"])
        window["elastosconnectivity"] = {};

    if (!window["elastosconnectivity"][context]) {
        // Create a singleton and save it globally
        let singleton = onSingletonCreation();
        window["elastosconnectivity"][context] = singleton;
        return singleton;
    } else {
        return window["elastosconnectivity"][context];
    }
}