
var chart;
$(document).ready(function () {
    am4core.useTheme(am4themes_animated);
    chart = am4core.create("pump-performance-chart", am4charts.PieChart);
    chart.data = [
        {
            category: "Thời gian thiết bị bật",
            value: 490,
            color: am4core.color("#3b82f6") // xanh
        },
        {
            category: "Thời gian thiết bị tắt",
            value: 525,
            color: am4core.color("#ef4444") // đỏ
        },
        {
            category: "Thời gian chưa diễn ra",
            value: 425,
            color: am4core.color("#4ad471ff") // xám nhạt
        }
    ];
    // Thiết lập series
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "category";
    series.slices.template.propertyFields.fill = "color";
    series.slices.template.stroke = am4core.color("#1e3a8a");
    series.slices.template.strokeWidth = 1;
    series.slices.template.strokeOpacity = 0.2;

    // Biểu đồ dạng vòng
    chart.innerRadius = am4core.percent(55);

    // // Bỏ viền bóng
    // series.slices.template.shadow.opacity = 0;

    // Ghi chú legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    chart.legend.labels.template.fill = am4core.color("#000000ff");

    // Label giữa vòng
    var label = chart.seriesContainer.createChild(am4core.Label);
    label.text = "Thời gian bật\n[bold]8giờ 10 phút[/]\nThời gian tắt\n[bold]8giờ 45 phút[/]";
    label.horizontalCenter = "middle";
    label.verticalCenter = "middle";
    label.textAlign = "middle";
    label.fill = am4core.color("#000000ff");


})


$(document).ready(function () {
    $.ajax({
        url: "/monitoring/get/to_bom",
        type: "GET",
        // data: { MeterCode, NodeCode },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            // var wt_realtime_level = res.wt_realtime_level
            var data = res.data;

            // render_water_level_realtime_chart(wt_realtime_level)
            const tobomDevice = data.filter(device =>
                device.meter_type === "DONGHO"
            );

            render_meter_list(tobomDevice)
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
})

function render_meter_list(data) {
    $("#pumps-container").empty();
    str = "";
    for (let i = 0; i < data.length; i++) {
        str += '<div class="card pump-item running">'
            + '<div class="d-flex justify-content-between align-items-center mb-20">'
            + '<div class="d-flex align-items-center">'
            + '<div class="pump-icon">⚡</div>'
            + '<div>'
            + '<h4>' + data[i].name + '</h4>'
            + '<div class="device-location">' + data[i].MeterCode + '</div>'
            + '</div>'
            + '</div>'
        switch (data[i].status) {
            case 1:
                str += '<div class="status-badge status-running">'
                    + ' ĐANG CHẠY'
                    + '</div>'
                break;
            case 0:
                str += '<div class="status-badge status-danger">'
                    + ' Mất kết nối'
                    + '</div>'
                break;
            case 2:
                str += '<div class="status-badge status-warning">'
                    + ' Cảnh báo'
                    + '</div>'
                break;
        }

        str += '</div>'
            + '<div class="stats-grid">'
            + '<div class="stat-item">'
            + '<div class="stat-label">Lưu lượng</div>'
            + '<div class="stat-value">' + data[i].last_flow_rate + ' m³/h</div>'
            + '</div>'
            + '<div class="stat-item">'
            + '<div class="stat-label">Áp lực</div>'
            + '<div class="stat-value">' + ((data[i].last_pressure == null || data[i].last_pressure == 2550) ? "-" : data[i].last_pressure) + ' bar</div>'
            + '</div>'
            + '<div class="stat-item">'
            + '<div class="stat-label">Nhiệt độ máy bơm</div>'
            + '<div class="stat-value value-normal">'
            + ' -°C'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="d-flex justify-content-end gap-10 mt-20">'
            + '<button class="btn btn-success detain_btn" data-pump-id="' + data[i].MeterCode + '" data-action="detail" data-pump-name="'+data[i].name+'">'
            + 'Chi tiết'
            + '</button>'
            + '<button class="btn btn-danger" data-pump-id="P-001" disabled>'
            + 'DỪNG'
            + '</button>'
            + '<button class="btn btn-primary" data-pump-id="P-001" disabled>'
            + 'AUTO'
            + '</button>'
            + '<button class="btn btn-info" disabled>CÀI ĐẶT</button>'
            + '</div>'
            + '</div>'
    }
    $("#pumps-container").append(str);
}


$(document).ready(function () {
    $(function () {
        $("#meter_data_time_from").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                // timePicker: true,
                // timePickerIncrement: 1,
                // timePicker24Hour: true,
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
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));

        $("#meter_data_time_to").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                // timePicker: true,
                // timePickerIncrement: 1,
                // timePicker24Hour: true,
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
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})
var METERCODE = null;

$(document).ready(function () {
    $(document).on("click", ".detain_btn", function () {
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
        let MeterCode = $(this).attr("data-pump-id")
        METERCODE = MeterCode;
        $("#lich_su_du_lieu").modal("show")
        $("#modal_title").html($(this).attr("data-pump-name"));

        get_and_render_chart_data();

    })
})

$(document).ready(function () {
    $('#lich_su_du_lieu').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex', 0);
        $(this).find('input').not("#static_group").val("");
        $('#tab-chart').tab('show');

    })
})

