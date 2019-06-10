var apikey = "2aca00e2d1ef80c8d993467bb7c58e83";
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
var is_toasting = false;
var unit;
var theme;
if (localStorage.getItem("theme")) {
    theme = localStorage.getItem("theme");
    if (theme === "light") {
        document.querySelector("body").className = "light";
    }
    document.querySelector("#themebtn").innerText = `Switch to ${(theme === "light")?"dark": "light"} mode`
} else {
    theme = "dark";
}
if (localStorage.getItem("unit")) {
    unit = localStorage.getItem("unit");
    document.querySelector("#unitbtn").innerText = `Switch to ${(unit === "metric")?"imperial": "metric"} units`
} else {
    unit = "metric"
}
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var searchtemplate = `<button id="closesearch" onclick="closesearch()">&times;</button><div id="searchinput">
<label for="cityquery">
    <h3>Enter City Name:-</h3>
</label>
<input type="text" id="cityquery" oninput="cities()">
</div>
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
        return res.json();
    }).then(function (resj) {
        citylist = resj;
        document.getElementById("citylist").innerHTML = searchtemplate;
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
        });
    });
}



function cities() {
    if (citydefinitions) {
        var cityvalue = document.getElementById("cityquery").value;
        if (cityvalue[cityvalue.length - 1] === " ") {
            return
        }
        if (cityvalue.length == 0) {
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
            cityhtml += `<div class="card" data-obj=${obj.id} onclick="aftersearch(${obj.id})"> ${obj.name}, ${obj.country.toUpperCase()}<br />Lat = ${obj.coord.lat} , Long = ${obj.coord.lon}</div>`
        }
        if (cityhtml !== " ") {
            document.getElementById("finalists").innerHTML = cityhtml;
        } else {
            document.getElementById("finalists").innerHTML = "<h4>No city found!</h4>";
        }
    }
}

var toaster = document.getElementById("toaster");

function toast(msg) {
    if (is_toasting == false) {
        document.getElementById("toaster").innerHTML = msg;
        document.getElementById("toaster").style.width = "100vw";
        document.getElementById("toaster").style.bottom = "0vh";
        is_toasting = true;
        setTimeout(function () {
            document.getElementById("toaster").style.bottom = "-50vh";
            document.getElementById("toaster").innerHTML = "";
            setTimeout(
                function () {
                    document.getElementById("toaster").innerHTML = "";
                    is_toasting = false;
                }, 500
            )
        }, 5000)
    } else {
        setTimeout(function () {
            toast(msg)
        }, 500)
    }
}

function offlinehandler(e) {
    if (!navigator.onLine) {
        toast("No Internet Connection!");
    }
}
window.addEventListener("load", offlinehandler);
window.addEventListener("offline", offlinehandler);

function hhmmss(num) {
    if (num < 10) {
        return "0" + num
    } else return num
}

function req(place) {
    if (!navigator.onLine) {
        toast("No internet connection!");
        return;
    } else
        date = new Date();
    utcTime = parseInt(date.getTime() / 1000);
    if (typeof last !== "undefined" && last.id == place && utcTime - last.dt < 1200) {
        init(last);
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?id=${place}&units=${unit}&APPID=${apikey}`).then(function (result) {
            return result.json()
        }).then(function (res) {
            last = res;
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
        document.querySelector("#minmax").innerHTML = parseInt(maxtemp) + `&deg;${(unit === "metric")?"C":"F"}&nbsp;/&nbsp;${parseInt(mintemp)}&deg;${(unit === "metric")?"C":"F"}&nbsp;&nbsp;<i class="wi wi-thermometer"></i>`;
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
        <div class="wtitle">${fore.list[i].weather[0].main}&nbsp;${fore.list[i].main.temp.toFixed(0)}&deg;${(unit === "metric")?"C":"F"}</div>
        <i class="icon wi wi-owm-${fore.list[i].weather[0].id}"></i>
        <div class="time">${hhmmss(tempdate.getHours())}:00</div>
        </div>`;
            } else {
                basedate = tempdate.getDate();
                tempdate = new Date(fore.list[i - 1].dt * 1000);
                foredate = tempdate.getDate();
                foremonth = tempdate.getMonth();
                if (typeof document.querySelector("#d" + basenum) === "object") {
                    document.querySelector("#d" + basenum).innerText = foredate + " " + months[foremonth];
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
                    document.querySelector("#d" + basenum).innerText = foredate + " " + months[foremonth];
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
        document.querySelector("#temp").innerHTML = res.main.temp.toFixed(0) + `&deg;${(unit === "metric")?"C":"F"}`;
        document.querySelector("#weather").innerHTML = res.weather[0].main + '&nbsp;&nbsp;&nbsp;<i id="wimg"></i>';
        document.querySelector("#wimg").className = "wi wi-owm-" + res.weather[0].id;
        document.querySelector("#place").innerText = res.name;
        document.querySelector("#pressure").innerHTML = res.main.pressure + " hPa" + '&nbsp;&nbsp;<i class="wi wi-barometer"></i>';
        if (typeof res.main.humidity !== "undefined") {
            document.querySelector("#humidity-c").style.display = "flex";
            document.querySelector("#humidity").innerHTML = res.main.humidity + '&nbsp;&nbsp;<i class="wi wi-humidity"></i>';
        } else {
            document.querySelector("#humidity-c").style.display = "none";
            document.querySelector("#humidity").innerText = "";
        }
        if (typeof res.wind.speed !== "undefined") {
            document.querySelector("#wind-c").style.display = "flex";
            document.querySelector("#wind").innerHTML = res.wind.speed + `&nbsp;${(unit === "metric")?"m/s":"mph"}&nbsp;&nbsp;<i id="windimg"></i>`;
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
            document.querySelector("#sunrise").innerHTML = hhmmss(sunrise.getHours()) + ":" + hhmmss(sunrise.getMinutes()) + ":" + hhmmss(sunrise.getSeconds()) + '&nbsp;&nbsp;<i class="wi wi-sunrise"></i>';
        } else {
            document.querySelector("#sunrise-c").style.display = "none";
            document.querySelector("#sunrise").innerHTML = "";
        }
        if (typeof res.sys.sunset !== "undefined") {
            var sunset = new Date(res.sys.sunset * 1000);
            document.querySelector("#sunset-c").style.display = "flex";
            document.querySelector("#sunset").innerHTML = hhmmss(sunset.getHours()) + ":" + hhmmss(sunset.getMinutes()) + ":" + hhmmss(sunset.getSeconds()) + '&nbsp;&nbsp;<i class="wi wi-sunset"></i>';
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

function changetheme() {
    document.querySelector("body").classList.toggle("light");
    theme = (theme == "dark") ? "light" : "dark";
    localStorage.setItem("theme", theme);
    document.querySelector("#themebtn").innerText = `Switch to ${(theme == "dark") ? "light" : "dark"} mode`
}

function changeunits() {
    if (!navigator.onLine) {
        toast("No Internet Connection! Units will be changed when connection restores.");
    } else {
        toast("Changing units....");
        unit = (unit === "metric") ? "imperial" : "metric";
        localStorage.setItem("unit", unit);
        last = undefined;
        lastforecast = undefined;
        document.querySelector("#unitbtn").innerText = `Switch to ${(unit === "metric") ? "imperial" : "metric"} units`
        req(city);
    }
}