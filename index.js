var apikey = "2aca00e2d1ef80c8d993467bb7c58e83";
var unit = "metric";
var last;
var lastTime;
var lastforecast;
var todaytemp = [];
var city;
var date;
var utcTime;
var mintemp;
var maxtemp;
if (localStorage.getItem("last")) {
    last = JSON.parse(localStorage.getItem("last"));
}
if (localStorage.getItem("lastforecast")) {
    lastforecast = JSON.parse(localStorage.getItem("lastforecast"));
}
if (localStorage.getItem("city")) {
    city = localStorage.getItem("city");
    init(last);
    forecast(lastforecast);
    if (navigator.onLine) {
        req(city);
    }
} else {
    search();
}

var tempre;
var citylist;
async function fetchjson() {
    const cityList = await fetch("city.list.min.json");
    citylist = await cityList.json();
}

function cities() {
    if (citylist) {
        if(document.getElementById("cityquery").value.length == 0){
            document.getElementById("finalists").innerHTML = "";
            return;
        }
        var str = document.getElementById("cityquery").value;
        tempre = new RegExp(`^${str}`, 'gi')
        var finale = citylist.filter(isfinalist);
        var cityhtml = " ";
        var ii;
        if (finale.length > 50) {
            ii = 50
        } else {
            ii = finale.length;
        }

        for (var i = 0; i < ii; i++) {
            var obj = finale[i];
            cityhtml += `<div class="card" onclick="aftersearch(${obj.id})"> ${obj.name}, ${obj.country.toUpperCase()}<br />Lat = ${obj.coord.lat} , Long = ${obj.coord.lon}</div>`
        }
        if(cityhtml !== " "){
        document.getElementById("finalists").innerHTML = cityhtml;
        }else{
            document.getElementById("finalists").innerHTML = "<h4>No city found!</h4>";
        }
    }
}

function isfinalist(src) {
    if (tempre.test(src.name)) {
        return src.name;
    }
}


function req(place) {
    date = new Date();
    utcTime = parseInt(date.getTime() / 1000);
    if (typeof last !== "undefined" && last.id == place && utcTime - last.dt < 1200) {
        init(last);
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${place}&units=${unit}&APPID=${apikey}`).then(function (result) {
            return result.json()
        }).then(function (res) {
            console.log(res);
            init(res);
        });
    }
    if (typeof lastforecast !== "undefined" && lastforecast.cod !== "404") {
        if (lastforecast.city.id == place && utcTime - last.dt < 3600) {
            forecast(lastforecast);
        }
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${place}&units=${unit}&APPID=${apikey}`).then(function (result) {
            return result.json()
        }).then(function (fore) {
            console.log(fore);
            lastforecast = fore;
            localStorage.setItem("lastforecast", JSON.stringify(lastforecast));
            forecast(fore);
        });
    }
}

function forecast(fore) {
    var tempdate;
    if (fore.cod === "404") {
        return;
    } else
        for (var i = 0; i < 5; i++) {
            tempdate = new Date(fore.list[i].dt * 1000);
            if (tempdate.getDate() === lastTime.getDate()) {
                todaytemp.push(fore.list[i].main.temp);
            }
        }
    maxtemp = Math.max.apply(Math, todaytemp);
    mintemp = Math.min.apply(Math, todaytemp);
    document.querySelector("#minmaxtext").innerText = "Max/Min";
    document.querySelector("#minmax").innerHTML = parseInt(maxtemp) + "&deg;C/" + parseInt(mintemp) + "&deg;C";
    var temphtml = "";
    tempdate = new Date(fore.list[0].dt * 1000);
    var basedate = tempdate.getDate();
    var basenum = 1;
    var foredate;
    var foremonth;
    for (let i = 0; i < fore.list.length; i++) {
        tempdate = new Date(fore.list[i].dt * 1000);
        if (tempdate.getDate() == basedate) {
            temphtml += `<div class="hours">
        <div class="wtitle">${fore.list[i].weather[0].main}&nbsp;${fore.list[i].main.temp.toFixed(0)}&deg;</div>
        <i class="icon wi wi-owm-${fore.list[i].weather[0].id}"></i>
        <div class="time">${tempdate.getHours()}:00</div>
        </div>`;
        } else {
            basedate = tempdate.getDate();
            tempdate = new Date(fore.list[i - 1].dt * 1000);
            foredate = tempdate.getDate();
            foremonth = tempdate.getMonth() + 1;
            if (typeof document.querySelector("#d" + basenum) === "object") {
                document.querySelector("#d" + basenum).innerText = foremonth + "/" + foredate;
                document.querySelector("#day" + basenum).innerHTML = temphtml;
                temphtml = "";
                basenum++;
            }
        }
        if (i === fore.list.length - 1) {
            basedate = tempdate.getDate();
            tempdate = new Date(fore.list[i - 1].dt * 1000);
            foredate = tempdate.getDate();
            foremonth = tempdate.getMonth() + 1;
            if (document.querySelector("#d" + basenum)) {
                document.querySelector("#d" + basenum).innerText = foremonth + "/" + foredate;
                document.querySelector("#day" + basenum).innerHTML = temphtml;
                temphtml = "";
                basenum++;
            }
        }
    }
}

