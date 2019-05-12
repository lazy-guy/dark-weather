var apikey = "2aca00e2d1ef80c8d993467bb7c58e83";
var unit = "metric";
var last;
var lastTime;
var lastforecast;
var city;
var date;
var utcTime;
var mintemp;
var maxtemp;
var ishome = false;
var citydefinitions = false;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var searchtemplate = `<button id="closesearch" onclick="closesearch()">&times;</button>
<label for="cityquery">
    <h3>Enter City Name:-</h3>
</label>
<input type="text" id="cityquery" oninput="cities()">
<div id="finalists"></div>`
var s_hash;
var s_href = window.location.href;
if (window.location.hash) {
    s_hash = window.location.hash.substring(1);
    s_href = s_href.replace(window.location.hash, "");
}
if (localStorage.getItem("last")) {
    last = JSON.parse(localStorage.getItem("last"));
} else {
    last = {
        id: "9090909090"
    }
}
if (localStorage.getItem("lastforecast")) {
    lastforecast = JSON.parse(localStorage.getItem("lastforecast"));
} else {
    lastforecast = {
        city: {
            id: "9090909090"
        }
    }
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

var citylist;
async function fetchjson() {
    const cityList = await fetch("city.list.min.json").then(function (res) {
        citydefinitions = true;
        document.getElementById("citylist").innerHTML = searchtemplate;
        return res;
    });
    citylist = await cityList.json();
}

function cities() {
    if (window.location.hash === "#citylist") {
        document.addEventListener("keyup", function (evt) {
            if (evt.keyCode === 13) {
                var cards = document.getElementsByClassName("card");
                if (cards[0]) {
                    cards[0].click();
                }
            }
            if (evt.keyCode === 27) {
                document.getElementById("closesearch").click();
            }
        })
    }
    if (citydefinitions) {
        if (document.getElementById("cityquery").value.length < 2) {
            document.getElementById("finalists").innerHTML = "";
            return;
        } else
            var str = document.getElementById("cityquery").value;
        var tempre = new RegExp(`^${str}`, 'gi')
        var finale = citylist.filter(function (src) {
            if (tempre.test(src.name)) {
                return src.name;
            }
        });
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
        if (cityhtml !== " ") {
            document.getElementById("finalists").innerHTML = cityhtml;
        } else {
            document.getElementById("finalists").innerHTML = "<h4>No city found!</h4>";
        }
    }
}

var toaster = document.getElementById("toaster");

function req(place) {
    if (!navigator.onLine) {
        toaster.style.bottom = "0vh";
        setTimeout(function () {
            toaster.style.bottom = "-50vh";
        }, 4000)
    }
    date = new Date();
    utcTime = parseInt(date.getTime() / 1000);
    if (typeof last !== "undefined" && last.id == place && utcTime - last.dt < 1200) {
        init(last);
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${place}&units=${unit}&APPID=${apikey}`).then(function (result) {
            return result.json()
        }).then(function (res) {
            init(res);
        });
    }
    if (typeof lastforecast !== "undefined" && lastforecast.city.id == place && lastforecast.cod !== "404" && utcTime - last.dt < 3600) {
        forecast(lastforecast);
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${place}&units=${unit}&APPID=${apikey}`).then(function (result) {
            return result.json()
        }).then(function (fore) {
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
    } else {
        var todaytemp = [];
        for (var i = 0; i < 5; i++) {
            tempdate = new Date(fore.list[i].dt * 1000);
            if (tempdate.getDate() === lastTime.getDate()) {
                todaytemp.push(fore.list[i].main.temp);
            }
        }
        todaytemp.push(last.main.temp.toFixed(0));
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
                foremonth = tempdate.getMonth();
                if (typeof document.querySelector("#d" + basenum) === "object") {
                    document.querySelector("#d" + basenum).innerText = foredate + "&nbsp;" + months[foremonth];
                    document.querySelector("#day" + basenum).innerHTML = temphtml;
                    temphtml = "";
                    basenum++;
                }
            }
            if (i === fore.list.length - 1) {
                basedate = tempdate.getDate();
                tempdate = new Date(fore.list[i - 1].dt * 1000);
                foredate = tempdate.getDate();
                foremonth = tempdate.getMonth();
                if (document.querySelector("#d" + basenum)) {
                    document.querySelector("#d" + basenum).innerText = foredate + "&nbsp;" + months[foremonth];
                    document.querySelector("#day" + basenum).innerHTML = temphtml;
                    temphtml = "";
                    basenum++;
                }
            }
        }
    }
}

function search() {
    if (window.location.hash !== "#citylist" && ishome === false) {
        window.history.pushState("City", "City", s_href + "#citylist");
        ishome = true;
    } else {
        window.history.replaceState("City", "City", s_href + "#citylist");
    }
    document.getElementById("citylist").style.top = "0";
    document.getElementById("main").style.overflowY = "hidden";
    if (typeof citylist === "undefined") {
        fetchjson();
    }
}

function aftersearch(id) {
    if (window.location.hash !== "#main") {
        window.history.replaceState("Main", "main", s_href + "#main");
    }
    document.getElementById("citylist").style.top = "110vh";
    document.getElementById("main").style.overflowY = "auto";
    setTimeout(function () {
        document.getElementById("finalists").innerHTML = "";
        document.getElementById("cityquery").value = ""
    }, 1000)
    req(id);
}

function closesearch() {
    if (window.location.hash !== "#main") {
        window.history.replaceState("Main", "main", s_href + "#main");
    }
    document.getElementById("citylist").style.top = "110vh";
    document.getElementById("main").style.overflow = "auto";
    setTimeout(function () {
        document.getElementById("finalists").innerHTML = "";
        document.getElementById("cityquery").value = ""
    }, 1000)
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
        last = res;
        localStorage.setItem("last", JSON.stringify(last));
        lastTime = new Date(last.dt * 1000);
    }
}

window.addEventListener("popstate", function () {
    if (window.location.hash == "#citylist") {
        search();
    } else {
        closesearch();
    }
})