from bs4 import BeautifulSoup
import urllib.request
import datetime

#redis database import
import redis

#redis db setup
redis_host = "localhost"
redis_port = 6379
redis_password = ""
r = redis.StrictRedis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True, db = 1)

# returns end time by adding duration (in minutes) to start time (Date object) 
def get_end_time(start_time, duration):
    date_object_start_time = datetime.datetime.strptime(start_time, "%H%M%S")
    end_time = date_object_start_time + datetime.timedelta(minutes=int(duration))
    return end_time.strftime("%H%M%S")

# gets 30 minute intervals from start time to end time and and fill the interval with value 1 in key
def fill_intervals(key, start_time, end_time):
    date_object = datetime.datetime.strptime(start_time, "%H%M%S")
    while(date_object.strftime("%H%M%S") != end_time):
        begin_interval = date_object.strftime("%H%M")
        date_object = date_object + datetime.timedelta(minutes=30)
        end_interval = date_object.strftime("%H%M")
        r.zadd(key, {begin_interval + "-" + end_interval: 1})

# removes timeslots with value 1 (x-y:1) from all keys in the database 
# NOTE: Assuming all the keys are sorted sets in the database
def remove_filled_slots():
    for key in r.keys():
        r.zremrangebyscore(key, 1, 1) #removes all elements with scores = 1 in key key

# adds empty intervals to key in database (i.e 0800-0830, 0830-0900, ... 2130-2200 with value 0) 
def init_key(key):
    r.zadd(key, {"0800-0830": 0})
    r.zadd(key, {"0830-0900": 0})
    r.zadd(key, {"0900-0930": 0})
    r.zadd(key, {"0930-1000": 0})
    for i in range(10, 22):
        block = str(i) + "00" + "-" + str(i) + "30"
        r.zadd(key, {block: 0})
        block = str(i) + "30"  + "-" + str(i + 1) + "00"
        r.zadd(key, {block: 0})

year = "2019" # year to get schedule of
term = "_W_" #replace with either "_F_", "_W_" or "_SU_" for fall, winter and summer semester. Do not remove enclosing underscores (_). Note: S1, S2 and SU courses are treated as full SU courses
ical_home_link = "http://ical.uit.yorku.ca/"
response_main = urllib.request.urlopen(ical_home_link)
soup_main = BeautifulSoup(response_main, features="html.parser", from_encoding=response_main.info().get_param('charset'))

for link in soup_main.find_all('a', href=True): # get all links in ical_home_link
    if(link['href'].startswith(year)):
        ical_subject_link = ical_home_link + link['href']
        print(ical_subject_link)
        response_inner = urllib.request.urlopen(ical_subject_link)
        soup_inner = BeautifulSoup(response_inner, features="html.parser", from_encoding=response_inner.info().get_param('charset'))
        for link in soup_inner.find_all('a', href=True):
            if(link['href'].startswith("20") and (term in link['href'] or (term != "_SU_" and "_Y_" in link['href']) or (term == "_SU_" and ("_S1_" in link['href'] or "_S2_" in link['href']))) and "_ONLN_" not in link['href'] and "_DIRD_" not in link['href'] and "_INSP_" not in link['href']):
                link = ical_subject_link + link['href']
                response = urllib.request.urlopen(link)

                description = duration = frequency = days = start_date = start_time = end_date = end_time = ""
                locations = list()
                for line in response:
                    line_decode = line.decode()
                    # if line_decode is LOCATION:MC  214, R   S201
                    if(line_decode.startswith("LOCATION:")):
                        multiple_locations = line_decode.strip().split(":")[1].split(",")
                        for loc in multiple_locations:
                            inner_tokens = loc.split()
                            if(inner_tokens[1].startswith("S") or inner_tokens[1].startswith("N")): #for ross building north and south, keep "RS 137" or "RN 137" format instead of "R S137"
                                inner_tokens[0] = inner_tokens[0] + inner_tokens[1][0]
                                inner_tokens[1] = inner_tokens[1][1:]
                            locations.append(inner_tokens[0] + "_" + inner_tokens[1])

                    # if line_decode is DESCRIPTION:LE EECS 3311  3.00 2019 LE F  E LAB 01
                    if(line_decode.startswith("DESCRIPTION:")):
                        description = line_decode.strip().split(":")[1]

                    # if line_decode is DURATION:PT90M 
                    if(line_decode.startswith("DURATION:")):
                        duration = line_decode.strip().split(":")[1].split("T")[1].split("M")[0]
                    
                    # if line_decode is RRULE:FREQ=WEEKLY;BYDAY=WE,MO;UNTIL=20191202T173000
                    if(line_decode.startswith("RRULE:FREQ=")):
                        if(not line_decode.startswith("RRULE:FREQ=YEARLY")):
                            values = line_decode.strip().split(":")[1]
                            tokens = values.split(";")

                            if(tokens[1].split("=")[0].startswith("INTERVAL")): #this line can contain "INTERVAL" sometimes, so just delete it as it is not needed
                                del tokens[1]

                            frequency = tokens[0].split("=")[1]
                            days = tokens[1].split("=")[1]
                            until = tokens[2].split("=")[1]

                            if(until == "00"): #some files might contain "RRULE:FREQ=WEEKLY;BYDAY=;UNTIL=00". We do not need to process this.
                                continue
                            
                            end_date = until.split("T")[0]
                            start_time = until.split("T")[1]
                            
                    # if line_decode is DTSTART;TZID=Canada/Eastern:20190904T143000 
                    # NOTE there are multiple entries starting with "DTSART" so it is important to match startswith with "DTSTART;..."
                    if(line_decode.startswith("DTSTART;TZID=Canada/Eastern")):
                        start_date = line_decode.strip().split(":")[1].split("T")[0]
                
                # print(link)
                if(len(locations) >= 1):
                    end_time = get_end_time(start_time, duration)
                    for location in locations:
                        for day in days.split(","):
                            key = location + "_" + day + "DAY"
                            if(not r.exists(key)):
                                init_key(key)
                            fill_intervals(key, start_time, end_time)


print("removing filled spots")
remove_filled_slots()