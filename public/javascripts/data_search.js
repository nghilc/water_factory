let LANG = "vi";
$(document).ready(function(){
    $.ajax({
        url: "/get/lang",
        type: "GET",
        success: function(res){
            // console.log(res);
            // LANG = res.lang;
        },
        error: function(xhr, status, error){
            if(xhr.status === 401){
                alert(xhr.responseText);
                window.location.href = "/login"
            }else{
                console.error("Lỗi:", error);
            }
        }
    })
});



function modifi_data(data,data_field_config){
    let x = [];
    let count = 0;
    for(let i=data.length-1; i>=0; i--){
        count +=1;
        let y = {
        index: count,
        MeterTime: new Date(data[i].MeterTime).toLocaleString('en-GB'),
      }


      for (const key in data_field_config){
        if(data_field_config[key] == 1 && (key == "pressure" || key == "PressureVol")){
          y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_2550_pressure((data[i][key]),return_unit_html(returnUnit(key,data[i].PressureUnit)))) : "-")
        }else if(data_field_config[key] == 1 && key == "ValOfNum"){
          y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null_0((data[i][key]))) : "-")
        }else if(data_field_config[key] == 1 && key == "Voltage"){
            y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null_pin((data[i][key]),data[i].unit_pin) + return_unit_html(returnUnit(key,data[i].unit_pin))) : "-")        
        }else {
          y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null((data[i][key])) + return_unit_html(returnUnit(key,data[i].unit))) : "-")
        }
      }
      x.push(y)
    }
    return x;
  } 





$(document).ready(function(){
    $(function(){
        $("#chart_time_from").daterangepicker(
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
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY H:mm'
                }
            }
        )
        $("#chart_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#chart_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#chart_time_to").daterangepicker(
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
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY H:mm'
                }
            }
        )
        $("#chart_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#chart_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
        init_data();
    })
})

var DATA = [];
var DATA_FIELD_CONFIG = {};
var DATA_SEARCH_MOMENT = null;
function init_data(){
  $("#table_data_container").show();  // Ẩn
  $("#chartDiv").show();  // Ẩn
    LOADED_CHART = 0;
    LOAD_TABLE = 0;
    let start_date = $("#chart_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#chart_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    $("#selected_MeterCode").val(MeterCode)
    let active_tab = $("#myTab .nav-link.active").attr("id");
    let data_field_selected = $("#filter_field").val();
    DATA_SEARCH_MOMENT = $("#data_search_moment").val();
    DATA_FIELD_CONFIG = {};
    for(let i=0; i<data_field_selected.length; i++){
        DATA_FIELD_CONFIG[data_field_selected[i]] = 1;
    }
    $.ajax({
        url: "/data_search/get/meter_data",
        type: "GET",
        data:{start_date, end_date, MeterCode, NodeCode, DATA_SEARCH_MOMENT},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            DATA = res.data;

            if(active_tab == "data-tab"){
              $("#data").show();
                render_data_table(DATA, DATA_FIELD_CONFIG, DATA_SEARCH_MOMENT);
            }else{
              $("#chart").show();
                render_chart(DATA_FIELD_CONFIG,DATA);
            }

        },
        error: function(xhr, status, error){
            if(xhr.status === 401){
                alert(xhr.responseText);
                window.location.href = "/login"
            }else{
                console.error("Lỗi:", error);
            }
        },  
        complete: function () {
           hideLoading()  // Ẩn overlay sau khi tải xong
        }
    })
}

