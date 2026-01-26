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

function containsVietnameseChars(str) {
    let vietnameseRegex = /[àáảãạăắằẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
    return vietnameseRegex.test(str);
}

function show_if_null_group(x){
    if(x === "" || x === null) 
      return "Chưa thuộc nhóm nào";
    return x;
  }

  function translate(str){
    if(LANG =="en"){
      return str;
  
    }else{
      switch(str){
        case "Full name cannot be empty!":
            return "Họ và tên không được để trống!"
        case "Are your want delete this account?":
        return "Bạn có chắc muốn xóa tài khoàn này?";
        case "Username cannot be empty!":
        return "Tên đăng nhập không được để trống";
        case "Invalid email format!":
        return "Sai định dạng email";
        case "User Email cannot be empty!":
        return "Email không được để trống";
        case "Password cannot be empty!":
        return "Mật khẩu không được để trống";
        case "Confirm Password cannot be empty!":
        return "Xác nhận mật khẩu không được để trống";
        case "Password must be at least 8 characters long!":
        return "Mật khẩu phải có độ dài ít nhất 8 ký tự";
        case "Username already taken. Please try another!":
        return "Tên đăng nhập đã được sử dụng";
        case "Email already taken. Please try another!":
        return "Email đã được sử dụng";
        case "delete":
        return "xóa";
        case "The password and confirm password must be match!":
        return "Xác nhận mật khẩu không khớp"
        case "Meter code cannot be empty!":
        return "Mã thiết bị không được để trống!"
        case "Meter name cannot be empty!":
        return "Mã thiết bị không được để trống!"
      }
    }
  }

  function validateEmail(email) 
  {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
  }


window.onload = function(){
    get_user_list();
}

function get_user_list(){
    $.ajax({
        url: "/manage/get/user_list",
        type: "GET",
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            let user_list = res.data;
            render_user_list_table(user_list);
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


function render_user_list_table(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#user_table') ) {
            $('#user_table').DataTable().clear().destroy();
        }
        $('#user_table_body').empty();
        if ($("#user_table").length) {
            $('#user_table').DataTable({
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2, 3 ] }
                  ],
                //   autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                //   paging: true,
                //   searching: true,
                columns: [
                    {data: "index", className: "text-center-data-table align-middle"},
                    {data: "username", className: "text-left-data-table align-middle"},
                    {data: "email", className: "text-left-data-table align-middle"},
                    {data: "name", className: "text-left-data-table align-middle"},
                    {data: "role", className: "text-center-data-table align-middle"},
                    {data: "status", className: "text-center-data-table align-middle"},
                    { data: "allow_req_api", className: "text-center-data-table align-middle" },
                    {data: "action", className: "text-center-data-table align-middle"},
                ],
                data: modifi_data(data),
                initComplete: function (settings, json) {
                        $('input[type="search"]').attr('autocomplete', 'off');

                    $(document).ready(function(){
                    //   $(".role_selecter").on("change",function(){
                    //     var acc_id = $(this).attr("acc_id");
                    //     var new_value = $(this).val();
                    //     var previous_value = $(this).attr("previous_value");
                    //     if(!confirm(`Bạn muốn đổi vai trò user này ?`)){
                    //       // chọn không
                    //       $(this).val(previous_value); 
                    //     }else{
                    //       $(this).attr("previous_value",new_value);
                    //       change_role(acc_id,new_value);
                    //     }
                    //   });
                      $(".bootstrap_toggle").bootstrapToggle();
                    //   $(".user_status").on("change",function(){
                    //     if(ON_OFF_STATUS){
                    //     let isChecked = $(this).prop("checked");
                    //     if(!confirm(`Bạn muốn đổi trạng thái user này ?`)){
                    //         // chọn không
                    //         ON_OFF_STATUS = 0;
                    //         $(this).bootstrapToggle(isChecked ? "off" : "on");
                    //         ON_OFF_STATUS = 1;
                    //       }else{
                    //         let status = $(this).is(':checked') ? 1 : 0;
                    //         let user_id = $(this).attr("user_id");
                    //         change_user_status(user_id, status);
                    //       }
                    //     }
                    //   });
                    //     $(".user_allow_req_api").on("change", function () {
                    //         if (ON_OFF_ALLOW_REQ_API) {
                    //             let isChecked = $(this).prop("checked");
                    //             if (!confirm(`Bạn muốn đổi quyền truy cập api user này ?`)) {
                    //                 // chọn không
                    //                 ON_OFF_ALLOW_REQ_API = 0;
                    //                 $(this).bootstrapToggle(isChecked ? "off" : "on");
                    //                 ON_OFF_ALLOW_REQ_API = 1;
                    //             } else {
                    //                 let status = $(this).is(':checked') ? 1 : 0;
                    //                 let user_id = $(this).attr("user_id");
                    //                 change_user_allow_req_api(user_id, status);
                    //             }
                    //         }
                    // });
                    //   $(".delete_user").on("click",function(){
                    //     if(confirm(`Bạn muốn xóa người dùng này ?`)){
                    //         let user_id = $(this).attr("user_id");
                    //         delete_user(user_id);                            
                    //     }
                    //   });
                    //   $(".setting_user").on("click",function(){
                    //     let user_id = $(this).attr("user_id");
                    //     let username = $(this).attr("username")
                    //     setting_user(user_id, username);
                    //   })
                    })
                }
            });
        } else {
            console.error("Bảng #user_table không tồn tại");
        }
        $('#user_table').on('draw.dt', function () {
            // $(".role_selecter").on("change",function(){
            //     var acc_id = $(this).attr("acc_id");
            //     var new_value = $(this).val();
            //     var previous_value = $(this).attr("previous_value");
            //     if(!confirm(`Bạn muốn đổi vai trò user này ?`)){
            //       // chọn không
            //       $(this).val(previous_value); 
            //     }else{
            //       $(this).attr("previous_value",new_value);
            //       change_role(acc_id,new_value);
            //     }
            //   });
              $(".bootstrap_toggle").bootstrapToggle();
            //   $(".user_status").on("change",function(){
            //     if(ON_OFF_STATUS){
            //     let isChecked = $(this).prop("checked");
            //     if(!confirm(`Bạn muốn đổi trạng thái user này ?`)){
            //         // chọn không
            //         ON_OFF_STATUS = 0;
            //         $(this).bootstrapToggle(isChecked ? "off" : "on");
            //         ON_OFF_STATUS = 1;
            //       }else{
            //         let status = $(this).is(':checked') ? 1 : 0;
            //         let user_id = $(this).attr("user_id");
            //         change_user_status(user_id, status);
            //       }
            //     }
            //   });
            // $(".user_allow_req_api").on("change", function () {
            //     if (ON_OFF_ALLOW_REQ_API) {
            //         let isChecked = $(this).prop("checked");
            //         if (!confirm(`Bạn muốn đổi quyền truy cập api user này ?`)) {
            //             // chọn không
            //             ON_OFF_ALLOW_REQ_API = 0;
            //             $(this).bootstrapToggle(isChecked ? "off" : "on");
            //             ON_OFF_ALLOW_REQ_API = 1;
            //         } else {
            //             let status = $(this).is(':checked') ? 1 : 0;
            //             let user_id = $(this).attr("user_id");
            //             change_user_allow_req_api(user_id, status);
            //         }
            //     }
            // });
              
            //   $(".delete_user").on("click",function(){
            //     if(confirm(`Bạn muốn xóa người dùng này ?`)){
            //         let user_id = $(this).attr("user_id");
            //         delete_user(user_id);                            
            //     }
            //   });
            //   $(".setting_user").on("click",function(){
            //     let user_id = $(this).attr("user_id");
            //     let username = $(this).attr("username")
            //     setting_user(user_id, username);
            //   })
        });
    })
}


