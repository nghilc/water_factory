
$(document).ready(function () {
    $(function () {
        $("#terminal_index_time").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: false,
                // timePickerIncrement: 1,
                timePicker24Hour: false,
                opens: 'right',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-primary',
                cancelClass: 'btn-small',
                format: 'DD/MM/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Submit',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY'
                }
            }
        )
        $("#terminal_index_time").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#terminal_index_time").data("daterangepicker").setEndDate(moment().startOf('minute'));
        init_data();
    })
})

$('#terminal_index_time').on('apply.daterangepicker', function (ev, picker) {
    init_data();

});

function return_per_change(id_tag, now, past){
    if (isNaN(now) || isNaN(past)) {
        $("#"+id_tag).html("-");
        $("#" + id_tag).attr("color","gray")
        return false;
      }
    if (past === 0) {
        // cả hai = 0 => không đổi
        if (now === 0){
            $("#" + id_tag).html("0%");
            $("#" + id_tag).css("color", "green")
            return true; 
        } 
        // từ 0 lên số khác => không tính %
        $("#" + id_tag).html("-");
        $("#" + id_tag).css("color", "gray")
        return false; 
      }
    let per = ((Number(now) - Number(past)) / Number(past)) * 100;
    if(per > 0){
        $("#" + id_tag).html("▲"+show_if_null(per)+"%");
        $("#" + id_tag).css("color", "green");
        return true;
    }
    if (per < 0) {
        $("#" + id_tag).html("▼" + show_if_null(Math.abs(per)) + "%");
        $("#" + id_tag).css("color", "red");
        return true;
    }
    $("#" + id_tag).html("0%");
    $("#" + id_tag).css("color", "green")
    return true;
}

function init_data(){
    let date = $("#terminal_index_time").data('daterangepicker').endDate.format("YYYY-MM-DD");
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    $("#selected_MeterCode").val(MeterCode)

    get_consum_today_and_yesterday(date, MeterCode, NodeCode);
    get_consum_this_month_and_last_month(date, MeterCode, NodeCode);
    get_consum_this_year_and_last_year(date, MeterCode, NodeCode);
    get_consum_hour_of_day(date, MeterCode, NodeCode);
    get_consum_day_of_month(date, MeterCode, NodeCode);
    get_consum_month_of_year(date, MeterCode, NodeCode);
    // $("#loading-consum_today_and_yesterday").removeClass("d-flex").css("display", "none");
    // $("#real-consum_today_and_yesterday").fadeIn(200);
    // $("#loading-consum_this_month_and_last_month").removeClass("d-flex").css("display", "none");
    // $("#real-consum_this_month_and_last_month").fadeIn(200);
    // $("#loading-consum_this_year_and_last_year").removeClass("d-flex").css("display", "none");
    // $("#real-consum_this_year_and_last_year").fadeIn(200);
    // console.log(MeterCode, NodeCode, date)

    // $.ajax({
    //     url: "/terminal_index/get/meter_data",
    //     type: "GET",
    //     data: { date, MeterCode, NodeCode },
    //     beforeSend: function () {
    //         showLoading();  // Hiện overlay khi bắt đầu tải
    //     },
    //     success: function (res) {
    //         $("#consum_today").html(show_if_null(res.consum_today))
    //         $("#consum_yesterday").html(show_if_null(res.consum_yesterday))
    //         return_per_change("day_per_change",res.consum_today, res.consum_yesterday)

    //         $("#consum_this_month").html(show_if_null(res.consum_this_month))
    //         $("#consum_last_month").html(show_if_null(res.consum_last_month))
    //         return_per_change("month_per_change", res.consum_this_month, res.consum_last_month)

    //         $("#consum_this_year").html(show_if_null(res.consum_this_year))
    //         $("#consum_last_year").html(show_if_null(res.consum_last_year))
    //         return_per_change("year_per_change", res.consum_this_year, res.consum_last_year)

    //         CHART["hour_of_day"] = render_chart_hod("hour_of_day", res.consum_hour_of_day, "Sản lượng theo giờ");
    //         render_table_hod("hour_of_day", res.consum_hour_of_day);
    //         // CHART["day_of_month"] = render_chart("day_of_month", res.consum_day_of_month, "Sản lượng theo ngày");
    //         CHART["day_of_month"] = render_chart_hod("day_of_month", res.consum_day_of_month, "Sản lượng theo ngày");
    //         render_table_hod("day_of_month", res.consum_day_of_month);

    //         // render_table("day_of_month", res.consum_day_of_month);
    //         CHART["month_of_year"] = render_chart_hod("month_of_year", res.consum_month_of_year, "Sản lượng theo tháng");
    //         render_table_hod("month_of_year", res.consum_month_of_year);

    //     },
    //     error: function (xhr, status, error) {
    //         if (xhr.status === 401) {
    //             alert(xhr.responseText);
    //             window.location.href = "/login"
    //         } else {
    //             console.error("Lỗi:", error);
    //         }
    //     },
    //     complete: function () {
    //         hideLoading()  // Ẩn overlay sau khi tải xong
    //     }
    // })
}

