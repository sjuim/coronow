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

function colorForCountry(country) {
    if (country === "US") {
        return "#0572f8";
    } else if (country === "China") {
        return "#f80505";
    } else if (country === "Brazil") {
        return "#0dac12";
    } else if (country === "Italy") {
        return "#a7b01f";
    } else if (country === "Spain") {
        return "#ffa500";
    } else if (country === "France") {
        return "#00d0ff";
    } else if (country === "Germany") {
        return "#8d0000";
    } else if (country === "United Kingdom") {
        return "#7900ff";
    } else if (country === "Japan") {
        return "#ff00d4";
    }
}

function buildCharts() {
    var country = $("#country").select2("val");
    var c_data = data[country];
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
                borderColor: colorForCountry(val)
            });
        });
        new Chart(wrapper.find("canvas")[0], {
            type: "line",
            data: {
                labels: beautifyDates(valuesOfKey(data.world, "date")),
                datasets: datasets
            }
        });
    });
}

var data = [];
var current_lang = navigator.language.split("-")[0];
var lang = {};
if (current_lang === "pt") {
    lang = {
        country: "País",
        confirmed: "Confirmados",
        deaths: "Mortes",
        recovered: "Recuperados",
        fatality: "Fatalidade",
        all_world: "Mundo Todo",
        overall_growth: "Crescimento geral",
        months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        comparing_countries: "Comparar países",
        footer: "Feito por <a href='https://github.com/etcho'>Etcho</a> para a <a href='https://github.com/lu-brito'>Lu</a> <i class='fas fa-heart'></i>. <a href='https://github.com/pomber/covid19' target='_blank'>Fonte de dados</a>."
    };
} else {
    lang = {
        country: "Country",
        confirmed: "Confirmed",
        deaths: "Deaths",
        recevered: "Recovered",
        fatality: "Fatality",
        all_world: "All World",
        overall_growth: "Overall growth",
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        comparing_countries: "Compare countries",
        footer: "Made by <a href='https://github.com/etcho'>Etcho</a> for <a href='https://github.com/lu-brito'>Lu</a> <i class='fas fa-heart'></i>. <a href='https://github.com/pomber/covid19' target='_blank'>Data source</a>."
    };
}

$(document).ready(function () {
    loadLang();

    $.ajax({
        url: "https://pomber.github.io/covid19/timeseries.json",
        dataType: "json",
        success: function (d) {
            data = d;
            var world = [];
            $("#country").append('<option value="world">' + lang.all_world + '</option>');
            $(Object.keys(data)).each(function (a, b) {
                $("#country").append('<option value="' + b + '">' + b + '</option>');
                $(data[b]).each(function (c, d) {
                    var found = false;
                    $(world).each(function (e, f) {
                        if (f.date === d.date) {
                            world[e].confirmed += d.confirmed;
                            world[e].deaths += d.deaths;
                            world[e].recovered += d.recovered;
                            found = true;
                        }
                    });
                    if (!found) {
                        world.push({date: d.date, confirmed: d.confirmed, deaths: d.deaths, recovered: d.recovered});
                    }
                });
            });
            data.world = world;
            if (hash().length > 0) {
                $("#country option").each(function () {
                    if ($(this).attr("value").toLowerCase() === hash().toLowerCase()) {
                        $(this).prop("selected", true);
                    }
                });
            }
            $("select").show().select2().trigger("change");
            $(".loading").hide();
        }
    });

    $("#country").on("change", function () {
        var country = $(this).select2("val");
        var d = data[country];
        var last = d[d.length - 1];
        $("#counter_confirmed").html(numberFormat(last.confirmed));
        $("#counter_deaths").html(numberFormat(last.deaths));
        $("#counter_recovered").html(numberFormat(last.recovered));
        $("#counter_fatality").html(numberFormat((last.deaths / (last.confirmed) * 100).toFixed(1)) + "%");
        jump(country);
        buildCharts();
        buildChartCompare();
    });

    $("img.flag").on("click", function () {
        if (!$(this).hasClass("active") || $("img.flag.active").length > 1) {
            $(this).toggleClass("active");
            buildChartCompare();
        }
    });
});