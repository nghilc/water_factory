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
    $("#save_info_meter").on("click",function(){
        // let tram_id = $("#donvi").children("option:selected").val();
        // let dv_type = $("#donvi").children("option:selected").attr("dv_type");
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let fields = $("#filter_field").val();
        let data_field_config = {};
        fields.forEach(field => {
            data_field_config[field] = 1;
        });

        let meter_name = $("#meter_name").val();
        let location = {
            lat: $("#meter_info_lat").val(),
            lng: $("#meter_info_lng").val()
        }
        let address = $("#address_info").val();
        let note = $("#note_info").val();

        let ma_tram = $("#ma_tram").val();
        let ma_tinh = $("#ma_tinh").val();
        let ma_cong_trinh = $("#ma_cong_trinh").val();
        let type_auto = ($("#type_auto").is(':checked')) ? 1 : 0;
        $.ajax({
            url: "/setting/post/save_meter_info",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                MeterCode: MeterCode, 
                NodeCode: NodeCode, 
                data_field_config: data_field_config, 
                meter_name: meter_name, 
                location: location, 
                address: address,
                note:note,
                type_auto: type_auto,
                ma_tram: ma_tram,
                ma_tinh: ma_tinh,
                ma_cong_trinh: ma_cong_trinh,
                // tram_id, 
                // dv_type
            }),
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                show_notification(res.message, (res.success) ? "success" : "error");
                search_meter_setting();
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
    })
})

$(document).ready(function(){
    $("#save_cycle_meter").on("click",function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");


        let ip_ftp = $("#ip_ftp").val();
        let field_ftp = $("#field_ftp").val();
        let cycle_min = $("#cycle_min").val();
        let cycle_time = $("#cycle_time").val();
        let user_ftp = $("#user_ftp").val();
        let pass_ftp = $("#pass_ftp").val();
        let sync_tnmt_data = $("#sync_tnmt_data").is(':checked');
        $.ajax({
            url: "/setting/post/save_meter_cycle",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                MeterCode: MeterCode,
                NodeCode: NodeCode,
                ip_ftp: ip_ftp,
                field_ftp: field_ftp,
                cycle_min: cycle_min,
                cycle_time: cycle_time,
                user_ftp: user_ftp,
                pass_ftp: pass_ftp,
                sync_tnmt_data: sync_tnmt_data,
            }),
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                show_notification(res.message, (res.success) ? "success" : "error");
                search_meter_setting();
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
    })
})