function render_data_table(data,data_field_config, data_search_moment){
        LOADED_TABLE = 1;
        if( $.fn.DataTable.isDataTable('#table_data') ) {
            $('#table_data').DataTable().clear().destroy();
          }
          $('#head_table_data').empty();
          $("#body_table_data").empty();
          if(data_search_moment == "hour"){
            let x = '<th class="border_th_d" style="min-width: 7%">STT</th><th class="border_th_d" style="min-width: 16%">'+translate_text('Thời gian')+'</th>'
            $("#head_table_data").append(x);
            let COLUMS = [
            {data: "index", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "MeterTime", className: "text-center-data-table align-middle border_config_eq_td_d"}
          ]
          for(const key in data_field_config ){
            if(data_field_config[key] == 1 && key != "OP"){
              COLUMS.push({data: key, className: "text-right-data-table align-middle border_config_eq_td_d"})
              let y = '<th class="border_th_d" >'+shortToFullName(key)+'</th>'
              $("#head_table_data").append(y);
            }
          }
          if ($("#table_data").length) {
              var table = $('#table_data').DataTable({
                  dom: '<"top"lp>rt<"bottom"ip><"clear">',
                  language : translate_data_table(LANG),
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
                  columns: COLUMS,
                  data: modifi_data(data,data_field_config),
                  initComplete: function () {
                      $(document).ready(function () {
                          table.on('page.dt', function () {
                              $('html, body').animate({
                                  scrollTop: 200
                              }, 'fast');
                          });
                      })

                  }
              });
          } else {
              console.error("Bảng #table_data không tồn tại");
          }
          }else{
            let x = '<th class="border_th_d" style="min-width: 7%">STT</th><th class="border_th_d" style="min-width: 16%">'+translate_text('Thời gian')+'</th><th class="border_th_d">Chỉ số đầu</th><th class="border_th_d">Chỉ số cuối</th><th class="border_th_d">Sản lượng</th><th class="border_th_d">Áp suất trung bình</th>'
            $("#head_table_data").append(x);
            let COLUMS = [
            {data: "index", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "MeterTime", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "ValStart", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "ValEnd", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "ValOfNum", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "AvgPressure", className: "text-center-data-table align-middle border_config_eq_td_d"}
          ]
        //   for(const key in data_field_config ){
        //     if(data_field_config[key] == 1 && key != "OP"){
        //       COLUMS.push({data: key, className: "text-right-data-table align-middle border_config_eq_td_d"})
        //       let y = '<th class="border_th_d" >'+shortToFullName(key)+'</th>'
        //       $("#head_table_data").append(y);
        //     }
        //   }
          if ($("#table_data").length) {
              $('#table_data').DataTable({
                  dom: '<"top"lp>rt<"bottom"ip><"clear">',
                  language : translate_data_table(LANG),
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
                  columns: COLUMS,
                  data: modifi_data_momnet(data),
              });
          } else {
              console.error("Bảng #table_data không tồn tại");
          }
          }

    
} 



function modifi_data_momnet(data){
    let x = [];
    let count = 0;
    for(let i=data.length-1; i>=0; i--){
        count +=1;
        let y = {
        index: count,
        MeterTime: new Date(data[i].MeterTime).toLocaleString('en-GB'),
        ValStart: show_if_null_0(data[i].ValStart),
        ValEnd: show_if_null_0(data[i].ValEnd),
        ValOfNum: show_if_null(data[i].ValOfNum),
        AvgPressure: show_if_null(data[i].AvgPressure)
      }


    //   for (const key in data_field_config){
    //     if(data_field_config[key] == 1 && (key == "pressure" || key == "PressureVol")){
    //       y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null((data[i][key])) + return_unit_html(returnUnit(key,data[i].PressureUnit))) : "-")
    //     }else if(data_field_config[key] == 1 && key == "ValOfNum"){
    //       y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null_0((data[i][key]))) : "-")
    //     }else if(data_field_config[key] == 1 && key == "Voltage"){
    //         y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null_pin((data[i][key]),data[i].unit_pin) + return_unit_html(returnUnit(key,data[i].unit_pin))) : "-")        
    //     }else {
    //       y[key] = ((typeof data[i][key] !== 'undefined') ? (show_if_null((data[i][key])) + return_unit_html(returnUnit(key,data[i].unit))) : "-")
    //     }
    //   }
      x.push(y)
    }
    return x;
}