function get_consum_hour_of_day(date, MeterCode, NodeCode){
    $.ajax({
        url: "/terminal_index/get/meter_data/hour_of_day",
        type: "GET",
        data: { date, MeterCode, NodeCode },
        beforeSend: function () {
            $("#chart-loading_hour_of_day").show();  // Hiện overlay khi bắt đầu tải
            $("#chart-loading_hour_of_day_table").show();  // Hiện overlay khi bắt đầu tải

        },
        success: function (res) {

            CHART["hour_of_day"] = render_chart_hod("hour_of_day", res.consum_hour_of_day, "Sản lượng theo giờ");
            render_table_hod("hour_of_day", res.consum_hour_of_day);


        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            $("#chart-loading_hour_of_day").hide();  // Ẩn overlay sau khi tải xong
            $("#chart-loading_hour_of_day_table").hide();  // Ẩn overlay sau khi tải xong

        }
    })
}

function get_consum_day_of_month(date, MeterCode, NodeCode) {
    $.ajax({
        url: "/terminal_index/get/meter_data/day_of_month",
        type: "GET",
        data: { date, MeterCode, NodeCode },
        beforeSend: function () {
            $("#chart-loading_day_of_month").show();  // Hiện overlay khi bắt đầu tải
            $("#chart-loading_day_of_month_table").show();  // Hiện overlay khi bắt đầu tải

        },
        success: function (res) {

            CHART["day_of_month"] = render_chart_hod("day_of_month", res.consum_day_of_month, "Sản lượng theo ngày");
            render_table_hod("day_of_month", res.consum_day_of_month);


        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            $("#chart-loading_day_of_month").hide();  // Ẩn overlay sau khi tải xong
            $("#chart-loading_day_of_month_table").hide();  // Ẩn overlay sau khi tải xong

        }
    })
}

function get_consum_month_of_year(date, MeterCode, NodeCode) {
    $.ajax({
        url: "/terminal_index/get/meter_data/month_of_year",
        type: "GET",
        data: { date, MeterCode, NodeCode },
        beforeSend: function () {
            $("#chart-loading_month_of_year").show();  // Hiện overlay khi bắt đầu tải
            $("#chart-loading_month_of_year_table").show();  // Hiện overlay khi bắt đầu tải

        },
        success: function (res) {

            CHART["month_of_year"] = render_chart_hod("month_of_year", res.consum_month_of_year, "Sản lượng theo tháng");
            render_table_hod("month_of_year", res.consum_month_of_year);


        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            $("#chart-loading_month_of_year").hide();  // Ẩn overlay sau khi tải xong
            $("#chart-loading_month_of_year_table").hide();  // Ẩn overlay sau khi tải xong

        }
    })
}

