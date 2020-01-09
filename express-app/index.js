let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

const client_link = "http://localhost:4200" //replace this link with clients that might connect to this service

const express = require('express');
const session = require('express-session');
var async = require('async');
var redis = require("redis");

var app = express();
app.enable('trust proxy');
app.use(session(
    {
        secret: "mine",
        proxy: true,
        resave: true,
        saveUninitialized: true
    }));

// setup redis connection
if (process.env.REDIS_URL) redis_client = redis.createClient(process.env.REDIS_URL);
else redis_client = redis.createClient()
redis_client.on("error", function (err) {
    console.log("Error " + err);
});
// use redis database 1 (since db 0 is being used by something else!)
redis_client.select(1, function (err) {
    if (err) return err;
});

// returns an array with 30 minute intervals from start_time to end_time
function getIntervals(start_time, end_time) {
    let intervals = new Array();
    let start_date = new Date()
    start_date.setHours(start_time.substring(0, 2))
    start_date.setMinutes(start_time.substring(2, 4))

    let end_date = new Date()
    end_date.setHours(end_time.substring(0, 2))
    end_date.setMinutes(end_time.substring(2, 4))
    end_date = new Date(end_date.getTime() - 30 * 60000);

    let current_date = start_date
    while (current_date <= end_date) {
        let start_interval = (current_date.getHours() < 10 ? '0' : '') + current_date.getHours() + (current_date.getMinutes() < 10 ? '0' : '') + current_date.getMinutes()
        current_date = new Date(current_date.getTime() + 30 * 60000);
        let end_interval = (current_date.getHours() < 10 ? '0' : '') + current_date.getHours() + (current_date.getMinutes() < 10 ? '0' : '') + current_date.getMinutes()
        intervals.push(start_interval + "-" + end_interval);
    }
    return intervals
}

// returns list of keys (rooms) whose values includes intervals in intervals parameters
function getRooms(keys_regex, intervals, callback) {
    redis_client.keys(keys_regex, function (err, keys) {
        if (err) throw err;
        else {
            let validRooms = new Array()
            async.forEach(keys, function (key, inner_callback) {
                checkFreeIntervals(key, intervals, function(err, valid_key){
                    if(err) throw err
                    if(valid_key) validRooms.push(key)
                    inner_callback(null)
                })
            }, function (err) {
                if (err) throw err
                callback(null, validRooms)
            });
        }
    });
}

//returns true if all the elements (intervals) in intervals parameter exist in the key of the database, false otherwise
function checkFreeIntervals(key, intervals, callback) {
    let valid_key = true
    async.forEach(intervals, function (interval, inner_callback) {
        redis_client.zscore(key, interval, function (err, data) {
            if (err) throw err
            if (!data) valid_key = false
            inner_callback(null)
        })
    }, function (err) {
        if (err) throw err
        callback(null, valid_key)
    });
}

app.use('/getRooms', function (req, res) {
    res.set("Access-Control-Allow-Origin", client_link);
    res.set("Access-Control-Allow-Credentials", true);

    let start_time = req.query.start_time
    let end_time = req.query.end_time
    let day = req.query.day
    let building_acr = req.query.building_acr
    let acr_room = req.query.acr_room

    let intervals = getIntervals(start_time, end_time)

    let keys_regex = "*_" + day
    if (building_acr != "null") keys_regex = building_acr + "_*_" + day
    if (acr_room != "null") keys_regex = acr_room + "_*"
    getRooms(keys_regex, intervals, function(err, data){
        if(err) throw err
        res.json(data)
    })
});

// returns a json to callback function with values [MODAY, TUDAY, ... FRDAY]. Each key contains intervals which indicates empty timeslots
function getRoomSchedule(room_key, callback){
    let room_schedule_json = {}
    redis_client.keys(room_key + "*",  function (err, days) {
        if (err) throw err
        console.log(days)
        async.forEach(days, function (day, inner_callback) {
            redis_client.zrange(day, 0, -1, function (err, data) {
                if (err) throw err
                room_schedule_json[day.split("_")[2]] = data // example, day = "ACE_002_MODAY" just need the day (i.e. MODAY)
                inner_callback(null)
            })
        }, function (err) {
            if (err) throw err
            callback(null, room_schedule_json)
        });
    })
}

app.use('/getRoomSchedule', function (req, res) {
    res.set("Access-Control-Allow-Origin", client_link);
    res.set("Access-Control-Allow-Credentials", true);

    let room_key = req.query.room_key
    console.log(room_key)

    getRoomSchedule(room_key, function(err, data){
        if(err) throw err
        res.json(data)
    })
});

// returns a list to callback function that contains lecture hall of the building in building_acr
function getBuildingRooms(building_acr, callback){
    redis_client.keys(building_acr + "_*",  function (err, rooms) {
        if (err) throw err
        building_rooms = new Array()
        rooms.forEach(function(key){
            building_rooms.push(key.split("_")[1])
        })
        callback(null, building_rooms)
    })
}

app.use('/getBuildingRooms', function (req, res) {
    res.set("Access-Control-Allow-Origin", client_link);
    res.set("Access-Control-Allow-Credentials", true);

    let building_acr = req.query.building_acr

    getBuildingRooms(building_acr, function(err, data){
        if(err) throw err
        res.json(data)
    })
});


// --------------------------------------SERVER
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%d', host, port);
});