var chart = null;
function render_chart(data_field_config, raw_data){
    LOADED_CHART = 1;
    let color_config = { "ValOfNum": "#35610f", "terminal_index": "#ef4444", "flowRate": "#10b981", "pressure": "#000cff", "measure_sensor": "#0ea5e9", "measure_static": "#8b5cf6", "measure_dynamic": "#f59e0b", "measure_delta": "#ff66f2", "ValueReverse": "#62fc03", "ValueForward": "#03effcff", "Voltage": "#03fc24", "voltage_ac_quy": "#73153d", "PressureVol": "#8b50d9", "VoltageOfMeter": "#e3854fff", "Temp": "#5281e8ff" };
    let unit_config = { "ValOfNum": "", "terminal_index": "m³", "flowRate": "m³/h", "pressure": "", "measure_sensor": "", "measure_static": "", "measure_dynamic": "", "measure_delta": "", "ValueReverse": "m³", "ValueForward": "m³", "Voltage": "V", "voltage_ac_quy": "V", "PressureVol": "", "VoltageOfMeter": "%", "Temp": "℃" };
    if(raw_data.length > 0){
      unit_config.measure_sensor  = returnUnit("measure_sensor",raw_data[0].unit);
      unit_config.measure_static  = returnUnit("measure_static",raw_data[0].unit);
      unit_config.measure_dynamic  = returnUnit("measure_dynamic",raw_data[0].unit);
      unit_config.measure_delta  = returnUnit("measure_delta",raw_data[0].unit);
      unit_config.PressureVol  = returnUnit("PressureVol",raw_data[0].PressureUnit);
      unit_config.pressure  = returnUnit("pressure",raw_data[0].PressureUnit);
      unit_config.Voltage  = returnUnit("Voltage",raw_data[0].unit_pin);

    }
    let data = [];
    for(let i=0; i<raw_data.length; i++){
        let x = {time: new Date(raw_data[i].MeterTime)}
        for (const key in data_field_config){
            if(data_field_config[key] == 1 ){
                // x[key] = stringtonum(raw_data[i][key]);
                if((key == 'PressureVol' || key == 'pressure') && (raw_data[i][key] != null && parseInt(raw_data[i][key]) == 2550)){
                    // console.log("PressureVol or pressure error");
                  }else{
                    x[key] = stringtonum(raw_data[i][key]);
                  }
            }
        }
        data.push(x);
    }
    let y = [];
    let arr = [];
    for (const key in data_field_config ){
        if(data_field_config[key] == 1 && key != "OP"){
            // y.push(returnY(key))
            arr.push(key)
        }
    }
    // let unit = Array.from(new Set(y));
    am4core.useTheme(am4themes_animated);
    if(chart != null){
        chart.dispose();
    }
    chart= am4core.create("chartDiv", am4charts.XYChart);
    // chart.scrollbarX = new am4core.Scrollbar();
    chart.data = data;
    chart.logo.disabled = true;
    // Tối ưu kích thước biểu đồ
    chart.paddingRight = 15;
    chart.paddingLeft = 0;
    chart.maskBullets = false;

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    // dateAxis.startLocation = 0.5;
    // dateAxis.endLocation = 0.5;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 60;
    dateAxis.renderer.labels.template.fontSize = 11;

    // dateAxis.renderer.grid.template.disabled = true;
    // dateAxis.renderer.fullWidthTooltip = true;
    dateAxis.renderer.labels.template.fill = am4core.color("#6b7280");
    dateAxis.renderer.grid.template.strokeOpacity = 0.05;
    dateAxis.renderer.cellStartLocation = 0.1;
    dateAxis.renderer.cellEndLocation = 0.9;

    dateAxis.dateFormats.setKey("hour", "HH:mm");
    dateAxis.dateFormats.setKey("day", "dd/MM");
    dateAxis.periodChangeDateFormats.setKey("hour", "dd/MM"); 
    dateAxis.dateFormats.setKey("month", "MM/yyyy");
    dateAxis.periodChangeDateFormats.setKey("day", "MM/yyyy");
    dateAxis.tooltipDateFormat = "dd/MM/yyyy HH:mm";

            // Tạo các trục Y và series
    var leftAxisCount = 0;
    var rightAxisCount = 0;
    var seriesList = [];
    function creatAxisAndSeries(key,i){
      
      // Tạo trục Y
      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.labels.template.fill = am4core.color(color_config[key]);
      valueAxis.renderer.labels.template.fontSize = 11;
      valueAxis.title.text = unit_config[key];
      valueAxis.title.fill = am4core.color(color_config[key]);
      valueAxis.title.fontSize = 11;
      // valueAxis.min = indicator.min;
      // valueAxis.max = indicator.max;
      valueAxis.renderer.grid.template.strokeOpacity = 0.05;
      valueAxis.cursorTooltipEnabled = false;
      if(i % 2 == 0){
        valueAxis.renderer.opposite = false;
        valueAxis.renderer.labels.template.paddingLeft = leftAxisCount > 0 ? 30 : 0;
        leftAxisCount++;
      }else{
        valueAxis.renderer.opposite = true;
        valueAxis.renderer.labels.template.paddingRight = rightAxisCount > 0 ? 30 : 0;
        rightAxisCount++;
      }
      
      var series;
        series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = key;
        series.dataFields.dateX = "time";
        series.name = shortToFullName(key) + unit_config[key];
        series.yAxis = valueAxis;

        series.strokeWidth = 2.5;
        series.fill = am4core.color(color_config[key]);
        series.stroke = am4core.color(color_config[key]);
        series.fillOpacity = 0.08;
        series.tensionX = 1;
        series.legendSettings.labelText = shortToFullName(key)
        series.tooltipText =shortToFullName(key)+ ": {valueY} " + unit_config[key] ;
        series.showOnInit = true;
        // series.tooltip.pointerOrientation = "horizontal";
        series.bullets.clear();


    }
    for(let i=0; i< arr.length; i++){
        creatAxisAndSeries(arr[i],i);
    }

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.cursor.lineY.disabled = true;
    chart.cursor.lineX.strokeOpacity = 0.2;
}

