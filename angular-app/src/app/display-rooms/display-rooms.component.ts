import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { Global } from '../global'


@Component({
  selector: 'app-display-rooms',
  templateUrl: './display-rooms.component.html',
  styleUrls: ['./display-rooms.component.css']
})

export class DisplayRoomsComponent implements OnInit {

  public searchString: string;

  day_map = {MODAY: "Monday", TUDAY:"Tuesday", WEDAY:"Wednesday", THDAY:"Thursday", FRDAY:"Friday"}
  start_time
  end_time
  day
  building_acr
  acr_room

  rooms
  intervals
  room_name
  moday_colored_intervals
  tuday_colored_intervals
  weday_colored_intervals
  thday_colored_intervals
  frday_colored_intervals
  day_name


  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private global: Global) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.start_time = params.get("start_time")
      this.end_time = params.get("end_time")
      this.day = params.get("day")
      this.building_acr = params.get("building_acr")
      this.acr_room = params.get("acr_room")

      this.day_name = this.day_map[this.day]
      
      let url = this.global.port + "/getRooms" + "?start_time=" + this.start_time + "&end_time=" + this.end_time + "&day=" + this.day + "&building_acr=" + this.building_acr + "&acr_room=" + this.acr_room
      this.http.get(url, { withCredentials: true }).subscribe(data => {
        this.rooms = data
        if(this.acr_room) this.rooms.splice(1, this.rooms.length - 1)
        this.rooms.sort()
        this.room_name = this.rooms[0].substring(0, this.rooms[0].lastIndexOf('_')).replace("_", " ")
        let url = this.global.port + "/getRoomSchedule" + "?room_key=" + this.rooms[0].substring(0, this.rooms[0].lastIndexOf('_'))
        this.http.get(url, { withCredentials: true }).subscribe(data => {
          data["MODAY"] ? this.moday_colored_intervals = data["MODAY"] : this.moday_colored_intervals = this.intervals
          data["TUDAY"] ? this.tuday_colored_intervals = data["TUDAY"] : this.tuday_colored_intervals = this.intervals
          data["WEDAY"] ? this.weday_colored_intervals = data["WEDAY"] : this.weday_colored_intervals = this.intervals
          data["THDAY"] ? this.thday_colored_intervals = data["THDAY"] : this.thday_colored_intervals = this.intervals
          data["FRDAY"] ? this.frday_colored_intervals = data["FRDAY"] : this.frday_colored_intervals = this.intervals
        });
      });
    });

    this.intervals = new Array()
    this.intervals.push("0800-0830")
    this.intervals.push("0830-0900")
    this.intervals.push("0900-0930")
    this.intervals.push("0930-1000")
    for (let i = 10; i < 22; i++) {
      this.intervals.push(i + "00-" + i + "30")
      this.intervals.push(i + "30-" + (i + 1) + "00")
    }

  }

  // returns intervals that are not in room_intervals but in this.intervals (i.e. all possible intervals)
  inverseIntervals(room_intervals){
    let inverse_intervals = this.intervals
    inverse_intervals = inverse_intervals.filter(e => !room_intervals.includes(e))
    return inverse_intervals
  }

  displaySchedule(room) {
    this.room_name = room.replace("_", " ")
    let url = this.global.port + "/getRoomSchedule" + "?room_key=" + room
    this.http.get(url, { withCredentials: true }).subscribe(data => {
      data["MODAY"] ? this.moday_colored_intervals = data["MODAY"] : this.moday_colored_intervals = this.intervals
      data["TUDAY"] ? this.tuday_colored_intervals = data["TUDAY"] : this.tuday_colored_intervals = this.intervals
      data["WEDAY"] ? this.weday_colored_intervals = data["WEDAY"] : this.weday_colored_intervals = this.intervals
      data["THDAY"] ? this.thday_colored_intervals = data["THDAY"] : this.thday_colored_intervals = this.intervals
      data["FRDAY"] ? this.frday_colored_intervals = data["FRDAY"] : this.frday_colored_intervals = this.intervals
    });

    // this.http.get(url, { withCredentials: true }).subscribe(data => {
    //   data["MODAY"] ? this.moday_colored_intervals = this.inverseIntervals(data["MODAY"]) : this.moday_colored_intervals = this.intervals
    //   data["TUDAY"] ? this.tuday_colored_intervals = this.inverseIntervals(data["TUDAY"]) : this.tuday_colored_intervals = this.intervals
    //   data["WEDAY"] ? this.weday_colored_intervals = this.inverseIntervals(data["WEDAY"]) : this.weday_colored_intervals = this.intervals
    //   data["THDAY"] ? this.thday_colored_intervals = this.inverseIntervals(data["THDAY"]) : this.thday_colored_intervals = this.intervals
    //   data["FRDAY"] ? this.frday_colored_intervals = this.inverseIntervals(data["FRDAY"]) : this.frday_colored_intervals = this.intervals
    // });
  }

  goBack() {
    this.router.navigate(['/home']) //{ queryParams: { "start_time": formatted_start_time, "end_time": formatted_end_time, "day": this.global.day_name, "building_acr": this.building_acr } }
  }

}
