import { navigatedView } from "./localidstores";
import type { NavigatedView } from "./navigatedview";
import type { ViewType } from "./viewtype";

class NavService {
    public activeView: NavigatedView = null;

    constructor() {
        navigatedView.subscribe((newView)=>{
            console.log("Active view changed:", newView);
            this.activeView = newView;
        })
    }

    public navigateTo(viewType: ViewType, params: any = {}) {
        navigatedView.set({
            viewType: viewType,
            params: params
        });
    }
}

export const navService = new NavService();