var LOADED_CHART = 0;
var LOAD_TABLE = 0;

$(document).ready(function(){
            // Khi chuyển tab
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        let target = $(e.target).attr("id"); // Lấy ID của tab hiện tại
        if (target === "data-tab") {
            if(LOAD_TABLE == 0){
                render_data_table(DATA, DATA_FIELD_CONFIG, DATA_SEARCH_MOMENT);
            }
        } else {
            if(LOADED_CHART == 0){
                render_chart(DATA_FIELD_CONFIG, DATA)
            }
        }
    });
})

$(document).ready(function(){
    $("#filter_tram").on("change",function(result){
        let tram_id = $(this).children("option:selected").val();
        let dv_type = $(this).children("option:selected").attr("dv_type");
        $("#filter_meter").empty();
        $("#table_data_container").hide();  // Ẩn
        $("#chartDiv").hide();  // Ẩn
        $.ajax({
            url: "/data_search/get/child_meter",
            type: "GET",
            data: {tram_id: tram_id, dv_type: dv_type},
            beforeSend: function () {
                // showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                let meter_list = res.meter_list;
                let x="";
                for(let i=0;  i<meter_list.length; i++){
                     x += "<option metercode ='"+meter_list[i].MeterCode+"' nodecode='"+ meter_list[i].NodeCode+"' data-tokens ='"+meter_list[i].MeterCode+"'>"+meter_list[i].name+"</option>";
                }
                $("#filter_meter").append(x);
                $('#filter_meter').selectpicker('refresh');
                $('#filter_meter').selectpicker('val', $("#filter_meter option:eq(0)").text());
                $('#filter_meter').selectpicker('refresh');
                get_field();
            },
            error: function(xhr, status, error){
                if(xhr.status === 401){
                    alert(xhr.responseText);
                    window.location.href = "/login"
                }else{
                    console.error("Lỗi:", error);
                }
            },  
            complete: function () {
            //    hideLoading()  // Ẩn overlay sau khi tải xong
            }
        })
    })
})

$(document).ready(function(){
  $("#filter_meter").on("change",function(result){
    get_field()
    $("#table_data_container").hide();  // Ẩn
    $("#chartDiv").hide();  // Ẩn
  })
})

function get_field(){
  $("#filter_field").val([]);
  $('#filter_field').trigger('change')
  let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
  let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
  $.ajax({
    url: "/data_search/get/field",
    type: "GET",
    data: {MeterCode, NodeCode},
    beforeSend: function () {
        // showLoading();  // Hiện overlay khi bắt đầu tải
    },
    success: function(res){
        let data_field_config = res.data_field_config;
        let x = []
        for(const key in data_field_config){
          if(data_field_config[key] == 1){
            x.push(key);
          }
        }
        $("#filter_field").val(x);
        $('#filter_field').trigger('change');
            init_data()

    },
    error: function(xhr, status, error){
        if(xhr.status === 401){
            alert(xhr.responseText);
            window.location.href = "/login"
        }else{
            console.error("Lỗi:", error);
        }
    },  
    complete: function () {
    //    hideLoading()  // Ẩn overlay sau khi tải xong
    }
})
}