$(document).ready(function(){
    $('#user_table').on("change", ".role_selecter", function () {
        var acc_id = $(this).attr("acc_id");
        var new_value = $(this).val();
        var previous_value = $(this).attr("previous_value");
        if (!confirm(`Bạn muốn đổi vai trò user này ?`)) {
            // chọn không
            $(this).val(previous_value);
        } else {
            $(this).attr("previous_value", new_value);
            change_role(acc_id, new_value);
        }
    });
    $('#user_table').on("change", ".user_status", function () {
        if (ON_OFF_STATUS) {
            let isChecked = $(this).prop("checked");
            if (!confirm(`Bạn muốn đổi trạng thái user này ?`)) {
                // chọn không
                ON_OFF_STATUS = 0;
                $(this).bootstrapToggle(isChecked ? "off" : "on");
                ON_OFF_STATUS = 1;
            } else {
                let status = $(this).is(':checked') ? 1 : 0;
                let user_id = $(this).attr("user_id");
                change_user_status(user_id, status);
            }
        }
    });
    $('#user_table').on("change", ".user_allow_req_api", function () {
        if (ON_OFF_ALLOW_REQ_API) {
            let isChecked = $(this).prop("checked");
            if (!confirm(`Bạn muốn đổi quyền truy cập api user này ?`)) {
                // chọn không
                ON_OFF_ALLOW_REQ_API = 0;
                $(this).bootstrapToggle(isChecked ? "off" : "on");
                ON_OFF_ALLOW_REQ_API = 1;
            } else {
                let status = $(this).is(':checked') ? 1 : 0;
                let user_id = $(this).attr("user_id");
                change_user_allow_req_api(user_id, status);
            }
        }
    });
    $('#user_table').on("click", ".delete_user", function () {
        if (confirm(`Bạn muốn xóa người dùng này ?`)) {
            let user_id = $(this).attr("user_id");
            delete_user(user_id);
        }
    });
    $('#user_table').on("click", ".setting_user", function () {
        let user_id = $(this).attr("user_id");
        let username = $(this).attr("username")
        setting_user(user_id, username);
    });
})

var ON_OFF_STATUS = 1;
var ON_OFF_ALLOW_REQ_API = 1;

function modifi_data(data){
    var y=[];
    let index = 1;
    for(let i=0; i<data.length; i++){
      let x ={ 
      index: index,
      username: data[i].user_name,
      email: show_if_null_text(data[i].email),
      name: show_if_null_text(data[i].name),
      role: '<select previous_value="'+data[i].role+'" class="role_selecter" acc_id="'+data[i].id+'"><option value="admin" '+((data[i].role == "admin") ? "selected" : "")+'>Admin</option><option value="sub" '+((data[i].role == "sub") ? "selected" : "")+'>Người dùng</option></selected>',
      creat_at: new Date(data[i].created_at).toLocaleString('en-GB'),
      status: '<input type="checkbox" class="bootstrap_toggle user_status" ' + ((data[i].status == 1) ? "checked" : "" )+ ' data-toggle="toggle" data-on="On" data-off="Off" data-onstyle="success" data-offstyle="danger" data-width="50" user_id="'+data[i].id+'" data-size="sm">',
          allow_req_api: '<input type="checkbox" class="bootstrap_toggle user_allow_req_api" ' + ((data[i].allow_req_api == 1) ? "checked" : "") + ' data-toggle="toggle" data-on="On" data-off="Off" data-onstyle="success" data-offstyle="danger" data-width="50" user_id="' + data[i].id + '" data-size="sm">',

      action: '<button class="btn btn-danger delete_user mr-2" user_id="'+data[i].id+'"><i class="fa fa-trash"></i></button><button class="btn btn-success setting_user mr-2" user_id="'+data[i].id+'" username="'+data[i].user_name+'"><i class="fas fa-cog"></i></button>'
      }
      index ++;
      y.push(x);
    }
    return(y);
}


