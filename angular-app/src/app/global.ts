import { Injectable } from '@angular/core';

@Injectable()
export class Global {
    // port = 8000;
    port = "http://localhost:8000"
    mode = "date"
    selected_date: Date
    start_time: Date
    end_time: Date
    // day_name
    // building_acr
    // selected_building
    room_schedule
}