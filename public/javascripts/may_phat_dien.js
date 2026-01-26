// var raw_data = may_phat_dien2;
function createGauge(id, name, min, max, unit, value) {
    let chart = echarts.init(document.getElementById(id));
    let option = {
        series: [{
            type: 'gauge',
            min,
            max,
            progress: { show: true, width: 25 },
            axisLine: {
                lineStyle: {
                    width: 18,
                    color: [
                        [0.6, '#2ecc71'],
                        [0.85, '#f1c40f'],
                        [1, '#e74c3c']
                    ]
                }
            },
            axisLabel: {
                fontSize: 9,       // số nhỏ lại
                distance: 10,      // đẩy số ra xa
                color: '#ccc'
            },
            pointer: { width: 6 },
            detail: {
                valueAnimation: true,
                formatter: `{value} ${unit}`,
                color: '#fff',
                fontSize: 12
            },
            // title: {
            //     offsetCenter: [0, '80%'],
            //     color: '#aaa',
            // },
            data: [{ value, name }]
        }]
    };

    chart.setOption(option);
    return chart;
}

// $(document).ready(function () {
//     for (let i = 0; i < raw_data.length; i++) {
//         if (raw_data[i].MeterCode && raw_data[i].Speed_u && raw_data[i].Speed_v != null) {
//             let toc_do = createGauge("toc_do_" + raw_data[i].MeterCode, "", 0, 3000, raw_data[i].Speed_u, raw_data[i].Speed_v);
//         }

//         if (raw_data[i].MeterCode && raw_data[i].V_Bat_u && raw_data[i].V_Bat_v != null) {
//             let dien_ap = createGauge("dien_ap_" + raw_data[i].MeterCode, "", 0, 36, raw_data[i].V_Bat_u, raw_data[i].V_Bat_v);
//         }

//         if (raw_data[i].MeterCode && raw_data[i].Tem_W_u && raw_data[i].Tem_W_v != null) {
//             let nhiet_do = createGauge("nhiet_do_" + raw_data[i].MeterCode, "", 0, 150, raw_data[i].Tem_W_u, raw_data[i].Tem_W_v);
//         }

//         if (raw_data[i].MeterCode && raw_data[i].P_Oil_u && raw_data[i].P_Oil_v != null) {
//             let ap_suat = createGauge("ap_suat_" + raw_data[i].MeterCode, "", 0, 300, raw_data[i].P_Oil_u, raw_data[i].P_Oil_v);
//         }
//     }
// })


function show_if_null_number(x) {
    if (x === "" || x === null || x === undefined) return "-";

    const num = Number(x);
    if (isNaN(num)) return "-";

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "&nbsp;";
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



// let TYPE = "";
// let METERCODE;
$(document).ready(function () {
    $(document).on("click", ".dien_ap_ra_pha_btn", function () {
        TYPE = "dien_ap_ra_pha_btn";
        METERCODE = $(this).attr("metercode");
        let meter_name = $(this).attr("meter_name");
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));

        $("#lich_su_du_lieu").modal("show");
        $('#modal_title').html("Điện áp đầu ra - " + meter_name);        
        get_data();
    })

    $(document).on("click", ".dien_ap_luoi_btn", function () {
        TYPE = "dien_ap_luoi_btn";
        METERCODE = $(this).attr("metercode");
        let meter_name = $(this).attr("meter_name");
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));

        $("#lich_su_du_lieu").modal("show");
        $('#modal_title').html("Điện áp lưới - " + meter_name);
        get_data();
    })

    $(document).on("click", ".dien_ap_ra_day_btn", function () {
        TYPE = "dien_ap_ra_day_btn";
        METERCODE = $(this).attr("metercode");
        let meter_name = $(this).attr("meter_name");
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));

        $("#lich_su_du_lieu").modal("show");
        $('#modal_title').html("Điện áp đầu ra - " + meter_name);
        get_data();
    })
})

function init_data(){
    get_data();
}

$(document).ready(function () {
    $("#export_data").on("click", function () {
        let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
        let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
        let MeterCode = METERCODE;
        window.open("/monitoring/export_may_phat_dien?start_date=" + start_date + "&end_date=" + end_date + "&MeterCode=" + MeterCode + "&type=" + TYPE, "_blank");
    })
})

