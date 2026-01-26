
var LANG = "vi";
$(document).ready(function(){
    $.ajax({
        url: "/get/lang",
        type: "GET",
        success: function(res){
            // LANG = res.lang;
            // console.log(LANG)
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
$(document).ready(function(){
    render_data_table([], { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 }, "hour")
})







$(document).ready(function(){
    $("#filter_tram").on("change",function(result){
        let tram_id = $(this).children("option:selected").val();
        let dv_type = $(this).children("option:selected").attr("dv_type");
        $("#filter_meter").empty();
        $.ajax({
            url: "/data_search/get/child_meter",
            type: "GET",
            data: {tram_id: tram_id, dv_type: dv_type},
            beforeSend: function () {
                // showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                let meter_list = res.meter_list;
                let x='<option value="" disabled selected> Chọn trạm quan trắc</option>';
                for(let i=0;  i<meter_list.length; i++){
                     x += "<option metercode ='"+meter_list[i].MeterCode+"' nodecode='"+ meter_list[i].NodeCode+"' data-tokens ='"+meter_list[i].MeterCode+"'>"+meter_list[i].name+"</option>";
                }
                $("#filter_meter").append(x);
                $('#filter_meter').selectpicker('refresh');
                $('#filter_meter').selectpicker('val',"");


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
    $(function(){
        $("#report_time_from").daterangepicker(
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
        $("#report_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#report_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#report_time_to").daterangepicker(
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
        $("#report_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#report_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

var METERCODE = null;
var NODECODE = null;
var START_DATE = null;
var END_DATE = null;
var DATA_SEARCH_MOMENT = null;

function init_data(){
    // $("#table_data_container").show();  // Ẩn
    // $("#chartDiv").show();  // Ẩn
      let start_date = $("#report_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
      let end_date = $("#report_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
      let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
      let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
      DATA_SEARCH_MOMENT = $("#data_search_moment").val();

      START_DATE = start_date;
      END_DATE = end_date;
      METERCODE = MeterCode;
      NODECODE = NodeCode;
      if(START_DATE != null && END_DATE !=null && START_DATE != "" && END_DATE !="" && METERCODE != null && NODECODE !=null && METERCODE != "" && NODECODE !="" ){
        $("#export_report").prop("disabled", false);
    }
      $.ajax({
          url: "/report/get/meter_data",
          type: "GET",
          data:{start_date, end_date, MeterCode, NodeCode, DATA_SEARCH_MOMENT},
          beforeSend: function () {
              showLoading();  // Hiện overlay khi bắt đầu tải
          },
          success: function(res){
            DATA = res.data;
            DATA_FIELD_CONFIG = JSON.parse(res.data_field_config)
            render_data_table(DATA, DATA_FIELD_CONFIG, DATA_SEARCH_MOMENT);

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


  
  function render_data_table(data,data_field_config,data_search_moment){
    LOADED_TABLE = 1;
    if( $.fn.DataTable.isDataTable('#table_data') ) {
        $('#table_data').DataTable().clear().destroy();
      }
      $('#head_table_data').empty();
      $("#body_table_data").empty();
      if(data_search_moment == "hour"){
        let x = '<th class="border_th_d" style="min-width: 7%">STT</th><th class="border_th_d" style="min-width: 16%">'+('Thời gian')+'</th>'
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
          COLUMS.push({ data: "RSSI", className: "text-right-data-table align-middle border_config_eq_td_d" });
          $("#head_table_data").append('<th class="border_th_d" >RSSI</th>');
      if ($("#table_data").length) {
          $('#table_data').DataTable({
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
          });
      } else {
          console.error("Bảng #table_data không tồn tại");
      }
      }else{
        let x = '<th class="border_th_d" style="min-width: 7%">STT</th><th class="border_th_d" style="min-width: 16%">'+('Thời gian')+'</th><th class="border_th_d">Chỉ số đầu</th><th class="border_th_d">Chỉ số cuối</th><th class="border_th_d">Sản lượng</th><th class="border_th_d">Áp suất trung bình</th>'
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
        if(data_field_config[key] == 1 && key != "OP"){
          y[key] = show_if_null((typeof data[i][key] !== 'undefined') ? (data[i][key]) : "-")
        }
      }
        y["RSSI"] = show_if_null_text(data[i].wave_current_1)
      x.push(y)
    }
    console.log(x)

    return x;
  } 

    


    $(document).ready(function(){
        $("#export_report").on("click",function(){
            if(START_DATE == null || END_DATE == null){
                show_notification("Chưa tìm kiếm dữ liệu", "error");
                return false;
            }
            if(METERCODE == null || NODECODE == null){
                show_notification("Chưa chọn trạm quan trắc", "error");
                return false;
            }
            window.open("/report/export_meter_data?start_date="+START_DATE+"&end_date="+END_DATE+"&MeterCode="+METERCODE+"&NodeCode="+NODECODE+"&data_search_moment="+DATA_SEARCH_MOMENT, "_blank");
        })
    })