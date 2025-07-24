import { RegistrationEvent } from './enums';

export interface RegistrationCustomEvent {
    eventtype: RegistrationEvent;
    data: any;
}