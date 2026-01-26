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




function search_meter_config(){
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    let val = $('#filter_tram option:selected').val();
    if(val == "all") val = null;
    // let select_dv_type = $('#filter_tram option:selected').attr('dv_type');
    // if(select_dv_type == "dvnd"){
    //     let dvql = $('#filter_tram option:selected').prevAll('option[dv_type="dvql"]').first().val();
    //     $('#setting_link_btn').attr('onclick', "window.location.href='/config_meter?MeterCode="+MeterCode+"&NodeCode="+NodeCode+"&donviquanly_id="+dvql+"&donvinguoidung_id="+val+"'");
    // }else{
    //     $('#setting_link_btn').attr('onclick', "window.location.href='/config_meter?MeterCode="+MeterCode+"&NodeCode="+NodeCode+"&donviquanly_id="+val+"&donvinguoidung_id=null'");
    // }
    $('#setting_link_btn').attr('onclick', "window.location.href='/config_meter?MeterCode=" + MeterCode + "&NodeCode=" + NodeCode+"'");
    $.ajax({
        url: "/config_meter/get/meter_info",
        type: "GET",
        data:{MeterCode, NodeCode},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            // $("#meter_info_container").html(res);
            $("#meter_info_container").empty();
            $("#meter_info_container").append(res);
            $('.select2bs4').select2({
                theme: 'bootstrap4',
                closeOnSelect: false,
                tags: true
              })
              $(".select2bs4").on("select2:select", function (evt) {
                var element = evt.params.data.element;
                var $element = $(element);
                
                $element.detach();
                $(this).append($element);
                $(this).trigger("change");
              });

              $(".bootstrap_toggle").bootstrapToggle();

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
            // Ẩn overlay sau khi tải xong
           hideLoading();


        }
    })
}

$(document).ready(function(){
    $("#filter_meter").on("change", function(){
        $("#Metercode_read").val( $(this).children("option:selected").attr("MeterCode"))
        search_meter_config()
    })
})


