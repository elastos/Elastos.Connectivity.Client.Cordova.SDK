import { writable } from 'svelte/store';
import type { NavigatedView } from './navigatedview';
import { ViewType } from './viewtype';

export const navigatedView = writable<NavigatedView>({viewType: ViewType.None});