function get_consum_today_and_yesterday(date, MeterCode, NodeCode){
    $.ajax({
        url: "/terminal_index/get/meter_data/today_and_yesterday",
        type: "GET",
        data: { date, MeterCode, NodeCode },
        beforeSend: function () {
            $("#loading-consum_today_and_yesterday").addClass("d-flex").show();
            $("#real-consum_today_and_yesterday").hide();
        },
        success: function (res) {
            $("#consum_today").html(show_if_null(res.consum_today))
            $("#consum_yesterday").html(show_if_null(res.consum_yesterday))
            return_per_change("day_per_change", res.consum_today, res.consum_yesterday)

        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            // hideLoading()  // Ẩn overlay sau khi tải xong
            $("#loading-consum_today_and_yesterday").removeClass("d-flex").css("display","none");
            $("#real-consum_today_and_yesterday").fadeIn(200);
        }
    })
}

function get_consum_this_month_and_last_month(date, MeterCode, NodeCode) {
    $.ajax({
        url: "/terminal_index/get/meter_data/this_month_and_last_month",
        type: "GET",
        data: { date, MeterCode, NodeCode },
        beforeSend: function () {
            $("#loading-consum_this_month_and_last_month").addClass("d-flex").show();
            $("#real-consum_this_month_and_last_month").hide();
        },
        success: function (res) {
            $("#consum_this_month").html(show_if_null(res.consum_this_month))
            $("#consum_last_month").html(show_if_null(res.consum_last_month))
            return_per_change("month_per_change", res.consum_this_month, res.consum_last_month)
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            // hideLoading()  // Ẩn overlay sau khi tải xong
            $("#loading-consum_this_month_and_last_month").removeClass("d-flex").css("display", "none");
            $("#real-consum_this_month_and_last_month").fadeIn(200);
        }
    })
}


function get_consum_this_year_and_last_year(date, MeterCode, NodeCode) {
    $.ajax({
        url: "/terminal_index/get/meter_data/this_year_and_last_year",
        type: "GET",
        data: { date, MeterCode, NodeCode },
        beforeSend: function () {
            $("#loading-consum_this_year_and_last_year").addClass("d-flex").show();
            $("#real-consum_this_year_and_last_year").hide();
        },
        success: function (res) {
            $("#consum_this_year").html(show_if_null(res.consum_this_year))
            $("#consum_last_year").html(show_if_null(res.consum_last_year))
            return_per_change("year_per_change", res.consum_this_year, res.consum_last_year)

        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            // hideLoading()  // Ẩn overlay sau khi tải xong
            $("#loading-consum_this_year_and_last_year").removeClass("d-flex").css("display", "none");
            $("#real-consum_this_year_and_last_year").fadeIn(200);
        }
    })
}



function render_table_hod(id, data){
    $("#" + id + "_tbody_table").empty();
    let sum = 0;
    let sum_y = 0;

    for (let i = 0; i < data.length; i++) {
        let str = '<tr><td class="text-center-data-table align-middle">' + return_time(id, data[i][id]) + '</td><td class="text-right-data-table align-middle">' + show_if_null(Number(data[i].consum_yesterday)) + '</td><td class="text-right-data-table align-middle">' + show_if_null(Number(data[i].consumption)) + '</td></tr>'
        $("#" + id + "_tbody_table").append(str);
        sum += (Number(data[i].consumption) < 0) ? 0 : Number(data[i].consumption);
        sum_y += (Number(data[i].consum_yesterday) < 0) ? 0 : Number(data[i].consum_yesterday);

    }
    $("#" + id + "_sum").html(show_if_null(sum))
    $("#" + id + "_sum_yesterday").html(show_if_null(sum_y))

}

