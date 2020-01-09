import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { Global } from './global'
import { FilterPipe } from './filter.pipe';

import { RouterModule, Routes } from '@angular/router';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { HttpClientModule } from "@angular/common/http";

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IntlModule } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'hammerjs';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DisplayRoomsComponent } from './display-rooms/display-rooms.component';

const urlMap: Routes =
  [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: HomeComponent },
    { path: 'display-rooms', component: DisplayRoomsComponent },
  ];

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DisplayRoomsComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(urlMap),
    AutocompleteLibModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    BrowserAnimationsModule,
    IntlModule,
    DateInputsModule,
    NgbModule,
    HttpClientModule,
  ],
  providers: [MatDatepickerModule, {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
  },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }, Global],
  bootstrap: [AppComponent],
})
export class AppModule { }