function change_role(acc_id,role){
    $.ajax({
        url: "/manage/change/user_role",
        type: "POST",
        data:{acc_id, role},
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

function change_user_status(user_id, status){
    $.ajax({
        url: "/manage/change/user_status",
        type: "POST",
        data:{user_id, status},
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

function change_user_allow_req_api(user_id, allow_req_api) {
    $.ajax({
        url: "/manage/change/user_allow_req_api",
        type: "POST",
        data: { user_id, allow_req_api },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            show_notification(res.message, (res.success) ? "success" : "error");
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
}


function delete_user(user_id){
    $.ajax({
        url: "/manage/delete/user",
        type: "POST",
        data:{user_id},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            show_notification(res.message, (res.success) ? "success" : "error");
            get_user_list();
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

var USER_ID = null;
function setting_user(user_id, username){
    USER_ID = user_id;
    $("#set_role").modal("show");
    $("#username").html(username);
    CHECKALL = 0;
    $("#checkAllEQ").prop("checked",false);
    CHECKALL = 1;
    $.ajax({
        url: "/manage/get/set_role_dvql",
        type: "GET",
        data:{user_id},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            let dvql = res.dvql;

            // console.log(dvql)
            $("#set_role_select_dvql").empty();
            for(let i=0; i<dvql.length; i++){
                $("#set_role_select_dvql").append("<option value='"+dvql[i].id+"' >"+dvql[i].org_name+"</option>")
            }
            get_set_role_meter_list();
            let tabs = res.access_menu ? res.access_menu.split(',') : [];
            let role = res.role;
            if(role == "admin"){
                $(".admin_menu").css("display", "block")
            }else{
                $(".admin_menu").css("display", "none")
            }
            $(".access_menu").prop("checked",false);
            tabs.forEach(e => {
                $('.access_menu[access_menu="' + e + '"]').prop("checked", true);
            });

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
    $("#set_role_select_dvql").on("change",function(){
        get_set_role_meter_list();
    })
})

function get_set_role_meter_list(){
    let dvql_id = $("#set_role_select_dvql").val();
    $.ajax({
        url: "/manage/get/set_role_meter_list",
        type: "GET",
        data:{USER_ID, dvql_id},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            render_set_role_meter_list(res.meter_list);
            let inh_group = res.inh;
            let selected_inh = res.selected_inh.map(i => i.org_id);
            $("#set_role_select_inherit_group").empty();
            let str = "";
            for (let i = 0; i < inh_group.length; i++) {
                str += '<option ' + ((selected_inh.includes(inh_group[i].org_id)) ? "selected" : "")+' value="' + inh_group[i].org_id + '">' + inh_group[i].org_name + '</option>'
            }
            $("#set_role_select_inherit_group").append(str);
            $('#set_role_select_inherit_group').select2({
                theme: 'bootstrap4',
                closeOnSelect: false,
                tags: true
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
           hideLoading()  // Ẩn overlay sau khi tải xong
        }
    })
}


var oTable = null;

function render_set_role_meter_list(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#table_setrole') ) {
            $('#table_setrole').DataTable().clear().destroy();
        }
        $('#table_setrole_body').empty();
        if ($("#table_setrole").length) {
            oTable = $('#table_setrole').DataTable({
                // dom:'t',
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2, 3] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "check_box", className: "text-center-data-table align-middle"},
                    {data: "meter_name", className: "text-left-data-table align-middle"},
                    {data: "MeterCode", className: "text-left-data-table align-middle"},
                    {data: "dvql", className: "text-left-data-table align-middle"},
                    // {data: "nhom", className: "text-left-data-table align-middle"}
                ],
                data: modifi_meter_list_setrole(data),
                // stateSave: true,
                initComplete: function (settings, json) {
                    // $(document).ready(function(){
                    //     $.fn.DataTable.ext.search.push((_,__,i) => {
                    //         const currentTr = oTable.row(i).node();
                    //         const inputMatch = $(currentTr)
                    //           .find('select,input')
                    //           .toArray()
                    //           .some(input => $(input).val().toLowerCase().includes( $('#search_3').val().toLowerCase()));
                    //         const textMatch = $(currentTr)
                    //           .children()
                    //           .not('td:has("input,select")')
                    //           .toArray()
                    //           .some(td => $(td).text().toLowerCase().includes($('#search_3').val().toLowerCase()))
                    //         return inputMatch || textMatch || $('#search_3').val() == ''
                    //       });
                    //       $('#search_3').on('keyup', () => oTable.draw());
                    // })
                }

            })
            var allPages = oTable.cells().nodes();
        }
    })
}

function modifi_meter_list_setrole(data){
    var y=[];
    for(let i=0; i<data.length; i++){
      let x ={ 
        check_box: '<input type="checkbox" class="set_role_meter" MeterCode="'+data[i].MeterCode+'" NodeCode="'+data[i].NodeCode+'" '+((data[i].group_id != null) ? "checked" : "")+'>',
        meter_name: data[i].meter_name,
        MeterCode: data[i].MeterCode,
        dvql: show_if_null_text(data[i].donviquanly_name),
        // nhom: show_if_null_text(data[i].donvinguoidung_name),

      }
      y.push(x);
    }
    return(y);
}

$(document).ready(function(){
    $("#save_setrole").on("click",function(){
        let arr_meter = [];
        let dvql_id = $("#set_role_select_dvql").val();
        if(dvql_id == null || dvql_id == ""){
            show_notification("Không có đơn vị quản lý", "error");
            return false;
        }
        oTable.$(".set_role_meter:checked").each(function(){
            arr_meter.push({
                MeterCode: $(this).attr("MeterCode"),
                NodeCode: $(this).attr("NodeCode")
            })
        })
        let inh_group = $("#set_role_select_inherit_group").val();
        let access_menu = [];
        $(".access_menu:checked").each(function(){
            access_menu.push($(this).attr("access_menu"))
        })
        $.ajax({
            url: "/manage/post/set_role",
            type: "POST",
            data: { user_id: USER_ID, arr_meter: JSON.stringify(arr_meter), dvql_id, inh_group: JSON.stringify(inh_group), access_menu: access_menu.join(",") },
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                show_notification(res.message, (res.success) ? "success" : "error");
                if(res.success){
                    $("#set_role").modal("hide")
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
    })
})

var CHECKALL = 1;
$(document).ready(function(){
    $(document).on("click","#checkAllEQ",function(){
        if(CHECKALL == 1){
            if($(this).is(":checked")){
                oTable.$("input[type='checkbox']").prop("checked",true);
              }else{
                oTable.$("input[type='checkbox']").prop("checked",false);
              }
        }
      })
})

var CHECK_ALL_RESIGN = 1;
$(document).ready(function(){
    $(document).on("click","#check_all_resign_meter_list",function(){
        if(CHECK_ALL_RESIGN == 1){
            if($(this).is(":checked")){
                resign_meter_list_otable.$("input[type='checkbox']").prop("checked",true);
              }else{
                resign_meter_list_otable.$("input[type='checkbox']").prop("checked",false);
              }
        }
      })
})
$(document).ready(function(){
    $("#add_user").on("click",function(){
        $('#addAcountModal').modal('show');
        get_resign_meter_list();
        CHECK_ALL_RESIGN = 0;
        $("#check_all_resign_meter_list").prop("checked",false);
        CHECK_ALL_RESIGN = 1;
    })
})

function get_resign_meter_list(){
    $.ajax({
        url: "/manage/get/resign_meter_list",
        type: "GET",
        data:{},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            render_resign_meter_list(res.data);
            let inh_group = res.inh;
            $("#select_inherit_group").empty();
            let str = "";
            for(let i=0; i<inh_group.length; i++){
                str+= '<option value="'+inh_group[i].org_id+'">'+inh_group[i].org_name+'</option>'
            }
            $("#select_inherit_group").append(str);
            $('#select_inherit_group').select2({
                theme: 'bootstrap4',
                closeOnSelect: false,
                tags: true
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
           hideLoading()  // Ẩn overlay sau khi tải xong
        }
    })
}

var resign_meter_list_otable = null;
function render_resign_meter_list(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#resign_meter_list') ) {
            $('#resign_meter_list').DataTable().clear().destroy();
            // resign_meter_list_otable.clear().destroy();
            // resign_meter_list_otable = null;
        }
        // $('#resign_meter_list').empty();
        if ($("#resign_meter_list").length) {
            resign_meter_list_otable = $('#resign_meter_list').DataTable({
                // dom:'t',
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 1, 2, 3] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "check_box", className: "text-center-data-table align-middle"},
                    {data: "meter_name", className: "text-left-data-table align-middle"},
                    {data: "MeterCode", className: "text-left-data-table align-middle"},
                    {data: "dvql", className: "text-left-data-table align-middle"},
                    // {data: "nhom", className: "text-left-data-table align-middle"}
                ],
                data: modifi_resign_meter_list(data),
                // stateSave: true,
                initComplete: function (settings, json) {
   
                }

            })
            var allPages = resign_meter_list_otable.cells().nodes();
        }
    })
}

function modifi_resign_meter_list(data){
    var y=[];
    for(let i=0; i<data.length; i++){
      let x ={ 
        check_box: '<input type="checkbox" class="set_resign_meter_list" MeterCode="'+data[i].MeterCode+'" NodeCode="'+data[i].NodeCode+'">',
        meter_name: data[i].meter_name,
        MeterCode: data[i].MeterCode,
        dvql: show_if_null_text(data[i].donviquanly_name),
        // nhom: show_if_null_text(data[i].donvinguoidung_name),
      }
      y.push(x);
    }
    return(y);
}


$(document).ready(function(){
    $("#addAcountModal").on('hidden.bs.modal', function (){
      $("#alert_message").css("display","none")
      $("#mode_container").css("display","block")
      $("#alert_message").html("");
      $("#username_register").val("");
      $("#pwd").val("");
      $("#cfpwd").val("");
      $("#email").val("");
      $("#full_name").val("");
      $("#resign_dvql_name").val("");

      $("#roleSubcriber").prop("checked",true);
      $("#mode_read_write").prop("checked",true)

    })
  })

  function resign(){
    let role = document.querySelector('input[name="role"]:checked').value;
      let allow_req_api = document.querySelector('input[name="allow_req_api"]:checked').value;
    let email = document.getElementById("email").value;
    let full_name = document.getElementById("full_name").value;
    let username = document.getElementById("username_register").value;
    let pass = document.getElementById("pwd").value;
    let cf = document.getElementById("cfpwd").value;
    let arr_meter = [];
    let resign_dvql_name = $("#resign_dvql_name").val();
    if(resign_dvql_name =="" || resign_dvql_name == null){
        $("#alert_message").css("display","block")
        $("#alert_message").html("Tên đơn vị quản lý không được để trống");
        $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
        return false;
    }
    if(username == ""){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("Username cannot be empty!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      return false;
    }else if(username.includes(" ")){
        $("#alert_message").css("display","block")
        $("#alert_message").html("Tên đăng nhập không được chứa khoảng trắng!")
        $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
        return false;
    }
    else if(containsVietnameseChars(username)){
        $("#alert_message").css("display","block")
        $("#alert_message").html("Tên đăng nhập không được chứa dấu tiếng việt!")
        $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
        return false;
    }
    else if(email == ""){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("User Email cannot be empty!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      return false;
    }
    else if(full_name == ""){
        $("#alert_message").css("display","block")
        $("#alert_message").html(translate("Full name cannot be empty!"))
        $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
        return false;
      }
    else if(!validateEmail(email)){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("Invalid email format!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      return false;
    }
    else if(pass == ""){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("Password cannot be empty!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      $("#pwd").val("");
      $("#cfpwd").val("");
      return false;
    }
    else if(cf == ""){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("Confirm Password cannot be empty!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      $("#pwd").val("");
      $("#cfpwd").val("");
      return false;
    }
    else if(pass.length < 8){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("Password must be at least 8 characters long!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      $("#pwd").val("");
      $("#cfpwd").val("");
      return false;
    }
    else if(pass != cf){
      $("#alert_message").css("display","block")
      $("#alert_message").html(translate("The password and confirm password must be match!"))
      $('#addAcountModal').animate({ scrollTop: 0 }, 'fast');
      $("#pwd").val("");
      $("#cfpwd").val("");
      return false;
    }
    else{
      $("#alert_message").css("display","none")
      $("#alert_message").html("");

      resign_meter_list_otable.$(".set_resign_meter_list:checked").each(function(){
        arr_meter.push({
            MeterCode: $(this).attr("MeterCode"),
            NodeCode: $(this).attr("NodeCode")
        })
    })
        let inh_group = $("#select_inherit_group").val()
      $.ajax({
        url: "/manage/register_admin",
        type: "POST",
          data: { email, username, pass, role, allow_req_api, full_name, resign_dvql_name, arr_meter: JSON.stringify(arr_meter), inh_group: JSON.stringify(inh_group)},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            show_notification(res.message, (res.success) ? "success" : "error");
            if(res.success){
                $('#addAcountModal').modal('hide');
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

            get_user_list();


        }
    })
    //   httpAsync(postData,"/registerAdmin","POST",function(result){
    //    if(result == "failUserName"){
    //     $("#alert_message").css("display","block")
    //     $("#alert_message").html(translate("Username already taken. Please try another!"))
    //     return false;
    //    }else if(result == "failEmail"){
    //     $("#alert_message").css("display","block")
    //     $("#alert_message").html(translate("Email already taken. Please try another!"))
    //     return false;
    //    }else{
    //      alert(result);
    //      $("#alert_message").html("");
    //      $("#username").val("");
    //      $("#pwd").val("");
    //      $("#cfpwd").val("");
    //      $("#email").val("");
    //    }
    //   })
    }
  }

// $(document).ready(function(){
//     $("#add_meter").on("click",function(){
        
//     })
// })

$(document).ready(function(){
    $("#mange_meter").on("click",function(){
        $("#mange_group").modal("show");
        get_danhsachdonvi();
    })
})

function get_danhsachdonvi(){
    $.ajax({
        url: "/manage/get/danhsachdonvi",
        type: "GET",
        data:{},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            render_danhsachdonvi(res.danhsachdonvi);
            DANHSACHTRAM = res.danhsachdonvi;

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

var datatable_1;
function render_danhsachdonvi(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#danhsachdonvi') ) {
            $('#danhsachdonvi').DataTable().clear().destroy();
        }
        $('#danhsachdonvi_body').empty();
        if ($("#danhsachdonvi").length) {
            datatable_1 =     $('#danhsachdonvi').DataTable({
                // dom:'t',
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2 ] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "index", className: "text-center-data-table align-middle"},
                    {data: "name", className: "text-left-data-table align-middle"},
                    {data: "action", className: "text-center-data-table align-middle"},
                ],
                data: modifi_danhsachdonvi_data(data),
                initComplete: function (settings, json) {
                    $(document).ready(function(){
                        // bấm vào nút xóa đơn vị
                        $(".delete_donvi").on("click",function(){
                            if(confirm(`Bạn muốn xóa đơn vị này ?`)){
                                let donvi_id = $(this).attr("donvi_id");
                                $.ajax({
                                    url: "/manage/delete/donvi",
                                    type: "POST",
                                    data:{donvi_id},
                                    beforeSend: function () {
                                        showLoading();  // Hiện overlay khi bắt đầu tải
                                    },
                                    success: function(res){
                                        show_notification(res.message, (res.success) ? "success" : "error");
                                        get_danhsachdonvi();
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
                    
                        })
                        // bấm vào nút cài đặt/ lưu
                        $(".edit_save_donvi").on("click",function(){
                            let donvi_id = $(this).attr("donvi_id");
                            let mode = $(this).attr("mode")
                            if(mode == "edit"){
                                $("#edit_icon_"+donvi_id).hide();
                                $("#save_icon_"+donvi_id).show();
                                $("#input_"+donvi_id).prop("readonly", false).focus();
                                $(this).attr("mode","save");
                            }else{
                                let ten_donvi = $("#input_"+donvi_id).val();
                                $.ajax({
                                    url: "/manage/post/suatendonvi",
                                    type: "POST",
                                    data:{ten_donvi, donvi_id},
                                    beforeSend: function () {
                                        showLoading();  // Hiện overlay khi bắt đầu tải
                                    },
                                    success: function(res){
                                        show_notification(res.message, (res.success) ? "success" : "error");
                                        if(res.success){
                                            $("#edit_icon_"+donvi_id).show();
                                            $("#save_icon_"+donvi_id).hide();
                                            $("#edit_save_donvi_"+donvi_id).attr("mode","edit");
                                            $("#input_"+donvi_id).prop("readonly", true)
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
                        })

                        // xử lý search được giá trị bên trong input
                        $.fn.DataTable.ext.search.push((_,__,i) => {
                            const currentTr = datatable_1.row(i).node();
                            const inputMatch = $(currentTr)
                              .find('select,input')
                              .toArray()
                              .some(input => $(input).val().toLowerCase().includes( $('#search').val().toLowerCase()));
                            const textMatch = $(currentTr)
                              .children()
                              .not('td:has("input,select")')
                              .toArray()
                              .some(td => $(td).text().toLowerCase().includes($('#search').val().toLowerCase()))
                            return inputMatch || textMatch || $('#search').val() == ''
                          });
                          $('#search').on('keyup', () => datatable_1.draw());

                      })
                }
            })
        }else {
            console.error("Bảng #danhsachdonvi không tồn tại");
        }
    })
}




function modifi_danhsachdonvi_data(data){
    var y=[];
    let index = 1;
    for(let i=0; i<data.length; i++){
      let x ={ 
      index: index,
      name: '<input class="form-control" id="input_'+data[i].id+'" donvi_id="'+data[i].id+'" value="'+data[i].org_name+'" readonly>',
    action: '<button class="btn btn-success edit_save_donvi mr-2" id="edit_save_donvi_'+data[i].id+'" donvi_id="'+data[i].id+'" mode="edit"><i class="fas fa-cog" id="edit_icon_'+data[i].id+'"></i><i class="fas fa-save" style="display: none;" id="save_icon_'+data[i].id+'"></i></button>'
    //   action: '<button class="btn btn-danger delete_donvi mr-2" donvi_id="'+data[i].id+'"><i class="fa fa-trash"></i></button><button class="btn btn-success edit_save_donvi mr-2" id="edit_save_donvi_'+data[i].id+'" donvi_id="'+data[i].id+'" mode="edit"><i class="fas fa-cog" id="edit_icon_'+data[i].id+'"></i><i class="fas fa-save" style="display: none;" id="save_icon_'+data[i].id+'"></i></button>'
      }
      index ++;
      y.push(x);
    }
    return(y);
}

$(document).ready(function(){
    $("#themdonvi").on("click",function(){
        let ten_donvi = $("#ten_donvi").val();
        if(ten_donvi == "" || ten_donvi == null){
            show_notification("Tên đơn vị không được để trống!", "error");
            return;
        }
        $.ajax({
            url: "/manage/post/themdonvi",
            type: "POST",
            data:{ten_donvi},
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                show_notification(res.message, (res.success) ? "success" : "error");
                $("#ten_donvi").val("");
                get_danhsachdonvi();

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
    $('#mange_group').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex',0);
        $(this).find('input').not("#static_group").val("");
    })
  })


 $(document).ready(function(){
    $("#dvnd_tab").on("click",function(){
        // get_danhsachtram()
        get_dvql();

    })
 })
 
$(document).ready(function(){
    $("#manage_select_dvql").on("change", function(){
        get_danhsachnhom()
    })
})


function get_dvql(){
    $.ajax({
        url: "/manage/get/danhsach_dvql",
        type: "GET",
        data:{},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            let data = res.data;
            $("#manage_select_dvql").empty();
            let str = "";
            for(let i=0; i<data.length; i++){
                str += "<option value='"+data[i].id+"'>"+data[i].org_name+"</option>"
            }
            $("#manage_select_dvql").append(str);
            get_danhsachnhom();

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
    $("#themnhom").on("click",function(){
        let ten_nhom = $("#ten_nhom").val();
        let dvql_id = $("#manage_select_dvql").val();
        if(ten_nhom == "" || ten_nhom == null){
            show_notification("Tên nhóm không được để trống!", "error");
            return;
        }
        $.ajax({
            url: "/manage/post/themnhom",
            type: "POST",
            data:{ten_nhom, dvql_id},
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function(res){
                show_notification(res.message, (res.success) ? "success" : "error");
                $("#ten_nhom").val("");
                get_danhsachnhom();

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


function get_danhsachnhom(){
    let dvql_id = $("#manage_select_dvql").val();
    $.ajax({
        url: "/manage/get/danhsachnhom",
        type: "GET",
        data:{dvql_id},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            let danhsachnhom = res.danhsachnhom;
            render_danhsachnhom(res.danhsachnhom);
            console.log(danhsachnhom)
            $("#manage_select_dvnd").empty();
            let str = "";
            for(let i=0; i<danhsachnhom.length; i++){
                str += "<option value='"+danhsachnhom[i].id+"'>"+danhsachnhom[i].org_name+"</option>"
            }
            $("#manage_select_dvnd").append(str);
            get_render_group_meter();

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


function get_render_group_meter(){
    let dvnd_id = $("#manage_select_dvnd").val();
    let dvql_id = $("#manage_select_dvql").val();
      CHECK_ALL_DANHSACHTHIETBI = 0;
    $("#check_all_danhsachthietbi").prop("checked",false);
    CHECK_ALL_DANHSACHTHIETBI = 1;
    $.ajax({
        url: "/manage/get/danhsachthietbi",
        type: "GET",
        data: { dvnd_id, dvql_id },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            renderdanhsachthietbi(res.meter_list)

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

function renderdanhsachthietbi(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#danhsachthietbi') ) {
            $('#danhsachthietbi').DataTable().clear().destroy();
        }
        if ($("#danhsachthietbi").length) {
            danhsachthietbi_otable = $('#danhsachthietbi').DataTable({
                // dom:'t',
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 1, 2, 3, 4] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "check_box", className: "text-center-data-table align-middle"},
                    {data: "meter_name", className: "text-left-data-table align-middle"},
                    {data: "MeterCode", className: "text-left-data-table align-middle"},
                    {data: "dvql", className: "text-left-data-table align-middle"},
                    // {data: "nhom", className: "text-left-data-table align-middle"},
                    {data: "is_pipe", className: "text-center-data-table align-middle"}

                ],
                data: modifi_danhsachthietbi(data),
                // stateSave: true,
                initComplete: function (settings, json) {
   
                }

            })
            var allPages = danhsachthietbi_otable.cells().nodes();
        }
    })
}

function modifi_danhsachthietbi(data){
    let dvnd_id = $("#manage_select_dvnd").val();
    let dvql_id = $("#manage_select_dvql").val();
    var y=[];
    for(let i=0; i<data.length; i++){
      let x ={ 
        check_box: '<input type="checkbox" class="set_danhsachthietbi" MeterCode="'+data[i].MeterCode+'" NodeCode="'+data[i].NodeCode+'" '+((data[i].donvinguoidung_id == dvnd_id) ? "checked " : "") + '>',
        meter_name: data[i].meter_name,
        MeterCode: data[i].MeterCode,
        dvql: show_if_null_text(data[i].donviquanly_name),
        is_pipe: '<input type="checkbox" class="set_is_pipe" MeterCode="'+data[i].MeterCode+'" NodeCode="'+data[i].NodeCode+'" '+((data[i].is_pipe == 1) ? "checked " : "") + '>'

      }
      y.push(x);
    }
    return(y);
}


$(document).ready(function(){
    $("#manage_select_dvnd").on("change",function(){
        get_render_group_meter()
    })
})

var CHECK_ALL_DANHSACHTHIETBI = 1;
$(document).ready(function(){
    $(document).on("click","#check_all_danhsachthietbi",function(){
        if(CHECK_ALL_DANHSACHTHIETBI == 1){
            if($(this).is(":checked")){
                danhsachthietbi_otable.$("input[type='checkbox'].set_danhsachthietbi:not(:disabled)").prop("checked",true);
              }else{
                danhsachthietbi_otable.$("input[type='checkbox'].set_danhsachthietbi:not(:disabled)").prop("checked",false);
              }
        }
      })
})

$(document).ready(function(){
    $(document).on("click",".set_is_pipe", function(){
      danhsachthietbi_otable.$("input[type='checkbox'].set_is_pipe:not(:disabled)").not(this).prop("checked",false);
      let this_MeterCode = $(this).attr("MeterCode");
      let this_NodeCode = $(this).attr("NodeCode");
      danhsachthietbi_otable.$("input[type='checkbox'].set_danhsachthietbi:not(:disabled)[MeterCode='"+this_MeterCode+"'][NodeCode='"+this_NodeCode+"']").prop("checked",true);
    })
  })

function save_manage_danhsachthietbi(){
    let dvnd_id = $("#manage_select_dvnd").val();
    let arr_meter = [];
    danhsachthietbi_otable.$(".set_danhsachthietbi:checked:not(:disabled)").each(function(){
        let MeterCode = $(this).attr("MeterCode");
        let NodeCode = $(this).attr("NodeCode");
        let is_pipe = danhsachthietbi_otable.$("input[type='checkbox'].set_is_pipe:not(:disabled)[MeterCode='"+MeterCode+"'][NodeCode='"+NodeCode+"']").prop("checked");
        arr_meter.push({
            MeterCode: MeterCode,
            NodeCode: NodeCode,
            is_pipe: (is_pipe) ? 1 : 0
        })
    })
    $.ajax({
        url: "/manage/post/save_manage_danhsachthietbi",
        type: "POST",
        data:{dvnd_id, arr_meter: JSON.stringify(arr_meter)},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            show_notification(res.message, (res.success) ? "success" : "error");
            get_render_group_meter()
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



var datatable_danhsachnhom = null;
function render_danhsachnhom(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#danhsachnhom') ) {
            $('#danhsachnhom').DataTable().clear().destroy();
        }
        $('#danhsachnhom_body').empty();
        if ($("#danhsachnhom").length) {
            datatable_danhsachnhom =     $('#danhsachnhom').DataTable({
                // dom:'t',
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2 ] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "index", className: "text-center-data-table align-middle"},
                    {data: "name", className: "text-left-data-table align-middle"},
                    {data: "action", className: "text-center-data-table align-middle"},
                ],
                data: modifi_danhsachnhom_data(data),
                initComplete: function (settings, json) {
                    $(document).ready(function(){
                        // bấm vào nút xóa đơn vị
                        $(".delete_nhom").on("click",function(){
                            if(confirm(`Bạn muốn xóa nhóm này ?`)){
                                let nhom_id = $(this).attr("nhom_id");
                                console.log(nhom_id)
                                $.ajax({
                                    url: "/manage/delete/nhom",
                                    type: "POST",
                                    data:{nhom_id},
                                    beforeSend: function () {
                                        showLoading();  // Hiện overlay khi bắt đầu tải
                                    },
                                    success: function(res){
                                        show_notification(res.message, (res.success) ? "success" : "error");
                                        get_danhsachnhom();
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
                    
                        })
                        // bấm vào nút cài đặt/ lưu
                        $(".edit_save_nhom").on("click",function(){
                            let nhom_id = $(this).attr("nhom_id");
                            let mode = $(this).attr("mode");
                            let dvql_id = $("#manage_select_dvql").val();
                            if(mode == "edit"){
                                $("#edit_icon_"+nhom_id).hide();
                                $("#save_icon_"+nhom_id).show();
                                $("#input_"+nhom_id).prop("readonly", false).focus();
                                $(this).attr("mode","save");
                            }else{
                                let ten_nhom = $("#input_"+nhom_id).val();
                                $.ajax({
                                    url: "/manage/post/suatennhom",
                                    type: "POST",
                                    data:{ten_nhom, nhom_id, dvql_id},
                                    beforeSend: function () {
                                        showLoading();  // Hiện overlay khi bắt đầu tải
                                    },
                                    success: function(res){
                                        show_notification(res.message, (res.success) ? "success" : "error");
                                        if(res.success){
                                            $("#edit_icon_"+nhom_id).show();
                                            $("#save_icon_"+nhom_id).hide();
                                            $("#edit_save_nhom_"+nhom_id).attr("mode","edit");
                                            $("#input_"+nhom_id).prop("readonly", true)
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
                        })

                        // xử lý search được giá trị bên trong input
                        $.fn.DataTable.ext.search.push((_,__,i) => {
                            const currentTr = datatable_danhsachnhom.row(i).node();
                            const inputMatch = $(currentTr)
                              .find('select,input')
                              .toArray()
                              .some(input => $(input).val().toLowerCase().includes( $('#search_datatable_danhsachnhom').val().toLowerCase()));
                            const textMatch = $(currentTr)
                              .children()
                              .not('td:has("input,select")')
                              .toArray()
                              .some(td => $(td).text().toLowerCase().includes($('#search_datatable_danhsachnhom').val().toLowerCase()))
                            return inputMatch || textMatch || $('#search_datatable_danhsachnhom').val() == ''
                          });
                          $('#search_datatable_danhsachnhom').on('keyup', () => datatable_danhsachnhom.draw());

                      })
                }
            })
        }else {
            console.error("Bảng #danhsachnhom không tồn tại");
        }
    })
}

function modifi_danhsachnhom_data(data){
    var y=[];
    let index = 1;
    for(let i=0; i<data.length; i++){
      let x ={ 
      index: index,
      name: '<input class="form-control" id="input_'+data[i].id+'" nhom_id="'+data[i].id+'" value="'+data[i].org_name+'" readonly>',
    // action: '<button class="btn btn-success edit_save_donvi mr-2" id="edit_save_donvi_'+data[i].id+'" donvi_id="'+data[i].id+'" mode="edit"><i class="fas fa-cog" id="edit_icon_'+data[i].id+'"></i><i class="fas fa-save" style="display: none;" id="save_icon_'+data[i].id+'"></i></button>'
      action: '<button class="btn btn-danger delete_nhom mr-2" nhom_id="'+data[i].id+'"><i class="fa fa-trash"></i></button><button class="btn btn-success edit_save_nhom mr-2" id="edit_save_nhom_'+data[i].id+'" nhom_id="'+data[i].id+'" mode="edit"><i class="fas fa-cog" id="edit_icon_'+data[i].id+'"></i><i class="fas fa-save" style="display: none;" id="save_icon_'+data[i].id+'"></i></button>'
      }
      index ++;
      y.push(x);
    }
    return(y);
}

 var DANHSACHTRAM = [];
 function get_danhsachtram(){
    $.ajax({
        url: "/manage/get/danhsachtram",
        type: "GET",
        data:{},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function(res){
            render_danhsachtram(res.danhsachtram);
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

var oTable_2 = null;

function render_danhsachtram(data){
    $(document).ready(function(){
        if( $.fn.DataTable.isDataTable('#danhsachtram') ) {
            $('#danhsachtram').DataTable().clear().destroy();
        }
        $('#danhsachtram_body').empty();
        if ($("#danhsachtram").length) {
            oTable_2 =   $('#danhsachtram').DataTable({
                // dom:'t',
                language : translate_data_table(LANG),
                "lengthMenu": [30, 60, 100],
                "pageLength": 30,
                "columnDefs": [
                    { className: "dt-head-center", targets: [ 0, 1, 2] },
                    { "orderable": false, "targets": [] },
                    { "orderable": true, "targets": [ 0, 1, 2 ] }
                  ],
                  autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
                  paging: true,
                  searching: true,
                columns: [
                    {data: "index", className: "text-center-data-table align-middle"},
                    {data: "name", className: "text-left-data-table align-middle"},
                    {data: "MeterCode", className: "text-left-data-table align-middle"},
                    {data: "thuocdonvi", className: "text-left-data-table align-middle"},
                ],
                data: modifi_danhsachtram_data(data),
                initComplete: function (settings, json) {
                    $(document).ready(function(){
                        oTable_2.$('.selectpicker').selectpicker({
                             noneSelectedText: "Chọn trạm"
                        });
                        // oTable_2.$('.selectpicker').selectpicker('refresh');
                        
                        oTable_2.$(".pick_donvi").on("change", function(){
                        let donvi_id = $(this).val();
                        let MeterCode = $(this).attr("MeterCode");
                        let NodeCode = $(this).attr("NodeCode");
                        if(donvi_id != "" && donvi_id != null){
                            $.ajax({
                                url: "/manage/post/doi_donvi",
                                type: "POST",
                                data:{MeterCode, NodeCode, donvi_id},
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
                    })

                    // xử lý search được giá trị bên trong input
                    $.fn.DataTable.ext.search.push((_,__,i) => {
                        const currentTr = oTable_2.row(i).node();
                        const inputMatch = $(currentTr)
                            .find('select option:selected, input')
                            .toArray()
                            .some(input => $(input).text().toLowerCase().includes( $('#search_2').val().toLowerCase()));
                        const textMatch = $(currentTr)
                            .children()
                            .not('td:has("input,select")')
                            .toArray()
                            .some(td => $(td).text().toLowerCase().includes($('#search_2').val().toLowerCase()))
                        return inputMatch || textMatch || $('#search_2').val() == ''
                        });
                        $('#search_2').on('keyup', () => oTable_2.draw());
                    })

                    
                }, 
                stateSave: true
            })
            var allPages = oTable_2.cells().nodes();
        }else {
            console.error("Bảng #danhsachtram không tồn tại");
        }
    })
}

function modifi_danhsachtram_data(data){
    var y=[];
    let index = 1;
    for(let i=0; i<data.length; i++){
      let x ={ 
        index: index,
        name: show_if_null_text(data[i].meter_name),
        MeterCode: show_if_null_text(data[i].MeterCode),
        thuocdonvi: '<select tram_diemdo_id="'+data[i].tram_diemdo_id+'" class="form-control selectpicker pick_donvi" data-live-search="true" MeterCode="'+data[i].MeterCode+'" NodeCode="'+data[i].NodeCode+'">'+return_option_danhsachtram(DANHSACHTRAM, data[i].parent_id)+'</select>'
      }
      index ++;
      y.push(x);
    }
    return(y);
}


function return_option_danhsachtram(DANHSACHTRAM, selected_id){
    let x;
    if(selected_id === null){
        x = '<option value="Chọn trạm" disabled selected>Chọn trạm</option>';
    }else{
        x = '<option value="Chọn trạm" disabled>Chọn trạm</option>';
    }
    for(let i=0; i < DANHSACHTRAM.length; i++){
        x+= '<option value="'+DANHSACHTRAM[i].id+'" '+((DANHSACHTRAM[i].id == selected_id) ? 'selected' : "")+'>'+DANHSACHTRAM[i].name+'</option>'
    }
    return x
}

