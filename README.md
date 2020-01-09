# yorku-study-room

Shows empty york university lecture halls (i.e. lecture halls when there are no lecture ) for students to study in
<br><br>

* `processor.py` used to parse yorku ical files and save to redis database<br>
* `express-app/` express app to retrieve backend database<br>
* `angular-app/` front end angular web application<br>
* `dump.rdb` redis database snapshot (database data populated by `processor.py`)<br>

<details><summary>Required Angular Libraries</summary>
<p>
``` npm i angular-ng-autocomplete
npm i angular-material
npm install --save kendo-ui-core
npm install --save @progress/kendo-ui
npm i @progress/kendo-angular-common
npm i @progress/kendo-angular-dateinputs
npm i @progress/kendo-angular-intl
npm i @progress/kendo-angular-l10n
npm i @progress/kendo-angular-popup
npm i @progress/kendo-theme-default
npm i @angular/material
npm i @angular/material-moment-adapter
npm i @ng-bootstrap/ng-bootstrap
npm i @angular/cdk
npm i moment
npm i hammerjs ```

add following in `angular.json` file under `styles` section
``` "./node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css",
 "node_modules/@progress/kendo-theme-default/dist/all.css"```

`"allowSyntheticDefaultImports": true,` add this to you `tsconfig.json` under `compilerOptions` 

</p>
</details>