function get_data() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    let MeterCode = METERCODE;
    $.ajax({
        url: "/monitoring/get/may_phat_dien_data",
        type: "GET",
        data: { MeterCode, start_date, end_date },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let data = res.data;
            switch (TYPE) {
                case "dien_ap_luoi_btn":
                    $("#may_phat_dien_thead").empty();
                    $("#may_phat_dien_thead").append(`
                        <th>Thời gian</th>
                        <th>Pha</th>
                        <th>Điện áp</th>
                        <th>Tần số dây</th>
                        <th>Dây</th>
                        <th>Điện áp</th>
                
                        `);
                    $("#may_phat_dien_tbody").empty();
                    for (let i = 0; i < data.length; i++) {

                        $("#may_phat_dien_tbody").append(`
                            <tr>
                            <td rowspan="3">HT: ${new Date(data[i].server_time).toLocaleString('en-GB')} <br> CT: ${new Date(data[i].meter_time).toLocaleString('en-GB')}</td>
                            <td>Pha A</td>
                            <td>${show_if_null_number(data[i].V_A2_v) + return_unit_html(data[i].V_A2_u)}</td>
                            <td rowspan="3">${show_if_null_number(data[i].Freq2_v) + return_unit_html(data[i].Freq2_u)}</td>
                            <td>AB</td>
                            <td>${show_if_null_number(data[i].V_AB2_v) + return_unit_html(data[i].V_AB2_u)}</td>
                            </tr>
                            <tr>
                            <td>Pha B</td>
                            <td>${show_if_null_number(data[i].V_B2_v) + return_unit_html(data[i].V_B2_u)}</td>
                            <td>BC</td>
                            <td>${show_if_null_number(data[i].V_BC2_v) + return_unit_html(data[i].V_BC2_u)}</td>
                            </tr>
                            <tr>
                            <td>Pha C</td>
                            <td>${show_if_null_number(data[i].V_C2_v) + return_unit_html(data[i].V_C2_u)}</td>
                            <td>BC</td>
                            <td>${show_if_null_number(data[i].V_CA2_v) + return_unit_html(data[i].V_CA2_u)}</td>
                            </tr>
                        `)
                    }
                    break;
                case "dien_ap_ra_pha_btn":
                    $("#may_phat_dien_thead").empty();
                    $("#may_phat_dien_thead").append(`
                            <th>Thời gian</th>
                            <th>Pha</th>
                            <th>Điện áp</th>
                            <th>Dòng diện</th>
                            <th>Hệ số góc</th>
                            <th>Công suất P</th>
                            <th>Công suất Q</th>
                            <th>Công suất S</th>
                            <th>Tần số dây</th>
                            `);
                    $("#may_phat_dien_tbody").empty();
                    for (let i = 0; i < data.length; i++) {

                        $("#may_phat_dien_tbody").append(`
                                <tr>
                                <td rowspan="4">HT: ${new Date(data[i].server_time).toLocaleString('en-GB')} <br> CT: ${new Date(data[i].meter_time).toLocaleString('en-GB')}</td>
                                <td>Pha A</td>
                                <td>${show_if_null_number(data[i].V_A_v) + return_unit_html(data[i].V_A_u)}</td>
                                <td>${show_if_null_number(data[i].I_A_v) + return_unit_html(data[i].I_A_u)}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td rowspan="4">${show_if_null_number(data[i].Freq_v) + return_unit_html(data[i].Freq_u)}</td>
                                </tr>
                                <tr>
                                <td>Pha B</td>
                                <td>${show_if_null_number(data[i].V_B_v) + return_unit_html(data[i].V_B_u)}</td>
                                <td>${show_if_null_number(data[i].I_B_v) + return_unit_html(data[i].I_B_u)}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                </tr>
                                <tr>
                                <td>Pha C</td>
                                <td>${show_if_null_number(data[i].V_C_v) + return_unit_html(data[i].V_C_u)}</td>
                                <td>${show_if_null_number(data[i].I_C_v) + return_unit_html(data[i].I_C_u)}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                </tr>
                                <tr>
                                <td>Tổng</td>
                                <td>-</td>
                                <td>${show_if_null_number(data[i].I_N_v) + return_unit_html(data[i].I_N_u)}</td>
                                <td>${show_if_null_number(data[i].PF_T_v) + return_unit_html(data[i].PF_T_u)}</td>
                                <td>${show_if_null_number(data[i].A_Inst_T_v) + return_unit_html(data[i].A_Inst_T_u)}</td>
                                <td>${show_if_null_number(data[i].Q_Inst_T_v) + return_unit_html(data[i].Q_Inst_T_u)}</td>
                                <td>${show_if_null_number(data[i].S_Inst_T_v) + return_unit_html(data[i].S_Inst_T_u)}</td>
                                </tr>
                            `)
                    }
                    break;
                case "dien_ap_ra_day_btn":
                    $("#may_phat_dien_thead").empty();
                    $("#may_phat_dien_thead").append(`
                        <th>Thời gian</th>
                        <th>Dây</th>
                        <th>Điện áp</th>
                        `);
                    $("#may_phat_dien_tbody").empty();
                    for (let i = 0; i < data.length; i++) {

                        $("#may_phat_dien_tbody").append(`
                            <tr>
                            <td rowspan="3">HT: ${new Date(data[i].server_time).toLocaleString('en-GB')} <br> CT: ${new Date(data[i].meter_time).toLocaleString('en-GB')}</td>
                            <td>AB</td>
                            <td>${show_if_null_number(data[i].V_AB_v) + return_unit_html(data[i].V_AB_u)}</td>
                            </tr>
                            <tr>
                            <td>BC</td>
                            <td>${show_if_null_number(data[i].V_BC_v) + return_unit_html(data[i].V_BC_u)}</td>
                 
                            </tr>
                            <tr>
                            <td>CA</td>
                            <td>${show_if_null_number(data[i].V_CA_v) + return_unit_html(data[i].V_CA_u)}</td>
                            </tr>
                            
                        `)
                    }
                    break;
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
    $(document).on("click", ".close-popup", function () {
        $("#may_phat_dien_history_popup").removeClass("active");
    })
})

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