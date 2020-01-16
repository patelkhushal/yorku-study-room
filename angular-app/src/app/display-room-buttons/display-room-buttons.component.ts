import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { Global } from '../global'

@Component({
  selector: 'app-display-room-buttons',
  templateUrl: './display-room-buttons.component.html',
  styleUrls: ['./display-room-buttons.component.css']
})
export class DisplayRoomButtonsComponent implements OnInit {

  day_map = { MODAY: "Monday", TUDAY: "Tuesday", WEDAY: "Wednesday", THDAY: "Thursday", FRDAY: "Friday" }
  start_time
  end_time
  day
  day_name
  building_acr
  rooms
  building_to_rooms
  // buildings

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private global: Global) { }

  ngOnInit() {
    this.building_to_rooms = new Array()
    this.route.queryParamMap.subscribe(params => {
      this.start_time = params.get("start_time")
      this.end_time = params.get("end_time")
      this.day = params.get("day")
      this.day_name = this.day_map[this.day]
      this.building_acr = params.get("building_acr")
      if (this.global.requested_rooms) {
        this.rooms = this.global.requested_rooms
        this.configureRooms()
      }
      else {
        let url = this.global.port + "/getRooms" + "?start_time=" + this.start_time + "&end_time=" + this.end_time + "&day=" + this.day + "&building_acr=" + this.building_acr
        this.http.get(url, { withCredentials: true }).subscribe(data => {
          this.rooms = data
          this.configureRooms()
        });
      }
    })
  }

  configureRooms() {
    let json = {}
    this.rooms.sort()
    this.rooms.forEach(function (element, index, array) {
      element = element.substring(0, element.lastIndexOf('_'))
      element = element.split("_")[0] + " " + element.split("_")[1]
      array[index] = element
      if(!json[element.split(" ")[0]]) {
        json[element.split(" ")[0]] = new Set()
      }
      json[element.split(" ")[0]].add(element.split(" ")[0] + " " + element.split(" ")[1])
    });
    // this.building_to_rooms.push(json)
    for(let item in json){
      let buildings_json = {}
      buildings_json["acr"] = item
      buildings_json["rooms"] = json[item]
      buildings_json["bldName"] = this.getBuildingName(item)
      this.building_to_rooms.push(buildings_json)
    }
  }

  getBuildingName(bld_acr) {
    let building_name = ""
    this.global.york_buildings.forEach(building => {
      if (bld_acr == building["acr"]) {
        building_name = building["bld-name"]
      }
    });
    return building_name
  }

}
