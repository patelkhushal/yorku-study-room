# yorku-study-room

Shows empty york university lecture halls (i.e. lecture halls when there are no lecture ) for students to study in
<br><br>

* `processor.py` used to parse yorku ical files and save to redis database<br>
* `express-app/` express app to retrieve backend database<br>
* `angular-app/` front end angular web application<br>
* `dump.rdb` redis database snapshot (database data populated by `processor.py`)<br>
