function numberFormat(number) {
    return new Intl.NumberFormat().format(number);
}

function hash() {
    return window.location.hash.replace("#", "");
}

function jump(h) {
    window.location.href = "#" + h;
}

function loadLang() {
    $("lang").each(function () {
        $(this).html(lang[$(this).attr("for")]);
    });
}

function valuesOfKey(list, key) {
    var filtered = [];
    $(list).each(function (a, b) {
        filtered.push(b[key]);
    });
    return filtered;
}

function beautifyDate(date) {
    date = date.split("-");
    if (current_lang === "pt") {
        return date[2] + "/" + lang.months[date[1] - 1];
    } else {
        return lang.months[date[1] - 1] + " " + date[2];
    }
}

function beautifyDates(dates) {
    $(dates).each(function (a, b) {
        dates[a] = beautifyDate(b);
    });
    return dates;
}

function colorForCounty(county) {
    if (county === "Suffolk") {
        return "#0572f8";
    } else if (county === "Norfolk") {
        return "#f80505";
    } else if (county === "Middlesex") {
        return "#0dac12";
    } else if (county === "Berkshire") {
        return "#a7b01f";
    } else if (county === "Worcester") {
        return "#ffa500";
    } else if (county === "Essex") {
        return "#00d0ff";
    } else if (county === "Barnstable") {
        return "#8d0000";
    } else if (county === "Bristol") {
        return "#7900ff";
    } else if (county === "Hampden") {
        return "#ff00d4";
    } else if (county === "Plymouth") {
        return "#b44c78";
    } else if (county === "Franklin") {
        return "#d4bcef";
    } else if (county === "Hampshire") {
        return "#0dac12";
    } else if (county === "Nantucket") {
        return "#efddbc";
    } else if (county === "Dukes") {
        return "#758a7d";
    } else {                    // For Unknown county
        return "#000000";
    }
}