function render_chart_hod(id, raw_data, name){
    let main_chart;
    if (CHART[id] != null) {
        CHART[id].dispose();
        delete CHART[id]
    }
    let data = [];
    for (let i = 0; i < raw_data.length; i++) {
        let x = {
            time: return_time(id, raw_data[i][id]),
            today: Number(raw_data[i].consumption),
            yesterday: Number(raw_data[i].consum_yesterday)
        }
        data.push(x);
    }
    am4core.useTheme(am4themes_animated);

    main_chart = am4core.create(id + "_chart", am4charts.XYChart);
    // main_chart.scrollbarX = new am4core.Scrollbar();
    main_chart.data = data;
    main_chart.logo.disabled = true;



    // Create X axis (CategoryAxis)
    let categoryAxis = main_chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "time";
    categoryAxis.renderer.minGridDistance = 40;
    // categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.grid.template.disabled = true;
    // categoryAxis.renderer.fullWidthTooltip = true;

    // categoryAxis.tooltip.disabled = false;
    // categoryAxis.tooltip.background.fill = am4core.color("#000");
    // categoryAxis.tooltip.background.stroke = am4core.color("#fff");
    // categoryAxis.tooltip.background.strokeWidth = 1;

    // Cursor để hiện tooltip
    main_chart.cursor = new am4charts.XYCursor();
    main_chart.cursor.xAxis = categoryAxis;
    main_chart.cursor.behavior = "none"; // tắt zoom, chỉ để tooltip

    // var label = categoryAxis.renderer.labels.template;
    // label.truncate = true;
    // label.maxWidth = 200;
    // label.tooltipText = "{category}";

    let title = main_chart.titles.create();
    title.text = name;
    title.marginTop = 5;
    title.fontSize = 20;
    title.marginBottom = 7;
    title.wrap = true;



    let valueAxis = main_chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.renderer.inside = true;
    // valueAxis.renderer.labels.template.disabled = true;
    valueAxis.title.text = "m³";
    valueAxis.min = 0;
    // valueAxis.tooltip.disabled = true;

    var series_2;
    series_2 = main_chart.series.push(new am4charts.ColumnSeries());
    series_2.name = "Cùng kỳ"
    series_2.dataFields.valueY = "yesterday";
    // series_2.stacked = true;
    series_2.dataFields.categoryX = "time";
    // series_2.sequencedInterpolation = true;
    series_2.columns.template.width = am4core.percent(40);
    series_2.tooltipText = `Cùng kỳ: {yesterday} (m3)`;

    // series_2.tooltip.getFillFromObject = false;
    // series_2.tooltip.background.fill = am4core.color("#fcfcfc");
    // series_2.tooltip.autoTextColor = false;
    // series_2.tooltip.label.fill = am4core.color("black");
    // series_2.tensionX = 1;
    // series_2.showOnInit = true;
    // series_2.tooltip.pointerOrientation = "horizontal";
    series_2.fill = am4core.color("#faab65ff");
    series_2.stroke = am4core.color("#faab65ff");

    var series_1;
    series_1 = main_chart.series.push(new am4charts.ColumnSeries());
    series_1.name = "Hiện tại"
    series_1.dataFields.valueY = "today";
    // series_1.stacked = true;
    series_1.dataFields.categoryX = "time";
    // series_1.sequencedInterpolation = true;
    series_1.columns.template.width = am4core.percent(40);
    series_1.tooltipText = `Hiện tại: {today} (m3)`;

    // series_1.tooltip.getFillFromObject = false;
    // series_1.tooltip.background.fill = am4core.color("#fcfcfc");
    // series_1.tooltip.autoTextColor = false;
    // series_1.tooltip.label.fill = am4core.color("black");
    // series_1.tensionX = 1;
    // series_1.showOnInit = true;
    // series_1.tooltip.pointerOrientation = "horizontal";
    series_1.fill = am4core.color("#2cbae6");
    series_1.stroke = am4core.color("#2cbae6");

    // Legend
    main_chart.legend = new am4charts.Legend();
    main_chart.legend.position = "bottom";
    main_chart.legend.paddingTop = 10;
    main_chart.legend.labels.template.fontSize = 14;
    return main_chart
}

