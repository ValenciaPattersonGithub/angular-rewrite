import { CommunicationEvent } from './enums';

export interface CommunicationCustomEvent {
    eventtype: CommunicationEvent;
    data: any;
}