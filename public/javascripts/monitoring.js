
var LANG = "vi";
var TABS = []

$(document).ready(function(){
    $.ajax({
        url: "/get/lang",
        type: "GET",
        success: function(res){
            // LANG = res.lang;
            ROLE = res.role
          TABS = res.access_menu ? res.access_menu.split(',') : []; 

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

var ORG_ID = "all";

$(document).ready(function(){
  $(document).on("click", ".menu-item", function(){
    $(".menu-item").removeClass("active");
    $(this).addClass("active");
    let pages = $(this).attr("data-page");
    $.ajax({
      url: "/monitoring/get/pages",
      type: "GET",
      data: { pages, org_id: ORG_ID },
      beforeSend: function () {
        showLoading();  // Hiện overlay khi bắt đầu tải
      },
      success: function (res) {
        // $("#meter_info_container").html(res);
        $("#partials_container").empty();
        $("#partials_container").append(res);
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
        // Ẩn overlay sau khi tải xong
        hideLoading();
      }
    })
  })
})

$(document).ready(function(){
  $("#filter_tram").change(function(){
    let val = $(this).children("option:selected").val();
    let type = $(this).children("option:selected").attr("dv_type");
    ORG_ID = val;
    if (type != "all"){
      $("#mainNavigation").show();
      $('a[data-page="tong-quan"]').trigger('click');
    }else{
      $("#mainNavigation").hide();
      let pages = "all";
      $.ajax({
        url: "/monitoring/get/pages",
        type: "GET",
        data: { pages, org_id: ORG_ID },
        beforeSend: function () {
          showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
          // $("#meter_info_container").html(res);
          $("#partials_container").empty();
          $("#partials_container").append(res);
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
          // Ẩn overlay sau khi tải xong
          hideLoading();
        }
      })
    }
  })
})

$(document).ready(function () {
  $(document).on("click", '.truy_cap_nha_may', function () {
    let org_id = $(this).attr("org_id");
    $('#filter_tram')
      .selectpicker('val', org_id)
      .trigger('change');
  })
})