function render_table(id, data){
    $("#"+id+"_tbody_table").empty();
    let sum = 0;
    for(let i=0; i<data.length; i++){
        let str = '<tr><td class="text-right-data-table align-middle">' + return_time(id, data[i][id]) + '</td><td class="text-right-data-table align-middle">' + show_if_null(Number(data[i].consumption)) +'</td></tr>'
        $("#" + id + "_tbody_table").append(str);
        sum += Number(data[i].consumption);
    }
    $("#"+id+"_sum").html(show_if_null(sum))
}

function return_time(id, x){
    switch(id){
        case "hour_of_day" : return (Number(x)+1) + ":00";
        case "day_of_month": return x;
        case "month_of_year": return "Tháng "+x
    }
}

var CHART = {};
function render_chart(id, raw_data, name){
    let main_chart;
    if (CHART[id] != null) {
        CHART[id].dispose();
        delete CHART[id]
    }
    let data = [];
    for (let i = 0; i < raw_data.length; i++) {
        let x = { 
            time: return_time(id,raw_data[i][id]),
            val: Number(raw_data[i].consumption)
        }
        data.push(x);
    }

    main_chart = am4core.create(id + "_chart", am4charts.XYChart);
    // main_chart.scrollbarX = new am4core.Scrollbar();
    main_chart.data = data;
    main_chart.logo.disabled = true;



    // Create X axis (CategoryAxis)
    let categoryAxis = main_chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "time"; 
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.fullWidthTooltip = true;

    categoryAxis.tooltip.disabled = false;
    categoryAxis.tooltip.background.fill = am4core.color("#000");
    categoryAxis.tooltip.background.stroke = am4core.color("#fff");
    categoryAxis.tooltip.background.strokeWidth = 1;

    // Cursor để hiện tooltip
    main_chart.cursor = new am4charts.XYCursor();
    main_chart.cursor.xAxis = categoryAxis;
    main_chart.cursor.behavior = "none"; // tắt zoom, chỉ để tooltip

    // var label = categoryAxis.renderer.labels.template;
    // label.truncate = true;
    // label.maxWidth = 200;
    // label.tooltipText = "{category}";

    let title = main_chart.titles.create();
    title.text = name;
    title.marginTop = 5;
    title.fontSize = 20;
    title.marginBottom = 7;
    title.wrap = true;
    


    let valueAxis = main_chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.renderer.inside = true;
    // valueAxis.renderer.labels.template.disabled = true;
    valueAxis.title.text = "m³";
    valueAxis.min = 0;
    // valueAxis.tooltip.disabled = true;

    var series_2;
    series_2 = main_chart.series.push(new am4charts.ColumnSeries());
    series_2.name = "Sản lượng"
    series_2.dataFields.valueY = "val";
    series_2.stacked = true;
    series_2.dataFields.categoryX = "time";
    series_2.sequencedInterpolation = true;
    series_2.columns.template.width = am4core.percent(60);
    series_2.columns.template.tooltipText = `Sản lượng: {val} (m3)`;

    series_2.tooltip.getFillFromObject = false;
    series_2.tooltip.background.fill = am4core.color("#fcfcfc");
    series_2.tooltip.autoTextColor = false;
    series_2.tooltip.label.fill = am4core.color("black");
    series_2.tensionX = 1;
    series_2.showOnInit = true;
    series_2.tooltip.pointerOrientation = "horizontal";
    series_2.fill = am4core.color("#2cbae6");
    series_2.stroke = am4core.color("#2cbae6");
    return main_chart
}

$(document).ready(function () {
    $("#filter_meter").on("change", function (result) {
        get_field()
    })
})

