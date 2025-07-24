// The appointment statuses that are used for appointments are within the domain of the appointment and scheduling area of the application given the application of the status is for appointments.
// Utilization of the type can be across modules but the definition will live here.
import { Injectable } from '@angular/core';

import { Timezone } from "../models/timezone";

// Item is separate in case we decide to get the data from an API in the future.
@Injectable()
export class TimezoneDataService {

    constructor() { }

    public timezones: Timezone[] = [
        new Timezone('Alaskan Standard Time', 'Alaskan Time Zone', -9, 'AKST', 'AKDT', 'America/Anchorage'),
        new Timezone('Central Standard Time', 'Central Time Zone', -6, 'CST', 'CDT', 'America/Chicago'),
        new Timezone('Eastern Standard Time', 'Eastern Time Zone', -5, 'EST', 'EDT', 'America/New_York'),
        new Timezone('Aleutian Standard Time', 'Hawaii–Aleutian Time Zone', -10, 'HAST', 'HAST', 'Pacific/Honolulu'),
        new Timezone('Hawaiian Standard Time', 'Hawaii Standard Time (Honolulu)', -10, 'HST', 'HST', 'Pacific/Honolulu'),
        new Timezone('Mountain Standard Time', 'Mountain Time Zone (Denver)', -7, 'MST', 'MDT', 'America/Denver'),
        new Timezone('US Mountain Standard Time', 'Mountain Time Zone (Phoenix)', -7, 'MST', 'MST', 'America/Phoenix'),
        new Timezone('Pacific Standard Time', 'Pacific Time Zone', -8, 'PST', 'PDT', 'America/Los_Angeles')
    ];

}