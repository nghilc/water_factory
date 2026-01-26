
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


function change_user_info(){
    let full_name = $("#profile_full_name").val();
    let mail = $("#profile_mail").val();
    $.ajax({
        url: "/profile/post/user_info",
        type: "POST",
        data:{full_name, mail},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            show_notification(res.message, (res.success) ? "success" : "error");
            if(!res.success) get_info_val();
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

function get_info_val(){
    $.ajax({
        url: "/profile/get/user_info",
        type: "GET",
        data:{},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            $("#profile_full_name").val(res.name);
            $("#profile_mail").val(res.mail);
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

function change_password(){
    let current_password = $("#current_password").val();
    let new_password = $("#new_password").val();
    let confirm_new_password = $("#confirm_new_password").val();
    if(new_password != confirm_new_password){
        show_notification("Xác nhận mật khẩu không chính xác", "error");
        return ;
    }
    let mail = $("#profile_mail").val();
    $.ajax({
        url: "/profile/post/change_password",
        type: "POST",
        data:{current_password, new_password},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            show_notification(res.message, (res.success) ? "success" : "error");
                $("#current_password").val("");
                $("#new_password").val("");
                $("#confirm_new_password").val("");

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

function save_menu_option_setting(){
    let menu_option = $('input[name="menu_option"]:checked').val();
    $.ajax({
        url: "/profile/post/menu_option",
        type: "POST",
        data:{menu_option},
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
}


$(document).ready(function(){
    $(".bootstrap_toggle").bootstrapToggle();
})

var ON_OFF_STATUS = 1;

$(document).ready(function(){
    $(".noti_setting_sw").on("change",function(){
        let dvql_id = $(this).attr("dvql_id");
        let status =  $(this).is(':checked') ? 1 : 0;
        if(ON_OFF_STATUS){
            if(confirm(`Bạn muốn đổi trạng thái nhận thông báo cảnh báo từ đơn vị quản lý này ?`)){
                // chọn có
                console.log(dvql_id, status)
                $.ajax({
                    url: "/profile/post/change_noti_popup_status",
                    type: "POST",
                    data:{dvql_id, status},
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
            }else{
                    // chọn không
                    let isChecked = $(this).prop("checked");
                    ON_OFF_STATUS = 0;
                    $(this).bootstrapToggle(isChecked ? "off" : "on");
                    ON_OFF_STATUS = 1;
            }
        }

    })
})