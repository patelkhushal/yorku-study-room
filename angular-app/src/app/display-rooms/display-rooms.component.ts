import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { Global } from '../global'


@Component({
  selector: 'app-display-rooms',
  templateUrl: './display-rooms.component.html',
  styleUrls: ['./display-rooms.component.css']
})

export class DisplayRoomsComponent implements OnInit {

  @ViewChild('auto', { static: false }) auto;
  @ViewChild('roomSelect', { static: false }) roomSelect;

  public searchString: string; //this is public due to heroku deployment issues

  day_map = { MODAY: "Monday", TUDAY: "Tuesday", WEDAY: "Wednesday", THDAY: "Thursday", FRDAY: "Friday" }
  start_time
  end_time
  day
  building_acr
  acr_room

  rooms
  rooms_filter
  intervals
  room_name
  building_name
  day_name
  keyword = 'name';
  filter_options
  room_filter_options
  selected_building_acr

  show_room_filter: Boolean

  moday_colored_intervals
  tuday_colored_intervals
  weday_colored_intervals
  thday_colored_intervals
  frday_colored_intervals

  moday_continuous_intervals
  tuday_continuous_intervals
  weday_continuous_intervals
  thday_continuous_intervals
  frday_continuous_intervals


  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private global: Global) { }

  ngOnInit() {
    this.filter_options = new Array()
    this.show_room_filter = false
    this.route.queryParamMap.subscribe(params => {
      this.start_time = params.get("start_time")
      this.end_time = params.get("end_time")
      this.day = params.get("day")
      this.building_acr = params.get("building_acr")
      this.acr_room = params.get("acr_room")

      this.day_name = this.day_map[this.day]

      if (this.global.requested_rooms) {
        this.rooms = this.global.requested_rooms
        this.configureRooms()
      }
      else {
        let url = this.global.port + "/getRooms" + "?start_time=" + this.start_time + "&end_time=" + this.end_time + "&day=" + this.day + "&building_acr=" + this.building_acr + "&acr_room=" + this.acr_room
        this.http.get(url, { withCredentials: true }).subscribe(data => {
          this.rooms = data
          this.configureRooms()
        });
      }
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

  configureRooms() {
    let buildings = new Set()
    if (this.acr_room && this.rooms.length > 1) this.rooms.splice(1, this.rooms.length - 1)
    this.rooms.sort()
    this.room_name = this.rooms[0].substring(0, this.rooms[0].lastIndexOf('_')).replace("_", " ")
    this.rooms.forEach(function (element, index, array) {
      buildings.add(element.split("_")[0])
      element = element.substring(0, element.lastIndexOf('_'))
      element = element.split("_")[0] + " " + element.split("_")[1]
      array[index] = element
    });
    Array.from(buildings).forEach(element => {
      this.getBuildingName(element)
      this.filter_options.push({ 'name': this.building_name + " - " + element, 'acr': element })
    });
    this.displaySchedule(this.rooms[0].replace(" ", "_"))
  }

  displaySchedule(room) {
    this.room_name = room.replace("_", " ")
    this.getBuildingName(room.split("_")[0])
    let url = this.global.port + "/getRoomSchedule" + "?room_key=" + room
    this.http.get(url, { withCredentials: true }).subscribe(data => {
      if (data["MODAY"]) {
        this.moday_colored_intervals = data["MODAY"];
        this.moday_continuous_intervals = this.getContinuousIntervalsJson(this.moday_colored_intervals);
      }
      else {
        this.moday_colored_intervals = this.intervals
        this.moday_continuous_intervals = { "0800": "2200_28" }
      }

      if (data["TUDAY"]) {
        this.tuday_colored_intervals = data["TUDAY"]
        this.tuday_continuous_intervals = this.getContinuousIntervalsJson(this.tuday_colored_intervals)
      }
      else {
        this.tuday_colored_intervals = this.intervals
        this.tuday_continuous_intervals = { "0800": "2200_28" }
      }

      if (data["WEDAY"]) {
        this.weday_colored_intervals = data["WEDAY"]
        this.weday_continuous_intervals = this.getContinuousIntervalsJson(this.weday_colored_intervals)
      }
      else {
        this.weday_colored_intervals = this.intervals
        this.weday_continuous_intervals = { "0800": "2200_28" }
      }

      if (data["THDAY"]) {
        this.thday_colored_intervals = data["THDAY"]
        this.thday_continuous_intervals = this.getContinuousIntervalsJson(this.thday_colored_intervals)
      }
      else {
        this.thday_colored_intervals = this.intervals
        this.thday_continuous_intervals = { "0800": "2200_28" }
      }

      if (data["FRDAY"]) {
        this.frday_colored_intervals = data["FRDAY"]
        this.frday_continuous_intervals = this.getContinuousIntervalsJson(this.frday_colored_intervals)
      }
      else {
        this.frday_colored_intervals = this.intervals
        this.frday_continuous_intervals = { "0800": "2200_28" }
      }
    });

    // this.http.get(url, { withCredentials: true }).subscribe(data => {
    //   data["MODAY"] ? this.moday_colored_intervals = this.inverseIntervals(data["MODAY"]) : this.moday_colored_intervals = this.intervals
    //   data["TUDAY"] ? this.tuday_colored_intervals = this.inverseIntervals(data["TUDAY"]) : this.tuday_colored_intervals = this.intervals
    //   data["WEDAY"] ? this.weday_colored_intervals = this.inverseIntervals(data["WEDAY"]) : this.weday_colored_intervals = this.intervals
    //   data["THDAY"] ? this.thday_colored_intervals = this.inverseIntervals(data["THDAY"]) : this.thday_colored_intervals = this.intervals
    //   data["FRDAY"] ? this.frday_colored_intervals = this.inverseIntervals(data["FRDAY"]) : this.frday_colored_intervals = this.intervals
    // });
  }

  getContinuousIntervalsJson(intervals) {
    let combined_intervals_json = {}
    let left_end = intervals[0].substring(0, 4)
    let right_end = intervals[0].substring(5, 9)
    let len = 1

    for (let i = 1; i < intervals.length; i++) {

      let curr_left = intervals[i].substring(0, 4)
      let curr_right = intervals[i].substring(5, 9)

      if (right_end == curr_left) {
        right_end = curr_right
        len++;
      }
      else {
        combined_intervals_json[left_end] = right_end + "_" + len
        left_end = curr_left
        right_end = curr_right
        len = 1
      }
    }
    if (!combined_intervals_json[left_end]) combined_intervals_json[left_end] = right_end + "_" + len
    return combined_intervals_json
  }

  getBuildingName(building_acr) {
    this.global.york_buildings.forEach(building => {
      if (building_acr == building["acr"]) {
        this.building_name = building["bld-name"]
      }
    });
  }

  goBack() {
    this.router.navigate(['/home'])
  }

  selectEvent(item) {
    // do something with selected item
    this.searchString = item.acr
    let rooms = new Array()
    this.rooms.forEach(element => {
      if (item.acr == element.split(" ")[0]) {
        rooms.push({'name': element})
      }
    });
    this.selected_building_acr = item.acr
    this.room_filter_options = rooms
    this.show_room_filter = true
  }

  buildingCleared() {
    this.searchString = ""
    this.show_room_filter = false
  }

  selectRoom(item) {
    // do something with selected item
    this.searchString = item.name
  }

  roomCleared() {
    this.searchString = this.selected_building_acr
    console.log(this.searchString)
  }



  // returns intervals that are not in room_intervals but in this.intervals (i.e. all possible intervals)
  inverseIntervals(room_intervals) {
    let inverse_intervals = this.intervals
    inverse_intervals = inverse_intervals.filter(e => !room_intervals.includes(e))
    return inverse_intervals
  }

}
