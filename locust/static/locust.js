$(window).ready(function() {
    var locustCountSelector = $("#locust_count");
    if (0 < locustCountSelector.length) {
        locustCountSelector.focus().select();
    }
});

$("#stop_test").click(function(event){
    event.preventDefault();
    $.get($(this).data("action"));
    $("body").attr("class", "stopped");
    $(".box_stop").hide();
    $("a.new_test").show();
    $("a.edit_test").hide();
    $(".user_count").hide();
});

$("#box_stop").find("a").click(function(event) {
    event.preventDefault();
    $.get($(this).attr("href"));
    $("body").attr("class", "stopped");
    $(".box_stop").hide();
    $("a.new_test").show();
    $("a.edit_test").hide();
    $(".user_count").hide();
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

var alternate = false;

$("#status").tabs();

var stats_tpl = $('#stats-template');
var errors_tpl = $('#errors-template');
var exceptions_tpl = $('#exceptions-template');

var barChart = null;
var polarAreaChart = null;
var updateBarChartInterval = null;
var updatePolarAreaChartInteval = null;

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
                polarAreaChart = createPolarArea("polarArea", polarData);
                barChart = createBarChart("bar", barChartData);

                //updatePolarAreaChartInteval = setInterval(updateChart(polarAreaChart), 10000)
                //updateBarChartInterval = setInterval(updateChart(barChart), 10000)

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
        var total_rps = Math.round(report.total_rps*100)/100;
        var fail_ratio = Math.round(report.fail_ratio*100);
        var totalPosition = report.stats.length -1;
        var total_requests = report.stats[totalPosition].num_requests;
        var failures = report.stats[totalPosition].num_failures;
        var success_request = total_requests - failures;
        if($("#status").is(':visible')){
            if(barChart != null){
                barChart.datasets[0].bars[0].value = success_request;
                barChart.datasets[0].bars[1].value = failures;
                barChart.update();
            } else {
                barChartData.datasets[0].data[0] = success_request;
                barChartData.datasets[0].data[1] = failures;
                barChart = createBarChart("bar", barChartData);
            }
            if(polarAreaChart != null){
                polarAreaChart.segments[0].value = failures;
                polarAreaChart.segments[1].value = success_request;
                polarAreaChart.update()
            } else {
                polarData[0].value = failures;
                polarData[1].value = success_request;
                polarAreaChart = createPolarArea("polarArea", polarData);
            }
        }
        $("#total_rps").html(total_rps);
        $("#total_requests").html(total_requests);

        //$("#fail_ratio").html(Math.round(report.fail_ratio*10000)/100);
        $("#fail_ratio").html(fail_ratio);
        $("#status_text").html(report.state);
        $("#userCount").html(report.user_count);

        if (typeof report.slave_count !== "undefined")
            $("#slaveCount").html(report.slave_count)

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
        setTimeout(updateStats, 5000);
    });
}
updateStats();

function updateChart(chart){
    chart.update();
}


function updateExceptions() {
    $.get('/test/' + test_id() + '/exceptions', function (data) {
        $("#exceptions").find("tbody").empty();
        $("#exceptions").find("tbody").jqoteapp(exceptions_tpl, data.exceptions);
        setTimeout(updateExceptions, 5000);
    });
}
updateExceptions();

function createBarChart(id, data){
    if($("#" + id).length > 0){
        var chartContext = $("#" + id).get(0).getContext("2d");
        return new Chart(chartContext).Bar(data, {
            responsive : true
        });
    }
    return null;
}

function createPolarArea(id, data){
    if($("#" + id).length > 0){
        var chartContext = $("#" + id).get(0).getContext("2d");
        return new Chart(chartContext).PolarArea(data, {
            responsive : true
        });
    }
    return null;
}