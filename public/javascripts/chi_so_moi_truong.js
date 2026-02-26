
var ROLE = "admin"
var TABS = []
// var TYPE = 1;
$(document).ready(function () {
    $.ajax({
        url: "/get/lang",
        type: "GET",
        success: function (res) {
            // LANG = res.lang;
            // console.log(LANG)
            ROLE = res.role;
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        }
    })
});




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


$(document).ready(function () {
    get_data_nha_may();
})

function get_data_nha_may() {
    $.ajax({
        url: "/monitoring/get/chi_so_moi_truong",
        type: "GET",
        data: {},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let general = res.general;
            let nuoc_tho = res.nuoc_tho;
            let tieu_chuan_nuoc_sach = res.tieu_chuan_nuoc_sach;
            let nuoc_sach = res.nuoc_sach;
            let tieu_chuan_nuoc_tho = res.tieu_chuan_nuoc_tho;

            // nước thô
            $("#nuoc_tho_container").empty();

            if (nuoc_tho.length > 0) {
                let str = "";
                for (let i = 0; i < nuoc_tho.length; i++) {
                    str += `
                <div class="col-12 mb-2">
                <div class="water-quality-card" data-type="raw">
                  <h5><span>${show_empty_if_null_text(nuoc_tho[i].name)}</span></h5>
                  <div class="parameter-grid">
                      <div class="parameter-item">
                          <div class="parameter-name">Nhiệt độ</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value" >${show_empty_if_null_text(nuoc_tho[i].nhiet_do)}</div>
                              <div class="parameter-unit">°C</div>
                          </div>
                      </div>
                      <div class="parameter-item">
                          <div class="parameter-name">Độ pH</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value raw-ph" >${show_empty_if_null_text(nuoc_tho[i].ph)}</div>
                          </div>
                      </div>
                      <div class="parameter-item">
                          <div class="parameter-name">Độ đục</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value raw-turbidity" >${nuoc_tho[i].do_duc ?? '-'}</div>
                              <div class="parameter-unit">NTU</div>
                          </div>
                          </div>
                      <div class="parameter-item">
                          <div class="parameter-name">Độ cứng</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value" >${(nuoc_tho[i].do_cung ?? '-')}</div>
                              <div class="parameter-unit">mg/l</div>
                          </div>
                      </div>
                  </div>
                  <div class="view-details-btn xem_chi_tiet_du_lieu xem_chi_tiet_nuoc_tho" MeterCode="${nuoc_tho[i].meter_code}" meter_name="${nuoc_tho[i].name}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Xem chi tiết
                  </div>
                </div>
                </div>
                `
                }
                $("#nuoc_tho_container").append(str);
            } else {
                let str = `
                <div class="col-12 mb-2">
                <div class="water-quality-card" data-type="raw">
                  <h5><span>-</span></h5>
                  <div class="parameter-grid">
                      <div class="parameter-item">
                          <div class="parameter-name">Nhiệt độ</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value" >-</div>
                              <div class="parameter-unit">°C</div>
                          </div>
                      </div>
                      <div class="parameter-item">
                          <div class="parameter-name">Độ pH</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value raw-ph" >-</div>
                          </div>
                      </div>
                      <div class="parameter-item">
                          <div class="parameter-name">Độ đục</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value raw-turbidity" >-</div>
                              <div class="parameter-unit">NTU</div>
                          </div>
                          </div>
                      <div class="parameter-item">
                          <div class="parameter-name">Độ cứng</div>
                          <div class="d-flex align-items-center">
                              <div class="parameter-value" >-</div>
                              <div class="parameter-unit">mg/l</div>
                          </div>
                      </div>
                  </div>
                  
                </div>
                </div>
                `
                $("#nuoc_tho_container").append(str);
            }

            // $(".name_nuoc_tho").html(show_empty_if_null_text(nuoc_tho.name));
            // $(".name_nuoc_sach").html(show_empty_if_null_text(nuoc_sach.name));
            // $("#meter_code_nuoc_tho").val(nuoc_tho.meter_code);
            // $("#meter_code_nuoc_tho").attr('data-title', nuoc_tho.name);
            // $("#meter_code_nuoc_sach").val(nuoc_sach.meter_code);
            // $("#meter_code_nuoc_sach").attr('data-title', nuoc_sach.name);

            $("#chat_luong_nuoc_tho").html("-");
            $("#chat_luong_nuoc_sach").html("-");
            $("#thoi_gian").html(general.thoi_gian);
            $("#trang_thai").html("-");
            $("#he_thong_giam_sat").html(general.he_thong_giam_sat);
            // $("#nuoc_tho_do_duc").html(nuoc_tho.do_duc ?? '-');
            // $("#nuoc_tho_ph").html(nuoc_tho.ph);

            // if (nuoc_tho.tt_ph == 1) {
            //   $('.nuoc_tho_ph').html("Bình thường").removeClass('status-warning').addClass('status-good');
            // } else {
            //   $('.nuoc_tho_ph').html("Không đạt").removeClass('status-good').addClass('status-warning');
            // }
            // $("#nuoc_tho_nhiet_do").html(nuoc_tho.nhiet_do);

            // if (nuoc_tho.tt_nhiet_do == 1) {
            //   $('.nuoc_tho_nhiet_do').html("Bình thường").removeClass('status-warning').addClass('status-good');
            // } else {
            //   $('.nuoc_tho_nhiet_do').html("Không đạt").removeClass('status-good').addClass('status-warning');
            // }


            // $("#nuoc_tho_do_cung").html(nuoc_tho.do_cung ?? '-');

            // nước sạch
            $("#nuoc_sach_container").empty();

            if (nuoc_sach.length > 0) {
                let str = "";
                for (let i = 0; i < nuoc_sach.length; i++) {
                    str += `
                <div class="col-12 mb-2">
                <div class="water-quality-card" data-type="clean">
                  <h5><span>${show_empty_if_null_text(nuoc_sach[i].name)}</span></h5>
                  <div class="parameter-grid">
                    <div class="parameter-item">
                      <div class="parameter-name">Nhiệt độ</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-temp">${show_empty_if_null_text(nuoc_sach[i].nhiet_do)}</div>
                        <div class="parameter-unit">°C</div>
                      </div>
                      ${(nuoc_sach[i].nhiet_do == null) ? "" : ((nuoc_sach[i].tt_nhiet_do == 1) ? '<span class="parameter-status status-good">Bình thường</span>' : '<span class="parameter-status status-warning">Không đạt</span>')}
                      </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Độ pH</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-ph">${show_empty_if_null_text(nuoc_sach[i].ph)}</div>
                      </div>
                      ${(nuoc_sach[i].ph == null) ? "" : ((nuoc_sach[i].tt_ph == 1) ? '<span class="parameter-status status-good">Bình thường</span>' : '<span class="parameter-status status-warning">Không đạt</span>')}                
                      </div>
      
                    <div class="parameter-item">
                      <div class="parameter-name">Clo dư</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-chlorine">${show_empty_if_null_text(nuoc_sach[i].clo_du)}</div>
                        <div class="parameter-unit">mg/l</div>
                      </div>
                      ${(nuoc_sach[i].clo_du == null) ? "" : ((nuoc_sach[i].tt_clo_du == 1) ? '<span class="parameter-status status-good">Bình thường</span>' : '<span class="parameter-status status-warning">Không đạt</span>')}                
                      </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Độ đục</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-turbidity">${nuoc_sach[i].do_duc ?? '-'}</div>
                        <div class="parameter-unit">NTU</div>
                      </div>
                      ${(nuoc_sach[i].do_duc == null) ? "" : ((nuoc_sach[i].tt_do_duc == 1) ? '<span class="parameter-status status-good">Bình thường</span>' : '<span class="parameter-status status-warning">Không đạt</span>')}                
                      </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Độ mặn</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value">${nuoc_sach.do_man ?? '-'}</div>
                        <div class="parameter-unit">%</div>
                      </div>
                      ${(nuoc_sach[i].do_man == null) ? "" : ((nuoc_sach[i].tt_do_man == 1) ? '<span class="parameter-status status-good">Bình thường</span>' : '<span class="parameter-status status-warning">Không đạt</span>')}                
                      </div>
                    <div class="parameter-item">
                      <div class="parameter-name">EC</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-ec">${nuoc_sach[i].EC ?? '-'}</div>
                        <div class="parameter-unit">uS/cm</div>
                      </div>
                      ${(nuoc_sach[i].EC == null) ? "" : ((nuoc_sach[i].tt_EC == 1) ? '<span class="parameter-status status-good">Bình thường</span>' : '<span class="parameter-status status-warning">Không đạt</span>')}                
                      </div>
                  </div>
                  <div class="view-details-btn xem_chi_tiet_du_lieu xem_chi_tiet_nuoc_sach" MeterCode="${nuoc_sach[i].meter_code}" meter_name="${nuoc_sach[i].name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Xem chi tiết
                  </div>
                  </div>
              </div>
                `
                }
                $("#nuoc_sach_container").append(str);
            } else {
                let str = `
                <div class="col-12 mb-2">
                <div class="water-quality-card" data-type="clean">
                  <h5><span>-</span></h5>
                  <div class="parameter-grid">
                    <div class="parameter-item">
                      <div class="parameter-name">Nhiệt độ</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-temp">-</div>
                        <div class="parameter-unit">°C</div>
                      </div>
                      </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Độ pH</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-ph">-</div>
                      </div>
                      </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Clo dư</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-chlorine">-</div>
                        <div class="parameter-unit">mg/l</div>
                      </div>
                    </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Độ đục</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-turbidity">-</div>
                        <div class="parameter-unit">NTU</div>
                      </div>
                    </div>
                    <div class="parameter-item">
                      <div class="parameter-name">Độ mặn</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value">-</div>
                        <div class="parameter-unit">%</div>
                      </div>
                    </div>
                    <div class="parameter-item">
                      <div class="parameter-name">EC</div>
                      <div class="d-flex align-items-center">
                        <div class="parameter-value clean-ec">-</div>
                        <div class="parameter-unit">uS/cm</div>
                      </div>
                    </div>
                  </div>
                 
                  </div>
              </div>
                `

                $("#nuoc_sach_container").append(str);
            }


            // $("#nuoc_sach_nhiet_do").html(nuoc_sach.nhiet_do);
            // if (nuoc_sach.tt_nhiet_do == 1) {
            //   $('.nuoc_sach_nhiet_do').html("Bình thường").removeClass('status-warning').addClass('status-good');
            // } else {
            //   $('.nuoc_sach_nhiet_do').html("Không đạt").removeClass('status-good').addClass('status-warning');
            // }
            // $("#nuoc_sach_ph").html(nuoc_sach.ph);
            // if (nuoc_sach.tt_ph == 1) {
            //   $('.nuoc_sach_ph').html("Bình thường").removeClass('status-warning').addClass('status-good');
            // } else {
            //   $('.nuoc_sach_ph').html("Không đạt").removeClass('status-good').addClass('status-warning');
            // }
            // $("#nuoc_sach_do_man").html(nuoc_sach.do_man);
            // $("#nuoc_sach_clo_du").html(nuoc_sach.clo_du);
            // if (nuoc_sach.tt_clo_du == 1) {
            //   $('.nuoc_sach_clo_du').html("Bình thường").removeClass('status-warning').addClass('status-good');
            // } else {
            //   $('.nuoc_sach_clo_du').html("Không đạt").removeClass('status-good').addClass('status-warning');
            // }
            // $("#nuoc_sach_do_duc").html(nuoc_sach.do_duc ?? '-');
            // if (nuoc_sach.tt_do_duc == 1) {
            //   $('.nuoc_sach_do_duc').html("Bình thường").removeClass('status-warning').addClass('status-good');
            // } else {
            //   $('.nuoc_sach_do_duc').html("Không đạt").removeClass('status-good').addClass('status-warning');
            // }
            // $("#nuoc_sach_EC").html(nuoc_sach.EC ?? '-');


            $("#tc_nuoc_tho_do_duc").html(tieu_chuan_nuoc_tho.do_duc);
            $("#tc_nuoc_tho_ph_min").html(tieu_chuan_nuoc_tho.ph_min);
            $("#tc_nuoc_tho_ph_max").html(tieu_chuan_nuoc_tho.ph_max);
            $("#tc_nuoc_tho_nhiet_do").html(tieu_chuan_nuoc_tho.nhiet_do);

            $("#tc_nuoc_sach_do_duc").html(tieu_chuan_nuoc_sach.do_duc);
            $("#tc_nuoc_sach_ph_min").html(tieu_chuan_nuoc_sach.ph_min);
            $("#tc_nuoc_sach_ph_max").html(tieu_chuan_nuoc_sach.ph_max);
            $("#tc_nuoc_sach_clo_du_min").html(tieu_chuan_nuoc_sach.clo_du_min);
            $("#tc_nuoc_sach_clo_du_max").html(tieu_chuan_nuoc_sach.clo_du_max);
            $("#tc_nuoc_sach_EC").html(tieu_chuan_nuoc_sach.EC);
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
    $(document).on("click", ".xem_chi_tiet_nuoc_tho", function () {
        $("#lich_su_du_lieu").modal("show");
        $("#modal_title").html($(this).attr("meter_name"));
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
        TYPE = 1;
        METERCODE = $(this).attr("MeterCode");
        get_and_render_chart_nuoc_tho();
    })
})

$(document).ready(function () {
    $(document).on("click", ".xem_chi_tiet_nuoc_sach", function () {
        $("#lich_su_du_lieu").modal("show");
        $("#modal_title").html($(this).attr("meter_name"));
        $("#meter_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#meter_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#meter_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
        TYPE = 2;
        METERCODE = $(this).attr("MeterCode");
        get_and_render_chart_nuoc_sach();
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



var METERCODE = null;

function get_and_render_chart_nuoc_tho() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    // METERCODE = $('#meter_code_nuoc_tho').val();
    $.ajax({
        url: "/overview/get/du_lieu_nuoc",
        type: "GET",
        data: { start_date, end_date, meter_code: METERCODE },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            nuoc_tho_render_chart(res.data);
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
function nuoc_tho_render_chart(raw_data) {
    let data = [];
    for (let i = 0; i < raw_data.length; i++) {
        let x = {
            time: new Date(raw_data[i].MeterTime),
            do_duc: stringtonum(raw_data[i].DoDuc),
            ph: stringtonum(raw_data[i].PH),
            nhiet_do: stringtonum(raw_data[i].Temp),
            do_cung: null
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

    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 60;
    dateAxis.renderer.labels.template.fontSize = 11;

    dateAxis.renderer.labels.template.fill = am4core.color("#6b7280");
    dateAxis.renderer.grid.template.strokeOpacity = 0.05;
    dateAxis.dateFormats.setKey("hour", "HH:mm");
    dateAxis.dateFormats.setKey("day", "dd/MM");
    dateAxis.periodChangeDateFormats.setKey("hour", "dd/MM");
    dateAxis.dateFormats.setKey("month", "MM/yyyy");
    dateAxis.periodChangeDateFormats.setKey("day", "MM/yyyy");
    dateAxis.tooltipDateFormat = "dd/MM/yyyy HH:mm";
    // dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");
    // dateAxis.title.fill = am4core.color("#ffffffff");
    // dateAxis.renderer.line.stroke = am4core.color("#ffffffff");
    CHART.cursor = new am4charts.XYCursor();
    CHART.cursor.fullWidthLineX = true;
    CHART.cursor.xAxis = dateAxis;
    CHART.cursor.lineX.strokeWidth = 0;
    CHART.cursor.lineX.fill = am4core.color("#000000ff");
    CHART.cursor.lineX.fillOpacity = 0.1;
    CHART.legend = new am4charts.Legend();
    CHART.legend.labels.template.fill = am4core.color("#383838ff");

    var NTU = CHART.yAxes.push(new am4charts.ValueAxis());
    NTU.tooltip.disabled = false;
    NTU.renderer.ticks.template.disabled = true;
    NTU.renderer.axisFills.template.disabled = true;
    // NTU.renderer.line.stroke = am4core.color("#ffffffff");
    NTU.renderer.line.strokeOpacity = 0.5;
    NTU.renderer.line.strokeWidth = 1;
    NTU.title.text = "NTU"
    NTU.renderer.opposite = false;
    NTU.extraMin = 0.1;
    NTU.extraMax = 0.1;
    // NTU.renderer.labels.template.fill = am4core.color("#ffffff");
    // NTU.title.fill = am4core.color("#ffffffff");


    var C = CHART.yAxes.push(new am4charts.ValueAxis());
    C.tooltip.disabled = false;
    C.renderer.ticks.template.disabled = true;
    C.renderer.axisFills.template.disabled = true;
    // C.renderer.line.stroke = am4core.color("#ffffffff");
    C.renderer.line.strokeOpacity = 0.5;
    C.renderer.line.strokeWidth = 1;
    C.title.text = "°C"
    C.renderer.opposite = false;
    C.extraMin = 0.1;
    C.extraMax = 0.1;
    // C.renderer.labels.template.fill = am4core.color("#ffffff");
    // C.title.fill = am4core.color("#ffffffff");

    var mgl = CHART.yAxes.push(new am4charts.ValueAxis());
    mgl.tooltip.disabled = false;
    mgl.renderer.ticks.template.disabled = true;
    mgl.renderer.axisFills.template.disabled = true;
    // mgl.renderer.line.stroke = am4core.color("#ffffffff");
    mgl.renderer.line.strokeOpacity = 0.5;
    mgl.renderer.line.strokeWidth = 1;
    mgl.title.text = "mg/l"
    mgl.renderer.opposite = true;
    mgl.extraMin = 0.1;
    mgl.extraMax = 0.1;
    // mgl.renderer.labels.template.fill = am4core.color("#ffffff");
    // mgl.title.fill = am4core.color("#ffffffff");

    var ph = CHART.yAxes.push(new am4charts.ValueAxis());
    ph.tooltip.disabled = false;
    ph.renderer.ticks.template.disabled = true;
    ph.renderer.axisFills.template.disabled = true;
    // ph.renderer.line.stroke = am4core.color("#ffffffff");
    ph.renderer.line.strokeOpacity = 0.5;
    ph.renderer.line.strokeWidth = 1;
    ph.title.text = ""
    ph.renderer.opposite = true;
    ph.extraMin = 0.1;
    ph.extraMax = 0.1;
    // ph.renderer.labels.template.fill = am4core.color("#ffffff");
    // ph.title.fill = am4core.color("#ffffffff");

    var series;
    series = CHART.series.push(new am4charts.LineSeries());
    series.yAxis = ph;

    series.dataFields.valueY = "ph";
    series.dataFields.dateX = "time";
    series.title = "Ph";
    series.strokeWidth = 3;
    series.tensionX = 1;
    series.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series.tooltipText = "Độ pH" + ": {valueY} ";
    series.name = "Độ pH"
    series.tooltip.pointerOrientation = "horizontal";
    series.fill = am4core.color("#00FFD5");
    series.stroke = am4core.color("#00FFD5");
    series.fillOpacity = 0;

    var series_2;
    series_2 = CHART.series.push(new am4charts.LineSeries());
    series_2.yAxis = NTU;

    series_2.dataFields.valueY = "do_duc";
    series_2.dataFields.dateX = "time";
    series_2.title = "Độ đục";
    series_2.strokeWidth = 3;
    series_2.tensionX = 1;
    series_2.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_2.tooltipText = "Độ đục" + ": {valueY} " + "(NTU)";
    series_2.name = "Độ đục"
    series_2.tooltip.pointerOrientation = "horizontal";
    series_2.fill = am4core.color("#1584b0");
    series_2.stroke = am4core.color("#00BFFF");
    series_2.fillOpacity = 0;


    var series_3;
    series_3 = CHART.series.push(new am4charts.LineSeries());
    series_3.yAxis = C;

    series_3.dataFields.valueY = "nhiet_do";
    series_3.dataFields.dateX = "time";
    series_3.title = "Nhiệt độ";
    series_3.strokeWidth = 3;
    series_3.tensionX = 1;
    series_3.showOnInit = true;
    series_3.tooltipText = "Nhiệt độ" + ": {valueY} " + "(°C)";
    series_3.name = "Nhiệt độ"
    series_3.tooltip.pointerOrientation = "horizontal";
    series_3.fill = am4core.color("#FF4D00");
    series_3.stroke = am4core.color("#FF4D00");
    series_3.fillOpacity = 0;


    var series_4;
    series_4 = CHART.series.push(new am4charts.LineSeries());
    series_4.yAxis = mgl;

    series_4.dataFields.valueY = "do_cung";
    series_4.dataFields.dateX = "time";
    series_4.title = "Độ cứng";
    series_4.strokeWidth = 3;
    series_4.tensionX = 1;
    series_4.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_4.tooltipText = "Độ cứng" + ": {valueY} " + "(mg/l)";
    series_4.name = "Độ cứng"
    series_4.tooltip.pointerOrientation = "horizontal";
    series_4.tooltip.label.fill = am4core.color("#090909ff");   // màu chữ
    // series_4.tooltip.background.fill = am4core.color("#FFD700"); // màu nền
    series_4.fill = am4core.color("#FFD700");
    series_4.stroke = am4core.color("#FFD700");
    series_4.fillOpacity = 0;
}



function get_and_render_chart_nuoc_sach() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    $.ajax({
        url: "/overview/get/du_lieu_nuoc",
        type: "GET",
        data: { start_date, end_date, meter_code: METERCODE },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            nuoc_sach_render_chart(res.data);
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

function nuoc_sach_render_chart(raw_data) {
    let data = [];
    for (let i = 0; i < raw_data.length; i++) {
        let x = {
            time: new Date(raw_data[i].MeterTime),
            nhiet_do: stringtonum(raw_data[i].Temp),
            ph: stringtonum(raw_data[i].PH),
            do_man: stringtonum(raw_data[i].DoManPer),
            clo_du: stringtonum(raw_data[i].CloDu),
            do_duc: stringtonum(raw_data[i].DoDuc),
            EC: stringtonum(raw_data[i].EC)

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
    // dateAxis.renderer.labels.template.fill = am4core.color("#6b7280");
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
    CHART.legend.labels.template.fill = am4core.color("#383838ff");

    var NTU = CHART.yAxes.push(new am4charts.ValueAxis());
    NTU.tooltip.disabled = false;
    NTU.renderer.ticks.template.disabled = true;
    NTU.renderer.axisFills.template.disabled = true;
    // NTU.renderer.line.stroke = am4core.color("#ffffffff");
    NTU.renderer.line.strokeOpacity = 0.5;
    NTU.renderer.line.strokeWidth = 1;
    NTU.title.text = "NTU"
    NTU.renderer.opposite = false;
    NTU.extraMin = 0.1;
    NTU.extraMax = 0.1;
    // NTU.renderer.labels.template.fill = am4core.color("#ffffffff");
    // NTU.title.fill = am4core.color("#ffffffff");


    var C = CHART.yAxes.push(new am4charts.ValueAxis());
    C.tooltip.disabled = false;
    C.renderer.ticks.template.disabled = true;
    C.renderer.axisFills.template.disabled = true;
    // C.renderer.line.stroke = am4core.color("#ffffffff");
    C.renderer.line.strokeOpacity = 0.5;
    C.renderer.line.strokeWidth = 1;
    C.title.text = "°C"
    C.renderer.opposite = false;
    C.extraMin = 0.1;
    C.extraMax = 0.1;
    // C.renderer.labels.template.fill = am4core.color("#ffffff");
    // C.title.fill = am4core.color("#ffffffff");


    var mgl = CHART.yAxes.push(new am4charts.ValueAxis());
    mgl.tooltip.disabled = false;
    mgl.renderer.ticks.template.disabled = true;
    mgl.renderer.axisFills.template.disabled = true;
    // mgl.renderer.line.stroke = am4core.color("#ffffffff");
    mgl.renderer.line.strokeOpacity = 0.5;
    mgl.renderer.line.strokeWidth = 1;
    mgl.title.text = "mg/l"
    mgl.renderer.opposite = true;
    mgl.extraMin = 0.1;
    mgl.extraMax = 0.1;
    // mgl.renderer.labels.template.fill = am4core.color("#ffffff");
    // mgl.title.fill = am4core.color("#ffffffff");


    var ph = CHART.yAxes.push(new am4charts.ValueAxis());
    ph.tooltip.disabled = false;
    ph.renderer.ticks.template.disabled = true;
    ph.renderer.axisFills.template.disabled = true;
    // ph.renderer.line.stroke = am4core.color("#ffffffff");
    ph.renderer.line.strokeOpacity = 0.5;
    ph.renderer.line.strokeWidth = 1;
    ph.title.text = ""
    ph.renderer.opposite = true;
    ph.extraMin = 0.1;
    ph.extraMax = 0.1;
    // ph.renderer.labels.template.fill = am4core.color("#ffffff");
    // ph.title.fill = am4core.color("#ffffffff");


    var per = CHART.yAxes.push(new am4charts.ValueAxis());
    per.tooltip.disabled = false;
    per.renderer.ticks.template.disabled = true;
    per.renderer.axisFills.template.disabled = true;
    // per.renderer.line.stroke = am4core.color("#ffffffff");
    per.renderer.line.strokeOpacity = 0.5;
    per.renderer.line.strokeWidth = 1;
    per.title.text = "%"
    per.renderer.opposite = true;
    per.extraMin = 0.1;
    per.extraMax = 0.1;
    // per.renderer.labels.template.fill = am4core.color("#ffffff");
    // per.title.fill = am4core.color("#ffffffff");



    var uscm = CHART.yAxes.push(new am4charts.ValueAxis());
    uscm.tooltip.disabled = false;
    uscm.renderer.ticks.template.disabled = true;
    uscm.renderer.axisFills.template.disabled = true;
    // uscm.renderer.line.stroke = am4core.color("#ffffffff");
    uscm.renderer.line.strokeOpacity = 0.5;
    uscm.renderer.line.strokeWidth = 1;
    uscm.title.text = "uS/cm"
    uscm.renderer.opposite = true;
    uscm.extraMin = 0.1;
    uscm.extraMax = 0.1;
    // uscm.renderer.labels.template.fill = am4core.color("#ffffff");
    // uscm.title.fill = am4core.color("#ffffffff");


    var series;
    series = CHART.series.push(new am4charts.LineSeries());
    series.yAxis = ph;

    series.dataFields.valueY = "ph";
    series.dataFields.dateX = "time";
    series.title = "Ph";
    series.strokeWidth = 3;
    series.tensionX = 1;
    series.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series.tooltipText = "Độ pH" + ": {valueY} ";
    series.name = "Độ pH"
    series.tooltip.pointerOrientation = "horizontal";
    series.fill = am4core.color("#00FFD5");
    series.stroke = am4core.color("#00FFD5");
    series.fillOpacity = 0;

    var series_2;
    series_2 = CHART.series.push(new am4charts.LineSeries());
    series_2.yAxis = NTU;

    series_2.dataFields.valueY = "do_duc";
    series_2.dataFields.dateX = "time";
    series_2.title = "Độ đục";
    series_2.strokeWidth = 3;
    series_2.tensionX = 1;
    series_2.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_2.tooltipText = "Độ đục" + ": {valueY} " + "(NTU)";
    series_2.name = "Độ đục"
    series_2.tooltip.pointerOrientation = "horizontal";
    series_2.fill = am4core.color("#00BFFF");
    series_2.stroke = am4core.color("#00BFFF");
    series_2.fillOpacity = 0;

    var series_3;
    series_3 = CHART.series.push(new am4charts.LineSeries());
    series_3.yAxis = C;

    series_3.dataFields.valueY = "nhiet_do";
    series_3.dataFields.dateX = "time";
    series_3.title = "Nhiệt độ";
    series_3.strokeWidth = 3;
    series_3.tensionX = 1;
    series_3.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_3.tooltipText = "Nhiệt độ" + ": {valueY} " + "(°C)";
    series_3.name = "Nhiệt độ"
    series_3.tooltip.pointerOrientation = "horizontal";
    series_3.fill = am4core.color("#FF4D00");
    series_3.stroke = am4core.color("#FF4D00");
    series_3.fillOpacity = 0;

    var series_4;
    series_4 = CHART.series.push(new am4charts.LineSeries());
    series_4.yAxis = mgl;

    series_4.dataFields.valueY = "clo_du";
    series_4.dataFields.dateX = "time";
    series_4.title = "Clo dư";
    series_4.strokeWidth = 3;
    series_4.tensionX = 1;
    series_4.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_4.tooltipText = "Clo dư" + ": {valueY} " + "(mg/l)";
    series_4.name = "Clo dư"
    series_4.tooltip.pointerOrientation = "horizontal";
    series_4.fill = am4core.color("#FFD700");
    series_4.stroke = am4core.color("#FFD700");
    series_4.fillOpacity = 0;

    var series_5;
    series_5 = CHART.series.push(new am4charts.LineSeries());
    series_5.yAxis = per;

    series_5.dataFields.valueY = "do_man";
    series_5.dataFields.dateX = "time";
    series_5.title = "Độ mặn";
    series_5.strokeWidth = 3;
    series_5.tensionX = 1;
    series_5.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_5.tooltipText = "Độ mặn" + ": {valueY} " + "(%)";
    series_5.name = "Độ mặn"
    series_5.tooltip.pointerOrientation = "horizontal";
    series_5.fill = am4core.color("#FF80AB");
    series_5.stroke = am4core.color("#FF80AB");
    series_5.fillOpacity = 0;

    var series_6;
    series_6 = CHART.series.push(new am4charts.LineSeries());
    series_6.yAxis = uscm;

    series_6.dataFields.valueY = "EC";
    series_6.dataFields.dateX = "time";
    series_6.title = "EC";
    series_6.strokeWidth = 3;
    series_6.tensionX = 1;
    series_6.showOnInit = true;
    // series.legendSettings.labelText = translate_text("Sản lượng") + " (m3)";
    series_6.tooltipText = "EC" + ": {valueY} " + "(uS/cm)";
    series_6.name = "EC"
    series_6.tooltip.pointerOrientation = "horizontal";
    series_6.fill = am4core.color("#00FF00");
    series_6.stroke = am4core.color("#00FF00");
    series_6.fillOpacity = 0;
}



function init_data() {
    let active_tab = $("#nuocThoTabs .nav-link.active").attr("id");
    if (active_tab = "tab-chart") {
        if (TYPE == 1) {
            get_and_render_chart_nuoc_tho()
        } else if (TYPE == 2) {
            get_and_render_chart_nuoc_sach()
        }
    } else {
        if (TYPE == 1) {
            get_and_render_table_nuoc_tho()
        } else if (TYPE == 2) {
            get_and_render_table_nuoc_sach()
        }
    }
}

function export_data() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    if (TYPE == 1) {
        window.open("/overview/export_nuoc_tho?start_date=" + start_date + "&end_date=" + end_date + "&MeterCode=" + METERCODE, "_blank");
    } else if (TYPE == 2) {
        window.open("/overview/export_nuoc_sach?start_date=" + start_date + "&end_date=" + end_date + "&MeterCode=" + METERCODE, "_blank");

    }
}

$(document).ready(function () {
    $("#tab-chart").on("click", function () {
        if (TYPE == 1) {
            get_and_render_chart_nuoc_tho()
        } else if (TYPE == 2) {
            get_and_render_chart_nuoc_sach()
        }
    })
    $("#tab-history").on("click", function () {
        if (TYPE == 1) {
            get_and_render_table_nuoc_tho()
        } else if (TYPE == 2) {
            get_and_render_table_nuoc_sach()
        }
    })
})


function get_and_render_table_nuoc_tho() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    $.ajax({
        url: "/overview/get/du_lieu_nuoc",
        type: "GET",
        data: { start_date, end_date, meter_code: METERCODE },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            nuoc_tho_render_table(res.data);
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

function nuoc_tho_render_table(raw_data) {
    $("#history_table_thead").empty();
    $("#history_table_thead").append(
        `
        <tr>
      <th>Thời gian</th>
      <th>Nhiệt độ</th>
      <th>Độ đục</th>
      <th>Độ PH</th>
      <th>Độ cứng</th>
      </tr>
    `
    );
    $("#history_table_tbody").empty();
    if ($.fn.DataTable.isDataTable('#history_table')) {
        $('#history_table').DataTable().clear().destroy();
    }
    $('#history_table').DataTable({
        language: translate_data_table(LANG),
        "lengthMenu": [10, 30, 60],
        "pageLength": 10,
        // "columnDefs": [
        //     { className: "dt-head-center", targets: [0, 1, 2, 3] },
        //     { "orderable": false, "targets": [] },
        //     { "orderable": true, "targets": [0, 1, 2, 3] }
        // ],
        order: [],
        autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
        paging: true,
        searching: false,
        columns: [
            { data: "time", className: "text-center-data-table align-middle" },
            { data: "nhiet_do", className: "text-right-data-table align-middle" },
            { data: "do_duc", className: "text-right-data-table align-middle" },
            { data: "ph", className: "text-right-data-table align-middle" },
            { data: "do_cung", className: "text-right-data-table align-middle" }

        ],
        data: nuoc_tho_modifi_data(raw_data),
    });
}

function nuoc_tho_modifi_data(data) {
    let x = [];
    for (let i = data.length - 1; i >= 0; i--) {
        let y = {
            time: new Date(data[i].MeterTime).toLocaleString('en-GB'),
            nhiet_do: show_if_null_text(data[i].Temp),
            do_duc: show_if_null_text(data[i].DoDuc),
            ph: show_if_null_text(data[i].PH),
            do_cung: show_if_null_text(null),
        }


        x.push(y)
    }
    return x;
}


function get_and_render_table_nuoc_sach() {
    let start_date = $("#meter_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 00:00:00";
    let end_date = $("#meter_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD") + " 23:59:59";
    $.ajax({
        url: "/overview/get/du_lieu_nuoc",
        type: "GET",
        data: { start_date, end_date, meter_code: METERCODE },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            nuoc_sach_render_table(res.data);
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

function nuoc_sach_render_table(raw_data) {
    $("#history_table_thead").empty();
    $("#history_table_thead").append(
        `
      <th>Thời gian</th>
      <th>Nhiệt độ</th>
      <th>Độ đục</th>
      <th>Độ PH</th>
      <th>Độ mặn</th>
      <th>Clo dư</th>
      <th>EC</th>
    `
    );
    $("#history_table_tbody").empty();
    if ($.fn.DataTable.isDataTable('#history_table')) {
        $('#history_table').DataTable().clear().destroy();
    }
    $('#history_table').DataTable({
        language: translate_data_table(LANG),
        "lengthMenu": [10, 30, 60],
        "pageLength": 10,
        "columnDefs": [
            { className: "dt-head-center", targets: [0, 1, 2, 3] },
            { "orderable": false, "targets": [] },
            { "orderable": true, "targets": [0, 1, 2, 3] }
        ],
        autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
        paging: true,
        searching: false,
        columns: [
            { data: "time", className: "text-center-data-table align-middle" },
            { data: "nhiet_do", className: "text-right-data-table align-middle" },
            { data: "do_duc", className: "text-right-data-table align-middle" },
            { data: "ph", className: "text-right-data-table align-middle" },
            { data: "do_man", className: "text-right-data-table align-middle" },
            { data: "clo_du", className: "text-right-data-table align-middle" },
            { data: "EC", className: "text-right-data-table align-middle" },

        ],
        data: nuoc_sach_modifi_data(raw_data),
    });
}

function nuoc_sach_modifi_data(data) {
    let x = [];
    for (let i = data.length - 1; i >= 0; i--) {
        let y = {
            time: new Date(data[i].MeterTime).toLocaleString('en-GB'),
            nhiet_do: show_if_null_text(data[i].Temp),
            ph: show_if_null_text(data[i].PH),
            do_man: show_if_null_text(data[i].DoManPer),
            clo_du: show_if_null_text(data[i].CloDu),
            do_duc: show_if_null_text(data[i].DoDuc),
            EC: show_if_null_text(data[i].EC)
        }


        x.push(y)
    }
    return x;
}


$(document).ready(function () {
    $("#cai_dat_nguong").on("click", function () {
        $("#cai_dat_nguong_modal").modal("show");
        get_standars()
    })
})

function get_standars() {
    $.ajax({
        url: "/overview/get/standards",
        type: "GET",
        data: {},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let standards_nuoc_tho = res.standards_nuoc_tho;
            $("#raw-turbidity-min").val(standards_nuoc_tho.do_duc_min);
            $("#raw-turbidity-max").val(standards_nuoc_tho.do_duc_max);
            $("#raw-ph-min").val(standards_nuoc_tho.ph_min);
            $("#raw-ph-max").val(standards_nuoc_tho.ph_max);


            let standards_nuoc_sach = res.standards_nuoc_sach;
            $("#clean-temp-min").val(standards_nuoc_sach.nhiet_do_min);
            $("#clean-temp-max").val(standards_nuoc_sach.nhiet_do_max);
            $("#clean-ph-min").val(standards_nuoc_sach.ph_min);
            $("#clean-ph-max").val(standards_nuoc_sach.ph_max);
            $("#clean-clo-min").val(standards_nuoc_sach.clo_du_min);
            $("#clean-clo-max").val(standards_nuoc_sach.clo_du_max);
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

// Hàm lưu cài đặt tiêu chuẩn
function saveStandards() {
    // Thu thập tất cả giá trị từ các input
    let standards_nuoc_tho = {
        do_duc_min: ($("#raw-turbidity-min").val() == "") ? null : $("#raw-turbidity-min").val(),
        do_duc_max: ($("#raw-turbidity-max").val() == "") ? null : $("#raw-turbidity-max").val(),
        ph_min: ($("#raw-ph-min").val() == "") ? null : $("#raw-ph-min").val(),
        ph_max: ($("#raw-ph-max").val() == "") ? null : $("#raw-ph-max").val(),
    };
    let standards_nuoc_sach = {
        nhiet_do_min: ($("#clean-temp-min").val() == "") ? null : $("#clean-temp-min").val(),
        nhiet_do_max: ($("#clean-temp-max").val() == "") ? null : $("#clean-temp-max").val(),
        ph_min: ($("#clean-ph-min").val() == "") ? null : $("#clean-ph-min").val(),
        ph_max: ($("#clean-ph-max").val() == "") ? null : $("#clean-ph-max").val(),
        clo_du_min: ($("#clean-clo-min").val() == "") ? null : $("#clean-clo-min").val(),
        clo_du_max: ($("#clean-clo-max").val() == "") ? null : $("#clean-clo-max").val(),
    }
    $.ajax({
        url: "/overview/post/save_standards",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ standards_nuoc_sach: standards_nuoc_sach, standards_nuoc_tho: standards_nuoc_tho }),
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            // if (res.success) {
            //   alert('Đã lưu cài đặt tiêu chuẩn chất lượng nước!');
            // }
            show_notification('Đã lưu cài đặt tiêu chuẩn chất lượng nước!', (res.success) ? "success" : "error");

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
    // Lưu vào localStorage (hoặc gửi lên server)

}


// Hàm đặt lại mặc định
function resetStandards() {
    if (confirm('Bạn có chắc muốn đặt lại tất cả giá trị về mặc định?')) {
        // Reset tất cả input về giá trị mặc định
        get_standars();
    }
}