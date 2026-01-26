
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


var METER_LIST = null;
function init_report(){
    let meter_list = [];
    $("#filter_meter option:selected").each(function(){
        meter_list.push({
            MeterCode: $(this).attr("MeterCode"),
            NodeCode: $(this).attr("NodeCode")
        })
    })
    if(meter_list.length > 0 ){
        $("#export_report").prop("disabled", false);
    }
    METER_LIST = JSON.stringify(meter_list)


    $.ajax({
        url: "/report/get/meter_list_data",
        type: "POST",
        data:{ meter_list: JSON.stringify(meter_list)},
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
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2 ] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "index", className: "text-center-data-table align-middle"},
                    {data: "matram", className: "text-center-data-table align-middle"},
                    {data: "meter_name", className: "text-center-data-table align-middle"},
                    // {data: "ten_donvi", className: "text-center-data-table align-middle"},
                    {data: "meter_status", className: "text-center-data-table align-middle"},
                    {data: "MeterCode", className: "text-center-data-table align-middle"},
                    {data: "frequency", className: "text-center-data-table align-middle"},
                    {data: "lat", className: "text-center-data-table align-middle"},
                    {data: "lng", className: "text-center-data-table align-middle"},
                    {data: "address", className: "text-center-data-table align-middle"},
                    {data: "sync_tnmt_data", className: "text-center-data-table align-middle"},
                    {data: "multiplier", className: "text-center-data-table align-middle"},
                    {data: "first_index", className: "text-center-data-table align-middle"},
                    {data: "serial_sim", className: "text-center-data-table align-middle"}

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
        matram: data[i].ma_tram,
        meter_name: data[i].meter_name,
        // ten_donvi: show_if_null_text(data[i].ten_donvi),
        meter_status: return_meter_status_2(data[i].status),
        MeterCode: data[i].MeterCode,
        frequency: data[i].frequency,
        lat: data[i].location_lat,
        lng: data[i].location_long,
        address: data[i].address,
        sync_tnmt_data: (data[i].sync_tnmt_data == 1) ? "Bật" : "Tắt",
        multiplier: data[i].multiplier,
        first_index: data[i].first_index,
        serial_sim: data[i].serial_sim,

    }
      index ++;
      y.push(x);
    }
    return(y);
}

function return_meter_status(data){
    if(data.meter_status == 0) return '<span><i class="fa fa-circle text-danger"></i></span>';
    let data_field_config;
    if(data.data_field_config){
        data_field_config = data.data_field_config
    }else{
        data_field_config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };    
    }
    for(const key in data_field_config){
        if(data_field_config[key] == 1 && key != "OP"){
            if(data["status_"+key] == 3) return '<span><i class="fa fa-circle text-warning"></i></span>'
        }
    }
    return '<span><i class="fa fa-circle text-success"></i></span>'
}


function return_meter_status_2(x){
    switch(x){
        case 0: return '<span><i class="fa fa-circle text-danger"></i></span>';
        case 1: return '<span><i class="fa fa-circle text-success"></i></span>';
        case 2: return '<span><i class="fa fa-circle text-danger"></i></span>';
        default: return '<span><i class="fa fa-circle text-warning"></i></span>';
    }
}

$(document).ready(function(){
    $("#export_report").on("click",function(){
        if(METER_LIST == null || METER_LIST.length == 0){
            show_notification("Chưa thêm trạm quan trắc", "error");
            return false;
        }
        openReportInNewTab(METER_LIST)
        // window.open("/report/export_meter_list?meter_list="+METER_LIST, "_blank");
    })
})


function openReportInNewTab(meterList) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/report/export_meter_list';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'meter_list';
    input.value = JSON.stringify(meterList);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}