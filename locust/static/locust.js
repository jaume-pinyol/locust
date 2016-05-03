$(window).ready(function() {
    var locustCountSelector = $("#locust_count");
    if (0 < locustCountSelector.length) {
        locustCountSelector.focus().select();
    }
});

var alternate = false;

$("#status").tabs();

var stats_tpl = $('#stats-template');
var errors_tpl = $('#errors-template');
var exceptions_tpl = $('#exceptions-template');

var latencyBarChart = null;
var barChart = null;

$( document ).ready(function(){
    $('#swarm_form').submit(function(event) {
        event.preventDefault();
        $.post($(this).attr("action"), $(this).serialize(),
            function(response) {
                if (response.success) {
                    $("body").attr("class", "hatching");
                    $("#start").fadeOut();
                    $("#status").fadeIn();
                    $(".box_running").fadeIn();
                    $("a.new_test").fadeOut();
                    $("li.edit_test").fadeIn();
                    $(".user_count").fadeIn();
                    $(".wrapper").fadeIn();
                    //polarAreaChart = createPolarArea("polarArea", polarData);
                    barChart = createChart("bar", "bar", barChartData);
                    latencyBarChart = createChart("bar", "latencyBar", latencyBarChartData);

                    var chart = d3.select(".d3charts")
                        .append("svg:svg")
                        .attr("class", "chart")
                        .attr("width", 420)
                        .attr("height", 20 * 2);

                    $("#bar").on("update", function(event, data){
                        barChart.datasets[0].bars[0].value = data.success_request;
                        barChart.datasets[0].bars[1].value = data.failures;
                        barChart.update();
                    });

                    $("#latencyBar").on("update", function(event, data){
                        $.each(data.stats, function(key, report_value){
                            if(report_value.name !== "Total"){
                                updateLatencyBarChart(report_value)
                            }
                        });
                    });

                    /*$(".chart").on("update", function(event, data){
                        updateS3BarChart(chart, [data.success_request, data.failures]);
                    });*/
                }
            }
        );
    });

    $('#edit_form').submit(function(event) {
        event.preventDefault();
        $.post($(this).attr("action"), $(this).serialize(),
            function(response) {
                if (response.success) {
                    $("body").attr("class", "hatching");
                    $("#edit").fadeOut();
                }
            }
        );
    });

    $("#stop_test").click(function(event){
        event.preventDefault();
        $.get($(this).data("action"));
        /*$("body").attr("class", "stopped");
        $(".box_stop").hide();
        $("a.new_test").show();
        $("a.edit_test").hide();
        $(".user_count").hide();*/
        stop();
    });



    $("#box_stop").find("a").click(function(event) {
        event.preventDefault();
        $.get($(this).attr("href"));
        /*$("body").attr("class", "stopped");
        $(".box_stop").hide();
        $("a.new_test").show();
        $("a.edit_test").hide();
        $(".user_count").hide();*/
        stop();
    });

    $("#box_reset").find("a").click(function(event) {
        event.preventDefault();
        $.get($(this).attr("href"));
    });

    $("#new_test").click(function(event) {
        event.preventDefault();
        $("#start").show();
        $("#locust_count").focus().select();
    });

    $(".edit_test").click(function(event) {
        event.preventDefault();
        $("#edit").show();
        $("#new_locust_count").focus().select();
    });

    $(".close_link").click(function(event) {
        event.preventDefault();
        $(this).parent().parent().hide();
    });

    $('#refresh').click(function(event) {
        event.preventDefault();
        $.get('/reload-tests',
            function(response) {
                if (response.success) {
                    location.reload();
                }
            }
        );
    });
});

var sortBy = function(field, reverse, primer){
    reverse = (reverse) ? -1 : 1;
    return function(a,b){
        a = a[field];
        b = b[field];
       if (typeof(primer) != 'undefined'){
           a = primer(a);
           b = primer(b);
       }
       if (a<b) return reverse * -1;
       if (a>b) return reverse * 1;
       return 0;
    }
};

// Sorting by column
var sortAttribute = "name";
var desc = false;
var report;
$(".stats_label").click(function(event) {
    event.preventDefault();
    sortAttribute = $(this).attr("data-sortkey");
    desc = !desc;
    var errorSelector = $("#errors");
    var statsSelector = $("#stats");

    statsSelector.find('tbody').empty();
    errorSelector.find('tbody').empty();

    alternate = false;
    totalRow = report.stats.pop();
    sortedStats = (report.stats).sort(sortBy(sortAttribute, desc));
    sortedStats.push(totalRow);
    statsSelector.find("tbody").jqoteapp(stats_tpl, sortedStats);
    alternate = false;
    errorSelector.find('tbody').jqoteapp(errors_tpl, (report.errors).sort(sortBy(sortAttribute, desc)));
});

var test_id = function(){
    return $('#test_id').data("value");
};

