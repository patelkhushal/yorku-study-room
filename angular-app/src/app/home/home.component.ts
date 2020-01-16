import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { Global } from '../global'

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

// const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('auto', { static: false }) auto;
  @ViewChild('roomSelect', { static: false }) roomSelect;

  lsb_url = "url(\"assets/images/lsb.jpg\")"
  berg_url = "url(\"assets/images/berg.jpg\")"
  lsb_room_url = "url(\"assets/images/lsb_room.jpg\")"

  display_date_error: Boolean
  display_time_error: Boolean
  display_building_error: Boolean
  display_room_error: Boolean
  display_search_error: Boolean
  display_free_error: Boolean

  picker //used to bind for <mat-datepicker> in home.html
  keyword = 'name';

  building_rooms
  selected_room
  day_name
  building_acr

  constructor(private router: Router, public global: Global, private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit() {
    this.building_rooms = new Array()
    if (!this.global.start_time && !this.global.end_time) {
      this.global.start_time = new Date()
      this.global.end_time = new Date(this.global.start_time.getTime() + 60 * 60000); //one hr more than start time
    }
    this.display_date_error = false
    this.display_time_error = false
    this.display_building_error = false
    this.display_room_error = false
    this.display_free_error = false
  }

  changeMode(new_mode) {
    this.global.mode = new_mode
    if (this.global.mode == "date"){
      this.renderer.setStyle(document.body, 'background-image', this.lsb_url)
      this.building_acr = null
    }
    else if (this.global.mode == "location_and_date") this.renderer.setStyle(document.body, 'background-image', this.berg_url)
    else this.renderer.setStyle(document.body, 'background-image', this.lsb_room_url)
  }

  selectEvent(item) {
    // do something with selected item
    this.building_acr = item.acr
    this.display_building_error = false
    if (this.global.mode == 'room') {
      this.building_rooms = new Array()
      let url = this.global.port + "/getBuildingRooms" + "?building_acr=" + this.building_acr
      this.http.get(url, { withCredentials: true }).subscribe((data: any[]) => {
        data = data.sort()
        data.forEach(element => {
          let temp_json = {}
          temp_json["name"] = element
          this.building_rooms.push(temp_json)
        });
      });
    }
  }

  selectRoom(item) {
    this.selected_room = item.name
    this.display_room_error = false
  }

  buildingCleared() {
    this.building_acr = null
    this.selected_room = null
  }

  roomCleared() {
    this.selected_room = null
  }

  openPanel(e): void {
    e.stopPropagation();
    this.auto.open();
  }

  openRoomPanel(e): void {
    e.stopPropagation();
    this.roomSelect.open();
  }

  dateChanged(event) {
    if (event.value) {
      this.global.selected_date = event.value.toDate()
      this.display_date_error = false
    }
    else {
      this.global.selected_date = null
      this.display_date_error = true
    }
  }

  roundMins(date: Date) {
    if (date.getHours() < 8) {date.setHours(8); date.setMinutes(0); return}
    if (date.getHours() >= 22) {
      date.setHours(22)
      if (date.getHours() == 22) date.setMinutes(0)
    }

    if (date.getMinutes() <= 15) date.setMinutes(0)
    if (date.getMinutes() > 15 && date.getMinutes() <= 30) date.setMinutes(30)
    if (date.getMinutes() > 30 && date.getMinutes() <= 45) date.setMinutes(30)
    if (date.getMinutes() > 45 && date.getMinutes() < 60) {
      date.setHours(date.getHours() + 1)
      date.setMinutes(0)
      if(date.getHours() == 8) date.setHours(7)
    }
  }

  searchClicked() {
    this.display_building_error = this.display_date_error = this.display_free_error = this.display_room_error = this.display_search_error = this.display_time_error = false
    let days = ['SUDAY', 'MODAY', 'TUDAY', 'WEDAY', 'THDAY', 'FRDAY', 'SADAY'];
    if(this.global.selected_date) this.day_name = days[this.global.selected_date.getDay()];

    if(this.day_name && (this.day_name == "SADAY" || this.day_name == "SUDAY")) this.display_free_error = true
    else {
      if (this.global.mode == "room") {
        if (!this.building_acr || !this.selected_room) {
          if (!this.building_acr) this.display_building_error = true
          if (!this.selected_room) this.display_room_error = true
        }
        else{
          if(this.global.requested_rooms) this.global.requested_rooms = null
          this.router.navigate(['/display-rooms'], { queryParams: { "acr_room": this.building_acr + "_" + this.selected_room } })
        } 
      }
  
      if (this.global.mode == "date" || this.global.mode == "location_and_date") {
        if (!this.global.selected_date || this.global.start_time > this.global.end_time || (this.global.mode == "location_and_date" && !this.building_acr)) {
          if (this.global.start_time > this.global.end_time) this.display_time_error = true
          if (!this.global.selected_date) this.display_date_error = true
          if (this.global.mode == "location_and_date" && !this.building_acr) this.display_building_error = true
        }
        else if((this.validDate(this.global.start_time) && this.validDate(this.global.end_time)) || this.roundDates()) {
          this.roundMins(this.global.start_time)
          this.roundMins(this.global.end_time)
  
          if(this.global.start_time.getTime() == this.global.end_time.getTime()) this.global.end_time.setMinutes(this.global.start_time.getMinutes() + 30)
          
          let formatted_start_time = (this.global.start_time.getHours() < 10 ? '0' : '') + this.global.start_time.getHours() + (this.global.start_time.getMinutes() < 10 ? '0' : '') + this.global.start_time.getMinutes()
          let formatted_end_time = (this.global.end_time.getHours() < 10 ? '0' : '') + this.global.end_time.getHours() + (this.global.end_time.getMinutes() < 10 ? '0' : '') + this.global.end_time.getMinutes()
  
          let url = this.global.port + "/getRooms" + "?start_time=" + formatted_start_time + "&end_time=" + formatted_end_time + "&day=" + this.day_name + "&building_acr=" + this.building_acr
          this.http.get(url, { withCredentials: true }).subscribe((data: any[]) => {
            if(data.length == 0) this.display_search_error = true;
            else{
              this.global.requested_rooms = data; 
              this.router.navigate(['/display-rooms'], { queryParams: { "start_time": formatted_start_time, "end_time": formatted_end_time, "day": this.day_name, "building_acr": this.building_acr } })
              // this.router.navigate(['/display-room-buttons'], { queryParams: { "start_time": formatted_start_time, "end_time": formatted_end_time, "day": this.day_name, "building_acr": this.building_acr } })
            }
          })
        }
        else{
          this.display_free_error = true
        } 
      }
    }
  }

  validDate(date: Date){
    let valid = false
    if(date.getHours() >= 8 && date.getHours() <= 22){
      valid = true
      if(date.getHours() == 22 && date.getMinutes() != 0){
        return false
      }
    }
    return valid
  }

  roundDates(){
    if(this.global.start_time.getHours() < 8 && this.validDate(this.global.end_time)) {
      return true
    }
    if(this.validDate(this.global.start_time) && this.global.end_time.getHours() >= 22) return true
    if(!this.validDate(this.global.start_time) && !this.validDate(this.global.end_time)){
      if(this.global.start_time.getHours() < 8 && this.global.end_time.getHours() >= 22) return true
    }
    return false
  }

  setTodayDate() {
    this.global.selected_date = new Date()
    this.display_date_error = false
  }
}
