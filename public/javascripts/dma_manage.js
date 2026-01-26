
var LANG = "vi";



$(document).ready(function(){
    get_dma_list();
})


function get_dma_list(){
    $.ajax({
        url: "/DMA/get/DMA_list",
        type: "GET",
        data: {},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            DATA = res.data;
            render_dma_list_datatable(DATA);
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

function render_dma_list_datatable(data){
    if ($.fn.DataTable.isDataTable('#table_dma_list_data')) {
        $('#table_dma_list_data').DataTable().clear().destroy();
    }
    $("#body_table_dma_list_data").empty();
    if ($("#table_dma_list_data").length) {
        $('#table_dma_list_data').DataTable({
            language: translate_data_table(LANG),
            "lengthMenu": [30, 60, 100],
            "pageLength": 30,
            "columnDefs": [
                { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4, 5, 6] },
                { "orderable": false, "targets": [] },
                { "orderable": true, "targets": [ 1, 2, 3, 4, 5] }
              ],
            autoWidth: false, // Tránh lỗi về tính toán chiều rộng cột
            paging: true,
            searching: true,
            columns: [
                { data: "index", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "org_code", className: "text-center-data-table align-middle border_config_eq_td_d" },
                { data: "org_name", className: "text-left-data-table align-middle border_config_eq_td_d" },
                { data: "org_note", className: "text-left-data-table align-middle border_config_eq_td_d" },
                { data: "number_meter_in", className: "text-right-data-table align-middle border_config_eq_td_d" },
                { data: "number_meter_out", className: "text-right-data-table align-middle border_config_eq_td_d" },
                { data: "action", className: "text-center-data-table align-middle border_config_eq_td_d" }

            ],
            data: modifi_list_data(data),
            initComplete: function (settings, json) {
                $('input[type="search"]').attr('autocomplete', 'off');
                $(document).ready(function () {
                    $(".delete_dma").on("click", function () {
                        let nhom_id = $(this).attr("org_id");
                        if (confirm(`Bạn muốn xóa DMA này ?`)) {
                            $.ajax({
                                url: "/manage/delete/nhom",
                                type: "POST",
                                data: { nhom_id },
                                beforeSend: function () {
                                    showLoading();  // Hiện overlay khi bắt đầu tải
                                },
                                success: function (res) {
                                    show_notification(res.message, (res.success) ? "success" : "error");
                                    get_dma_list();
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


                    })
                })
                $(document).ready(function () {
                    $(".edit_dma").on("click", function () {
                        EDIT_DMA_ID = $(this).attr("org_id");
                        repair_edit();
                    })
                })
              
            }
        });
    } else {
        console.error("Bảng #table_dma_list_data không tồn tại");
    }
}

function modifi_list_data(data) {
    var y = [];
    let index = 1;
    for (let i = 0; i < data.length; i++) {
        let x = {
            index: index,
            org_code: show_if_null_text(data[i].org_code),
            org_name: show_if_null_text(data[i].org_name),
            org_note: show_if_null_text(data[i].org_note),
            number_meter_in: data[i].number_meter_in,
            number_meter_out: data[i].number_meter_out,
            action: '<button class="btn btn-default edit_dma mr-2" title="Sửa" org_id="' + data[i].id + '"><i class="fas fa-cog"></i></button><button title="Xóa" class="btn btn-default mr-2 delete_dma" org_id="' + data[i].id + '"><i class="fa fa-trash"></i></button>'
        }
        index++;
        y.push(x);
    }
    return (y);
}

function add_dma(){
    $("#add_dma").modal("show");
    $("#add_dma_title").html("Thêm mới DMA");
    $("#save_add_dma").css("display", "inline");
    $("#save_edit_dma").css("display", "none");
    $.ajax({
        url: "/manage/get/danhsach_dvql",
        type: "GET",
        data: {},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let data = res.data;
            $("#group_dvql").empty();
            let str = "";
            for (let i = 0; i < data.length; i++) {
                str += "<option value='" + data[i].id + "'>" + data[i].org_name + "</option>"
            }
            $("#group_dvql").append(str);
            get_tong_nhanh();
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

function get_tong_nhanh(){
    $.ajax({
        url: "/DMA/get/uncheck_meter_list",
        type: "GET",
        data: {},
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let data = res.data;
            $("#select_meter_in").empty();
            $("#select_meter_out").empty();

            let str = "";
            for(let i=0; i<data.length; i++){
                str+= '<option value="'+data[i].MeterCode+'" MeterCode="'+data[i].MeterCode+'" NodeCode="'+data[i].NodeCode+'" data-tokens="'+data[i].MeterCode+'" >'+data[i].meter_name+'</option>'
                
            }
            $("#select_meter_in").append(str);
            $("#select_meter_out").append(str);
            $('.select2bs4').select2({
                theme: 'bootstrap4',
                closeOnSelect: false,
                matcher: function (params, data) {
                    if ($.trim(params.term) === '') {
                        return data;
                    }

                    const term = params.term.toLowerCase();
                    const text = data.text.toLowerCase();
                    // const value = (data.element.value || '').toLowerCase();
                    const metercode = (data.element.dataset.tokens || '').toLowerCase();

                    if (
                        text.includes(term) ||
                        //   value.includes(term) ||
                        metercode.includes(term)
                    ) {
                        return data;
                    }

                    return null;
                }
            })
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

$(document).ready(function(){
    $("#save_add_dma").on("click",function(){
        let dvql_id = $("#group_dvql").val();
        let dma_name = $("#dma_name").val();
        let dma_code = $("#dma_code").val();
        let dma_note = $("#dma_note").val();
        let loss_fre = $("#loss_fre").val();
        let loss_threshold = $("#loss_threshold").val();
        let sum_in = $("#select_meter_in").val();
        let sum_out = $("#select_meter_out").val();
        $.ajax({
            url: "/DMA/post/save_add_dma",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                dvql_id: dvql_id,
                dma_name: dma_name,
                dma_code: dma_code,
                dma_note: dma_note,
                loss_fre: loss_fre,
                loss_threshold: loss_threshold,
                sum_in: sum_in,
                sum_out: sum_out
            }),
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                show_notification(res.message, (res.success) ? "success" : "error");
                if (res.success){
                    $("#add_dma").modal("hide");
                    get_dma_list();
                }
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
    $('#add_dma').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex', 0);
        $(this).find('input').not("#static_group").val("");
    })
  })


  $(document).ready(function(){
      $(".delete_dma").on("click",function(){
          let nhom_id = $(this).attr("org_id");
              if (confirm(`Bạn muốn xóa DMA này ?`)) {
                  $.ajax({
                      url: "/manage/delete/nhom",
                      type: "POST",
                      data: { nhom_id },
                      beforeSend: function () {
                          showLoading();  // Hiện overlay khi bắt đầu tải
                      },
                      success: function (res) {
                          show_notification(res.message, (res.success) ? "success" : "error");
                          get_dma_list();
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

          
      })
  })

  var EDIT_DMA_ID = null;
  $(document).ready(function(){
      $(".edit_dma").on("click",function(){
          EDIT_DMA_ID = $(this).attr("org_id");
        repair_edit();
      })
  })

  function repair_edit(){
    $("#add_dma").modal("show");
    $("#add_dma_title").html("Chỉnh sửa DMA");
    $("#save_add_dma").css("display", "none");
    $("#save_edit_dma").css("display", "inline");
      $.ajax({
          url: "/manage/get/danhsach_dvql",
          type: "GET",
          data: {},
          beforeSend: function () {
              showLoading();  // Hiện overlay khi bắt đầu tải
          },
          success: function (res) {
              let data = res.data;
              $("#group_dvql").empty();
              let str = "";
              for (let i = 0; i < data.length; i++) {
                  str += "<option selected value='" + data[i].id + "'>" + data[i].org_name + "</option>"
              }

              $("#group_dvql").append(str);
              get_dma_info();
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

function get_dma_info(){
    $.ajax({
        url: "/DMA/get/dma_info",
        type: "GET",
        data: { org_id: EDIT_DMA_ID },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            let data = res.data;
            let info = res.info;
            // let data2 = res.data2
            $("#select_meter_in").empty();
            $("#select_meter_out").empty();

            let str = "";
            let str_in = "";
            let str_out = "";
            for (let i = 0; i < data.length; i++) {
                if(data[i].is_pipe == null) {
                    str_in += '<option value="' + data[i].MeterCode + '" MeterCode="' + data[i].MeterCode + '" NodeCode="' + data[i].NodeCode + '" data-tokens="' + data[i].MeterCode + '" >' + data[i].meter_name + '</option>';
                    str_out += '<option value="' + data[i].MeterCode + '" MeterCode="' + data[i].MeterCode + '" NodeCode="' + data[i].NodeCode + '" data-tokens="' + data[i].MeterCode + '" >' + data[i].meter_name + '</option>';
                } else if (data[i].is_pipe == 0 || data[i].is_pipe == "0"){
                    str_in += '<option value="' + data[i].MeterCode + '" MeterCode="' + data[i].MeterCode + '" NodeCode="' + data[i].NodeCode + '" data-tokens="' + data[i].MeterCode + '" >' + data[i].meter_name + '</option>';
                    str_out += '<option selected value="' + data[i].MeterCode + '" MeterCode="' + data[i].MeterCode + '" NodeCode="' + data[i].NodeCode + '" data-tokens="' + data[i].MeterCode + '" >' + data[i].meter_name + '</option>';
                } else if (data[i].is_pipe == 1 || data[i].is_pipe == "1"){
                    str_in += '<option selected value="' + data[i].MeterCode + '" MeterCode="' + data[i].MeterCode + '" NodeCode="' + data[i].NodeCode + '" data-tokens="' + data[i].MeterCode + '" >' + data[i].meter_name + '</option>';
                    str_out += '<option  value="' + data[i].MeterCode + '" MeterCode="' + data[i].MeterCode + '" NodeCode="' + data[i].NodeCode + '" data-tokens="' + data[i].MeterCode + '" >' + data[i].meter_name + '</option>';
                }
            }
            $("#select_meter_in").append(str_in);
            $("#select_meter_out").append(str_out);
            // for (let i = 0; i < data2.length; i++) {
            //     if (data2[i].is_pipe == 1 || data2[i].is_pipe == "1") {
            //         str_in += '<option selected value="' + data2[i].MeterCode + '" MeterCode="' + data2[i].MeterCode + '" NodeCode="' + data2[i].NodeCode + '" data-tokens="' + data2[i].MeterCode + '" >' + data2[i].meter_name + '</option>';
            //     }
            //     if (data2[i].is_pipe == 0 || data2[i].is_pipe == "0") {
            //         str_out += '<option selected value="' + data2[i].MeterCode + '" MeterCode="' + data2[i].MeterCode + '" NodeCode="' + data2[i].NodeCode + '" data-tokens="' + data2[i].MeterCode + '" >' + data2[i].meter_name + '</option>';
            //     }
            // }
            // $("#select_meter_in").append(str_in);
            // $("#select_meter_out").append(str_out);
            $('.select2bs4').select2({
                theme: 'bootstrap4',
                closeOnSelect: false,
                matcher: function (params, data) {
                    if ($.trim(params.term) === '') {
                        return data;
                    }

                    const term = params.term.toLowerCase();
                    const text = data.text.toLowerCase();
                    // const value = (data.element.value || '').toLowerCase();
                    const metercode = (data.element.dataset.tokens || '').toLowerCase();

                    if (
                        text.includes(term) ||
                        //   value.includes(term) ||
                        metercode.includes(term)
                    ) {
                        return data;
                    }

                    return null;
                }
            })
            if(info.length > 0){
                console.log(info)
                $("#group_dvql").val(info[0].parent_id);
                $("#dma_name").val(info[0].org_name);
                $("#dma_code").val(info[0].org_code);
                $("#dma_note").val(info[0].note);
                $("#loss_threshold").val(info[0].loss_threshold);
                $("#loss_fre").val(info[0].loss_fre);

            }
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



$(document).ready(function () {
    $("#save_edit_dma").on("click", function () {
        let dvql_id = $("#group_dvql").val();
        let dma_name = $("#dma_name").val();
        let dma_code = $("#dma_code").val();
        let dma_note = $("#dma_note").val();
        let loss_fre = $("#loss_fre").val();
        let loss_threshold = $("#loss_threshold").val();
        let sum_in = $("#select_meter_in").val();
        let sum_out = $("#select_meter_out").val();
        $.ajax({
            url: "/DMA/post/save_edit_dma",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                dvql_id: dvql_id,
                dma_name: dma_name,
                dma_code: dma_code,
                dma_note: dma_note,
                loss_fre: loss_fre,
                loss_threshold: loss_threshold,
                sum_in: sum_in,
                sum_out: sum_out,
                org_id: EDIT_DMA_ID
            }),
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                show_notification(res.message, (res.success) ? "success" : "error");
                if (res.success) {
                    $("#add_dma").modal("hide");
                    get_dma_list();
                }
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