function updateStats() {
    $.get('/test/' + test_id() + '/stats/requests', function (data) {
        report = JSON.parse(data);
        var total_rps = Math.round(report.total_rps * 100) / 100;
        var fail_ratio = Math.round(report.fail_ratio * 100);
        var totalPosition = report.stats.length -1;
        var total_requests = report.stats[totalPosition].num_requests;
        var failures = report.stats[totalPosition].num_failures;
        var success_request = total_requests - failures;
        var state = report.state;


        if($("#status").is(':visible')){
            $("#bar").trigger("update", {
                "success_request" : success_request,
                "failures":  failures
            });

            $("#latencyBar").trigger("update", {
                "stats": report.stats
            });

            /*$(".chart").trigger("update", {
                "success_request" : success_request,
                "failures":  failures
            });*/
        }
        $("#total_rps").html(total_rps);
        $("#fail_ratio").html(fail_ratio);
        $("#status_text").html(report.state);
        $("#userCount").html(report.user_count);

        if (typeof report.slave_count !== "undefined")
            $("#slaveCount").html(report.slave_count);

        var errorSelector = $("#errors");
        var statsSelector = $("#stats");

        statsSelector.find('tbody').empty();
        errorSelector.find('tbody').empty();

        alternate = false;

        totalRow = report.stats.pop();
        sortedStats = (report.stats).sort(sortBy(sortAttribute, desc));
        sortedStats.push(totalRow);
        statsSelector.find('tbody').jqoteapp(stats_tpl, sortedStats);
        alternate = false;
        errorSelector.find('tbody').jqoteapp(errors_tpl, (report.errors).sort(sortBy(sortAttribute, desc)));

        if (state != "stopped") {
            setTimeout(updateStats, 5000);
        } else {
            stop();
        }
    });
}

updateStats();


function stop() {
    $("body").attr("class", "stopped");
    $(".box_stop").hide();
    $("a.new_test").show();
    $("a.edit_test").hide();
    $(".user_count").hide();
}

function updateExceptions() {
    $.get('/test/' + test_id() + '/exceptions', function (data) {
        $("#exceptions").find("tbody").empty();
        $("#exceptions").find("tbody").jqoteapp(exceptions_tpl, data.exceptions);
        setTimeout(updateExceptions, 20000);
    });
}

updateExceptions();

function createChart(type, id, data, conf){
    if(!conf){
        conf = { responsive: true };
    }
    if($("#" + id).length > 0) {
        var chartContext = $("#" + id).get(0).getContext("2d");
        var chart = null;
        switch (type) {
            case "radar":
                chart = new Chart(chartContext).Radar(data, conf);
                break;
            case "bar":
                chart = new Chart(chartContext).Bar(data, conf);
                break;
            case "polar":
                chart = new Chart(chartContext).PolarArea(data, conf);
        }
    }
    if(chart != null){
        chart.id = id;
        chart.type = type;
    }
    return chart;
}

function generateNewBarDataset(dataset){
    return {
        label: dataset.label,
        fillColor: dataset.fillColor,
        strokeColor: dataset.strokeColor,
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: [dataset.values[0], dataset.values[1], dataset.values[2], dataset.values[3]]
    };
}

function updateS3BarChart(chart, data) {
    var x = d3.scale.linear()
        .domain([0, d3.max(data)])
        .range([0, 420]);

    chart.selectAll("rect")
        .data(data).enter()
        .append("svg:rect").attr("y", function(d, i) { return i * 20; })
        .attr("width", x)
        .attr("height", 20);

    var y = d3.scale.ordinal()
        .domain(data)
        .rangeBands([0, 120]);

    chart.selectAll("rect")
        .data(data).enter()
        .append("svg:rect")
        .attr("y", y)
        .attr("width", x)
        .attr("height", y.rangeBand());

    chart.selectAll("text")
        .data(data)
        .enter()
        .append("svg:text").attr("x", x)
        .attr("y", function(d) { return y(d) + y.rangeBand() / 2; })
        .attr("dx", -3) // padding-right
        .attr("dy", ".35em") // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text(String);
}

function updateLatencyBarChart(data) {
    var average_latency = data.avg_response_time;
    var media_latency = data.median_response_time;
    var max_latency = data.max_response_time;
    var min_latency = data.min_response_time;
    var found = false;
    for(i = 0;  i < latencyBarChart.datasets.length; i++){
        if(latencyBarChart.datasets[i].label == data.name){
            latencyBarChart.datasets[i].bars[0].value = average_latency;
            latencyBarChart.datasets[i].bars[1].value = max_latency;
            latencyBarChart.datasets[i].bars[2].value = min_latency;
            latencyBarChart.datasets[i].bars[3].value = media_latency;
            found = true;
        }
    }

    if(!found){
        var position = latencyBarChart.datasets.length;
        if(latencyBarChart.datasets.length == 1 && latencyBarChart.datasets[0].label == "default"){
            position = 0;
        }
        //console.log("adding new node " + data.name);
        latencyBarChartData.datasets[position] = generateNewBarDataset({
            label: data.name,
            fillColor: generate_random_color_rgba(generate_random_color_hex(), 40),
            strokeColor: generate_random_color_rgba(generate_random_color_hex(), 30),
            values: [average_latency, max_latency, min_latency, media_latency]
        });

        latencyBarChart = createChart("bar", latencyBarChart.id, latencyBarChartData);
    } else {
        latencyBarChart.update();
    }
}

function generate_random_color_hex(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function generate_random_color_rgba(hex,opacity){
    hex = hex.replace('#','');
    red = parseInt(hex.substring(0,2), 16);
    green = parseInt(hex.substring(2,4), 16);
    blue = parseInt(hex.substring(4,6), 16);
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + opacity/100 + ')';
}