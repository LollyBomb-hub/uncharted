import {AbstractCreationEvents} from "./ViewEvents";

export type SingleItemEventHandler<Y, T> = (event: Y, item: T, containerId: string) => void

// item is container identifier
export type CreationHandler<T> = SingleItemEventHandler<AbstractCreationEvents, T>