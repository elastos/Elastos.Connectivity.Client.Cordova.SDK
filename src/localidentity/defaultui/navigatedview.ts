import type { ViewType } from "./viewtype";

export type NavigatedView = {
    viewType: ViewType;
    params?: any; // Custom navigation data
}