import { writable } from 'svelte/store';
import { ViewType } from './viewtype';

export const viewType = writable<ViewType>(ViewType.None);