$(document).ready(function(){
    $(".save_alert_config").on("click",function(){
        let field = $(this).attr("field");
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        // let Qmax = null;
        // let Qmin = null;
        // if(field == "terminal_index"){
        //     Qmax = $("#terminal_index_Qmax").val();
        //     Qmin = $("#terminal_index_Qmin").val();
        // }
        let thresh_hold = [];
        $(".tr_"+field).each(function(){
            let start = $(this).find(".start_"+field).val();
            let end = $(this).find(".end_"+field).val();
            let low = $(this).find(".low_"+field).val();
            let high = $(this).find(".high_"+field).val();
    
            if(start || end || low || high){
                thresh_hold.push({
                    start: start || null,
                    end: end || null,
                    low: low || null,
                    high: high || null
                })
            }
    
        })
        $.ajax({
            url: "/setting/post/save_alert_config",
            type: "POST",
            data: {MeterCode, NodeCode, field, thresh_hold: JSON.stringify(thresh_hold)},
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();  
            },
            success: function(res){
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})

$(document).ready(function(){
    $("#save_alert_voltage").on("click",function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let threshold_pin = $("#threshold_pin").val();
        let threshold_battery = $("#threshold_battery").val();
        $.ajax({
            url: "/setting/post/save_alert_voltage",
            type: "POST",
            data: {MeterCode, NodeCode, threshold_pin, threshold_battery},
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();  
            },
            success: function(res){
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})
$(document).ready(function () {
    $("#save_water_output").on("click", function () {
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let min_exploitation_rate = $("#min_exploitation_rate").val();
        let max_exploitation_rate = $("#max_exploitation_rate").val();
        let daily_exploitation_limit = $("#daily_exploitation_limit").val();
        // let water_output_year_min = $("#water_output_year_min").val();
        // let water_output_year_max = $("#water_output_year_max").val();
        $.ajax({
            url: "/setting/post/save_water_output",
            type: "POST",
            data: { MeterCode, NodeCode, min_exploitation_rate, max_exploitation_rate, daily_exploitation_limit },
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();
            },
            success: function (res) {
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})
$(document).ready(function () {
    $("#save_threshold_terminal_index").on("click", function () {
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let min_threshold_terminal_index = $("#min_threshold_terminal_index").val();
        let max_threshold_terminal_index = $("#max_threshold_terminal_index").val();

        // let water_output_year_min = $("#water_output_year_min").val();
        // let water_output_year_max = $("#water_output_year_max").val();
        $.ajax({
            url: "/setting/post/save_threshold_terminal_index",
            type: "POST",
            data: { MeterCode, NodeCode, min_threshold_terminal_index, max_threshold_terminal_index },
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();
            },
            success: function (res) {
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})
$(document).ready(function(){
    $("#multiplier_first_index").on("click",function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let multiplier = $("#multiplier").val();
        let first_index = $("#first_index").val();
        $.ajax({
            url: "/setting/post/save_multiplier_first_index",
            type: "POST",
            data: {MeterCode, NodeCode, multiplier, first_index},
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();  
            },
            success: function(res){
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})
$(document).ready(function(){
    $("#compen_value_conver_value").on("click",function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let compen_value = $("#compen_value").val();
        let conver_value = $("#conver_value").val();
        let tank_base_bottom = $("#tank_base_bottom").val();

        $.ajax({
            url: "/setting/post/save_compen_value_conver_value",
            type: "POST",
            data: { MeterCode, NodeCode, compen_value, conver_value, tank_base_bottom },
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();  
            },
            success: function(res){
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})

$(document).ready(function(){
    $("#pressuer_config").on("click",function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let X1 = $("#X1").val();
        let X2 = $("#X2").val();
        let UX = $("#Entity_Ux").val();
        let Y1 = $("#Y1").val();
        let Y2 = $("#Y2").val();
        let UY = $("#Entity_Uy").val();
        let Om = $("#Om").val();
        let config_pressure_measure = $("#config_pressure_measure.Uy").val();

        $.ajax({
            url: "/setting/post/save_pressuer_config",
            type: "POST",
            data: {MeterCode, NodeCode, X1, X2, UX, Y1, X1, Y2, UY, Om, config_pressure_measure},
            beforeSend: function () {
                // Hiện overlay khi bắt đầu tải
                showLoading();  
            },
            success: function(res){
                show_notification(res.message, res.success ? 'success' : 'error');
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

    })
})

$(document).ready(function(){
    $("#save_setting_conversion").on("click",function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let show_bar_to_m = ($("#show_bar_to_m").is(':checked')) ? 1 : 0;
        let conver_factor = $("#conver_factor").val();
        let compen_factor = $("#compen_factor").val();
        $.ajax({
            url: "/setting/post/save_setting_conversion",
            type: "POST",
            // contentType: "application/json",
            data:{
                MeterCode: MeterCode, 
                NodeCode: NodeCode, 
                show_bar_to_m: show_bar_to_m, 
                conver_factor: conver_factor, 
                compen_factor: compen_factor
            },
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
        })
    })
})



$(document).ready(function(){
    $("#collection_channel_device").change(function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let collection_channel_device = ($("#collection_channel_device").is(':checked')) ? 1 : 0;
        $.ajax({
            url: "/setting/post/collection_channel_device",
            type: "POST",
            contentType: "application/json",
            data:JSON.stringify({
                MeterCode: MeterCode, 
                NodeCode: NodeCode, 
                collection_channel_device: collection_channel_device
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
        })
    })
})

$(document).ready(function(){
    $("#delete_meter_acc").on("click",function(){
        if (confirm("Bạn có chắc chắn muốn xóa thiết bị này khỏi tài khoản ?")) {
            // Nếu bấm Yes
            let MeterCode = $(this).attr("MeterCode");
            let NodeCode = $(this).attr("NodeCode");
            $.ajax({
                url: "/setting/post/delete_meter_acc",
                type: "POST",
                // contentType: "application/json",
                data:{
                    MeterCode: MeterCode, 
                    NodeCode: NodeCode
                },
                beforeSend: function () {
                    showLoading();  // Hiện overlay khi bắt đầu tải
                },
                success: function(res){
                    show_notification(res.message, (res.success) ? "success" : "error");
                    setTimeout(() => {
                        // location.reload();
                        window.location.href = "/setting"
                      }, 1000);                },
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

    })
})

function search_meter_setting(){
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    let NodeCode = $("#filter_meter option:selected").attr("NodeCode");
    let val = $('#filter_tram option:selected').val();
    if(val =="all") val = null;
    // let select_dv_type = $('#filter_tram option:selected').attr('dv_type');
    // if(select_dv_type == "dvnd"){
    //     let dvql = $('#filter_tram option:selected').prevAll('option[dv_type="dvql"]').first().val();
    //     $('#config_meter_link_btn').attr('onclick', "window.location.href='/config_meter?MeterCode="+MeterCode+"&NodeCode="+NodeCode+"&donviquanly_id="+dvql+"&donvinguoidung_id="+val+"'");
    // }else{
    //     $('#config_meter_link_btn').attr('onclick', "window.location.href='/config_meter?MeterCode="+MeterCode+"&NodeCode="+NodeCode+"&donviquanly_id="+val+"&donvinguoidung_id=null'");
    // }
    $('#config_meter_link_btn').attr('onclick', "window.location.href='/config_meter?MeterCode=" + MeterCode + "&NodeCode=" + NodeCode + "'");
    $.ajax({
        url: "/setting/get/meter_info",
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
              $('#donvi').selectpicker('refresh');

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
            $(document).ready(function(){
                $("#delete_data").on("click", function(){
                    $("#delete_data_modal").modal("show");
                    get_and_render_delete_data_table();
                })
            })

           $(document).ready(function(){
            $("#save_info_meter").on("click",function(){
                // let tram_id = $("#donvi").children("option:selected").val();
                // let dv_type = $("#donvi").children("option:selected").attr("dv_type");
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let fields = $("#filter_field").val();
                let data_field_config = {};
                fields.forEach(field => {
                    data_field_config[field] = 1;
                });
                let meter_name = $("#meter_name").val();
                let location = {
                    lat: $("#meter_info_lat").val(),
                    lng: $("#meter_info_lng").val()
                }
                let address = $("#address_info").val();
                let note = $("#note_info").val();
                let ma_tram = $("#ma_tram").val();
                let ma_tinh = $("#ma_tinh").val();
                let ma_cong_trinh = $("#ma_cong_trinh").val();
                let type_auto = ($("#type_auto").is(':checked')) ? 1 : 0;
                $.ajax({
                    url: "/setting/post/save_meter_info",
                    type: "POST",
                    contentType: "application/json",
                    data:JSON.stringify({
                        MeterCode: MeterCode, 
                        NodeCode: NodeCode, 
                        data_field_config: data_field_config, 
                        meter_name: meter_name, 
                        location: location, 
                        address: address,
                        note: note,
                        type_auto: type_auto,
                        ma_tram: ma_tram,
                        ma_tinh: ma_tinh,
                        ma_cong_trinh: ma_cong_trinh,
                        // tram_id, 
                        // dv_type
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
                })
            })
        })

            $(document).ready(function () {
                $("#save_cycle_meter").on("click", function () {
                    let MeterCode = $(this).attr("MeterCode");
                    let NodeCode = $(this).attr("NodeCode");


                    let ip_ftp = $("#ip_ftp").val();
                    let field_ftp = $("#field_ftp").val();
                    let cycle_min = $("#cycle_min").val();
                    let cycle_time = $("#cycle_time").val();
                    let user_ftp = $("#user_ftp").val();
                    let pass_ftp = $("#pass_ftp").val();
                    let sync_tnmt_data = $("#sync_tnmt_data").is(':checked');
                    $.ajax({
                        url: "/setting/post/save_meter_cycle",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            MeterCode: MeterCode,
                            NodeCode: NodeCode,
                            ip_ftp: ip_ftp,
                            field_ftp: field_ftp,
                            cycle_min: cycle_min,
                            cycle_time: cycle_time,
                            user_ftp: user_ftp,
                            pass_ftp: pass_ftp,
                            sync_tnmt_data: sync_tnmt_data,
                        }),
                        beforeSend: function () {
                            showLoading();  // Hiện overlay khi bắt đầu tải
                        },
                        success: function (res) {
                            show_notification(res.message, (res.success) ? "success" : "error");
                            search_meter_setting();
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
                })
            })

        $(document).ready(function(){
            $(".save_alert_config").on("click",function(){
                let field = $(this).attr("field");
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                // let Qmax = null;
                // let Qmin = null;
                // if(field == "terminal_index"){
                //     Qmax = $("#terminal_index_Qmax").val();
                //     Qmin = $("#terminal_index_Qmin").val();
                // }
                let thresh_hold = [];
                $(".tr_"+field).each(function(){
                    let start = $(this).find(".start_"+field).val();
                    let end = $(this).find(".end_"+field).val();
                    let low = $(this).find(".low_"+field).val();
                    let high = $(this).find(".high_"+field).val();
            
                    if(start || end || low || high){
                        thresh_hold.push({
                            start: start || null,
                            end: end || null,
                            low: low || null,
                            high: high || null
                        })
                    }
            
                })
                $.ajax({
                    url: "/setting/post/save_alert_config",
                    type: "POST",
                    data: {MeterCode, NodeCode, field, thresh_hold: JSON.stringify(thresh_hold)},
                    beforeSend: function () {
                        // Hiện overlay khi bắt đầu tải
                        showLoading();  
                    },
                    success: function(res){
                        show_notification(res.message, res.success ? 'success' : 'error');
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
        
            })
        })

        $(document).ready(function(){
            $("#save_alert_voltage").on("click",function(){
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let threshold_pin = $("#threshold_pin").val();
                let threshold_battery = $("#threshold_battery").val();
                $.ajax({
                    url: "/setting/post/save_alert_voltage",
                    type: "POST",
                    data: {MeterCode, NodeCode, threshold_pin, threshold_battery},
                    beforeSend: function () {
                        // Hiện overlay khi bắt đầu tải
                        showLoading();  
                    },
                    success: function(res){
                        show_notification(res.message, res.success ? 'success' : 'error');
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
        
            })
        })

            $(document).ready(function () {
                $("#save_water_output").on("click", function () {
                    let MeterCode = $(this).attr("MeterCode");
                    let NodeCode = $(this).attr("NodeCode");
                    let min_exploitation_rate = $("#min_exploitation_rate").val();
                    let max_exploitation_rate = $("#max_exploitation_rate").val();
                    let daily_exploitation_limit = $("#daily_exploitation_limit").val();

                    // let water_output_year_min = $("#water_output_year_min").val();
                    // let water_output_year_max = $("#water_output_year_max").val();
                    $.ajax({
                        url: "/setting/post/save_water_output",
                        type: "POST",
                        data: { MeterCode, NodeCode, min_exploitation_rate, max_exploitation_rate, daily_exploitation_limit },
                        beforeSend: function () {
                            // Hiện overlay khi bắt đầu tải
                            showLoading();
                        },
                        success: function (res) {
                            show_notification(res.message, res.success ? 'success' : 'error');
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

                })
            })

            $(document).ready(function () {
                $("#save_threshold_terminal_index").on("click", function () {
                    let MeterCode = $(this).attr("MeterCode");
                    let NodeCode = $(this).attr("NodeCode");
                    let min_threshold_terminal_index = $("#min_threshold_terminal_index").val();
                    let max_threshold_terminal_index = $("#max_threshold_terminal_index").val();

                    // let water_output_year_min = $("#water_output_year_min").val();
                    // let water_output_year_max = $("#water_output_year_max").val();
                    $.ajax({
                        url: "/setting/post/save_threshold_terminal_index",
                        type: "POST",
                        data: { MeterCode, NodeCode, min_threshold_terminal_index, max_threshold_terminal_index },
                        beforeSend: function () {
                            // Hiện overlay khi bắt đầu tải
                            showLoading();
                        },
                        success: function (res) {
                            show_notification(res.message, res.success ? 'success' : 'error');
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

                })
            })

        $(document).ready(function(){
            $("#multiplier_first_index").on("click",function(){
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let multiplier = $("#multiplier").val();
                let first_index = $("#first_index").val();
                $.ajax({
                    url: "/setting/post/save_multiplier_first_index",
                    type: "POST",
                    data: {MeterCode, NodeCode, multiplier, first_index},
                    beforeSend: function () {
                        // Hiện overlay khi bắt đầu tải
                        showLoading();  
                    },
                    success: function(res){
                        show_notification(res.message, res.success ? 'success' : 'error');
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
        
            })
        })
        $(document).ready(function(){
            $("#compen_value_conver_value").on("click",function(){
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let compen_value = $("#compen_value").val();
                let conver_value = $("#conver_value").val();
                let tank_base_bottom = $("#tank_base_bottom").val();

                $.ajax({
                    url: "/setting/post/save_compen_value_conver_value",
                    type: "POST",
                    data: { MeterCode, NodeCode, compen_value, conver_value, tank_base_bottom },
                    beforeSend: function () {
                        // Hiện overlay khi bắt đầu tải
                        showLoading();  
                    },
                    success: function(res){
                        show_notification(res.message, res.success ? 'success' : 'error');
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
        
            })
        });
        $(document).ready(function(){
            $("#pressuer_config").on("click",function(){
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let X1 = $("#X1").val();
                let X2 = $("#X2").val();
                let UX = $("#Entity_Ux").val();
                let Y1 = $("#Y1").val();
                let Y2 = $("#Y2").val();
                let UY = $("#Entity_Uy").val();
                let Om = $("#Om").val();
                let config_pressure_measure = $("#config_pressure_measure.Uy").val();
        
                $.ajax({
                    url: "/setting/post/save_pressuer_config",
                    type: "POST",
                    data: {MeterCode, NodeCode, X1, X2, UX, Y1, X1, Y2, UY, Om, config_pressure_measure},
                    beforeSend: function () {
                        // Hiện overlay khi bắt đầu tải
                        showLoading();  
                    },
                    success: function(res){
                        show_notification(res.message, res.success ? 'success' : 'error');
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
        
            })
        })

        $(document).ready(function(){
            $("#save_setting_conversion").on("click",function(){
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let show_bar_to_m = ($("#show_bar_to_m").is(':checked')) ? 1 : 0;
                let conver_factor = $("#conver_factor").val();
                let compen_factor = $("#compen_factor").val();
                $.ajax({
                    url: "/setting/post/save_setting_conversion",
                    type: "POST",
                    contentType: "application/json",
                    data:JSON.stringify({
                        MeterCode: MeterCode, 
                        NodeCode: NodeCode, 
                        show_bar_to_m: show_bar_to_m, 
                        conver_factor: conver_factor, 
                        compen_factor: compen_factor
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
                })
            })
        })

        $(document).ready(function(){
            $("#collection_channel_device").change(function(){
                let MeterCode = $(this).attr("MeterCode");
                let NodeCode = $(this).attr("NodeCode");
                let collection_channel_device = ($("#collection_channel_device").is(':checked')) ? 1 : 0;
                $.ajax({
                    url: "/setting/post/collection_channel_device",
                    type: "POST",
                    contentType: "application/json",
                    data:JSON.stringify({
                        MeterCode: MeterCode, 
                        NodeCode: NodeCode, 
                        collection_channel_device: collection_channel_device
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
                })
            })
        })

        $(document).ready(function(){
            $("#delete_meter_acc").on("click",function(){
                if (confirm("Bạn có chắc chắn muốn xóa thiết bị này khỏi tài khoản ?")) {
                    // Nếu bấm Yes
                    let MeterCode = $(this).attr("MeterCode");
                    let NodeCode = $(this).attr("NodeCode");
                    $.ajax({
                        url: "/setting/post/delete_meter_acc",
                        type: "POST",
                        // contentType: "application/json",
                        data:{
                            MeterCode: MeterCode, 
                            NodeCode: NodeCode
                        },
                        beforeSend: function () {
                            showLoading();  // Hiện overlay khi bắt đầu tải
                        },
                        success: function(res){
                            show_notification(res.message, (res.success) ? "success" : "error");
                            setTimeout(() => {
                                // location.reload();
                                window.location.href = "/setting"

                              }, 1000);                },
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
        
            })
        })
        $(document).ready(function(){
            $("#log_user").on("click",function(){
                $("#log_user_modal").modal("show");
                get_and_render_log_user();
            })
        })
        

        }
    })
}

$(document).ready(function(){
    $("#filter_meter").on("change", function(){
        $("#Metercode_read").val( $(this).children("option:selected").attr("MeterCode"))
        search_meter_setting();
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
                $("#Metercode_read").val( $("#filter_meter").children("option:selected").attr("MeterCode"))
                search_meter_setting();

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
    $("#log_user").on("click",function(){
        $("#log_user_modal").modal("show");
        get_and_render_log_user();
    })
})

function modifi_log_user(data){
    var y=[];
    for(let i=0; i<data.length; i++){
      let x ={ 
        stt: (i+1), 
        time: new Date(data[i].time).toLocaleString('en-GB'),
        user: data[i].user,
        action: data[i].action,
        value: return_log_user_detail(data[i].value) 
      }
      y.push(x);
    }
    return(y);
}

function return_log_user_detail(x){
    if(x == "" || x == null) return "-";
    try{
        let data = JSON.parse(x);
        let str = "";
        if(Array.isArray(data)){
            for(let i = 0; i<data.length; i++){
                for(const key in data[i]){
                    str += '<strong>'+return_field_name(key)+'</strong>:' + ' ' + show_if_null_text(data[i][key]) + '<br>'
                }
                str+= "---------<br>"
            }
        }else{
            for(const key in data){
                str += '<strong>'+return_field_name(key)+'</strong>:' + ' ' + show_if_null_text(data[key]) + '<br>'
            }
        }
        return str;
    }catch(e){
        return x;
    }
}


$(document).ready(function(){
      if ($("#delete_data_modal").length){
    $(function(){
        $("#delete_data_time_from").daterangepicker(
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
        $("#delete_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#delete_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#delete_data_time_to").daterangepicker(
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
        $("#delete_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#delete_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
      }

})


$(document).ready(function(){
    $("#delete_data").on("click", function(){
        $("#delete_data_modal").modal("show");
        get_and_render_delete_data_table();
    })
})


function get_and_render_delete_data_table(){
    let start_date = $("#delete_data_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#delete_data_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let MeterCode = $("#delete_data").attr("MeterCode");
    let NodeCode = $("#delete_data").attr("NodeCode");
    $("#delete_data_modal_title").html("Xóa bản tin " + MeterCode)
       $.ajax({
        url: "/setting/get/delete_meter_data",
        type: "GET",
        data:{start_date, end_date, MeterCode, NodeCode},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            render_delete_data_table(res.data, JSON.parse(res.data_field_config))

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


function render_delete_data_table(data,data_field_config){
        if( $.fn.DataTable.isDataTable('#delete_data_table') ) {
            $('#delete_data_table').DataTable().clear().destroy();
          }
          $('#head_delete_table_data').empty();
          $("#body_delete_table_data").empty();
            let x = '<th class="border_th_d">Xóa</th><th class="border_th_d" style="min-width: 7%">STT</th><th class="border_th_d" style="min-width: 16%">'+translate_text('Thời gian')+'</th>'
            $("#head_delete_table_data").append(x);
            let COLUMS = [
            {data: "del_btn", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "index", className: "text-center-data-table align-middle border_config_eq_td_d"},
            {data: "MeterTime", className: "text-center-data-table align-middle border_config_eq_td_d"}
          ]
          for(const key in data_field_config ){
            if(data_field_config[key] == 1 && key != "OP"){
              COLUMS.push({data: key, className: "text-right-data-table align-middle border_config_eq_td_d"})
              let y = '<th class="border_th_d" >'+shortToFullName(key)+'</th>'
              $("#head_delete_table_data").append(y);
            }
          }
          if ($("#delete_data_table").length) {
              $('#delete_data_table').DataTable({
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
                  data: modifi_delete_data(data,data_field_config),
                initComplete: function (settings, json) {
                     $(document).ready(function(){
                        $(".delete_data_btn").on("click",function(){
                            let idkey = $(this).attr("idkey");
                            console.log(idkey)
                        $.ajax({
                            url: "/setting/post/delete_OP_data",
                            type: "POST",
                            data:{idkey},
                            beforeSend: function () {
                                showLoading();  // Hiện overlay khi bắt đầu tải
                            },
                            success: function(res){
                                show_notification(res.message, (res.success) ? "success" : "error");
                                 get_and_render_delete_data_table();
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
                        })
                    })
                }
              });
          } else {
              console.error("Bảng #delete_data_table không tồn tại");
          }
          

    
} 


function modifi_delete_data(data,data_field_config){
    let x = [];
    let count = 0;
    for(let i=data.length-1; i>=0; i--){
        count +=1;
        let y = {
        del_btn: "<button class='btn btn-danger delete_data_btn' idkey='"+data[i].id+"'>Xóa</button>",
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
    $("#delete_data_search").on("click",function(){
                get_and_render_delete_data_table();
    })
  })


  $(document).ready(function(){
    $("#log_user_search").on("click",function(){
        get_and_render_log_user();
    })
  })


  function get_and_render_log_user(){
        let MeterCode = $("#log_user").attr("MeterCode");
        let NodeCode = $("#log_user").attr("NodeCode");
        let start_date = $("#log_user_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
        let end_date = $("#log_user_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
        $("#log_user_modal_title").html("Lịch sử cài đặt "+MeterCode)
        $.ajax({
            url: "/setting/get/log_user",
            type: "GET",
            contentType: "application/json",
            data: {MeterCode, NodeCode, start_date, end_date},
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                console.log(res)
                let data = res.data;
                if( $.fn.DataTable.isDataTable('#log_user_table') ) {
                    $('#log_user_table').DataTable().clear().destroy();
                    }
                    if ($("#log_user_table").length) {
                    $('#log_user_table').DataTable({
                        // dom:'t',
                        language : translate_data_table(LANG),
                        "lengthMenu": [30, 60, 100],
                        "pageLength": 30,
                        "columnDefs": [
                            { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4] },
                            { "orderable": false, "targets": [] },
                            { "orderable": true, "targets": [ 1, 2, 3, 4,] }
                            ],
                            autoWidth: false,
                        columns: [
                            {data: "stt", className: "text-center-data-table align-middle"},
                            {data: "time", className: "text-center-data-table align-middle"},
                            {data: "user", className: "text-left-data-table align-middle"},
                            {data: "action", className: "text-left-data-table align-middle"},
                            {data: "value", className: "text-left-data-table align-middle"},
                        ],
                        data: modifi_log_user(data),
                        // stateSave: true,
                        initComplete: function (settings, json) {
            
                        }
        
                    })
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
    $(function(){
        $("#log_user_time_from").daterangepicker(
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
        $("#log_user_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#log_user_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#log_user_time_to").daterangepicker(
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
        $("#log_user_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#log_user_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
      

})


$(document).ready(function(){
    $('#log_user_modal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex',0);
        $(this).find('input').not("#static_group").val("");
        $("#log_user_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#log_user_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#log_user_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#log_user_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));

    })
  })


  $(document).ready(function(){
    $('#log_user_modal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex',0);
        $(this).find('input').not("#static_group").val("");
        $("#log_user_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#log_user_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#log_user_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#log_user_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));

    })
  })


    $(document).ready(function(){
    $('#delete_data_modal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex',0);
        $(this).find('input').not("#static_group").val("");
        $("#delete_data_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#delete_data_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#delete_data_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#delete_data_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));

    })
  })


$(document).ready(function () {
    $(".delete_data_btn").on("click", function () {
        let idkey = $(this).attr("idkey");
        console.log(idkey)
        $.ajax({
            url: "/setting/post/delete_OP_data",
            type: "POST",
            data: { idkey },
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                show_notification(res.message, (res.success) ? "success" : "error");
                get_and_render_delete_data_table();
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
    })
})