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
                    if (nuoctho[i].status == 1){
                        if (nuoctho[i].last_measure_sensor != null && nuoctho[i].min_mucnuoc != null && nuoctho[i].last_measure_sensor < nuoctho[i].min_mucnuoc){
                            nuoctho[i].status = 2;
                        }

                        if (nuoctho[i].last_measure_sensor != null && nuoctho[i].max_mucnuoc != null && nuoctho[i].last_measure_sensor > nuoctho[i].max_mucnuoc) {
                            nuoctho[i].status = 2;
                        }
                    }
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
                        + `<span class="data-value ${(nuoctho[i].status == 0) ? "text-danger" : ((nuoctho[i].status == 2) ? "text-warning" : "text-success")}">` + show_if_null(nuoctho[i].last_measure_sensor) + ' ' + nuoctho[i].last_unit + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Mực nước Max (tràn)</span>'
                        + '<span class="data-value">' + show_if_null(nuoctho[i].max_mucnuoc) + ' m</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Mực nước Min</span>'
                        + '<span class="data-value">' + show_if_null(nuoctho[i].min_mucnuoc) + ' m</span>'
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
                let tt_nhiet_do = 1;
                let tt_ph = 1;
                let tt_do_duc = 1;
                for (let i = 0; i < csmt_tho.length; i++) {
                    if (csmt_tho[i].status == 1){
                        if (csmt_tho[i].last_Temp != null && csmt_tho[i].min_nhietdo != null && csmt_tho[i].last_Temp < csmt_tho[i].min_nhietdo) {
                            csmt_tho[i].status = 2;
                            tt_nhiet_do = 2;
                        }
                        if (csmt_tho[i].last_Temp != null && csmt_tho[i].max_nhietdo != null && csmt_tho[i].last_Temp > csmt_tho[i].max_nhietdo) {
                            csmt_tho[i].status = 2;
                            tt_nhiet_do = 2;
                        }
                        if (csmt_tho[i].last_PH != null && csmt_tho[i].min_ph != null && csmt_tho[i].last_PH < csmt_tho[i].min_ph) {
                            csmt_tho[i].status = 2;
                            tt_ph = 2;
                        }
                        if (csmt_tho[i].last_PH != null && csmt_tho[i].max_ph != null && csmt_tho[i].last_PH > csmt_tho[i].max_ph) {
                            csmt_tho[i].status = 2;
                            tt_ph = 2;
                        }
                        if (csmt_tho[i].last_DoDuc != null && csmt_tho[i].min_doduc != null && csmt_tho[i].last_DoDuc < csmt_tho[i].min_doduc) {
                            csmt_tho[i].status = 2;
                            tt_do_duc = 2;
                        }
                        if (csmt_tho[i].last_DoDuc != null && csmt_tho[i].max_doduc != null && csmt_tho[i].last_DoDuc > csmt_tho[i].max_doduc) {
                            csmt_tho[i].status = 2;
                            tt_do_duc = 2;
                        }
                        
                    } else if (csmt_tho[i].status == 0){
                         tt_nhiet_do = 0;
                         tt_ph = 0;
                         tt_do_duc = 0;
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
                        + `<span class="data-value ${(tt_nhiet_do == 0) ? "text-danger" : ((tt_nhiet_do == 2) ? "text-warning" : "text-success")}">` + (csmt_tho[i].last_Temp ?? '-') + ' °C</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ pH</span>'
                        + `<span class="data-value ${(tt_ph == 0) ? "text-danger" : ((tt_ph == 2) ? "text-warning" : "text-success")}">` + (csmt_tho[i].last_PH ?? '-') + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ đục</span>'
                        + `<span class="data-value ${(tt_do_duc == 0) ? "text-danger" : ((tt_do_duc == 2) ? "text-warning" : "text-success")}">` + (csmt_tho[i].last_DoDuc ?? '-') + ' NTU</span>'
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
                    if (nuocsach[i].status == 1) {
                        if (nuocsach[i].last_measure_sensor != null && nuocsach[i].min_mucnuoc != null && nuocsach[i].last_measure_sensor < nuocsach[i].min_mucnuoc) {
                            nuocsach[i].status = 2;
                        }

                        if (nuocsach[i].last_measure_sensor != null && nuocsach[i].max_mucnuoc != null && nuocsach[i].last_measure_sensor > nuocsach[i].max_mucnuoc) {
                            nuocsach[i].status = 2;
                        }
                    }
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
                        + `<span class="data-value ${(nuocsach[i].status == 0) ? "text-danger" : ((nuocsach[i].status == 2) ? "text-warning" : "text-success")}"` + show_if_null(nuocsach[i].last_measure_sensor) + ' ' + nuocsach[i].last_unit + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Ngưỡng trên</span>'
                        + '<span class="data-value">' + nuocsach[i].max_mucnuoc + ' m</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Dung tích</span>'
                        + '<span class="data-value">' + nuocsach[i].min_mucnuoc + ' m</span>'
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
                let tt_nhiet_do = 1;
                let tt_ph = 1;
                let tt_do_duc = 1;
                let tt_clo_du = 1;
                let tt_EC = 1;

                for (let i = 0; i < csmt_sach.length; i++) {
         
                    if (csmt_sach[i].status == 1) {
                        if (csmt_sach[i].last_Temp != null && csmt_sach[i].min_nhietdo != null && csmt_sach[i].last_Temp < csmt_sach[i].min_nhietdo) {
                            csmt_sach[i].status = 2;
                            tt_nhiet_do = 2;
                        }
                        if (csmt_sach[i].last_Temp != null && csmt_sach[i].max_nhietdo != null && csmt_sach[i].last_Temp > csmt_sach[i].max_nhietdo) {
                            csmt_sach[i].status = 2;
                            tt_nhiet_do = 2;
                        }
        
                        if (csmt_sach[i].last_PH != null && csmt_sach[i].min_ph != null && csmt_sach[i].last_PH < csmt_sach[i].min_ph) {
                            csmt_sach[i].status = 2;
                            tt_ph = 2;
                        }
                        if (csmt_sach[i].last_PH != null && csmt_sach[i].max_ph != null && csmt_sach[i].last_PH > csmt_sach[i].max_ph) {
                            csmt_sach[i].status = 2;
                            tt_ph = 2;
                        }

                        if (csmt_sach[i].last_DoDuc != null && csmt_sach[i].min_doduc != null && csmt_sach[i].last_DoDuc < csmt_sach[i].min_doduc) {
                            csmt_sach[i].status = 2;
                            tt_do_duc = 2;
                        }
                        if (csmt_sach[i].last_DoDuc != null && csmt_sach[i].max_doduc != null && csmt_sach[i].last_DoDuc > csmt_sach[i].max_doduc) {
                            csmt_sach[i].status = 2;
                            tt_do_duc = 2; 
                        }

                        if (csmt_sach[i].last_CloDu != null && csmt_sach[i].min_clodu != null && csmt_sach[i].last_CloDu < csmt_sach[i].min_clodu) {
                            csmt_sach[i].status = 2;
                            tt_clo_du = 2;
                        }
                        if (csmt_sach[i].last_clodu != null && csmt_sach[i].max_clodu != null && csmt_sach[i].last_CloDu > csmt_sach[i].max_nhietdo) {
                            csmt_sach[i].status = 2;
                            tt_clo_du = 2;
                        }

                        if (csmt_sach[i].last_EC != null && csmt_sach[i].min_EC != null && csmt_sach[i].last_EC < csmt_sach[i].min_EC) {
                            csmt_sach[i].status = 2;
                            tt_EC = 2;
                        }
                        if (csmt_sach[i].last_EC != null && csmt_sach[i].max_EC != null && csmt_sach[i].last_EC > csmt_sach[i].max_EC) {
                            csmt_sach[i].status = 2;
                            tt_EC = 2;
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
                        + `<span class="data-value ${(tt_nhiet_do == 0) ? "text-danger" : ((tt_nhiet_do == 2) ? "text-warning" : "text-success")}">` + (csmt_sach[i].last_Temp ?? '-') + ' °C</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ pH</span>'
                        + `<span class="data-value ${(tt_ph == 0) ? "text-danger" : ((tt_ph == 2) ? "text-warning" : "text-success")}">` + (csmt_sach[i].last_PH ?? '-') + '</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">Độ đục</span>'
                        + `<span class="data-value ${(tt_do_duc == 0) ? "text-danger" : ((tt_do_duc == 2) ? "text-warning" : "text-success")}">` + (csmt_sach[i].last_DoDuc ?? '-') + ' NTU</span>'
                        + '</div>'

                        + '<div class="data-item">'
                        + '<span class="data-label">Clo dư</span>'
                        + `<span class="data-value ${(tt_clo_du == 0) ? "text-danger" : ((tt_clo_du == 2) ? "text-warning" : "text-success")}">` + (csmt_sach[i].last_CloDu ?? '-') + ' mg/l</span>'
                        + '</div>'
                        + '<div class="data-item">'
                        + '<span class="data-label">EC</span>'
                        + `<span class="data-value ${(tt_EC == 0) ? "text-danger" : ((tt_EC == 2) ? "text-warning" : "text-success")}">` + (csmt_sach[i].last_EC ?? '-') + ' uS/cm</span>'
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
            // if (wmco_tho == 1) {
            //     $('.wmco_tho').html("-").removeClass('warning-value').addClass('stat-value');
            // } else if (wmco_tho == 0) {
            //     $('.wmco_tho').html("-").removeClass('stat-value').addClass('warning-value');
            // } else {
            //     $('.wmco_tho').html("-").removeClass('stat-value').removeClass('warning-value');
            // }

            // if (wmco_sach == 1) {
            //     $('.wmco_sach').html("-").removeClass('warning-value').addClass('stat-value');
            // } else if (wmco_sach == 0) {
            //     $('.wmco_sach').html("-").removeClass('stat-value').addClass('warning-value');
            // } else {
            //     $('.wmco_sach').html("-").removeClass('stat-value').removeClass('warning-value');
            // }
            const pumpData24h = data.filter(device =>
                device.meter_type === "DONGHO"
            );
            render_pump_production_24_chart(pumpData24h)

            const mucnuocDevices = data.filter(device =>
                device.meter_type === "MUCNUOC"
            );

            render_water_level_realtime_chart(mucnuocDevices)

            const may_phat_dien = res.may_phat_dien;
            $("#may_phat_dien_container").empty();

            if (may_phat_dien.length == 0) {
                $("#may_phat_dien_container").append(`
                    <div class="generator-panel">
                        <div class="generator-header">
                            <h5>🔌 <span id="ten_may_phat_dien"></span></h5>
                            <span class="status-indicator status-normal"></span>
                            <span class="generator-status-text status-running" id="generator_note">CHƯA LẮP THIẾT BỊ ĐO</span>
                        </div>
            
                        <div class="generator-grid">
                            <!-- Điện áp lưới -->
                            <div class="generator-section">
                                <div class="section-title">ĐIỆN ÁP LƯỚI</div>
                                <table class="table table-bordered">
                                    <tr>
                                        <th>Pha</th>
                                        <th>Điện áp</th>
                                        <th>Tần số</th>
                                    </tr>
                                    <tr>
                                        <td>Pha A</td>
                                        <td class="value-cell">
                                            <span class="value grid-voltage-a" id="V_A2_v">-</span>
                                            <span class="unit-cell" id="V_A2_u">(V)</span>
                                        </td>
                                        <td class="value-cell" rowspan="3">
                                            <span class="value" id="Freq2_v">-</span>
                                            <span class="unit-cell" id="Freq2_u">(Hz)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pha B</td>
                                        <td class="value-cell">
                                            <span class="value grid-voltage-b" id="V_B2_v">-</span>
                                            <span class="unit-cell" id="V_B2_u">(V)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pha C</td>
                                        <td class="value-cell">
                                            <span class="value grid-voltage-c" id="V_C2_v">-</span>
                                            <span class="unit-cell" id="V_C2_u">(V)</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
            
                            <div class="generator-section">
                                <div class="section-title">ĐIỆN ÁP ĐẦU RA</div>
                                <table class="table table-bordered">
                                    <tr>
                                        <th>Pha</th>
                                        <th>Điện áp</th>
                                        <th>Dòng điện</th>
                                    </tr>
                                    <tr>
                                        <td>Pha A</td>
                                        <td class="value-cell">
                                            <span class="value output-voltage-a" id="V_A_v">-</span>
                                            <span class="unit-cell" id="V_A_u">(V)</span>
                                        </td>
                                        <td class="value-cell">
                                            <span class="value output-current-a" id="I_A_v">-</span>
                                            <span class="unit-cell" id="I_A_u">(A)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pha B</td>
                                        <td class="value-cell">
                                            <span class="value" id="V_B_v">-</span>
                                            <span class="unit-cell" id="V_B_u">(V)</span>
                                        </td>
                                        <td class="value-cell">
                                            <span class="value" id="I_B_v">-</span>
                                            <span class="unit-cell" id="I_B_u">(A)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Pha C</td>
                                        <td class="value-cell">
                                            <span class="value" id="V_C_v">-</span>
                                            <span class="unit-cell" id="V_C_u">(V)</span>
                                        </td>
                                        <td class="value-cell">
                                            <span class="value" id="I_C_v">-</span>
                                            <span class="unit-cell" id="I_C_u">(A)</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
            
                            <div class="generator-section">
                                <div class="section-title">THÔNG TIN CHUNG</div>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Tốc độ</span>
                                        <span class="info-value generator-speed" id="Speed_v">- (rpm)</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Điện áp ắc quy</span>
                                        <span class="info-value battery-voltage" id="V_Bat_v">- (V)</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Nhiệt độ nước</span>
                                        <span class="info-value water-temp" id="Tem_W_v">- (°C)</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Áp suất dầu</span>
                                        <span class="info-value oil-pressure" id="P_Oil_v">- (PSI)</span>
                                    </div>
                                </div>
                            </div>
            
                            <div class="generator-section">
                                <div class="section-title">TRẠNG THÁI ĐẦU VÀO</div>
                                <div class="status-grid-small" id="sta_in_container">
                                    <div class="status-item status-off">MCE: -</div>
                                    <div class="status-item status-off">AUX.1: -</div>
                                    <div class="status-item status-off">AUX.2: -</div>
                                    <div class="status-item status-off">AUX.3: -</div>
                                </div>
                            </div>
                        </div>
                    </div>
            
                    <div class="alerts-panel">
                        <h5 class="generator-header">⚠️ CẢNH BÁO HIỆN TẠI</h5>
                    </div>
                    `);

                // $("#generator_note").html("")
                // let data = may_phat_dien[0];
                // $("#ten_may_phat_dien").html(data.name);
                // $("#V_A2_v").html(show_if_null_number(data.V_A2_v))
                // $("#V_A2_u").html(return_unit_html(data.V_A2_u))

                // $("#Freq2_v").html(show_if_null_number(data.Freq2_v))
                // $("#Freq2_u").html(return_unit_html(data.Freq2_u))

                // $("#V_B2_v").html(show_if_null_number(data.V_B2_v))
                // $("#V_B2_u").html(return_unit_html(data.V_B2_u))

                // $("#V_C2_v").html(show_if_null_number(data.V_C2_v))
                // $("#V_C2_u").html(return_unit_html(data.V_C2_u))

                // $("#V_A_v").html(show_if_null_number(data.V_A_v))
                // $("#V_A_u").html(return_unit_html(data.V_A_u))

                // $("#I_A_v").html(show_if_null_number(data.I_A_v))
                // $("#I_A_u").html(return_unit_html(data.I_A_u))

                // $("#V_B_v").html(show_if_null_number(data.V_B_v))
                // $("#V_B_u").html(return_unit_html(data.V_B_u))

                // $("#I_B_v").html(show_if_null_number(data.I_B_v))
                // $("#I_B_u").html(return_unit_html(data.I_B_u))


                // $("#V_C_v").html(show_if_null_number(data.V_C_v))
                // $("#V_C_u").html(return_unit_html(data.V_C_u))

                // $("#I_C_v").html(show_if_null_number(data.I_C_v))
                // $("#I_C_u").html(return_unit_html(data.I_C_u))

                // $("#Speed_v").html(show_if_null(data.Speed_v) + "&nbsp;" + return_unit_html(data.Speed_u))
                // $("#V_Bat_v").html(show_if_null(data.V_Bat_v) + "&nbsp;" + return_unit_html(data.V_Bat_u))
                // $("#Tem_W_v").html(show_if_null(data.Tem_W_v) + "&nbsp;" + return_unit_html(data.Tem_W_u))
                // $("#P_Oil_v").html(show_if_null(data.P_Oil_v) + "&nbsp;" + return_unit_html(data.P_Oil_u))

                // $("#sta_in_container").empty();
                // if (data.Sta_In) {
                //     let sta_in = JSON.parse(data.Sta_In);
                //     let str_sta_in = "";
                //     for (let key in sta_in) {
                //         str_sta_in += `<div class="status-item status-${sta_in[key]}">${key}: ${(sta_in[key] == "on") ? "BẬT" : "TẮT"}</div>`
                //     }
                //     $("#sta_in_container").append(str_sta_in);
                // }
            }else{
                for(let i=0; i<may_phat_dien.length; i++){
                    $("#may_phat_dien_container").append(`
                        <div class="generator-panel">
                            <div class="generator-header">
                                <h5>🔌 <span>${may_phat_dien[i].name}</span></h5>
                                ${(may_phat_dien[i].point_status == 0) ? '<span class="generator-status-text status-stopped">Mất kết nối</span>' : '<span class="generator-status-text status-running">Đang kết nối</span>'}
                            </div>
                            <span>HT: ${ new Date(may_phat_dien[i].server_time).toLocaleString('en-GB')}</span> - 
                            <span>CT: ${new Date(may_phat_dien[i].meter_time).toLocaleString('en-GB') }</span>
                            <div class="generator-grid mt-2">
 
                                <div class="generator-section">
                                    <div class="section-title">ĐIỆN ÁP LƯỚI</div>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th>Pha</th>
                                            <th>Điện áp</th>
                                            <th>Tần số</th>
                                        </tr>
                                        <tr>
                                            <td>Pha A</td>
                                            <td class="value-cell">
                                                <span class="value grid-voltage-a">${(may_phat_dien[i].V_A2_v != null) ? may_phat_dien[i].V_A2_v : "-"}</span>
                                                <span class="unit-cell">${(may_phat_dien[i].V_A2_u != null) ? '(' + may_phat_dien[i].V_A2_u + ')' : ""}</span>
                                            </td>
                                            <td class="value-cell" rowspan="3">
                                                <span class="value" >${(may_phat_dien[i].Freq2_v != null) ? may_phat_dien[i].Freq2_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].Freq2_u != null) ? '(' + may_phat_dien[i].Freq2_u + ')' : ""}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Pha B</td>
                                            <td class="value-cell">
                                                <span class="value grid-voltage-b">${(may_phat_dien[i].V_B2_v != null) ? may_phat_dien[i].V_B2_v : "-" }</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].V_B2_u != null) ? '(' + may_phat_dien[i].V_B2_u + ')' : ""}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Pha C</td>
                                            <td class="value-cell">
                                                <span class="value grid-voltage-c" >${(may_phat_dien[i].V_C2_v != null) ? may_phat_dien[i].V_C2_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].V_C2_u != null) ? '(' + may_phat_dien[i].V_C2_u + ')' : ""}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                
                                <div class="generator-section">
                                    <div class="section-title">ĐIỆN ÁP ĐẦU RA</div>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th>Pha</th>
                                            <th>Điện áp</th>
                                            <th>Dòng điện</th>
                                        </tr>
                                        <tr>
                                            <td>Pha A</td>
                                            <td class="value-cell">
                                                <span class="value output-voltage-a" >${(may_phat_dien[i].V_A_v != null) ? may_phat_dien[i].V_A_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].V_A_u != null) ? '(' + may_phat_dien[i].V_A_u + ')' : ""}</span>
                                            </td>
                                            <td class="value-cell">
                                                <span class="value output-current-a" >${(may_phat_dien[i].I_A_v != null) ? may_phat_dien[i].I_A_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].I_A_u != null) ? '(' + may_phat_dien[i].I_A_u + ')' : ""}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Pha B</td>
                                            <td class="value-cell">
                                                <span class="value" >${(may_phat_dien[i].V_B_v != null) ? may_phat_dien[i].V_B_v : "-"}</span>
                                                <span class="unit-cell" id="V_B_u">${(may_phat_dien[i].V_B_u != null) ? '(' + may_phat_dien[i].V_B_u + ')' : ""}</span>
                                            </td>
                                            <td class="value-cell">
                                                <span class="value" >${(may_phat_dien[i].I_B_v != null) ? may_phat_dien[i].I_B_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].I_B_u != null) ? '(' + may_phat_dien[i].I_B_u + ')' : ""}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Pha C</td>
                                            <td class="value-cell">
                                                <span class="value" >${(may_phat_dien[i].V_C_v != null) ? may_phat_dien[i].V_C_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].V_C_u != null) ? '(' + may_phat_dien[i].V_C_u + ')' : ""}</span>
                                            </td>
                                            <td class="value-cell">
                                                <span class="value" >${(may_phat_dien[i].I_C_v != null) ? may_phat_dien[i].I_C_v : "-"}</span>
                                                <span class="unit-cell" >${(may_phat_dien[i].I_C_u != null) ? '(' + may_phat_dien[i].I_C_u + ')' : ""}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                
                                <div class="generator-section">
                                    <div class="section-title">THÔNG TIN CHUNG</div>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <span class="info-label">Tốc độ</span>
                                            <span class="info-value generator-speed" >${(may_phat_dien[i].Speed_v != null) ? may_phat_dien[i].Speed_v : '-'} (${(may_phat_dien[i].Speed_u != null) ? may_phat_dien[i].Speed_u : '-'})</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Điện áp ắc quy</span>
                                            <span class="info-value battery-voltage" >${(may_phat_dien[i].V_Bat_v != null) ? may_phat_dien[i].V_Bat_v : '-'} (${(may_phat_dien[i].V_Bat_u != null) ? may_phat_dien[i].V_Bat_u : '-'})</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Nhiệt độ nước</span>
                                            <span class="info-value water-temp" id="Tem_W_v">${(may_phat_dien[i].Tem_W_v != null) ? may_phat_dien[i].Tem_W_v : '-'} (${(may_phat_dien[i].Tem_W_u != null) ? may_phat_dien[i].Tem_W_u : '-'})</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Áp suất dầu</span>
                                            <span class="info-value oil-pressure" id="P_Oil_v">${(may_phat_dien[i].P_Oil_v != null) ? may_phat_dien[i].P_Oil_v : '-'} (${(may_phat_dien[i].P_Oil_u != null) ? may_phat_dien[i].P_Oil_u : '-'})</span>
                                        </div>
                                    </div>
                                </div>
                
                                <div class="generator-section">
                                    <div class="section-title">TRẠNG THÁI ĐẦU VÀO</div>
                                    <div class="status-grid-small" id="sta_in_container">
                                        ${may_phat_dien[i].Sta_In && (JSON.parse(may_phat_dien[i].Sta_In).EMER =="on") ? '<div class="status-item status-on">EMER: BẬT</div>' : '<div class="status-item status-off">EMER: TẮT</div>'}
                                        ${may_phat_dien[i].Sta_In && JSON.parse(may_phat_dien[i].Sta_In)["AUX.1"] && (JSON.parse(may_phat_dien[i].Sta_In)["AUX.1"] == "on") ? '<div class="status-item status-on">AUX.1: BẬT</div>' : '<div class="status-item status-off">AUX.1: TẮT</div>'}
                                        ${may_phat_dien[i].Sta_In && JSON.parse(may_phat_dien[i].Sta_In)["AUX.2"] && (JSON.parse(may_phat_dien[i].Sta_In)["AUX.2"] == "on") ? '<div class="status-item status-on">AUX.2: BẬT</div>' : '<div class="status-item status-off">AUX.2: TẮT</div>'}
                                        ${may_phat_dien[i].Sta_In && JSON.parse(may_phat_dien[i].Sta_In)["AUX.3"] && (JSON.parse(may_phat_dien[i].Sta_In)["AUX.3"] == "on") ? '<div class="status-item status-on">AUX.3: BẬT</div>' : '<div class="status-item status-off">AUX.3: TẮT</div>'}
                                        ${may_phat_dien[i].Sta_In && JSON.parse(may_phat_dien[i].Sta_In)["AUX.4"] && (JSON.parse(may_phat_dien[i].Sta_In)["AUX.4"] == "on") ? '<div class="status-item status-on">AUX.4: BẬT</div>' : '<div class="status-item status-off">AUX.4: TẮT</div>'}
                                        ${may_phat_dien[i].Sta_In && JSON.parse(may_phat_dien[i].Sta_In)["AUX.5"] && (JSON.parse(may_phat_dien[i].Sta_In)["AUX.5"] == "on") ? '<div class="status-item status-on">AUX.5: BẬT</div>' : '<div class="status-item status-off">AUX.5: TẮT</div>'}
                                    </div>
                                </div>
                            </div>
                        </div>
                
                        <div class="alerts-panel">
                            <h5 class="generator-header">⚠️ CẢNH BÁO HIỆN TẠI</h5>
                            ${
                            (may_phat_dien[i].Alarm != "") ? `<div class="alert-item alert-high">
                                <div class="alert-icon">🔴</div>
                                <div class="alert-content">
                                    <div class="alert-title">Alarm</div>
                                    <div class="alert-desc">${may_phat_dien[i].Alarm}</div>
                                    <div class="alert-time">-</div>
                                </div>
                            </div>  ` : "Không có cảnh báo"
                            }
            
                  
                        </div>
                        `)
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


    // var axisCM = CHART_REAL_TIME.yAxes.push(new am4charts.ValueAxis());
    // axisCM.title.text = "Mực nước (cm)";
    // axisCM.title.fontSize = 10;
    // // axisCM.title.fill = am4core.color("#fff");
    // axisCM.renderer.opposite = true;
    // // axisCM.renderer.labels.template.fill = am4core.color("#fff");
    // axisCM.renderer.labels.template.fontSize = 10;

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

    // var sM_dynamic = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    // sM_dynamic.name = "Mực nước động";
    // sM_dynamic.dataFields.valueY = "valueDynamicM";
    // sM_dynamic.yAxis = axisM;
    // baseColumnStyle(sM_dynamic);

    // sM_dynamic.columns.template.fill = am4core.color("#ffffff");   // trắng
    // sM_dynamic.columns.template.stroke = am4core.color("#cfd7e6");   // viền nhẹ
    // sM_dynamic.columns.template.tooltipText =
    //     "{categoryX}\n{valueDynamicM} m (động)\nTổng: {valueYTotal} m";

    // --- CM (trục phải) ---
    var sCM_static = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    sCM_static.name = "Mực nước hiện tại";
    sCM_static.dataFields.valueY = "valueCM";
    // sCM_static.yAxis = axisCM;
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

    // var sCM_dynamic = CHART_REAL_TIME.series.push(new am4charts.ColumnSeries());
    // sCM_dynamic.name = "Mực nước động";
    // sCM_dynamic.dataFields.valueY = "valueDynamicCM";
    // sCM_dynamic.yAxis = axisCM;
    // baseColumnStyle(sCM_dynamic);
    // sCM_dynamic.hiddenInLegend = true;


    // sCM_dynamic.columns.template.fill = am4core.color("#ffffff");
    // sCM_dynamic.columns.template.stroke = am4core.color("#cfd7e6");
    //sCM_dynamic.columns.template.tooltipText =
    //     "{categoryX}\n{valueDynamicCM} cm (động)\nTổng: {valueYTotal} cm";

    // Nhãn tổng trên đỉnh cột (đơn vị đúng theo trạm)
    // var label = sM_dynamic.bullets.push(new am4charts.LabelBullet());
    // label.label.fontSize = 11;
    // label.label.dy = -10;
    // label.label.text = "{valueY} (m)";

    // label.label.fill = am4core.color("#fff");

    // var label2 = sCM_dynamic.bullets.push(new am4charts.LabelBullet());
    // label2.label.fontSize = 11;
    // label2.label.dy = -10;
    // label2.label.text = "{valueY} (cm)";


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