function get_field() {
    $("#filter_field").val([]);
    $('#filter_field').trigger('change')
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    $.ajax({
        url: "/data_search/get/field",
        type: "GET",
        data: { MeterCode, NodeCode },
        beforeSend: function () {
            // showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let data_field_config = res.data_field_config;
            let x = []
            for (const key in data_field_config) {
                if (data_field_config[key] == 1) {
                    x.push(key);
                }
            }
            $("#filter_field").val(x);
            $('#filter_field').trigger('change');
            init_data()

        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            //    hideLoading()  // Ẩn overlay sau khi tải xong
        }
    })
  }

$(document).ready(function () {
    $("#filter_tram").on("change", function (result) {
        let tram_id = $(this).children("option:selected").val();
        let dv_type = $(this).children("option:selected").attr("dv_type");
        $("#filter_meter").empty();
        $("#table_data_container").hide();  // Ẩn
        $("#chartDiv").hide();  // Ẩn
        $.ajax({
            url: "/data_search/get/child_meter",
            type: "GET",
            data: { tram_id: tram_id, dv_type: dv_type },
            beforeSend: function () {
                // showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                let meter_list = res.meter_list;
                let x = "";
                for (let i = 0; i < meter_list.length; i++) {
                    x += "<option metercode ='" + meter_list[i].MeterCode + "' nodecode='" + meter_list[i].NodeCode + "' data-tokens ='" + meter_list[i].MeterCode + "'>" + meter_list[i].name + "</option>";
                }
                $("#filter_meter").append(x);
                $('#filter_meter').selectpicker('refresh');
                $('#filter_meter').selectpicker('val', $("#filter_meter option:eq(0)").text());
                $('#filter_meter').selectpicker('refresh');
                get_field();
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    alert(xhr.responseText);
                    window.location.href = "/login"
                } else {
                    console.error("Lỗi:", error);
                }
            },
            complete: function () {
                //    hideLoading()  // Ẩn overlay sau khi tải xong
            }
        })
    })
})


// $(document).ready(function(){
//     $(".export_data").on("click",function(){
//         let type = $(this).attr('type_consum');
//         let date = $("#terminal_index_time").data('daterangepicker').endDate.format("YYYY-MM-DD");
//         let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
//         let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
//         window.open("/terminal_index/export_meter_data?date=" + date + "&type=" + type + "&MeterCode=" + MeterCode + "&NodeCode=" + NodeCode, "_blank");
//     })
// })

$(document).ready(function () {
    $(function () {
        $("#add_daily_terminal_index_time").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: false,
                // timePickerIncrement: 1,
                timePicker24Hour: false,
                opens: 'right',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-primary',
                cancelClass: 'btn-small',
                format: 'DD/MM/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Submit',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY'
                }
            }
        )
        $("#add_daily_terminal_index_time").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#add_daily_terminal_index_time").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

function add_daily_terminal_index(){
    $("#add_daily_terminal_index_time").data("daterangepicker").setStartDate(moment().startOf('minute'));
    $("#add_daily_terminal_index_time").data("daterangepicker").setEndDate(moment().startOf('minute'));
    $("#ValStart").val("");
    $("#ValEnd").val("");
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    $("#add_daily_terminal_index_metercode").val(MeterCode)
    $("#add_daily_terminal_index").modal("show");
}

function save_insert_daily_terminal_index(){
    let date = $("#add_daily_terminal_index_time").data('daterangepicker').endDate.format("YYYY-MM-DD");
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    let terminal_index_val = $("#daily_terminal_index_val").val();
    let ValStart = $("#ValStart").val();
    let ValEnd = $("#ValEnd").val();

    $.ajax({
        url: "/terminal_index/post/insert_daily_terminal_index",
        type: "POST",
        data: { date, MeterCode, NodeCode, terminal_index_val, ValStart, ValEnd },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            show_notification(res.message, (res.success) ? "success" : "error");
            if(res.success){
                $("#add_daily_terminal_index").modal("hide");
                init_data()
            }
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            hideLoading()  // Ẩn overlay sau khi tải xong
        }
    })
}

