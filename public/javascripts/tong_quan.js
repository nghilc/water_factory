$(document).ready(function () {
    get_general_instant();
})
function return_status_mayphatdien(x) {
    switch (x) {
        case 1:
            $("#trang_thai_may_phat").css("color", "#4CAF50");
            $("#trang_thai_may_phat").html("Đang hoạt động");
            break;
        case 0:
            $("#trang_thai_may_phat").css("color", "red");
            $("#trang_thai_may_phat").html("Mất kết nối");
            break;
    }
}

function return_status_nguon_nuoc(x) {
    switch (x) {
        case 1:
            return '<span class="status-indicator status-normal">Đang kết nối</span>'
        case 0:
            return '<span class="status-indicator status-danger">Mất kết nối</span>'
        case 2:
            return '<span class="status-indicator status-warning">Cảnh báo</span>'

    }
}
function show_if_null_number(x) {
    if (x === "" || x === null || x === undefined) return "-";

    const num = Number(x);
    if (isNaN(num)) return "-";

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function return_unit_html(x) {
    if (x != null && x != "") {
        return '<span>(' + x + ')</span>'
    }
    return "";
}
function show_if_null(x) {
    if (x === "" || x === null)
        return "-";
    return x;
  }

function get_general_instant() {
    $.ajax({
        url: "/monitoring/get/tong_quan",
        type: "GET",
        // data: { MeterCode, NodeCode },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            // console.log(res.pumpData)
            var data = res.data;
            let tong_san_luong_nuoc_tho = 0;
            let tong_san_luong_nuoc_sach = 0;
            let dien_nang_tieu_thu_thang = "-";
            let nguon_nuoc_tho = '';
            let be_chua_nuoc_sach = '';

            let maybom_nuoctho = "";
            let maybom_nuocsach = "";
            const nuoctho = data.filter(device =>
                device.meter_type === "MUCNUOC" && device.data_type == 1
            );
            if (nuoctho.length > 0) {
                for (let i = 0; i < nuoctho.length; i++) {
                    nguon_nuoc_tho += ""
                        + '<div class="equipment-card normal">'
                        + '<div class="equipment-header">'
                        + '<h4>' + nuoctho[i].name + '</h4>'
                        + return_status_nguon_nuoc(nuoctho[i].status)
                        + ' </div>'
                        + '<div class="data-grid">'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dữ liệu gần nhất lúc</span>'
                        + '<span class="data-value">' + (new Date((nuoctho[i].last_data_time)).toLocaleString('en-GB')) + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Mực nước hiện tại</span>'
                        + '<span class="data-value">' + nuoctho[i].last_measure_sensor + ' ' + nuoctho[i].last_unit + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Mực nước động</span>'
                        + '<span class="data-value">' + nuoctho[i].last_measure_dynamic + ' ' + nuoctho[i].last_unit + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dung tích</span>'
                        + '<span class="data-value">- </span>'
                        + '</div>'
                        + ' </div>'
                        + '</div>'
                }
            } else {
                nguon_nuoc_tho += '<div class="warning-value">Chưa lắp thiết bị đo mực nước</div>';
            }
            let wmco_tho = 0;
            let wmco_sach = 0;
            let config_wmco_tho = res.config_wmco.filter(device =>
                device.device_type === 1
            );


            const csmt_tho = data.filter(device =>
                device.meter_type === "CSMT" && device.data_type == 1
            );
            if (csmt_tho.length > 0) {
                for (let i = 0; i < csmt_tho.length; i++) {
                    if (csmt_tho[i].last_Temp == null && csmt_tho[i].last_PH == null) {
                        wmco_tho = null;
                    } else {
                        if (config_wmco_tho[0].nhiet_do_max >= csmt_tho[i].last_Temp && config_wmco_tho[0].ph_min <= csmt_tho[i].last_PH && config_wmco_tho[0].ph_max >= csmt_tho[i].last_PH) {
                            wmco_tho = 1;
                        }
                    }
                    nguon_nuoc_tho += ""
                        + '<div class="equipment-card normal">'
                        + '<div class="equipment-header">'
                        + '<h4>' + csmt_tho[i].name + '</h4>'
                        + return_status_nguon_nuoc(csmt_tho[i].status)
                        + ' </div>'
                        + '<div class="data-grid">'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dữ liệu gần nhất lúc</span>'
                        + '<span class="data-value">' + (new Date((csmt_tho[i].last_data_time)).toLocaleString('en-GB')) + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Nhiệt độ</span>'
                        + '<span class="data-value ' + (config_wmco_tho[0].nhiet_do_max < csmt_tho[i].last_Temp ? "status-off" : "") + '">' + (csmt_tho[i].last_Temp ?? '-') + ' °C</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ pH</span>'
                        + '<span class="data-value ' + (config_wmco_tho[0].ph_min > csmt_tho[i].last_PH || config_wmco_tho[0].ph_max < csmt_tho[i].last_PH ? "status-off" : "") + '">' + (csmt_tho[i].last_PH ?? '-') + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ đục</span>'
                        + '<span class="data-value">' + (csmt_tho[i].last_DoDuc ?? '-') + ' NTU</span>'
                        + '</div>'

                        + ' </div>'
                        + '</div>'
                }

            } else {
                wmco_tho = null;
                nguon_nuoc_tho += '<div class="warning-value">Chưa lắp thiết bị đo môi trường</div>';
            }

            const nuocsach = data.filter(device =>
                device.meter_type === "MUCNUOC" && device.data_type == 2
            );
            if (nuocsach.length > 0) {
                for (let i = 0; i < nuocsach.length; i++) {
                    be_chua_nuoc_sach += ""
                        + '<div class="equipment-card normal">'
                        + '<div class="equipment-header">'
                        + '<h4>' + nuocsach[i].name + '</h4>'
                        + return_status_nguon_nuoc(nuocsach[i].status)
                        + ' </div>'
                        + '<div class="data-grid">'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dữ liệu gần nhất lúc</span>'
                        + '<span class="data-value">' + (new Date((nuocsach[i].last_data_time)).toLocaleString('en-GB')) + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Mực nước hiện tại</span>'
                        + '<span class="data-value">' + (nuocsach[i].last_measure_sensor ?? '-') + ' ' + nuocsach[i].last_unit + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Mực nước động</span>'
                        + '<span class="data-value">' + (nuocsach[i].last_measure_dynamic ?? '-') + ' ' + nuocsach[i].last_unit + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dung tích</span>'
                        + '<span class="data-value">- %</span>'
                        + '</div>'
                        + ' </div>'
                        + '</div>'
                }
            } else {
                be_chua_nuoc_sach += '<div class="warning-value">Chưa lắp thiết bị đo mực nước</div>';
            }
            let config_wmco_sach = res.config_wmco.filter(device =>
                device.device_type === 2
            );
            const csmt_sach = data.filter(device =>
                device.meter_type === "CSMT" && device.data_type == 2
            );
            if (csmt_sach.length > 0) {
                for (let i = 0; i < csmt_sach.length; i++) {
                    if (csmt_sach[i].last_Temp == null && csmt_sach[i].last_DoDuc == null && csmt_sach[i].last_PH == null && csmt_sach[i].last_CloDu == null) {
                        wmco_sach = null;
                    } else {
                        if (config_wmco_sach[0].nhiet_do_max >= csmt_sach[i].last_Temp &&
                            config_wmco_sach[0].do_duc_max >= csmt_sach[i].last_DoDuc &&
                            config_wmco_sach[0].ph_min <= csmt_sach[i].last_PH && config_wmco_sach[0].ph_max >= csmt_sach[i].last_PH &&
                            config_wmco_sach[0].clo_du_min <= csmt_sach[i].last_CloDu && config_wmco_sach[0].clo_du_max >= csmt_sach[i].last_CloDu) {
                            wmco_sach = 1;
                        }
                    }

                    be_chua_nuoc_sach += ""
                        + '<div class="equipment-card normal">'
                        + '<div class="equipment-header">'
                        + '<h4>' + csmt_sach[i].name + '</h4>'
                        + return_status_nguon_nuoc(csmt_sach[i].status)
                        + ' </div>'
                        + '<div class="data-grid">'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dữ liệu gần nhất lúc</span>'
                        + '<span class="data-value">' + (new Date((csmt_sach[i].last_data_time)).toLocaleString('en-GB')) + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Nhiệt độ</span>'
                        + '<span class="data-value ' + (config_wmco_sach[0].nhiet_do_max < csmt_sach[i].last_Temp ? "status-off" : "") + '">' + (csmt_sach[i].last_Temp ?? '-') + ' °C</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ pH</span>'
                        + '<span class="data-value ' + (config_wmco_sach[0].ph_min > csmt_sach[i].last_PH || config_wmco_sach[0].ph_max < csmt_sach[i].last_PH ? "status-off" : "") + '">' + (csmt_sach[i].last_PH ?? '-') + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ đục</span>'
                        + '<span class="data-value ' + (config_wmco_sach[0].do_duc_max < csmt_sach[i].last_DoDuc ? "status-off" : "") + '">' + (csmt_sach[i].last_DoDuc ?? '-') + ' NTU</span>'
                        + '</div>'

                        + '<div class="data-item">'
                        + '<span class="data-label">Clo dư</span>'
                        + '<span class="data-value ' + (config_wmco_sach[0].clo_du_min > csmt_sach[i].last_CloDu || config_wmco_sach[0].clo_du_max < csmt_sach[i].last_CloDu ? "status-off" : "") + '">' + (csmt_sach[i].last_CloDu ?? '-') + ' mg/l</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">EC</span>'
                        + '<span class="data-value">' + (csmt_sach[i].last_EC ?? '-') + ' uS/cm</span>'
                        + '</div>'
                        + ' </div>'
                        + '</div>'
                }
            } else {
                wmco_sach = null;
                be_chua_nuoc_sach += '<div class="warning-value">Chưa lắp thiết bị đo môi trường</div>';
            }

            const maybomnuoctho = data.filter(device =>
                device.meter_type === "DONGHO" && device.data_type == 1
            );
            if (maybomnuoctho.length > 0) {
                for (let i = 0; i < maybomnuoctho.length; i++) {
                    tong_san_luong_nuoc_tho += Number(maybomnuoctho[i].san_luong_tu_0h);
                    maybom_nuoctho += `<div class="equipment-card normal">
                        <div class="equipment-header">
                            <h4>${maybomnuoctho[i].name}</h4>
                            <span class="status-indicator status-normal">Đang chạy</span>
                        </div>
                        <div class="data-grid">
                            <div class="data-item">
                                <span class="data-label">Dữ liệu gần nhất lúc</span>
                                <span class="data-value">${(new Date((maybomnuoctho[i].last_data_time)).toLocaleString('en-GB'))}</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">Lưu lượng</span>
                                <span class="data-value">${maybomnuoctho[i].last_flow_rate ?? '-'} m³/h</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">Áp lực</span>
                                <span class="data-value">${maybomnuoctho[i].last_pressure != null && maybomnuoctho[i].last_pressure != 2550 ? maybomnuoctho[i].last_pressure : '-'} bar</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">Nhiệt độ máy bơm</span>
                                <span class="data-value">-°C</span>
                            </div>
                        </div>
                    </div>`;
                }

            } else {
                maybom_nuoctho += '<div class="warning-value">Chưa lắp thiết bị đo</div>';
            }
            const maybomnuocsach = data.filter(device =>
                device.meter_type === "DONGHO" && device.data_type == 2
            );
            if (maybomnuocsach.length > 0) {
                for (let i = 0; i < maybomnuocsach.length; i++) {
                    tong_san_luong_nuoc_sach += Number(maybomnuocsach[i].san_luong_tu_0h);
                    maybom_nuocsach += `<div class="equipment-card normal">
                        <div class="equipment-header">
                            <h4>${maybomnuocsach[i].name}</h4>
                            <span class="status-indicator status-normal">Đang chạy</span>
                        </div>
                        <div class="data-grid">
                            <div class="data-item">
                                <span class="data-label">Dữ liệu gần nhất lúc</span>
                                <span class="data-value">${(new Date((maybomnuocsach[i].last_data_time)).toLocaleString('en-GB'))}</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">Lưu lượng</span>
                                <span class="data-value">${maybomnuocsach[i].last_flow_rate ?? '-'} m³/h</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">Áp lực</span>
                                <span class="data-value">${maybomnuocsach[i].last_pressure ?? '-'} bar</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">Nhiệt độ máy bơm</span>
                                <span class="data-value">-°C</span>
                            </div>
                        </div>
                    </div>`;
                }
            } else {
                maybom_nuocsach += '<div class="warning-value">Chưa lắp thiết bị đo</div>';
            }
            $("#tong_san_luong_nuoc_tho").html(tong_san_luong_nuoc_tho + "&nbsp;m³")
            $("#tong_san_luong_nuoc_sach").html(tong_san_luong_nuoc_sach + "&nbsp;m³")
            $("#dien_nang_tieu_thu_thang").html(dien_nang_tieu_thu_thang)
            $("#nguon_nuoc_tho_container").empty();
            $("#nguon_nuoc_tho_container").append(nguon_nuoc_tho);
            $("#be_nuoc_sach_container").empty();
            $("#be_nuoc_sach_container").append(be_chua_nuoc_sach);
            $("#generator-grid").empty();
            $("#generator-grid").append(maybom_nuoctho);

            $('.wmco_time').html(new Date().toLocaleString('en-GB'));

            $("#generator-grid2").empty();
            $("#generator-grid2").append(maybom_nuocsach);
            if (wmco_tho == 1) {
                $('.wmco_tho').html("Đạt").removeClass('warning-value').addClass('stat-value');
            } else if (wmco_tho == 0) {
                $('.wmco_tho').html("Không Đạt").removeClass('stat-value').addClass('warning-value');
            } else {
                $('.wmco_tho').html("-").removeClass('stat-value').removeClass('warning-value');
            }
            if (wmco_sach == 1) {
                $('.wmco_sach').html("Đạt").removeClass('warning-value').addClass('stat-value');
            } else if (wmco_sach == 0) {
                $('.wmco_sach').html("Không Đạt").removeClass('stat-value').addClass('warning-value');
            } else {
                $('.wmco_sach').html("-").removeClass('stat-value').removeClass('warning-value');
            }
            const pumpData24h = data.filter(device =>
                device.meter_type === "DONGHO"
            );
            render_pump_production_24_chart(pumpData24h)

            const mucnuocDevices = data.filter(device =>
                device.meter_type === "MUCNUOC"
            );

            render_water_level_realtime_chart(mucnuocDevices)

            const may_phat_dien = data.filter(device =>
                device.meter_type === "GENERATOR"
            );
            if (may_phat_dien.length > 0) {
                $("#generator_note").html("")
                let data = may_phat_dien[0];
                $("#ten_may_phat_dien").html(data.name);
                $("#V_A2_v").html(show_if_null_number(data.V_A2_v))
                $("#V_A2_u").html(return_unit_html(data.V_A2_u))

                $("#Freq2_v").html(show_if_null_number(data.Freq2_v))
                $("#Freq2_u").html(return_unit_html(data.Freq2_u))

                $("#V_B2_v").html(show_if_null_number(data.V_B2_v))
                $("#V_B2_u").html(return_unit_html(data.V_B2_u))

                $("#V_C2_v").html(show_if_null_number(data.V_C2_v))
                $("#V_C2_u").html(return_unit_html(data.V_C2_u))

                $("#V_A_v").html(show_if_null_number(data.V_A_v))
                $("#V_A_u").html(return_unit_html(data.V_A_u))

                $("#I_A_v").html(show_if_null_number(data.I_A_v))
                $("#I_A_u").html(return_unit_html(data.I_A_u))

                $("#V_B_v").html(show_if_null_number(data.V_B_v))
                $("#V_B_u").html(return_unit_html(data.V_B_u))

                $("#I_B_v").html(show_if_null_number(data.I_B_v))
                $("#I_B_u").html(return_unit_html(data.I_B_u))


                $("#V_C_v").html(show_if_null_number(data.V_C_v))
                $("#V_C_u").html(return_unit_html(data.V_C_u))

                $("#I_C_v").html(show_if_null_number(data.I_C_v))
                $("#I_C_u").html(return_unit_html(data.I_C_u))

                $("#Speed_v").html(show_if_null(data.Speed_v) + "&nbsp;" + return_unit_html(data.Speed_u))
                $("#V_Bat_v").html(show_if_null(data.V_Bat_v) + "&nbsp;" + return_unit_html(data.V_Bat_u))
                $("#Tem_W_v").html(show_if_null(data.Tem_W_v) + "&nbsp;" + return_unit_html(data.Tem_W_u))
                $("#P_Oil_v").html(show_if_null(data.P_Oil_v) + "&nbsp;" + return_unit_html(data.P_Oil_u))

                $("#sta_in_container").empty();
                if (data.Sta_In) {
                    let sta_in = JSON.parse(data.Sta_In);
                    let str_sta_in = "";
                    for (let key in sta_in) {
                        str_sta_in += `<div class="status-item status-${sta_in[key]}">${key}: ${(sta_in[key] == "on") ? "BẬT" : "TẮT"}</div>`
                    }
                    $("#sta_in_container").append(str_sta_in);
                }
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

var CHART_PUMP_24 = null;

function render_pump_production_24_chart(rawData) {
    am4core.useTheme(am4themes_animated);

    rawData.sort(function (a, b) {
        if (a.data_type !== b.data_type) {
            return a.data_type - b.data_type;
        }
        return a.value - b.value;
    });
    // --- Khởi tạo chart ---
    if (CHART_PUMP_24) {
        CHART_PUMP_24.dispose();
        CHART_PUMP_24 = null;
      }
    console.log(CHART_PUMP_24)
    CHART_PUMP_24 = am4core.create("pump-production-24h-chart", am4charts.XYChart);
    CHART_PUMP_24.data = rawData;
    CHART_PUMP_24.logo.disabled = true;
    // --- Trục X ---
    var xAxis = CHART_PUMP_24.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = "name";
    xAxis.renderer.labels.template.maxWidth = 130;
    xAxis.renderer.labels.template.wrap = true;
    xAxis.renderer.labels.template.truncate = false;
    xAxis.renderer.minGridDistance = 30;
    xAxis.renderer.labels.template.fill = am4core.color("#000000ff");
    xAxis.renderer.labels.template.fontSize = 10;

    // --- Trục Y ---
    var yAxis = CHART_PUMP_24.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.title.text = "Sản lượng 24h (m³)";
    yAxis.title.fill = am4core.color("#000000ff");
    yAxis.title.fontSize = 10;
    yAxis.renderer.labels.template.fill = am4core.color("#000000ff");
    yAxis.renderer.labels.template.fontSize = 10;
    // --- Series cột ---
    var series = CHART_PUMP_24.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "name";
    series.dataFields.valueY = "san_luong_tu_0h";
    //  series.columns.template.tooltipText = "[bold]{name}[/]\n{valueY} m³";
    series.columns.template.width = am4core.percent(60);
    series.columns.template.strokeWidth = 0;


    // --- Màu theo loại ---
    series.columns.template.adapter.add("fill", function (fill, target) {
        var type = target.dataItem.dataContext.data_type;
        if (type === 1) return am4core.color("#ff7043"); // cam
        if (type === 2) return am4core.color("#0aa162ff"); // tím
        return fill;
    });

    var label2 = series.bullets.push(new am4charts.LabelBullet());
    label2.label.fontSize = 11;
    label2.label.dy = -10;
    label2.label.text = "{valueY} (m³)";
    label2.label.fill = am4core.color("#000000ff");
    CHART_PUMP_24.maskBullets = false;

    //chart.cursor = new am4charts.XYCursor();
}

var CHART_REAL_TIME = null

function render_water_level_realtime_chart(originalData) {

    var chartData = originalData.map(r => ({
        station: r.name,
        unit: r.data_type === 1 ? "m" : "cm",
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
    if (CHART_REAL_TIME) {
        CHART_REAL_TIME.dispose();
        CHART_REAL_TIME = null;
    }
    am4core.useTheme(am4themes_animated);
    var CHART_REAL_TIME = am4core.create("water-level-realtime-chart", am4charts.XYChart);
    CHART_REAL_TIME.data = chartData;

    // =============== AXES ===============
    var categoryAxis = CHART_REAL_TIME.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "station";
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.maxWidth = 150;
    categoryAxis.renderer.labels.template.wrap = true;
    categoryAxis.renderer.labels.template.truncate = false;
    categoryAxis.renderer.labels.template.fill = am4core.color("#000000ff");
    categoryAxis.renderer.labels.template.fontSize = 10;

    var axisM = CHART_REAL_TIME.yAxes.push(new am4charts.ValueAxis());
    axisM.title.text = "Mực nước (m)";
    axisM.title.fontSize = 10;
    // axisM.title.fill = am4core.color("#fff");
    axisM.min = 0;
    // axisM.renderer.labels.template.fill = am4core.color("#fff");
    axisM.renderer.labels.template.fontSize = 10;


    var axisCM = CHART_REAL_TIME.yAxes.push(new am4charts.ValueAxis());
    axisCM.title.text = "Mực nước (cm)";
    axisCM.title.fontSize = 10;
    // axisCM.title.fill = am4core.color("#fff");
    axisCM.renderer.opposite = true;
    // axisCM.renderer.labels.template.fill = am4core.color("#fff");
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
    var sM_static = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    sM_static.name = "Mực nước hiện tại";
    sM_static.dataFields.valueY = "valueM";
    sM_static.yAxis = axisM;
    baseColumnStyle(sM_static);
    sM_static.columns.template.fill = CHART_REAL_TIME.colors.getIndex(0); // xanh
    sM_static.columns.template.stroke = CHART_REAL_TIME.colors.getIndex(0);

    var labelBullet = sM_static.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY} (m)";
    labelBullet.label.dy = 15;
    labelBullet.label.fontSize = 11;
    labelBullet.label.fill = am4core.color("#333");
    labelBullet.label.bold = true;
    // sM_static.columns.template.tooltipText =
    //     "{categoryX}\n{valueM} m (hiện tại)";

    var sM_dynamic = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    sM_dynamic.name = "Mực nước động";
    sM_dynamic.dataFields.valueY = "valueDynamicM";
    sM_dynamic.yAxis = axisM;
    baseColumnStyle(sM_dynamic);
    // sM_dynamic.columns.template.fill = am4core.color("#ffffff");   // trắng
    // sM_dynamic.columns.template.stroke = am4core.color("#cfd7e6");   // viền nhẹ
    // sM_dynamic.columns.template.tooltipText =
    //     "{categoryX}\n{valueDynamicM} m (động)\nTổng: {valueYTotal} m";

    // --- CM (trục phải) ---
    var sCM_static = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    sCM_static.name = "Mực nước hiện tại";
    sCM_static.dataFields.valueY = "valueCM";
    sCM_static.yAxis = axisCM;
    baseColumnStyle(sCM_static);
    // Ẩn khỏi legend để chỉ hiển thị 1 mục "Mực nước hiện tại"
    sCM_static.hiddenInLegend = true;
    sCM_static.columns.template.fill = CHART_REAL_TIME.colors.getIndex(0);
    sCM_static.columns.template.stroke = CHART_REAL_TIME.colors.getIndex(0);

    var labelBullet = sCM_static.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY} (cm)";
    labelBullet.label.dy = 15;
    labelBullet.label.fontSize = 11;
    labelBullet.label.fill = am4core.color("#333");
    labelBullet.label.bold = true;
    // sCM_static.columns.template.tooltipText =
    //     "{categoryX}\n{valueCM} cm (hiện tại)";

    var sCM_dynamic = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    sCM_dynamic.name = "Mực nước động";
    sCM_dynamic.dataFields.valueY = "valueDynamicCM";
    sCM_dynamic.yAxis = axisCM;
    baseColumnStyle(sCM_dynamic);
    sCM_dynamic.hiddenInLegend = true;
    // sCM_dynamic.columns.template.fill = am4core.color("#ffffff");
    // sCM_dynamic.columns.template.stroke = am4core.color("#cfd7e6");
    //sCM_dynamic.columns.template.tooltipText =
    //     "{categoryX}\n{valueDynamicCM} cm (động)\nTổng: {valueYTotal} cm";

    // Nhãn tổng trên đỉnh cột (đơn vị đúng theo trạm)
    var label = sM_dynamic.bullets.push(new am4charts.LabelBullet());
    label.label.fontSize = 11;
    label.label.dy = -10;
    label.label.text = "{valueY} (m)";
    // label.label.fill = am4core.color("#fff");

    var label2 = sCM_dynamic.bullets.push(new am4charts.LabelBullet());
    label2.label.fontSize = 11;
    label2.label.dy = -10;
    label2.label.text = "{valueY} (cm)";
    // label2.label.fill = am4core.color("#fff");

    CHART_REAL_TIME.maskBullets = false;

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