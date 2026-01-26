var LANG = "vi";


$(document).ready(function () {
    $(function () {
        $("#dma_time_from").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: true,
                timePickerIncrement: 1,
                timePicker24Hour: true,
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
                    format: 'DD/MM/YYYY H:mm'
                }
            }
        )
        $("#dma_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#dma_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#dma_time_to").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: true,
                timePickerIncrement: 1,
                timePicker24Hour: true,
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
                    format: 'DD/MM/YYYY H:mm'
                }
            }
        )
        $("#dma_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#dma_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
        init_dma_data();
    })
})

var DATA = [];
function init_dma_data(){
    let start_date = $("#dma_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#dma_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let dma_id = $("#filter_dma option:selected").attr("org_id");
    let moment = $("#dma_data_type").val();
    $.ajax({
        url: "/DMA/get/DMA_loss_data",
        type: "GET",
        data: { start_date, end_date, dma_id, moment },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            DATA = res.data;
            let location = res.location;
            render_dma_loss_datatable(DATA);
            render_dma_loss_chart(DATA);
            init_map(location)
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


function render_dma_loss_datatable(data){
    if ($.fn.DataTable.isDataTable('#table_dma_loss_data')) {
        $('#table_dma_loss_data').DataTable().clear().destroy();
    }
    $("#body_table_dma_loss_data").empty();
    if ($("#table_dma_loss_data").length) {
        $('#table_dma_loss_data').DataTable({
            dom: '<"top"lp>rt<"bottom"ip><"clear">',
            language: translate_data_table(LANG),
            "lengthMenu": [30, 60, 100],
            "pageLength": 30,
            // "columnDefs": [
            //     { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4, 5, 6, 7 ,8 ,9] },
            //     { "orderable": false, "targets": [] },
            //     { "orderable": true, "targets": [ 0, 1, 2, 3, 4, 5 ,6 ,7 ,8 ,9 ] }
            //   ],
            autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
            paging: true,
            searching: true,
            columns: [
                { data: "index", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "time", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "sum_tong", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "sum_nhanh", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "loss", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "percent", className: "text-center-data-table align-middle border_config_eq_td_d" }
            ],
            data: modifi_loss_data(data),
            createdRow: function(row, rowData, dataIndex){
                if (typeof rowData.threshold !== "undefined" && rowData.sum_nhanh != null && rowData.sum_tong != null){
                    if(Number(rowData.sum_tong) > (Number(rowData.sum_nhanh) + Number(rowData.threshold))){
                        console.log("chạy")
                        $(row).css("color","red")
                    }
                }
            }
        });
    } else {
        console.error("Bảng #table_dma_loss_data không tồn tại");
    }
}


function modifi_loss_data(data){
    let x = [];
    let count = 0;
    for (let i = data.length - 1; i >= 0; i--) {
        count += 1;
        let y = {
            index: count,
            // time: new Date(data[i].time_).toLocaleString('en-GB'),
            time: return_momnet_data($("#dma_data_type").val(),data[i].time_),
            sum_tong: show_if_null_0(data[i].sum_tong_) + return_unit_html("m³"),
            sum_nhanh: show_if_null_0(data[i].sum_nhanh_) + return_unit_html("m³"),
            loss: show_if_null_0(data[i].chenh_lech_) + return_unit_html("m³"),
            percent: ((Number(data[i].chenh_lech_) / Number(data[i].sum_tong_)) * 100).toFixed(2) + return_unit_html("%"),
            threshold: data[i].threshold
        }
        x.push(y)
    }
    return x;
}

function return_per(chenh_lech, sum_tong){
    if (chenh_lech === null || Number(chenh_lech < 0) || sum_tong === null )
        return null;
    return Number(((Number(chenh_lech) / Number(sum_tong)) * 100).toFixed(2))
}

var DMA_LOSS_CHART = null;

function render_dma_loss_chart(data){
    let data_chart = [];
    for (let i = 0; i < data.length; i++) {
        data_chart.push({
            meter_time: new Date(data[i].time_),
            loss: (data[i].chenh_lech_ === null || Number(data[i].chenh_lech_) < 0) ? null : Number(data[i].chenh_lech_),
            total: (data[i].sum_tong_ === null) ? null : Number(data[i].sum_tong_),
            per: return_per(data[i].chenh_lech_, data[i].sum_tong_)
        })
      }
    let thickness = 3;
    am4core.useTheme(am4themes_animated);
    if (DMA_LOSS_CHART) {
        DMA_LOSS_CHART.dispose();
      }
    DMA_LOSS_CHART = am4core.create("dma_loss_data_chart", am4charts.XYChart);
    DMA_LOSS_CHART.scrollbarX = new am4core.Scrollbar();
    DMA_LOSS_CHART.data = data_chart;
    DMA_LOSS_CHART.logo.disabled = true;

    let dateAxis = DMA_LOSS_CHART.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 60;
    dateAxis.startLocation = 0.5;
    dateAxis.endLocation = 0.5;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.grid.template.disabled = true;
    dateAxis.renderer.fullWidthTooltip = true;

    dateAxis.dateFormats.setKey("hour", "HH:mm");
    dateAxis.dateFormats.setKey("day", "dd/MM");
    dateAxis.periodChangeDateFormats.setKey("hour", "dd/MM");
    dateAxis.dateFormats.setKey("month", "MM/yyyy");
    dateAxis.periodChangeDateFormats.setKey("day", "MM/yyyy");

    dateAxis.tooltipDateFormat = "dd/MM/yyyy HH:mm";


    DMA_LOSS_CHART.cursor = new am4charts.XYCursor();
    DMA_LOSS_CHART.cursor.fullWidthLineX = true;
    DMA_LOSS_CHART.cursor.xAxis = dateAxis;
    DMA_LOSS_CHART.cursor.lineX.strokeWidth = 0;
    DMA_LOSS_CHART.cursor.lineX.fill = am4core.color("#000");
    DMA_LOSS_CHART.cursor.lineX.fillOpacity = 0.1;
    // DMA_LOSS_CHART.legend = new am4charts.Legend();

    var m3 = DMA_LOSS_CHART.yAxes.push(new am4charts.ValueAxis());
    m3.tooltip.disabled = false;
    m3.renderer.ticks.template.disabled = true;
    m3.renderer.axisFills.template.disabled = true;
    m3.renderer.line.strokeOpacity = 0.5;
    m3.renderer.line.strokeWidth = 1;
    m3.title.text = "m³"
    m3.renderer.opposite = false;
    m3.extraMin = 0.1;
    m3.extraMax = 0.1; 

    var per = DMA_LOSS_CHART.yAxes.push(new am4charts.ValueAxis());
    per.tooltip.disabled = false;
    per.renderer.ticks.template.disabled = true;
    per.renderer.axisFills.template.disabled = true;
    per.renderer.line.strokeOpacity = 0.5;
    per.renderer.line.strokeWidth = 1;
    per.title.text = "%"
    per.renderer.opposite = true;
    per.extraMin = 0.1;
    per.extraMax = 0.1; 

    var series;
    series = DMA_LOSS_CHART.series.push(new am4charts.LineSeries());
    series.yAxis = m3;

    series.dataFields.valueY = "total";
    series.dataFields.dateX = "meter_time";
    series.title = translate_text("Sản lượng");
    series.strokeWidth = thickness;
    series.tensionX = 1;
    series.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series.tooltipText = translate_text("Sản lượng") + ": {valueY} " + "(m³)";
    series.name = translate_text("Sản lượng")
    series.tooltip.pointerOrientation = "horizontal";
    series.fill = am4core.color("#1584b0");
    series.stroke = am4core.color("#1584b0");
    series.fillOpacity = 0.8;

    var series_2;
    series_2 = DMA_LOSS_CHART.series.push(new am4charts.LineSeries());
    series_2.yAxis = m3;
    series_2.dataFields.valueY = "loss";
    series_2.dataFields.dateX = "meter_time";
    series_2.title = translate_text("Thất thoát");
    series_2.strokeWidth = thickness;
    series_2.tensionX = 1;
    series_2.showOnInit = true;
    // series_2.legendSettings.labelText = translate_text("Thất thoát") + " (m3)";
    series_2.tooltipText = translate_text("Thất thoát") + ": {valueY} " + "(m³)";
    series_2.name = translate_text("Thất thoát");
    series_2.tooltip.pointerOrientation = "horizontal";
    series_2.fill = am4core.color("#fc7c38");
    series_2.stroke = am4core.color("#702903");
    series_2.fillOpacity = 0.8;

    var series_3;
    series_3 = DMA_LOSS_CHART.series.push(new am4charts.LineSeries());
    series_3.yAxis = per;
    series_3.dataFields.valueY = "per";
    series_3.dataFields.dateX = "meter_time";
    series_3.title = translate_text("Thất thoát");
    series_3.strokeWidth = 2;
    series_3.tensionX = 1;
    series_3.showOnInit = true;
    // series_2.legendSettings.labelText = translate_text("Thất thoát") + " (m3)";
    series_3.tooltipText = translate_text("Thất thoát") + ": {valueY} " + "(%)";
    series_3.name = translate_text("Thất thoát");
    series_3.tooltip.pointerOrientation = "horizontal";
    series_3.fill = am4core.color("#fc4e4e");
    series_3.stroke = am4core.color("#fc4e4e");
    series_3.fillOpacity = 0;
}


var Lmap = null;

function init_map(data){
    let center = {
        lat: 21.029462138754397,
        lng: 105.78479111781412
    };
    let ZOOM = 13;
    if (Lmap) {
        Lmap.off();
        Lmap.remove();
        Lmap = null;
    }
    if (L.DomUtil.get('dma_loss_map')) {
        L.DomUtil.get('dma_loss_map')._leaflet_id = null;
    }
    $("#dma_loss_map").empty();
    Lmap = new L.map('dma_loss_map', {
        popupMovable: false,//set 'true' for enable this plugin.
        popupMovableZoomMode: 'relative',
        // popupMovableZoomMode: 'absolute',
        closePopupOnClick: false,//when using the plugin ,this option are recommend 'false'.
        zoomControl: true,
        preferCanvas: true,
        fullscreenControl: true,
        scrollWheelZoom: false, // disable original zoom function
        smoothWheelZoom: true,  // enable smooth zoom 
        smoothSensitivity: 1,   // zoom speed. default is 1
        fullscreenControl: true, // Thêm nút full màn hình
        fullscreenControlOptions: {
            position: 'topleft'
        }

    }).setView(new L.LatLng(center.lat, center.lng), ZOOM);
    // var streetLayer = L.tileLayer('https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    //     attribution: '© Google Maps'
    // }).addTo(Lmap);
    // // Chế độ Vệ tinh (Satellite)
    // var satelliteLayer = L.tileLayer('https://mt.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    //     attribution: '© Google Maps'
    // });
    // var baseLayers = {
    //     "Đường phố": streetLayer,
    //     "Vệ tinh": satelliteLayer
    // };
    // L.control.layers(baseLayers).addTo(Lmap);
    var osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(Lmap);
    const icon_disconnect = new L.icon({
        iconUrl: '/images/marker_red.png',
        iconSize: [35, 50],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    const icon_warning = new L.icon({
        iconUrl: '/images/marker_yellow.png',
        iconSize: [35, 50],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    const icon_success = new L.icon({
        iconUrl: '/images/marker_blue.png',
        iconSize: [35, 50],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })
    // var markers = L.markerClusterGroup();
    var markers = L.layerGroup();

    var arr_marker = [];
    if (data.length > 0) {
        var myPoints = [];//
        for (var i = 0; i < data.length; i++) {
            if (data[i].location_lat != null && data[i].location_long != null && data[i].location_lat != "" && data[i].location_long != "") {
                let content = "<a href='/data_search?MeterCode=" + data[i].MeterCode_ + "&NodeCode=" + data[i].NodeCode_ +"' style='color: black;' title='Tra cứu lịch sử'><span style='font-weight: bold;'>" + translate_text("Mã trạm") + ": " + data[i].MeterCode_ + ((data[i].is_pipe) ? " [Tổng]" : "") +"</span><br>" + "<span style='font-weight: bold'>" + translate_text("Tên trạm") + ": " + data[i].meter_name + "</span><br> " + translate_text("Thời gian");
                if (new Date(data[i].last_data_time_intan).getTime() > new Date(data[i].last_data_time).getTime()) {
                    content += ": " + return_if_empty_reconfig_data(data[i].last_data_time_intan);

                } else {
                    content += ": " + return_if_empty_reconfig_data(data[i].last_data_time);

                }
                if (data[i].data_field_config) {
                    let config = JSON.parse(data[i].data_field_config)
                    for (const key in config) {
                        if (config[key] == 1 && key != "OP") {
                            if (key == "ValOfNum") {
                                // content += "<br> " + shortToFullName(key)+" : "+show_if_null_0(data[i][return_last_data(key)]);
                                if (new Date(data[i].last_data_time_intan).getTime() > new Date(data[i].last_data_time).getTime()) {
                                    content += "<br> " + shortToFullName(key) + " : " + show_if_null_0(data[i][return_last_data(key) + "_intan"]);
                                } else {
                                    content += "<br> " + shortToFullName(key) + " : " + show_if_null_0(data[i][return_last_data(key)]);
                                }
                            } else if (key == "pressure" || key == "PressureVol") {
                                content += "<br> " + shortToFullName(key) + " : " + show_if_null(data[i][return_last_data(key)]) + return_unit_html(returnUnit(key, data[i]["UY"]));
                            } else if (key == "Voltage") {
                                content += "<br> " + shortToFullName(key) + " : " + show_if_null_pin(data[i][return_last_data(key)], data[i].unit_pin) + return_unit_html(returnUnit(key, data[i]["unit_pin"]));
                            } else {

                                // content += "<br> " + shortToFullName(key)+" : "+show_if_null(data[i][return_last_data(key)]) + return_unit_html(returnUnit(key,data[i][return_last_data("unit")]));
                                if (key == "flowRate" || key == "terminal_index") {
                                    if (new Date(data[i].last_data_time_intan).getTime() > new Date(data[i].last_data_time).getTime()) {
                                        content += "<br> " + shortToFullName(key) + " : " + show_if_null(data[i][return_last_data(key) + "_intan"]) + return_unit_html(returnUnit(key, data[i][return_last_data("unit")]));

                                    } else {
                                        content += "<br> " + shortToFullName(key) + " : " + show_if_null(data[i][return_last_data(key)]) + return_unit_html(returnUnit(key, data[i][return_last_data("unit")]));

                                    }
                                } else {
                                    content += "<br> " + shortToFullName(key) + " : " + show_if_null(data[i][return_last_data(key)]) + return_unit_html(returnUnit(key, data[i][return_last_data("unit")]));
                                }
                            }

                        }
                    }
                } else {
                    let config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };
                    for (const key in config) {
                        if (config[key] == 1) {
                            if (key == "ValOfNum") {
                                content += "<br> " + shortToFullName(key) + " : " + show_if_null_0(data[i][return_last_data(key)]);
                            } else if (key == "pressure" || key == "PressureVol") {
                                content += "<br> " + shortToFullName(key) + " : " + show_if_null(data[i][return_last_data(key)]) + return_unit_html(returnUnit(key, data[i]["UY"]));
                            } else if (key == "Voltage") {
                                content += "<br> " + shortToFullName(key) + " : " + show_if_null_pin(data[i][return_last_data(key)], data[i].unit_pin) + return_unit_html(returnUnit(key, data[i]["unit_pin"]));
                            } else {
                                content += "<br> " + shortToFullName(key) + " : " + show_if_null(data[i][return_last_data(key)]) + return_unit_html(returnUnit(key, data[i][return_last_data("unit")]));
                            }
                        }
                    }
                }
                content += "</a>"

                // L.circleMarker([Number(data[i].location_lat), Number(data[i].location_long)],{color:data[i].meter_status == 0 ? "#d92550" : "#3ac47d"}).addTo(Lmap);

                const popup2 = new L.Popup({
                    autoClose: false,
                    offset: [0, 10],
                    autoPan: true,
                    autoPanPadding: [50, 50],
                }).setContent(content);

                // L.marker([data[i].location_lat, data[i].location_long],{icon: icon}).addTo(Lmap).bindPopup(popup2).openPopup();
                var marker = L.marker([Number(data[i].location_lat), Number(data[i].location_long)], { icon: (data[i].meter_status == 1) ? icon_success : ((data[i].meter_status == 2) ? icon_warning : icon_disconnect) }).bindPopup(
                    popup2
                    //     content, {
                    //     autoPan: true, 
                    //     autoPanPadding: [50, 50] 
                    // }
                );
                
                // arr_marker.push({
                //     marker: marker,
                //     donvinguoidung_id: data[i].donvinguoidung_id
                // })

    

                markers.addLayer(marker);


                myPoints.push(new Array(data[i].location_lat, data[i].location_long));
            }
        }

        Lmap.addLayer(markers);
        // MỞ HẾT POPUP
        markers.eachLayer(function (layer) {
            if (layer.getPopup()) {
                layer.openPopup();
            }
        });
        // var myBounds = new L.LatLngBounds(myPoints);
        // var lcent =  Lmap.fitBounds(myBounds).getCenter(); 
    if (myPoints.length > 0) {
            // Lmap.setView(myPoints[0], ZOOM);
            var centroid = calculateCentroid(myPoints);
            Lmap.setView(centroid, ZOOM);
        }
    }

}

function calculateCentroid(points) {
    var totalPoints = points.length;
    var latSum = 0;
    var lngSum = 0;

    points.forEach(function (point) {
        latSum += Number(point[0]);
        lngSum += Number(point[1]);
    });

    var centroidLat = latSum / totalPoints;
    var centroidLng = lngSum / totalPoints;

    return [centroidLat, centroidLng];
  }


  $(document).ready(function(){
      $("#dma_data_type").on("change",function(){
          let type = $(this).children("option:selected").val();

        switch(type){
            case "hour":
                $("#dma_time_from").daterangepicker(
                    {
                        singleDatePicker: true,
                        showDropdowns: true,
                        showWeekNumbers: true,
                        timePicker: true,
                        timePickerIncrement: 1,
                        timePicker24Hour: true,
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
                            format: 'DD/MM/YYYY H:mm'
                        }
                    }
                )
                $("#dma_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
                $("#dma_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
                $("#dma_time_to").daterangepicker(
                    {
                        singleDatePicker: true,
                        showDropdowns: true,
                        showWeekNumbers: true,
                        timePicker: true,
                        timePickerIncrement: 1,
                        timePicker24Hour: true,
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
                            format: 'DD/MM/YYYY H:mm'
                        }
                    }
                )
                $("#dma_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
                $("#dma_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
                break;
            case "day":
                $('#dma_time_from').datetimepicker('destroy');
                $("#dma_time_from").daterangepicker(
                    {
                        singleDatePicker: true,
                        showDropdowns: true,
                        showWeekNumbers: true,
                        timePicker: false,
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
                $("#dma_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
                $("#dma_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
                $('#dma_time_to').datetimepicker('destroy');
                $("#dma_time_to").daterangepicker(
                    {
                        singleDatePicker: true,
                        showDropdowns: true,
                        showWeekNumbers: true,
                        timePicker: false,
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
                $("#dma_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
                $("#dma_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
                break;
            case "month":
                $("#dma_time_from").daterangepicker(
                    {
                        singleDatePicker: true,
                        showDropdowns: true,
                        showWeekNumbers: true,
                        timePicker: false,
                        // timePickerIncrement: 1,
                        // timePicker24Hour: true,
                        opens: 'right',
                        buttonClasses: ['btn btn-default'],
                        applyClass: 'btn-small btn-primary',
                        cancelClass: 'btn-small',
                        format: 'MM/YYYY',
                        separator: ' to ',
                        locale: {
                            applyLabel: 'Submit',
                            fromLabel: 'From',
                            toLabel: 'To',
                            customRangeLabel: 'Custom Range',
                            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                            firstDay: 1,
                            format: 'MM/YYYY'
                        }
                    }
                )
                $("#dma_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
                $("#dma_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
                $("#dma_time_to").daterangepicker(
                    {
                        singleDatePicker: true,
                        showDropdowns: true,
                        showWeekNumbers: true,
                        timePicker: false,
                        // timePickerIncrement: 1,
                        // timePicker24Hour: true,
                        opens: 'right',
                        buttonClasses: ['btn btn-default'],
                        applyClass: 'btn-small btn-primary',
                        cancelClass: 'btn-small',
                        format: 'MM/YYYY',
                        separator: ' to ',
                        locale: {
                            applyLabel: 'Submit',
                            fromLabel: 'From',
                            toLabel: 'To',
                            customRangeLabel: 'Custom Range',
                            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                            firstDay: 1,
                            format: 'MM/YYYY'
                        }
                    }
                )
                $("#dma_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
                $("#dma_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
                break;
        }

      })
  })