function search() {
    location.hash = "#citylist";
}

function aftersearch(id){
    location.hash = "#";
    setTimeout(function(){document.getElementById("finalists").innerHTML = "";document.getElementById("cityquery").value = ""}, 1000)
    req(id);
}

function init(res) {
    if (res.cod === "404") {
        alert("City not found!");
        return;
    } else {
        city = res.id;
        localStorage.setItem("city", city);
        document.querySelector("#extras").style.display = "block";
        document.querySelector("#temp").innerHTML = res.main.temp.toFixed(0) + "&deg;C";
        document.querySelector("#weather").innerHTML = res.weather[0].main + '&nbsp;&nbsp;&nbsp;<i id="wimg"></i>';
        document.querySelector("#wimg").className = "wi wi-owm-" + res.weather[0].id;
        document.querySelector("#place").innerText = res.name;
        document.querySelector("#pressure").innerText = res.main.pressure + " hPa";
        if (typeof res.main.humidity !== "undefined") {
            document.querySelector("#humidity-c").style.display = "flex";
            document.querySelector("#humidity").innerHTML = res.main.humidity + '&nbsp;<i class="wi wi-humidity"></i>';
        } else {
            document.querySelector("#humidity-c").style.display = "none";
            document.querySelector("#humidity").innerText = "";
        }
        if (typeof res.wind.speed !== "undefined") {
            document.querySelector("#wind-c").style.display = "flex";
            document.querySelector("#wind").innerHTML = res.wind.speed + ' m/s&nbsp;&nbsp;<i id="windimg"></i>';
            var winddeg = parseInt(res.wind.deg);
            var direction;
            if (winddeg >= 0 && winddeg <= 22) {
                direction = "n";
            }
            if (winddeg >= 23 && winddeg <= 44) {
                direction = "nne";
            }
            if (winddeg >= 45 && winddeg <= 67) {
                direction = "ne";
            }
            if (winddeg >= 68 && winddeg <= 89) {
                direction = "ene";
            }
            if (winddeg >= 90 && winddeg <= 112) {
                direction = "e";
            }
            if (winddeg >= 113 && winddeg <= 134) {
                direction = "ese";
            }
            if (winddeg >= 135 && winddeg <= 157) {
                direction = "se";
            }
            if (winddeg >= 158 && winddeg <= 179) {
                direction = "sse";
            }
            if (winddeg >= 180 && winddeg <= 202) {
                direction = "s";
            }
            if (winddeg >= 203 && winddeg <= 224) {
                direction = "ssw";
            }
            if (winddeg >= 225 && winddeg <= 247) {
                direction = "sw";
            }
            if (winddeg >= 248 && winddeg <= 269) {
                direction = "wsw";
            }
            if (winddeg >= 270 && winddeg <= 292) {
                direction = "w";
            }
            if (winddeg >= 293 && winddeg <= 312) {
                direction = "wnw";
            }
            if (winddeg >= 313 && winddeg <= 335) {
                direction = "nw";
            }
            if (winddeg >= 336 && winddeg <= 359) {
                direction = "nnw";
            }
            document.querySelector("#windimg").className = "wi wi-wind wi-towards-" + direction + "-deg";
        } else {
            document.querySelector("#wind-c").style.display = "none";
            document.querySelector("#wind").innerText = "";
        }
        if (typeof res.rain !== "undefined") {
            if (typeof res.rain["1h"] !== "undefined") {
                document.querySelector("#rain-c").style.display = "flex";
                document.querySelector("#rain").innerText = res.rain["1h"] + " mm";
            } else
            if (typeof res.rain["3h"] !== "undefined") {
                document.querySelector("#rain-c").style.display = "flex";
                document.querySelector("#rain").innerText = res.rain["3h"] + " mm";
            }
        } else {
            document.querySelector("#rain-c").style.display = "none";
            document.querySelector("#rain").innerText = "";
        }
        if (typeof res.sys.sunrise !== "undefined") {
            var sunrise = new Date(res.sys.sunrise * 1000);
            document.querySelector("#sunrise-c").style.display = "flex";
            document.querySelector("#sunrise").innerHTML = sunrise.getHours() + ":" + sunrise.getMinutes() + ":" + sunrise.getSeconds() + '&nbsp;&nbsp;<i class="wi wi-sunrise"></i>';
        } else {
            document.querySelector("#sunrise-c").style.display = "none";
            document.querySelector("#sunrise").innerHTML = "";
        }
        if (typeof res.sys.sunset !== "undefined") {
            var sunset = new Date(res.sys.sunset * 1000);
            document.querySelector("#sunset-c").style.display = "flex";
            document.querySelector("#sunset").innerHTML = sunset.getHours() + ":" + sunset.getMinutes() + ":" + sunset.getSeconds() + '&nbsp;&nbsp;<i class="wi wi-sunset"></i>';
        } else {
            document.querySelector("#sunset-c").style.display = "none";
            document.querySelector("#sunset").innerHTML = "";
        }
        console.log();
        last = res;
        localStorage.setItem("last", JSON.stringify(last));
        lastTime = new Date(last.dt * 1000);
    }
}

fetchjson();