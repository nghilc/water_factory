
$(document).ready(function () {
    $.ajax({
        url: "/monitoring/get/muc_nuoc",
        type: "GET",
        // data: { MeterCode, NodeCode },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            // var wt_realtime_level = res.wt_realtime_level
            var data = res.data;

            // render_water_level_realtime_chart(wt_realtime_level)
            const mucnuocDevices = data.filter(device =>
                device.meter_type === "MUCNUOC"
            );

            render_water_level_realtime_chart(mucnuocDevices)
            render_table_meter_list(mucnuocDevices)
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

function render_table_meter_list(data) {
    $("#water-level-table-body").empty();
    let str = "";
    let onl = data.filter(x => x.status == 1).length;
    $("#status_meter_list").html(onl + "/" + data.length + " thiết bị")
    for (let i = 0; i < data.length; i++) {
        str += '<tr class="station-row" data-station-id="' + data[i].MeterCode + '" data-station-name="' + data[i].name + '" data-station-location="-" style="cursor: pointer;" unit="' + data[i].last_unit + '">'
            + '<td>'
            + '<div class="d-flex align-items-center">'
            + '<div class="device-icon">🌊</div>'
            + '<div>'
            + '<div class="device-name">' + data[i].name + '</div>'
            + '<div class="device-location">-</div>'
            + '</div>'
            + '</div>'
            + '</td>'
            + ' <td>'
        switch (data[i].status) {
            case 0: str += '<div class="status-badge status-danger text-center">Mất kết nối</div>'; break;
            case 1: str += '<div class="status-badge status-normal text-center">Bình thường</div>'; break;
            case 2: str += '<div class="status-badge status-warning text-center">Cảnh báo</div>'; break;
        }
        str += '</td>'
            + '<td class="text-center">' + new Date(data[i].last_data_time).toLocaleString('en-GB') + '</td>'
            + '<td class="text-center value-normal">'
            + data[i].last_measure_sensor + " " + data[i].last_unit
            + '</td>'
            + '<td class="text-center value-normal">'
            + data[i].last_measure_dynamic + " " + data[i].last_unit
            + '</td>'

    }
    $("#water-level-table-body").append(str);

}
var METERCODE = null;
var UNIT = "m"
$(document).ready(function () {
    $(document).on("click", ".station-row", function () {
        $("#lich_su_du_lieu").modal("show");
        $("#modal_title").html($(this).attr("data-station-name"));

        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
        let MeterCode = $(this).attr("data-station-id");

        METERCODE = MeterCode;
        let unit = $(this).attr("unit");
        if (unit) {
            UNIT = unit;
        } else {
            UNIT = "m"
        }
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



function get_and_render_chart_data() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    $.ajax({
        url: "/monitoring/get/muc_nuoc_data",
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
            measure_sensor: show_number_if_null(raw_data[i].measure_sensor),
            measure_dynamic: show_number_if_null(raw_data[i].measure_dynamic)
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
    // dateAxis.renderer.line.stroke = am4core.color("#ffffffff");
    // dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");
    // dateAxis.title.fill = am4core.color("#ffffffff");


    CHART.cursor = new am4charts.XYCursor();
    CHART.cursor.fullWidthLineX = true;
    CHART.cursor.xAxis = dateAxis;
    CHART.cursor.lineX.strokeWidth = 0;
    CHART.cursor.lineX.fill = am4core.color("#000");
    CHART.cursor.lineX.fillOpacity = 0.1;
    CHART.legend = new am4charts.Legend();
    // CHART.legend.labels.template.fill = am4core.color("#ffffffff");


    var wt = CHART.yAxes.push(new am4charts.ValueAxis());
    wt.tooltip.disabled = false;
    wt.renderer.ticks.template.disabled = true;
    wt.renderer.axisFills.template.disabled = true;
    // wt.renderer.line.stroke = am4core.color("#ffffffff");
    wt.renderer.line.strokeOpacity = 0.5;
    wt.renderer.line.strokeWidth = 1;
    wt.title.text = UNIT;
    wt.renderer.opposite = false;
    wt.extraMin = 0.1;
    wt.extraMax = 0.1;
    // wt.renderer.labels.template.fill = am4core.color("#ffffff");
    // wt.title.fill = am4core.color("#ffffffff");

    var series;
    series = CHART.series.push(new am4charts.LineSeries());
    series.yAxis = wt;

    series.dataFields.valueY = "measure_sensor";
    series.dataFields.dateX = "time";
    series.title = "Mực nước hiện tại";
    series.strokeWidth = 3;
    series.tensionX = 1;
    series.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series.tooltipText = "Mực nước hiện tại" + ": {valueY} " + "(m)";
    series.name = "Mực nước hiện tại"
    series.tooltip.pointerOrientation = "horizontal";
    series.fill = am4core.color("#1584b0");
    series.stroke = am4core.color("#1584b0");
    series.fillOpacity = 0;

    var series_2;
    series_2 = CHART.series.push(new am4charts.LineSeries());
    series_2.yAxis = wt;

    series_2.dataFields.valueY = "measure_dynamic";
    series_2.dataFields.dateX = "time";
    series_2.title = "Mực nước động";
    series_2.strokeWidth = 3;
    series_2.tensionX = 1;
    series_2.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_2.tooltipText = "Mực nước động" + ": {valueY} " + "(m)";
    series_2.name = "Mực nước động"
    series_2.tooltip.pointerOrientation = "horizontal";
    series_2.fill = am4core.color("#15b046ff");
    series_2.stroke = am4core.color("#15b046ff");
    series_2.fillOpacity = 0;
}



function get_and_render_table_data() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59"; $.ajax({
        url: "/monitoring/get/muc_nuoc_data",
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
              <th>Mực nước hiện tại</th>
              <th>Mực nước động</th>
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
                    { data: "measure_sensor", className: "text-right-data-table align-middle" },
                    { data: "measure_dynamic", className: "text-right-data-table align-middle" },
                ],
                data: modifi_data(raw_data),
            });
        } else {
            console.error("Bảng #history_table không tồn tại");
        }
    })
}

function modifi_data(data) {
    let x = [];
    for (let i = data.length - 1; i >= 0; i--) {
        let y = {
            time: new Date(data[i].time).toLocaleString('en-GB'),
            measure_sensor: show_dash_if_null(data[i].measure_sensor),
            measure_dynamic: show_dash_if_null(data[i].measure_dynamic),
        }


        x.push(y)
    }
    return x;
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

function render_water_level_realtime_chart(originalData) {

    var chartData = originalData.map(r => ({
        station: r.name,
        unit: r.last_unit,
        valueM: r.data_type === 1 ? r.last_measure_sensor : null,
        valueDynamicM: r.data_type === 1 ? r.last_measure_dynamic : null,
        valueCM: r.data_type === 2 ? r.last_measure_sensor : null,
        valueDynamicCM: r.data_type === 2 ? r.last_measure_dynamic : null
    }));

    function computeUnifiedMaxM(data) {
        let maxM = 0;
        data.forEach(d => {
            if (d.unit === "m") maxM = Math.max(maxM, (d.valueM || 0) + (d.valueDynamicM || 0));
            if (d.unit === "cm") maxM = Math.max(maxM, ((d.valueCM || 0) + (d.valueDynamicCM || 0)) / 100);
        });
        return maxM || 1;
    }

    am4core.useTheme(am4themes_animated);
    var chart = am4core.create("water-trend-chart", am4charts.XYChart);
    chart.data = chartData;

    // =============== AXES ===============
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "station";
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.maxWidth = 150;
    categoryAxis.renderer.labels.template.wrap = true;
    categoryAxis.renderer.labels.template.truncate = false;
    categoryAxis.renderer.labels.template.fill = am4core.color("#000000ff");
    categoryAxis.renderer.labels.template.fontSize = 10;

    var axisM = chart.yAxes.push(new am4charts.ValueAxis());
    axisM.title.text = "Mực nước (m)";
    axisM.title.fontSize = 10;
    axisM.title.fill = am4core.color("#000000ff");
    axisM.min = 0;
    axisM.renderer.labels.template.fill = am4core.color("#000000ff");
    axisM.renderer.labels.template.fontSize = 10;


    var axisCM = chart.yAxes.push(new am4charts.ValueAxis());
    axisCM.title.text = "Mực nước (cm)";
    axisCM.title.fontSize = 10;
    axisCM.title.fill = am4core.color("#000000ff");
    axisCM.renderer.opposite = true;
    axisCM.renderer.labels.template.fill = am4core.color("#000000ff");
    axisCM.renderer.labels.template.fontSize = 10;
    // Đồng bộ min/max 2 trục theo hệ số 100 để tick khớp
    // var maxM = computeUnifiedMaxM(chartData) * 1.1;
    // axisM.strictMinMax = true; axisM.min = 0; axisM.max = maxM;
    // axisCM.strictMinMax = true; axisCM.min = 0; axisCM.max = maxM * 100;

    // =============== SERIES ===============
    // Style chung
    function baseColumnStyle(series) {
        series.clustered = false;       // 1 cột duy nhất/1 trạm
        series.stacked = true;        // chồng value & value_dynamic
        series.dataFields.categoryX = "station";
        series.columns.template.width = am4core.percent(60);
    }

    // --- M (trục trái) ---
    var sM_static = chart.series.push(new am4charts.ColumnSeries());
    sM_static.name = "Mực nước hiện tại";
    sM_static.dataFields.valueY = "valueM";
    sM_static.yAxis = axisM;
    baseColumnStyle(sM_static);
    sM_static.columns.template.fill = chart.colors.getIndex(0); // xanh
    sM_static.columns.template.stroke = chart.colors.getIndex(0);

    var labelBullet = sM_static.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY} (m)";
    labelBullet.label.dy = 15;
    labelBullet.label.fontSize = 11;
    labelBullet.label.fill = am4core.color("#333");
    labelBullet.label.bold = true;
    // sM_static.columns.template.tooltipText =
    //     "{categoryX}\n{valueM} m (hiện tại)";

    var sM_dynamic = chart.series.push(new am4charts.ColumnSeries());
    sM_dynamic.name = "Mực nước động";
    sM_dynamic.dataFields.valueY = "valueDynamicM";
    sM_dynamic.yAxis = axisM;
    baseColumnStyle(sM_dynamic);
    // sM_dynamic.columns.template.fill = am4core.color("#b4eaffff");   // trắng
    // sM_dynamic.columns.template.stroke = am4core.color("#b4eaffff");   // viền nhẹ
    // sM_dynamic.columns.template.tooltipText =
    //     "{categoryX}\n{valueDynamicM} m (động)\nTổng: {valueYTotal} m";

    // --- CM (trục phải) ---
    var sCM_static = chart.series.push(new am4charts.ColumnSeries());
    sCM_static.name = "Mực nước hiện tại";
    sCM_static.dataFields.valueY = "valueCM";
    sCM_static.yAxis = axisCM;
    baseColumnStyle(sCM_static);
    // Ẩn khỏi legend để chỉ hiển thị 1 mục "Mực nước hiện tại"
    sCM_static.hiddenInLegend = true;
    sCM_static.columns.template.fill = chart.colors.getIndex(0);
    sCM_static.columns.template.stroke = chart.colors.getIndex(0);

    var labelBullet = sCM_static.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY} (cm)";
    labelBullet.label.dy = 15;
    labelBullet.label.fontSize = 11;
    labelBullet.label.fill = am4core.color("#333");
    labelBullet.label.bold = true;
    // sCM_static.columns.template.tooltipText =
    //     "{categoryX}\n{valueCM} cm (hiện tại)";

    var sCM_dynamic = chart.series.push(new am4charts.ColumnSeries());
    sCM_dynamic.name = "Mực nước động";
    sCM_dynamic.dataFields.valueY = "valueDynamicCM";
    sCM_dynamic.yAxis = axisCM;
    baseColumnStyle(sCM_dynamic);
    sCM_dynamic.hiddenInLegend = true;
    sCM_dynamic.columns.template.fill = am4core.color("#000000ff");
    sCM_dynamic.columns.template.stroke = am4core.color("#000000ff");
    //sCM_dynamic.columns.template.tooltipText =
    //     "{categoryX}\n{valueDynamicCM} cm (động)\nTổng: {valueYTotal} cm";

    // Nhãn tổng trên đỉnh cột (đơn vị đúng theo trạm)
    var label = sM_dynamic.bullets.push(new am4charts.LabelBullet());
    label.label.fontSize = 11;
    label.label.dy = -10;
    label.label.text = "{valueY} (m)";
    label.label.fill = am4core.color("#000000ff");

    var label2 = sCM_dynamic.bullets.push(new am4charts.LabelBullet());
    label2.label.fontSize = 11;
    label2.label.dy = -10;
    label2.label.text = "{valueY} (cm)";
    label2.label.fill = am4core.color("#000000ff");

    chart.maskBullets = false;

    function addWaterHover(series) {
        const tpl = series.columns.template;

        // Bo góc + hiệu ứng phóng/đổ bóng khi hover
        tpl.strokeOpacity = 0;
        tpl.column.cornerRadiusTopLeft = 10;
        tpl.column.cornerRadiusTopRight = 10;

        const hs = tpl.states.create("hover");
        hs.properties.scaleY = 1.04;
        hs.properties.scaleX = 1.02;
        const hoverShadow = hs.filters.push(new am4core.DropShadowFilter());
        hoverShadow.blur = 12;
        hoverShadow.opacity = 0.45;
        hoverShadow.dx = 0; hoverShadow.dy = 2;

        // 👉 Vệt "sóng nước" (overlay) – TẠO TRÊN TEMPLATE BẰNG CLASS, KHÔNG PHẢI INSTANCE
        const waveTpl = tpl.createChild(am4core.Rectangle);
        waveTpl.isMeasured = false;
        waveTpl.width = am4core.percent(140);
        waveTpl.height = am4core.percent(100);
        waveTpl.opacity = 0;
        waveTpl.zIndex = 5;

        const grad = new am4core.LinearGradient();
        grad.rotation = 20;
        grad.addColor(am4core.color("#000000ff"), 0);
        grad.addColor(am4core.color("#000000ff"), 0.5);
        grad.addColor(am4core.color("#000000ff"), 1);
        grad.stops.getIndex(0).opacity = 0.00;
        grad.stops.getIndex(1).opacity = 0.35;
        grad.stops.getIndex(2).opacity = 0.00;
        waveTpl.fill = grad;

        // Chạy vệt sóng trên CHÍNH CỘT ĐƯỢC HOVER (ev.target)
        tpl.events.on("over", function (ev) {
            const col = ev.target;                         // cột thực
            const wave = col.children.getIndex(col.children.length - 1); // clone của waveTpl
            wave.opacity = 1;
            wave.y = 0;
            wave.x = -col.pixelWidth;
            wave.animate(
                { property: "x", from: -col.pixelWidth, to: col.pixelWidth },
                900,
                am4core.ease.cubicOut
            ).events.on("animationended", function () {
                wave.opacity = 0;
            });
        });

        tpl.events.on("out", function (ev) {
            const col = ev.target;
            const wave = col.children.getIndex(col.children.length - 1);
            if (wave) wave.opacity = 0;
        });
    }
}







$(document).ready(function () {
    $(document).on("click", "#btn-save-threshold", function () {
        saveThresholdSettings()
    })
})

// Hàm lưu cài đặt ngưỡng
function saveThresholdSettings() {
    let result = {};
    // lower
    $('.lower_threshold').each(function () {
        let metercode = $(this).attr('metercode');
        if (!result[metercode]) result[metercode] = {};
        result[metercode].lower_threshold = $(this).val();
    });

    // upper
    $('.upper_threshold').each(function () {
        let metercode = $(this).attr('metercode');
        if (!result[metercode]) result[metercode] = {};
        result[metercode].upper_threshold = $(this).val();
    });

    // convert object → array
    let data = Object.keys(result).map(key => ({
        metercode: key,
        lower_threshold: result[key].lower_threshold,
        upper_threshold: result[key].upper_threshold
    }));
    $.ajax({
        url: "/monitoring/post/save_threshold",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            if (res.success) {
                alert('Đã lưu cài đặt tiêu chuẩn chất lượng nước!');
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


$(document).ready(function () {
    $("#export_data").on("click", function () {
        let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
        let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
        window.open("/monitoring/export_muc_nuoc_meter_data?start_date=" + start_date + "&end_date=" + end_date + "&MeterCode=" + METERCODE, "_blank");

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
  
function showThresholdSettings(){
    get_threshold_setting();
}

function get_threshold_setting() {
    $("#cai_dat_nguong_modal").modal("show")

    $.ajax({
        url: "/monitoring/get/muc_nuoc_threshold_setting",
        type: "GET",
        // data: { MeterCode, NodeCode },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            append_threshold_setting(res.data)
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



function append_threshold_setting(data) {
    $("#threshold-grid").empty();
    str = '';
    for (let i = 0; i < data.length; i++) {
        str += '<div class="threshold-card">'
            + '<h4>🌊 ' + data[i].name + '</h4>'
            + '<div class="threshold-setting">'
            + '<div class="threshold-info">'
            + '<div class="threshold-name">Cảnh báo mực nước</div>'
            + '<div class="threshold-unit">Mét (m)</div>'
            + '</div>'
            + '<div class="threshold-inputs">'
            + '<div class="threshold-input">'
            + '<label>Ngưỡng dưới</label>'
            + '<input type="number" class="lower_threshold" metercode="' + data[i].MeterCode_ + '" value="' + (data[i].lower_threshold == null ? '' : data[i].lower_threshold) + '" step="0.1">'
            + '</div>'
            + '<div class="threshold-input">'
            + '<label>Ngưỡng trên</label>'
            + '<input type="number" class="upper_threshold" metercode="' + data[i].MeterCode_ + '" value="' + (data[i].upper_threshold == null ? '' : data[i].upper_threshold) + '" step="0.1">'
            + ' </div>'
            + '</div>'
            + '</div>'
            + '</div>'
    }
    $("#threshold-grid").append(str);

}

function resetThresholdSettings(){
    get_threshold_setting();
}

function init_data() {
    let active_tab = $("#nuocThoTabs .nav-link.active").attr("id");
    if (active_tab = "tab-chart") {
            get_and_render_chart_data()

    } else {
  
            get_and_render_table_data()
        
    }
  }