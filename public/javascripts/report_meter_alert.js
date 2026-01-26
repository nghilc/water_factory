
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
    render_alert_table([])
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
var TRAM_ID = null;
var DV_TYPE = null;

function init_data(){
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    let start_date = $("#report_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#report_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let tram_id = $("#filter_tram").children("option:selected").val();
    let dv_type = $("#filter_tram").children("option:selected").attr("dv_type");
    START_DATE = start_date;
    END_DATE = end_date;
    METERCODE = MeterCode;
    NODECODE = NodeCode;
    TRAM_ID = tram_id;
    DV_TYPE = dv_type;
    if(START_DATE != null && END_DATE !=null && START_DATE != "" && END_DATE !="" && METERCODE != null && NODECODE !=null && METERCODE != "" && NODECODE !="" ){
        $("#export_report").prop("disabled", false);
    }
    $.ajax({
        url: "/report/get/alert_data",
        type: "GET",
        data:{start_date, end_date, MeterCode, NodeCode, tram_id, dv_type},
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

  function render_alert_table(data){
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
      alert_mess: data[i].name + "<br><span style='color: red'>"+ data[i].alert_type+"</span>",
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
    $("#export_report").on("click",function(){
        if(START_DATE == null || END_DATE == null){
            show_notification("Chưa tìm kiếm dữ liệu", "error");
            return false;
        }
        if(METERCODE == null || NODECODE == null){
            show_notification("Chưa chọn trạm quan trắc", "error");
            return false;
        }
        window.open("/report/export_meter_alert?start_date="+START_DATE+"&end_date="+END_DATE+"&MeterCode="+METERCODE+"&NodeCode="+NODECODE+"&tram_id="+TRAM_ID+"&dv_type="+DV_TYPE, "_blank");
    })
})