function buildCharts() {
    var county = $("#county").select2("val");
    var c_data = data[county];
    var wrapper = $("#wrapper-chart");
    wrapper.html("<canvas height='200'></canvas>");
    new Chart(wrapper.find("canvas")[0], {
        type: "line",
        data: {
            labels: beautifyDates(valuesOfKey(c_data, "date")),
            datasets: [
                {
                    label: lang.confirmed,
                    data: valuesOfKey(c_data, "confirmed"),
                    fill: false,
                    borderColor: "#ffcc5c",
                    lineTension: 0,
                    pointRadius: 1,
                    borderWidth: 2
                },
                {
                    label: lang.deaths,
                    data: valuesOfKey(c_data, "deaths"),
                    fill: true,
                    borderColor: "#ff6f69",
                    backgroundColor: "rgba(255, 0, 0, 0.3)",
                    lineTension: 0,
                    pointRadius: 1,
                    borderWidth: 2
                },
                {
                    label: lang.recovered,
                    data: valuesOfKey(c_data, "recovered"),
                    fill: false,
                    borderColor: "#96ceb4",
                    lineTension: 0,
                    pointRadius: 0,
                    borderDash: [3, 3],
                    borderWidth: 2
                }
            ]
        },
        options: {
            tooltips: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function buildChartCompare() {
    $(["confirmed", "deaths", "recovered"]).each(function (a, attribute) {
        var wrapper = $("#wrapper-chart-compare-" + attribute);
        wrapper.html("<canvas height='200'></canvas>");
        var datasets = [];
        $(".flag.active").each(function () {
            var val = $(this).attr("value");
            datasets.push({
                label: val,
                data: valuesOfKey(data[val], attribute),
                fill: false,
                lineTension: 0,
                pointRadius: 1,
                borderWidth: 2,
                borderColor: colorForCounty(val)
            });
        });
        new Chart(wrapper.find("canvas")[0], {
            type: "line",
            data: {
                labels: beautifyDates(valuesOfKey(data.statewide, "date")),
                datasets: datasets
            }
        });
    });
}

var chart = null;
function buildMapChart(i) {
    if (data === false) {
        setTimeout(function () {
            buildMapChart();
        }, 500);
        return;
    }
    i = i === undefined ? data.statewide.length - 1 : i;
    var attribute = $("#map-buttons-world-map .btn-warning").attr("attribute");
    var cdata = [['County', 'Deaths']];
    $(Object.keys(data)).each(function (a, b) {
        if (b !== "statewide") {
            cdata.push([b, data[b][i][attribute]]);
        }
    });
    $("#slider-map-date").html(beautifyDate(data.statewide[i].date));

    var colors = ['#fff9f9', '#ffc9c9', '#ffa9a9', '#ff8989', '#ff6f69'];
    if (attribute === "confirmed") {
        colors = ["#F8F8F8", "#ffcc5c"];
    } else if (attribute === "recovered") {
        colors = ["#F8F8F8", "#88d8b0"];
    }

    var gdata = google.visualization.arrayToDataTable(cdata);

    var options = {
        colorAxis: {
            colors: colors
        },
        height: $("#wrapper-map").width() * 0.583
    };

    $("#wrapper-map").html("");
    if (chart === null) {
        chart = new google.visualization.GeoChart($("#wrapper-map")[0]);
    }
    chart.clearChart();
    chart.draw(gdata, options);
}

function updateCounters(county, i) {
    var d = data[county];
    i = i === undefined ? d.length - 1 : i;
    if (i > 0) {
        $("#counter_confirmed").html(numberFormat(d[i].confirmed) + '<div class="counter_change' + (d[i].confirmed - d[i - 1].confirmed > 0 ? ' going-up"><i class="fas fa-caret-up"></i> ' : ' going-down"><i class="fas fa-caret-down"></i> ') + (numberFormat(d[i].confirmed - d[i - 1].confirmed)) + '</div>');
        $("#counter_deaths").html(numberFormat(d[i].deaths) + '<div class="counter_change' + (d[i].deaths - d[i - 1].deaths > 0 ? ' going-up"><i class="fas fa-caret-up"></i> ' : ' going-down"><i class="fas fa-caret-down"></i> ') + (numberFormat(d[i].deaths - d[i - 1].deaths)) + '</div>');
        $("#counter_recovered").html(numberFormat(d[i].recovered) + '<div class="counter_change' + (d[i].recovered - d[i - 1].recovered >= 0 ? ' going-down"><i class="fas fa-caret-up"></i> ' : ' going-up"><i class="fas fa-caret-down"></i> ') + (numberFormat(d[i].recovered - d[i - 1].recovered)) + '</div>');
    } else {
        $("#counter_confirmed").html(numberFormat(d[i].confirmed));
        $("#counter_deaths").html(numberFormat(d[i].deaths));
        $("#counter_recovered").html(numberFormat(d[i].recovered));
    }
    $("#counter_fatality").html(numberFormat(((isNaN(d[i].deaths / (d[i].confirmed) * 100) ? 0 : d[i].deaths / (d[i].confirmed) * 100)).toFixed(1)) + "%");
    $("#slider-counters-date").html(beautifyDate(data.statewide[i].date));
}

var data = false;
var current_lang = navigator.language.split("-")[0];
var lang = {};
if (current_lang === "pt") {
    lang = {
        country: "País",
        confirmed: "Confirmados",
        deaths: "Mortes",
        recovered: "Recuperados",
        fatality: "Fatalidade",
        all_state: "Em Todo o Estado",
        overall_growth: "Crescimento geral",
        months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        comparing_counties: "Comparar países",
        //This footer I have not bothered updating
        footer: "Feito por <a href='https://github.com/etcho'>Etcho</a> para a <a href='https://github.com/lu-brito'>Lu</a> <i class='fas fa-heart'></i>. <a href='https://github.com/pomber/covid19' target='_blank'>Fonte de dados</a>.",
        world_map: "Mapa do Mundo",
    };
} else {
    lang = {
        country: "Country",
        confirmed: "Confirmed",
        deaths: "Deaths",
        recevered: "Recovered",
        fatality: "Fatality",
        all_state: "Statewide",
        overall_growth: "Overall growth",
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        comparing_counties: "Compare counties",
        footer: "Adapted by <a href='https://github.com/sjuim'>Shreya Majumdar</a> from code made by <a href='https://github.com/etcho'>Etcho</a> for <a href='https://github.com/lu-brito'>Lu</a> <i class='fas fa-heart'></i>. <a href='https://sjuim.github.io/covid19-mass-data/timeseries.json' target='_blank'>Data source for my project</a>, adapted from information published by <a href='https://github.com/nytimes/covid-19-data'>NY Times</a>.",
        world_map: "World Map",
    };
}

$(document).ready(function () {
    loadLang();

    $.ajax({
        url: "https://sjuim.github.io/covid19-mass-data/timeseries.json",
        dataType: "json",
        success: function (d) {
            data = d;
            var statewide = [];
            $("#county").append('<option value="statewide">' + lang.all_state + '</option>');
            $(Object.keys(data)).each(function (a, b) {
                $("#county").append('<option value="' + b + '">' + b + '</option>');
                $(data[b]).each(function (c, d) {
                    var found = false;
                    $(statewide).each(function (e, f) {
                        if (f.date === d.date) {
                            statewide[e].confirmed += d.confirmed;
                            statewide[e].deaths += d.deaths;
                            statewide[e].recovered += d.recovered;
                            found = true;
                        }
                    });
                    if (!found) {
                        statewide.push({date: d.date, confirmed: d.confirmed, deaths: d.deaths, recovered: d.recovered});
                    }
                });
            });
            data.statewide = statewide;
            if (hash().length > 0) {
                $("#county option").each(function () {
                    if ($(this).attr("value").toLowerCase() === hash().toLowerCase()) {
                        $(this).prop("selected", true);
                    }
                });
            }
            $("select").show().select2().trigger("change");
            $(".loading").not(".dontgo").hide();

            $("#slider-map, #slider-counters").attr("data-slider-max", data.statewide.length - 1).attr("data-slider-value", data.statewide.length - 1);
            $("#slider-map, #slider-counters").slider();
            $("#slider-map").on("change", function (slideEvt) {
                buildMapChart(slideEvt.value.newValue);
            });
            $("#slider-counters").on("change", function (slideEvt) {
                updateCounters($("#county").select2("val"), slideEvt.value.newValue);
            });
        }
    });

    $("#county").on("change", function () {
        var county = $(this).select2("val");
        updateCounters(county);
        jump(county);
        buildCharts();
        buildChartCompare();
    });

    $("img.flag").on("click", function () {
        if (!$(this).hasClass("active") || $("img.flag.active").length > 1) {
            $(this).toggleClass("active");
            buildChartCompare();
        }
    });

    $("#map-buttons-world-map .btn").on("click", function () {
        $("#map-buttons-world-map .btn").removeClass("btn-warning").addClass("btn-secondary");
        $(this).addClass("btn-warning");
        buildMapChart($("#slider-map").val());
    });

    google.charts.load('current', {
        'packages': ['geochart'],
        'mapsApiKey': 'AIzaSyD4quPRnwLcqC9R6iaHl4ffAGJeAybt7Yg'
    });

    google.charts.setOnLoadCallback(buildMapChart);
});