$(document).ready(function () {
    $("#tab-chart").on("click", function () {
        get_and_render_chart_data()
    })
    $("#tab-history").on("click", function () {
        get_and_render_table_data()
    })
})
function init_data() {
    let active_tab = $("#nuocThoTabs .nav-link.active").attr("id");
    if (active_tab = "tab-chart") {
        get_and_render_chart_data()

    } else {

        get_and_render_table_data()

    }
}

function get_and_render_chart_data() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    $.ajax({
        url: "/monitoring/get/to_bom_data",
        type: "GET",
        data: { start_date, end_date, METERCODE },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            render_chart(res.data)
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

var CHART = null;
function render_chart(raw_data, unit) {
    let data = [];
    for (let i = 0; i < raw_data.length; i++) {
        let x = {
            time: new Date(raw_data[i].time),
            pressure: (raw_data[i].pressure == null || raw_data[i].pressure == 2550) ? null : Number(raw_data[i].pressure),
            flowRate: (raw_data[i].flowRate == null) ? null : Number(raw_data[i].flowRate),
        }
        data.push(x);
    }

    am4core.useTheme(am4themes_animated);
    if (CHART != null) {
        CHART.dispose();
    }
    CHART = am4core.create("history_chart_div", am4charts.XYChart);
    CHART.data = data;
    CHART.logo.disabled = true;
    CHART.paddingRight = 15;
    CHART.paddingLeft = 0;
    CHART.maskBullets = false;
    let dateAxis = CHART.xAxes.push(new am4charts.DateAxis());
    // dateAxis.startLocation = 0.5;
    // dateAxis.endLocation = 0.5;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 60;
    dateAxis.renderer.labels.template.fontSize = 11;
    // dateAxis.renderer.grid.template.disabled = true;
    // dateAxis.renderer.fullWidthTooltip = true;
    dateAxis.renderer.labels.template.fill = am4core.color("#6b7280");
    dateAxis.renderer.grid.template.strokeOpacity = 0.05;
    dateAxis.dateFormats.setKey("hour", "HH:mm");
    dateAxis.dateFormats.setKey("day", "dd/MM");
    dateAxis.periodChangeDateFormats.setKey("hour", "dd/MM");
    dateAxis.dateFormats.setKey("month", "MM/yyyy");
    dateAxis.periodChangeDateFormats.setKey("day", "MM/yyyy");
    dateAxis.tooltipDateFormat = "dd/MM/yyyy HH:mm";
    // dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");

    CHART.cursor = new am4charts.XYCursor();
    CHART.cursor.fullWidthLineX = true;
    CHART.cursor.xAxis = dateAxis;
    CHART.cursor.lineX.strokeWidth = 0;
    CHART.cursor.lineX.fill = am4core.color("#000");
    CHART.cursor.lineX.fillOpacity = 0.1;
    CHART.legend = new am4charts.Legend();


    var m3h = CHART.yAxes.push(new am4charts.ValueAxis());
    m3h.tooltip.disabled = false;
    m3h.renderer.ticks.template.disabled = true;
    m3h.renderer.axisFills.template.disabled = true;
    m3h.renderer.line.strokeOpacity = 0.5;
    m3h.renderer.line.strokeWidth = 1;
    m3h.title.text = "m³/h";
    m3h.renderer.opposite = false;
    m3h.extraMin = 0.1;
    m3h.extraMax = 0.1;
    // m3h.renderer.labels.template.fill = am4core.color("#ffffff");

    var bar = CHART.yAxes.push(new am4charts.ValueAxis());
    bar.tooltip.disabled = false;
    bar.renderer.ticks.template.disabled = true;
    bar.renderer.axisFills.template.disabled = true;
    bar.renderer.line.strokeOpacity = 0.5;
    bar.renderer.line.strokeWidth = 1;
    bar.title.text = "bar";
    bar.renderer.opposite = true;
    bar.extraMin = 0.1;
    bar.extraMax = 0.1;
    // bar.renderer.labels.template.fill = am4core.color("#ffffff");

    var series;
    series = CHART.series.push(new am4charts.LineSeries());
    series.yAxis = m3h;

    series.dataFields.valueY = "flowRate";
    series.dataFields.dateX = "time";
    series.title = "Lưu lượng";
    series.strokeWidth = 3;
    series.tensionX = 1;
    series.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series.tooltipText = "Lưu lượng" + ": {valueY} " + "(m³/h)";
    series.name = "Lưu lượng"
    series.tooltip.pointerOrientation = "horizontal";
    // series.fill = am4core.color("#1584b0");
    series.stroke = am4core.color("#1584b0");
    series.fillOpacity = 0;

    var series_2;
    series_2 = CHART.series.push(new am4charts.LineSeries());
    series_2.yAxis = bar;

    series_2.dataFields.valueY = "pressure";
    series_2.dataFields.dateX = "time";
    series_2.title = "Áp suất";
    series_2.strokeWidth = 3;
    series_2.tensionX = 1;
    series_2.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_2.tooltipText = "Áp suất" + ": {valueY} " + "(bar)";
    series_2.name = "Áp suất"
    series_2.tooltip.pointerOrientation = "horizontal";
    // series.fill = am4core.color("#1584b0");
    series_2.stroke = am4core.color("#15b046ff");
    series_2.fillOpacity = 0;
}


function get_and_render_table_data() {

    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59"; $.ajax({
        url: "/monitoring/get/to_bom_data",
        type: "GET",
        data: { start_date, end_date, METERCODE },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            render_table(res.data)
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


function render_table(raw_data) {
    $(document).ready(function () {
        $("#history_table_thead").empty();
        $("#history_table_thead").append(
            `
            <tr>
              <th>Thời gian</th>
              <th>Lưu lượng</th>
              <th>Áp lực</th>
              </tr>
            `
        );
        if ($.fn.DataTable.isDataTable('#history_table')) {
            $('#history_table').DataTable().clear().destroy();
        }
        $('#history_table_tbody').empty();
        if ($("#history_table").length) {
            $('#history_table').DataTable({
                language: translate_data_table(LANG),
                "lengthMenu": [10, 30, 60],
                "pageLength": 10,
                // "columnDefs": [
                //     { className: "dt-head-center", targets: [0, 1, 2] },
                //     { "orderable": false, "targets": [] },
                //     { "orderable": true, "targets": [0, 1, 2] }
                // ],
                order: [],

                autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                paging: true,
                searching: false,
                columns: [
                    { data: "time", className: "text-center-data-table align-middle" },
                    { data: "flowRate", className: "text-right-data-table align-middle" },
                    { data: "pressure", className: "text-right-data-table align-middle" },
                ],
                data: modifi_data(raw_data),
            });
        } else {
            console.error("Bảng #data_table không tồn tại");
        }
    })
}


function modifi_data(data) {
    let x = [];
    for (let i = data.length - 1; i >= 0; i--) {
        let y = {
            time: new Date(data[i].time).toLocaleString('en-GB'),
            pressure: (data[i].pressure == null || data[i].pressure == 2550) ? "-" : Number(data[i].pressure),
            flowRate: (data[i].flowRate == null) ? null : Number(data[i].flowRate),
        }


        x.push(y)
    }
    return x;
} 

function export_data(){

}