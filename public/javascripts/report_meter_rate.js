
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

function return_date(x){
    const date = new Date(x);
    
    const day = String(date.getDate()).padStart(2, '0');  // Lấy ngày và thêm '0' nếu cần
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Lấy tháng và thêm '0' nếu cần
    const year = date.getFullYear();  // Lấy năm
    
    return `${day}/${month}/${year}`;  // Trả về chuỗi theo định dạng "DD/MM/YYYY"
  }
  



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
        "infoFiltered": "(Đã lọc từ _MAX_ tổng số bản ghi)",
        "lengthMenu": "  _MENU_ ",
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



$(document).ready(function(){
    $("#filter_tram").on("change",function(result){
        let tram_id = $(this).children("option:selected").val();
        let dv_type = $(this).children("option:selected").attr("dv_type");
        $("#filter_meter").empty();
        $("#data").hide();  // Ẩn
        $("#chart").hide();  // Ẩn
        $.ajax({
            url: "/data_search/get/child_meter",
            type: "GET",
            data: {tram_id: tram_id, dv_type: dv_type},
            beforeSend: function () {
                // showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                let meter_list = res.meter_list;
                $("#checkAll").prop("checked",false)
                let x="";
                for(let i=0;  i<meter_list.length; i++){
                     x += "<option metercode ='"+meter_list[i].MeterCode+"' nodecode='"+ meter_list[i].NodeCode+"' data-tokens ='"+meter_list[i].MeterCode+"'>"+meter_list[i].name+"</option>";
                }
                $("#filter_meter").append(x);
                $('.select2bs4').select2({
                    theme: 'bootstrap4',
                    closeOnSelect:false
                  })
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
    $("#checkAll").change(function(){
        if($(this).is(':checked')){
            var allValues = $('#filter_meter option').map(function() { return this.value; }).get();
            $('#filter_meter').val(allValues).trigger('change');
        }else{
            $('#filter_meter').val(null).trigger('change');

        }
    })
})

$(document).ready(function(){
    $(function(){
        $("#report_time_from").daterangepicker(
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
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY'
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
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY'
                }
            }
        )
        $("#report_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#report_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

function isWithin31Days(start_date, end_date) {
    let startDate = new Date(start_date);
    let endDate = new Date(end_date);

    let diffTime = endDate - startDate; // Chênh lệch mili giây
    let diffDays = diffTime / (1000 * 60 * 60 * 24); // Chuyển thành ngày

    return diffDays <= 31;
}


var START_DATE = null;
var END_DATE = null;
var METER_LIST = null;
function init_report(){
    let meter_list = [];
    $("#filter_meter option:selected").each(function(){
        meter_list.push({
            MeterCode: $(this).attr("MeterCode"),
            NodeCode: $(this).attr("NodeCode")
        })
    })
    let start_date = $("#report_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD");
    let end_date = $("#report_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD");
    if(!isWithin31Days(start_date, end_date)){
        show_notification("Khoảng thời gian phải nhỏ hơn 1 tháng", "error");
        return false
    }
    START_DATE = start_date;
    END_DATE = end_date;
    METER_LIST = JSON.stringify(meter_list);
    if(START_DATE != null && END_DATE !=null && START_DATE != "" && END_DATE !="" && meter_list.length > 0 ){
        $("#export_report").prop("disabled", false);
    }
    $.ajax({
        url: "/report/get/meter_rate_data",
        type: "POST",
        data:{start_date: start_date, end_date: end_date, meter_list: JSON.stringify(meter_list)},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            if(res.success){
                render_report_table(res.report_data)
            }else{
                show_notification(res.message, "error")
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

$(document).ready(function(){
    render_report_table([]);
})

function render_report_table(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#report_table') ) {
            $('#report_table').DataTable().clear().destroy();
        }
        $('#report_table_body').empty();
        if ($("#report_table").length) {
            $('#report_table').DataTable({
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4, 5, 6, 7] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2, 3 ] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "index", className: "text-center-data-table align-middle"},
                    {data: "MeterCode", className: "text-center-data-table align-middle"},
                    {data: "name", className: "text-center-data-table align-middle"},
                    // {data: "ten_donvi", className: "text-center-data-table align-middle"},
                    {data: "thoi_gian_thu_thap", className: "text-center-data-table align-middle"},
                    {data: "tan_suat", className: "text-center-data-table align-middle"},
                    {data: "ban_ghi_thuc_te", className: "text-center-data-table align-middle"},
                    {data: "ban_ghi_thiet_ke", className: "text-center-data-table align-middle"},
                    {data: "ty_le", className: "text-center-data-table align-middle"},

                ],
                data: modifi_report_data(data)
            });
        } else {
            console.error("Bảng #report_table không tồn tại");
        }
    })
}

function modifi_report_data(data){
    var y=[];
    let index = 1;
    for(let i=0; i<data.length; i++){
      let x ={ 
        index: index,
        MeterCode: data[i].MeterCode,
        name: data[i].name,
        // ten_donvi: show_if_null(data[i].ten_donvi),
        thoi_gian_thu_thap: return_date(data[i].thoi_gian_thu_thap),
        tan_suat: data[i].tan_suat,
        ban_ghi_thuc_te: data[i].ban_ghi_thuc_te,
        ban_ghi_thiet_ke: data[i].ban_ghi_thiet_ke,
        ty_le: data[i].ty_le,
    }
      index ++;
      y.push(x);
    }
    return(y);
}

$(document).ready(function(){
    $("#export_report").on("click",function(){
        if(START_DATE == null || END_DATE == null){
            show_notification("Chưa tìm kiếm dữ liệu", "error");
            return false;
        }
        if(METER_LIST == null || METER_LIST.length == 0){
            show_notification("Chưa thêm trạm quan trắc", "error");
            return false;
        }
        // window.open("/report/export_meter_rate?start_date="+START_DATE+"&end_date="+END_DATE+"&meter_list="+METER_LIST, "_blank");
        openReportInNewTab(METER_LIST)

    })
})

function openReportInNewTab(meterList) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/report/export_meter_rate';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'meter_list';
    input.value = JSON.stringify(meterList);
    form.appendChild(input);

    
    // Input: start_date
    const inputStartDate = document.createElement('input');
    inputStartDate.type = 'hidden';
    inputStartDate.name = 'start_date';
    inputStartDate.value = START_DATE;  // biến toàn cục
    form.appendChild(inputStartDate);

    // Input: end_date
    const inputEndDate = document.createElement('input');
    inputEndDate.type = 'hidden';
    inputEndDate.name = 'end_date';
    inputEndDate.value = END_DATE;  // biến toàn cục
    form.appendChild(inputEndDate);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}