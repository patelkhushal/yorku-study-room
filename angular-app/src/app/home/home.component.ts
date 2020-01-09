import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  picker
  keyword = 'name';
  data = [{ 'acr': 'ATK', 'bld-name': 'Atkinson', 'name': 'Atkinson - ATK' }, { 'acr': 'ACE', 'bld-name': 'Accolade Building East', 'name': 'Accolade Building East - ACE' }, { 'acr': 'ACW', 'bld-name': 'Accolade Building West', 'name': 'Accolade Building West - ACW' }, { 'acr': 'BC', 'bld-name': 'Bethune College', 'name': 'Bethune College - BC' }, { 'acr': 'BSB', 'bld-name': 'Behavioural Sciences Building', 'name': 'Behavioural Sciences Building - BSB' }, { 'acr': 'CB', 'bld-name': 'Chemistry Building', 'name': 'Chemistry Building - CB' }, { 'acr': 'CC', 'bld-name': 'Calumet College', 'name': 'Calumet College - CC' }, { 'acr': 'CFA', 'bld-name': 'Joan & Martin Goldfarb Centre for Fine Arts', 'name': 'Joan & Martin Goldfarb Centre for Fine Arts - CFA' }, { 'acr': 'CFT', 'bld-name': 'Centre for Film & Theatre', 'name': 'Centre for Film & Theatre - CFT' }, { 'acr': 'CLH', 'bld-name': 'Curtis Lecture Halls', 'name': 'Curtis Lecture Halls - CLH' }, { 'acr': 'DB', 'bld-name': 'Victor Phillip Dahdaleh Building', 'name': 'Victor Phillip Dahdaleh Building - DB' }, { 'acr': 'FC', 'bld-name': 'Founders College', 'name': 'Founders College - FC' }, { 'acr': 'FRQ', 'bld-name': 'Farquharson Life Sciences', 'name': 'Farquharson Life Sciences - FRQ' }, { 'acr': 'HNE', 'bld-name': 'Health, Nursing and Environmental Studies Building', 'name': 'Health, Nursing and Environmental Studies Building - HNE' }, { 'acr': 'LAS', 'bld-name': 'Lassonde Building', 'name': 'Lassonde Building - LAS' }, { 'acr': 'LMP', 'bld-name': 'LA&PS @ IBM Markham', 'name': 'LA&PS @ IBM Markham - LMP' }, { 'acr': 'LSB', 'bld-name': 'Life Sciences Building', 'name': 'Life Sciences Building - LSB' }, { 'acr': 'LUM', 'bld-name': 'Lumbers Building', 'name': 'Lumbers Building - LUM' },  { 'acr': 'MC', 'bld-name': 'McLaughlin College', 'name': 'McLaughlin College - MC' }, { 'acr': 'PSE', 'bld-name': 'Petrie Science & Engineering Building (and Observatory)', 'name': 'Petrie Science & Engineering Building (and Observatory) - PSE' }, { 'acr': 'RN', 'bld-name': 'Ross Building - North', 'name': 'Ross Building - North - RN' }, { 'acr': 'RS', 'bld-name': 'Ross Building - South', 'name': 'Ross Building - South - RS' }, { 'acr': 'SC', 'bld-name': 'Stong College', 'name': 'Stong College - SC' }, { 'acr': 'SLH', 'bld-name': 'Stedman Lecture Halls', 'name': 'Stedman Lecture Halls - SLH' }, { 'acr': 'SSB', 'bld-name': 'The Seymour Schulich Building', 'name': 'The Seymour Schulich Building - SSB' }, { 'acr': 'SHR', 'bld-name': 'Sherman Health Science Research Centre', 'name': 'Sherman Health Science Research Centre - SHR' }, { 'acr': 'TC', 'bld-name': 'Tennis Canada – Aviva Centre', 'name': 'Tennis Canada – Aviva Centre - TC' }, { 'acr': 'TFC', 'bld-name': 'Toronto Track & Field Centre', 'name': 'Toronto Track & Field Centre - TFC' }, { 'acr': 'TM', 'bld-name': 'Tait McKenzie', 'name': 'Tait McKenzie - TM' }, { 'acr': 'VC', 'bld-name': 'Vanier College', 'name': 'Vanier College - VC' }, { 'acr': 'VH', 'bld-name': 'Vari Hall', 'name': 'Vari Hall - VH' }, { 'acr': 'WC', 'bld-name': 'Winters College', 'name': 'Winters College - WC' }, { 'acr': 'WSC', 'bld-name': 'William Small Centre', 'name': 'William Small Centre - WSC' }, { 'acr': 'YH', 'bld-name': 'York Hall (Glendon Campus)', 'name': 'York Hall (Glendon Campus) - YH' }];
  building_rooms
  rooms_temp
  selected_room

  display_date_error: Boolean
  display_time_error: Boolean
  display_building_error: Boolean
  display_room_error: Boolean

  day_name
  building_acr


  constructor(private router: Router, public global: Global, private http: HttpClient) { }

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
  }

  changeMode(new_mode) {
    this.global.mode = new_mode
  }

  selectEvent(item) {
    // do something with selected item
    this.building_acr = item.acr
    this.display_building_error = false
    if(this.global.mode == 'room'){
      this.building_rooms = new Array()
      let url = this.global.port + "/getBuildingRooms" + "?building_acr=" + this.building_acr
        this.http.get(url, { withCredentials: true }).subscribe(data => {
          this.rooms_temp = data
          this.rooms_temp.sort()
          this.rooms_temp = new Set(this.rooms_temp)
          this.rooms_temp.forEach(element => {
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
      this.display_date_error = true
    }
  }

  roundMins(date: Date) {
    if(date.getHours() < 8) date.setHours(8)
    if(date.getHours() > 22) date.setHours(22)

    if (date.getMinutes() <= 15) date.setMinutes(0)
    if (date.getMinutes() > 15 && date.getMinutes() <= 30) date.setMinutes(30)
    if (date.getMinutes() > 30 && date.getMinutes() <= 45) date.setMinutes(30)
    if (date.getMinutes() > 45 && date.getMinutes() < 60) {
      date.setHours(date.getHours() + 1)
      date.setMinutes(0)
    }
  }

  searchClicked() {

    if(this.global.mode == "room"){
      if(!this.building_acr || !this.selected_room){
        if(!this.building_acr) this.display_building_error = true
        if(!this.selected_room) this.display_room_error = true
      }
      else{
        this.router.navigate(['/display-rooms'], { queryParams: { "acr_room": this.building_acr + "_" + this.selected_room } })
      }
    }

    if (this.global.mode == "date" || this.global.mode == "location_and_date") {
      if (!this.global.selected_date || this.global.start_time >= this.global.end_time || ( this.global.mode == "location_and_date" && !this.building_acr)) {
        if (this.global.start_time >= this.global.end_time) this.display_time_error = true
        if (!this.global.selected_date) this.display_date_error = true
        if (this.global.mode == "location_and_date" && !this.building_acr) this.display_building_error = true
      }
      else {
        this.roundMins(this.global.start_time)
        this.roundMins(this.global.end_time)

        let formatted_start_time = (this.global.start_time.getHours() < 10 ? '0' : '') + this.global.start_time.getHours() + (this.global.start_time.getMinutes() < 10 ? '0' : '') + this.global.start_time.getMinutes()
        let formatted_end_time = (this.global.end_time.getHours() < 10 ? '0' : '') + this.global.end_time.getHours() + (this.global.end_time.getMinutes() < 10 ? '0' : '') + this.global.end_time.getMinutes()

        let days = ['SUDAY', 'MODAY', 'TUDAY', 'WEDAY', 'THDAY', 'FRDAY', 'SADAY'];
        this.day_name = days[this.global.selected_date.getDay()];
        this.router.navigate(['/display-rooms'], { queryParams: { "start_time": formatted_start_time, "end_time": formatted_end_time, "day": this.day_name, "building_acr": this.building_acr } })
      }
    }
  }

  setTodayDate() {
    this.global.selected_date = new Date()
    this.display_date_error = false
  }
}