$(document).ready(function(){
    $("#filter_tram").on("change",function(result){
        let tram_id = $(this).children("option:selected").val();
        let dv_type = $(this).children("option:selected").attr("dv_type");

        $("#filter_meter").empty();
        // $("#data").hide();  // Ẩn
        // $("#chart").hide();  // Ẩn
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
                $("#Metercode_read").val( $("#filter_meter").children("option:selected").attr("MeterCode"));
                search_meter_config();

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
    });

    $(document).on("click","#btnSendMeter",function(){
        if (confirm("Xác nhận gửi lệnh cấu hình đồng hồ ?")) {
            let DcuCode = $(this).attr("DcuCode");
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let server_address_read = $("#server_address_read").val();
            let retain = ($("#txtRetainMeter").is(':checked')) ? 1 : 0;
            let multiplier = $("#multiplier").val();
            let first_index = $("#first_index").val();
            $.ajax({
                url: "/config_meter/post/config_meter",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    MeterCode: MeterCode,
                    NodeCode:NodeCode,
                    DcuCode: DcuCode,
                    retain: retain,
                    multiplier:multiplier,
                    first_index: first_index,
                    server_address_read : server_address_read
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });

    $(document).on("click","#btnSendSaveWare",function(){
        if (confirm("Xác nhận gửi lệnh lưu kho ?")) {
            let DcuCode = $(this).attr("DcuCode");
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let server_address_read = $("#server_address_read").val();
            let retain_reset_and_save = ($("#txtRetainResetAndSave").is(':checked')) ? 1 : 0;
            $.ajax({
                url: "/config_meter/post/config_reset_and_save",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    DcuCode: DcuCode,
                    retain_reset_and_save: retain_reset_and_save,
                    server_address_read : server_address_read,
                    type: 'saveware',
                    MeterCode: MeterCode,
                    NodeCode: NodeCode
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });


    $(document).on("click","#btnSendReset",function(){
        if (confirm("Xác nhận gửi lệnh reset thiết bị ?")) {
            let DcuCode = $(this).attr("DcuCode");
            let server_address_read = $("#server_address_read").val();
            let retain_reset_and_save = ($("#txtRetainResetAndSave").is(':checked')) ? 1 : 0;
            $.ajax({
                url: "/config_meter/post/config_reset_and_save",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    DcuCode: DcuCode,
                    retain_reset_and_save: retain_reset_and_save,
                    server_address_read : server_address_read,
                    type: 'reset'
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });

    $(document).on("click","#config_freq",function(){
        if (confirm("Xác nhận gửi lệnh cấu hình tần suất ?")) {
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let DcuCode = $(this).attr("DcuCode");
            let freq_time = $("#freq_time").val();
            let freq_coefficient = $("#freq_coefficient").val();
            let server_address_read = $("#server_address_read").val();

            let retain_config_freq = ($("#retain_config_freq").is(':checked')) ? 1 : 0;
            $.ajax({
                url: "/config_meter/post/config_freq",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    MeterCode: MeterCode, 
                    NodeCode: NodeCode, 
                    DcuCode: DcuCode,
                    freq_time: freq_time, 
                    freq_coefficient: freq_coefficient,
                    retain_config_freq: retain_config_freq,
                    server_address_read : server_address_read
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });

    $(document).on("click","#btnSendConfigPre",function(){
        if (confirm("Xác nhận gửi lệnh cấu hình cổng áp suất ?")) {
            let DcuCode = $(this).attr("DcuCode");
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let server_address_read = $("#server_address_read").val();
            let retain = ($("#txtRetainPressure").is(':checked')) ? 1 : 0;
            let X1 = $("#X1").val();
            let X2 = $("#X2").val();
            let Ux = $("#Entity_Ux").val();
            let Y1 = $("#Y1").val();
            let Y2 = $("#Y2").val();
            let Uy = $("#Entity_Uy").val();
            let cbxAnalog = $("#cbxAnalog").val();
            let wire_length = null;
            let measure_static = null;

            if (cbxAnalog >= 3 && cbxAnalog <= 6){
                wire_length = $("#wire_length").val();
                measure_static = $("#measure_static").val();

            }
            let Om = $("#Om").val();
            let send_lcd_cm = ($("#send_lcd_cm").is(':checked')) ? 1 : 0;
            let config_pressure_measure = ($("#config_pressure_measure").is(':checked')) ? 1 : 0;
            $.ajax({
                url: "/config_meter/post/config_pressure",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    MeterCode: MeterCode,
                    NodeCode:NodeCode,
                    DcuCode: DcuCode,
                    retain: retain,
                    server_address_read : server_address_read,
                    X1:X1,
                    X2: X2,
                    Ux :Ux,
                    Y1 :Y1,
                    Y2 :Y2,
                    Uy :Uy,
                    cbxAnalog :cbxAnalog,
                    Om :Om,
                    send_lcd_cm :send_lcd_cm,
                    config_pressure_measure :config_pressure_measure,
                    wire_length: wire_length,
                    measure_static: measure_static
                    
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });
    $(document).on("change","#cbxAnalog",function(){
        if ($(this).val() < 3 || $(this).val() > 6){
            $("#wire_length_container").hide();
            $("#measure_static_container").hide();

        }else{
            $("#wire_length_container").show();
            $("#measure_static_container").show();

        }
    })

    $(document).on("click","#btnTerminalIndex",function(){
        if (confirm("Xác nhận gửi lệnh cấu hình ngưỡng sản lượng ?")) {
            let DcuCode = $(this).attr("DcuCode");
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let server_address_read = $("#server_address_read").val();
            let retain = ($("#txtRetainTerminalIndex").is(':checked')) ? 1 : 0;
            let min = $("#txtTerminalIndexMin").val();
            let max = $("#txtTerminalIndexMax").val();
            $.ajax({
                url: "/config_meter/post/config_alert_terminal_index",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    MeterCode: MeterCode,
                    NodeCode:NodeCode,
                    DcuCode: DcuCode,
                    retain: retain,
                    server_address_read : server_address_read,
                    min:min,
                    max: max 
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });

    $(document).on("click","#btnFlowRate",function(){
        if (confirm("Xác nhận gửi lệnh cấu hình ngưỡng lưu lượng ?")) {
            let DcuCode = $(this).attr("DcuCode");
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let server_address_read = $("#server_address_read").val();
            let retain = ($("#txtFlowRate").is(':checked')) ? 1 : 0;
            let min = $("#txtFlowRateMin").val();
            let max = $("#txtFlowRateMax").val();
            $.ajax({
                url: "/config_meter/post/config_alert_flow_rate",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    MeterCode: MeterCode,
                    NodeCode:NodeCode,
                    DcuCode: DcuCode,
                    retain: retain,
                    server_address_read : server_address_read,
                    min:min,
                    max: max 
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });

    $(document).on("click","#btnAlertPin",function(){
        if (confirm("Xác nhận gửi lệnh cấu hình ngưỡng pin?")) {
            let DcuCode = $(this).attr("DcuCode");
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            let server_address_read = $("#server_address_read").val();
            let retain = ($("#txtAlertPin").is(':checked')) ? 1 : 0;
            let min = $("#txtAlertPinMin").val();
            $.ajax({
                url: "/config_meter/post/config_alert_pin",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    MeterCode: MeterCode,
                    NodeCode:NodeCode,
                    DcuCode: DcuCode,
                    retain: retain,
                    server_address_read : server_address_read,
                    min:min
                }),
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
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
            });
        }
    });
    
    $(document).on('change','#freq_time', function() {
        let freq_time = this.value;
        let freq_coefficient = $('#freq_coefficient').val();
        $('#txtRs').val(parseInt(freq_time) * parseInt(freq_coefficient));
    });
    
    $(document).on('change','#freq_coefficient', function() {
        let freq_coefficient = this.value;
        let freq_time = $('#freq_time').val();
        $('#txtRs').val(parseInt(freq_time) * parseInt(freq_coefficient));
    });

})

