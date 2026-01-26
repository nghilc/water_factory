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

function translate_data_table(lang){
    if(lang == "vi"){
      return  {
        "aria": {
            "sortAscending": " - click / quay lại để sắp xếp tăng dần"
          },
        "info": "",
        "infoEmpty":      "Không có dữ liệu",
        "loadingRecords": "Đang tải...",
        "search": "Tìm kiếm: ",
        "zeroRecords":    "Không có giá trị nào",
        "lengthMenu": "  _MENU_ ",
        "infoFiltered": "(Đã lọc từ _MAX_ tổng số bản ghi)",
        "paginate": {
            "previous": "Trước",
            "next": "Sau",
          }
    }
    }
    return  {
      "aria": {
          "sortAscending": " - click/return to sort ascending"
        },
      "info": "",
      "infoEmpty":      "Data Empty!",
      "loadingRecords": "Loading...",
      "search": "Search: ",
      "zeroRecords":    "Zero records",
      "lengthMenu": "  _MENU_ ",
      "paginate": {
          "previous": "prev",
          "next": "next",
        }
  }
  }

window.onload = function(){
    $(document).ready(function(){
        render_alert_table(alert_data_first);
    })
}

function render_alert_table(data){
    // console.log(data)
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#alert_table') ) {
            $('#alert_table').DataTable().clear().destroy();
        }
        $('#alert_table_body').empty();
        if ($("#alert_table").length) {
            $('#alert_table').DataTable({
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2, 3 ] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "id", className: "text-center-data-table align-middle"},
                    {data: "creat_at", className: "text-center-data-table align-middle"},
                    {data: "alert_mess", className: "text-left-data-table align-middle"},
                    {data: "threshold", className: "text-right-data-table align-middle"},
                    {data: "alert_value", className: "text-right-data-table align-middle"},
                ],
                data: modifi_data(data)
            });
        } else {
            console.error("Bảng #alert_table không tồn tại");
        }
    })
}

function modifi_data(data){
    var y=[];
    let index = 1;
    for(let i=0; i<data.length; i++){
      let x ={ 
      id: index,
      threshold: show_if_null(data[i].threshold),
          alert_mess: show_if_null_text(data[i].name) + "<br><span style='color: red'>" + show_if_null_text(data[i].alert_type)+"</span>",
      alert_value: show_if_null(data[i].alert_value),
      creat_at: ((data[i].alert_time != null && data[i].alert_time != "") ? ("Bắt đầu: <strong>" + new Date(data[i].alert_time).toLocaleString('en-GB') +"</strong>") : "-") + ((data[i].alert_end_time != null && data[i].alert_end_time != "") ? ("<br>Kết thúc: <strong>" + new Date(data[i].alert_end_time).toLocaleString('en-GB') +"</strong>") : ""),
      }
      index ++;
      y.push(x);
    }
    return(y);
}

function return_alert_type(x){
    switch(x){
        case "POWER": return "Nguồn điện";
        case "SENSOR": return "Trạng thái kết nối cảm biến";
        case "OXY": return "Thông báo lượng Oxy";
        case "PH": return "Độ PH";
        case "TTPH": return "Trạng thái cảm biến PH";
        case "LOIBOM": return "Trạng thái bơm";
        default: return x;
    }
}

$(document).ready(function(){
    $(function(){
        $("#alert_time_from").daterangepicker(
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
        $("#alert_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#alert_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#alert_time_to").daterangepicker(
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
        $("#alert_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#alert_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

function init_alert(){
    $("#alert_table_container").show();  // Hiện
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    let alert_type = JSON.stringify($("#filter_alert_type").val());
    let start_date = $("#alert_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#alert_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let tram_id = $("#filter_tram").children("option:selected").val();
    let dv_type = $("#filter_tram").children("option:selected").attr("dv_type");
    $.ajax({
        url: "/alert/get/alert_data",
        type: "GET",
        data:{start_date, end_date, MeterCode, NodeCode, alert_type, tram_id, dv_type},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            render_alert_table(res.data);
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
                let x="<option metercode ='all' nodecode='all'>Tất cả</option>";
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

function get_field(){
    $("#filter_alert_type").val([]);
    $('#filter_alert_type').trigger('change')
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
          let x = ["CHANGE_DIRECTION","LOST_DEVICE","MAGNETIC_DETECT","HARD_RESET"]
          for(const key in data_field_config){
            if(data_field_config[key] == 1){
              switch(key){
                case "terminal_index": 
                    x.push("low_terminal_index","high_terminal_index");
                    break;
                case "flowRate": 
                x.push("low_terminal_index","high_terminal_index");
                break;
                case "pressure": 
                x.push("low_pressure","low_pressure");
                break;
                case "PressureVol": 
                x.push("low_PressureVol","high_PressureVol");
                break;
                case "measure_sensor": 
                x.push("low_measure_sensor","high_measure_sensor");
                break;
            }
            }
          }
          $("#filter_alert_type").val(x);
          $('#filter_alert_type').trigger('change')
  
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

$(document).ready(function(){
    $("#filter_tram").on("change",function(result){
      $("#alert_table_container").hide();  // Ẩn
    })
  })

  $(document).ready(function(){
    $("#filter_meter").on("change",function(result){
        get_field()
      $("#alert_table_container").hide();  // Ẩn
    })
  })