var LANG = "vi";


$(document).ready(function(){
    if (localStorage.getItem('org_id')) {
        $('#filter_danhsachtram')
            .selectpicker('val', localStorage.getItem('org_id'))
    }else{
        $('#filter_danhsachtram')
            .selectpicker('val', "all")
    }
    let val = $("#filter_danhsachtram").children("option:selected").val();
    let type = $("#filter_danhsachtram").children("option:selected").attr("dv_type");
    $.ajax({
        url: "/setting/get/danhsachthietbi",
        type: "GET",
        data: { org_id: val, type },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let danh_sach_thiet_bị = res.danh_sach_thiet_bị;
            let x;
            $("#filter_meter").empty();
            for (let i = 0; i < danh_sach_thiet_bị.length; i++) {
                x += "<option MeterCode ='" + danh_sach_thiet_bị[i].MeterCode + "' data-tokens ='" + danh_sach_thiet_bị[i].MeterCode + "'>" + danh_sach_thiet_bị[i].meter_name + "</option>";
            }
            $("#filter_meter").append(x);
            $('#filter_meter').selectpicker('refresh');
            $('#filter_meter').selectpicker('val', $("#filter_meter option:eq(0)").text());
            $('#filter_meter').selectpicker('refresh');
            $("#Metercode_read").val($(this).children("option:selected").attr("MeterCode"))

            if (danh_sach_thiet_bị.length > 0) {
                $("#Metercode_read").val($("#filter_meter").children("option:selected").attr("MeterCode"))

            } else {
                $("#Metercode_read").val("")
            }
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

$(document).ready(function () {
    $("#filter_danhsachtram").change(function () {
        let val = $(this).children("option:selected").val();
        let type = $(this).children("option:selected").attr("dv_type");
        localStorage.setItem('org_id', val);
        $.ajax({
            url: "/setting/get/danhsachthietbi",
            type: "GET",
            data: { org_id: val, type },
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                let danh_sach_thiet_bị = res.danh_sach_thiet_bị;
                let x;
                $("#filter_meter").empty();
                for (let i = 0; i < danh_sach_thiet_bị.length; i++) {
                    x += "<option MeterCode ='" + danh_sach_thiet_bị[i].MeterCode + "' data-tokens ='" + danh_sach_thiet_bị[i].MeterCode + "'>" + danh_sach_thiet_bị[i].meter_name + "</option>";
                }
                $("#filter_meter").append(x);
                $('#filter_meter').selectpicker('refresh');
                $('#filter_meter').selectpicker('val', $("#filter_meter option:eq(0)").text());
                $('#filter_meter').selectpicker('refresh');

                if (danh_sach_thiet_bị.length > 0){
                    $("#Metercode_read").val($("#filter_meter").children("option:selected").attr("MeterCode"))
                }else{
                    $("#Metercode_read").val("")
                }
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
    $(document).on("click","#save_info_meter",function(){
        let MeterCode = $(this).attr("MeterCode");
        let meter_type = $(this).attr("meter_type");
        let location = {
            lat: ($("#meter_info_lat").val() == "") ? null : $("#meter_info_lat").val(),
            lng: ($("#meter_info_lng").val() == "") ? null : $("#meter_info_lng").val(),
        }
        let meter_name = $("#meter_name").val();
        $.ajax({
            url: "/setting/post/save_meter_info",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                MeterCode: MeterCode, 
                meter_name: meter_name, 
                location: location, 
                meter_type: meter_type,
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


$(document).ready(function () {
    $(document).on("click", "#save_meter_alert", function () {
        let MeterCode = $(this).attr("MeterCode");
        let meter_type = $(this).attr("meter_type");
        function getVal(id) {
            let v = $("#" + id).val();
            return v === "" ? null : parseFloat(v);
        }

        const fields = [
            ["doduc"],
            ["ph"],
            ["nhietdo"],
            ["clodu"],
            ["EC"],
            ["docung"],
            ["doman"],
            ["mucnuoc"]
        ];

        for (let f of fields) {
            let name = f[0];

            let min = getVal("min_" + name);
            let max = getVal("max_" + name);

            if (min !== null && max !== null && min > max) {
                show_notification(
                    `Giá trị ngưỡng dưới không được lớn hơn ngưỡng trên`,
                    "error"
                );
                return false;
            }
        }

        $.ajax({
            url: "/setting/post/save_meter_alert",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                MeterCode: MeterCode,
                meter_type: meter_type,
                min_doduc: ($("#min_doduc").val() == "") ? null : $("#min_doduc").val(),
                max_doduc: ($("#max_doduc").val() == "") ? null : $("#max_doduc").val(),
                min_ph: ($("#min_ph").val() == "") ? null : $("#min_ph").val(),
                max_ph: ($("#max_ph").val() == "") ? null : $("#max_ph").val(),
                min_nhietdo: ($("#min_nhietdo").val() == "") ? null : $("#min_nhietdo").val(),
                max_nhietdo: ($("#max_nhietdo").val() == "") ? null : $("#max_nhietdo").val(),
                min_clodu: ($("#min_clodu").val() == "") ? null : $("#min_clodu").val(),
                max_clodu: ($("#max_clodu").val() == "") ? null : $("#max_clodu").val(),
                min_EC: ($("#min_EC").val() == "") ? null : $("#min_EC").val(),
                max_EC: ($("#max_EC").val() == "") ? null : $("#max_EC").val(),
                min_docung: ($("#min_docung").val() == "") ? null : $("#min_docung").val(),
                max_docung: ($("#max_docung").val() == "") ? null : $("#max_docung").val(),
                min_doman: ($("#min_doman").val() == "") ? null : $("#min_doman").val(),
                max_doman: ($("#max_doman").val() == "") ? null : $("#max_doman").val(),
                min_mucnuoc: ($("#min_mucnuoc").val() == "") ? null : $("#min_mucnuoc").val(),
                max_mucnuoc: ($("#max_mucnuoc").val() == "") ? null : $("#max_mucnuoc").val(),

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







function search_meter_setting(){
    let MeterCode = $("#filter_meter option:selected").attr("MeterCode");
    $.ajax({
        url: "/setting/get/meter_info",
        type: "GET",
        data:{MeterCode},
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


$(document).ready(function () {
    $("#filter_meter").on("change", function () {
        $("#Metercode_read").val($(this).children("option:selected").attr("MeterCode"))
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



