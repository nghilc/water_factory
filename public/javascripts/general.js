$(window).scroll(function () {
    if ($(this).scrollTop() > 200) {  // Khi cuộn xuống 200px, nút sẽ hiện lên
        $('#backToTop').fadeIn();
    } else {
        $('#backToTop').fadeOut();
    }
});

// Khi người dùng nhấn nút "Back to Top", cuộn trang lên đầu
$('#backToTop').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 'fast');  // Cuộn lên đầu trang
    return false;
});
var pad = function(num) { return ('00'+num).slice(-2) };
function returnSQLDateFormat(dateObj){
  if(dateObj == "" || dateObj == null) return "-";
  let date = new Date(dateObj);
  let x = date.getFullYear()         + '-' +
  pad(date.getMonth() + 1)  + '-' +
  pad(date.getDate())       + ' ' +
  pad(date.getHours())      + ':' +
  pad(date.getMinutes())    + ':' +
  pad(date.getSeconds());
  return x;
}

function return_date_format_ddmmyyhhmmss(dateObj){
  if(dateObj == "" || dateObj == null) return "-";
  let date = new Date(dateObj);
  let x = pad(date.getDate())         + '-' +
  pad(date.getMonth() + 1)  + '-' + '20' +
  pad(date.getFullYear())       + ' ' +
  pad(date.getHours())      + ':' +
  pad(date.getMinutes())    + ':' +
  pad(date.getSeconds());
  return x;
}



function return_momnet_data(moment, dateObj){
  if (dateObj == "" || dateObj == null) return "-";
  let date = new Date(dateObj);
  let x;
  switch(moment){
    case "hour":
      x = pad(date.getDate()) + '-' +
        pad(date.getMonth() + 1) + '-' + '20' +
        pad(date.getFullYear()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds());
      return x;
    case "day":
      x = pad(date.getDate()) + '-' +
      pad(date.getMonth() + 1) + '-' + '20' +
        pad(date.getFullYear()) + ' '
      return x;
    case "month":
      x = pad(date.getMonth() + 1) + '-' + '20' +
        pad(date.getFullYear()) + ' '
      return x;
    default:
      return "-"
  }
}




function show_if_2550_pressure(x,u){
  if (x === null || x === "" || x === undefined || isNaN(Number(x))) {
      return '-';
  }

  const num = Number(x);
  const rounded = Math.round(num * 100) / 100;
  if(rounded == 2550){
    return 'NaN';
  }else{
    let str = rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return str.replace(/,/g, ' ') + u;
 

  }
}

function show_if_null(x){
    // if(x === "" || x === null) 
    //   return "-";
    // return x;
    if (x === null || x === "" || x === "null" || x === undefined || isNaN(Number(x))) {
      return '-';
    }
  
    // Ép x thành số và làm tròn tối đa 3 chữ số thập phân
    const num = Number(x);
    const rounded = Math.round(num * 100) / 100;
  
    // Format số với dấu phẩy cho phần nghìn, dấu chấm cho thập phân
    let str = rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return str.replace(/,/g, ' ');

  }

  function show_if_null_text(x){
    if(x === "" || x === null || x === "null" || typeof x == "undefined") 
      return "-";
    return x;
    }



function show_empty_if_null_text(x) {
  if (x === "" || x === null || x === "null" || typeof x == "undefined")
    return "-";
  return x;
      }


    function show_if_null_pin(x, unit){
      if(unit == '%'){
        return show_if_null_0(x)
      }else{
        return show_if_null(x)
      }
      // if(x === "" || x === null) 
      //   return "-";
      // return x;
      }


  function show_if_null_0(x){
    // if(x === "" || x === null) 
    //   return "-";
    // return x;
    if (x === null || x === "" || x === undefined || isNaN(Number(x))) {
      return '-';
    }
  
    // Ép x thành số và làm tròn tối đa 3 chữ số thập phân
    const num = Number(x);
    const rounded = Math.round(num * 100) / 100;
    // Kiểm tra có phần thập phân không
    const hasDecimal = !Number.isInteger(rounded);
    // Format số với dấu phẩy cho phần nghìn, dấu chấm cho thập phân
    let str = rounded.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimal ? 1 : 0,
      maximumFractionDigits: 2
    });
    return str.replace(/,/g, ' ');

  }


  function stringtonum(x){
    if(Number.isNaN(Number(x)) || x == null ){
        return null;
    }else{
        return Number(x);
    }
}

  function return_if_empty_reconfig_data(x){
    if(x == "" || x === null){
      return "-"
    }else{
      return new Date(x).toLocaleString('en-GB')
    }
  }
  

  
  function translate_text(text){
    if(LANG == "en"){
      switch(text){
        case "Thất thoát":
          return "Loss";
        case "SL thất thoát":
          return "Loss";
        case "SL tiêu thụ":
          return "Remain"; 
        case "Sản lượng":
          return "Quantity";
        case "Lưu lượng":
          return"Flow rate";
        case "Áp suất":
          return "Pressure";
        case "Sản lượng thuận":
          return "Quantity down";
        case "Sản lượng ngược":
          return "Quantity reverse";
        case "Mực nước bể":
          return "Water level";
        case "Tần suất dữ liệu (Phút)":
          return "Data frequency (minute)";
        case "Điện áp pin dự phòng":
          return "Battery backup";
        case "Điện áp ác quy":
          return "Battery";
        case "Thời điểm":
          return "Time";
        case "Gửi bản tin tức thời":
          return "Send instant message";
        case "Chỉ số từng thời điểm":
          return "Data indicator time";
        case "Biểu đồ":
          return "Chart";
        case "Cảnh báo":
          return "Warning";
        case "Chi tiết":
          return "Detail";
        case "Đặt làm nguồn":
          return "Set source";
        case "Tổng":
          return "Main";
        case "Nhánh":
          return "Branch";
        case "Phóng to":
          return "Zoom";
        case "Không hoạt động":
          return "Offline";
        case "Đang hoạt động":
          return "Online";
        case "Thời gian":
          return "Time";
        case "Nhiệt độ":
        return "Temp";
        case "Độ PH":
        return "PH";
        case "Độ mặn":
        return "Salinity";
        case "Hoạt động":
        return "Online"; 
        case "Mất kết nối":
        return "Offline";     
        case "Mã trạm":
            return " Meter code";
        case "Tên trạm":
            return "Name";    
        case "Độ đục":
          return "Turbidity";
        case "EC":
          return "EC";
        case "Vận hành":
          return "Operate"
        default:
          return text; 
      }
    }else{
      return text;
    }
  }

  function shortToFullName(name){     // Trả về tên đầy đủ
    if(LANG == "vi"){
        switch(name){
            case "ValOfNum":
              return "Chỉ số";
            case "terminal_index":
              return "Sản lượng";
            case "flowRate":
              return "Lưu lượng";
            case "pressure":
              return "Áp suất";
            case "measure_sensor":
              return "Mực nước đo được"
            case "measure_static":
              return "Mực nước tĩnh";
            case "measure_dynamic":
              return "Mực nước động";
            case "measure_delta":
              return "Hiệu số mực nước";
            case "ValueReverse":
              return "Chỉ số ngược";
          case "ValueForward":
            return "Chỉ số thuận";
            case "Voltage":
              return "Điện áp pin";
            case "voltage_ac_quy":
              return "Điện áp ắc quy";
            case "PressureVol":
              return "Điện áp";
          case "VoltageOfMeter":
            return "Điện áp đồng hồ";
          case "HARD_RESET":
            return "Reset thiết bị";
          case "LOST_DEVICE":
            return "Tháo dỡ thiết bị";
          case "MAGNETIC_DETECT":
            return "Nhiễu từ trường";
          case "CHANGE_DIRECTION":
            return "Ngược xung";
          case "Temp":
            return "Nhiệt độ";
            default:
              return name;
          }
    }else{
        switch(name){
          case "pressure":
            return "Pressure";
          case "quanity":
            return "Quanity";
          case "flowRate":
            return "Flow rate";
          case "terminal_index":
            return "Quanity";
          case "measure_sensor":
            return "Measure value sensor";
          case "measure_static":
            return "Measure static";
          case "measure_dynamic":
            return "Measure dynamic"
          // case "measure_cacul":
          //   return "Measure Value Level Cacul Real";
          case "measure_delta":
            return "Measure value delta";
          case "ValueForward":
            return "Quantity down";
          case "ValueReverse":
            return "Quantity reverse";
            case "Voltage":
              return "Pin voltage";
          case "VoltageOfMeter":
            return "Meter voltage";
            case "voltage_ac_quy":
              return "Battery voltage";
            case "PressureVol":
              return "Pressure voltage";
            case "Temp":
              return "Temperature"
            default:
              return name;
          }
    }
}


function return_last_data(key){
  switch(key){
    case "terminal_index": return "last_terminal_index";
    case "flowRate": return "last_flow_rate"
    case "ValOfNum": return "last_ValOfNum"
    case "measure_sensor": return "last_measure_sensor"
    case "ValueReverse": return "last_ValueReverse"
    case "ValueForward": return "last_ValueForward"
    case "measure_delta": return "last_measure_delta"
    case "measure_static": return "last_measure_static"
    case "measure_dynamic": return "last_measure_dynamic"
    case "pressure": return "last_pressure"
    case "Voltage": return "last_voltage_pin"
    case "PressureVol": return "last_PressureVol"
    case "voltage_ac_quy": return "last_voltage_ac_quy"
    case "ValOfNum": return "last_ValOfNum"
    case "VoltageOfMeter": return "last_VoltageOfMeter"
    case "Temp": return "last_Temp"


    default: return "last_" + key
  }
}


function return_last_data_io(key){
  switch(key){
    case "terminal_index": return "terminalIndex";
    case "flowRate": return "flowRate"
    case "ValOfNum": return "valOfNum"
    case "measure_sensor": return "measureSensor"
    case "ValueReverse": return "valueReverse"
    case "ValueForward": return "valueForward"
    case "measure_delta": return "measureDelta"
    case "measure_static": return "measureStatic"
    case "measure_dynamic": return "measureDynamic"
    case "pressure": return "pressure"
    case "Voltage": return "voltage"
    case "PressureVol": return "pressureVol"
    case "voltage_ac_quy": return "voltageAcQuy"
    case "VoltageOfMeter": return "voltageOfMeter"
    default: return "last_" + key
  }
}


function change_mode_text(x){
  if(LANG == "en"){
    if(x == 1) return "Auto";
    else if(x == 0) return "Manual"
    else return "Off"
  }else{
    if(x == 1) return "Tự động";
    else if(x == 0) return "Thủ công"
    else return "Tắt"
  }
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


function format_number(x) {
  // Kiểm tra null, undefined hoặc không thể ép thành số
  if (x === null || x === undefined || isNaN(Number(x))) {
    return '-';
  }

  // Ép x thành số và làm tròn tối đa 3 chữ số thập phân
  const num = Number(x);
  const rounded = Math.round(num * 100) / 100;

  // Format số với dấu phẩy cho phần nghìn, dấu chấm cho thập phân
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function returnUnit(field, unit){  //trả về đơn bị vs đầu vào là biến 
  switch(field){
    case "pressure":
      if(unit !== undefined && unit !== null){
        return unit
      }
      return "";
    case "PressureVol":
      if(unit !== undefined && unit !== null){
        return unit
      }
      return "";
    case "quanity":
      return "m³";
    case "flowRate":
      return "m³/h";
    case "terminal_index":
      return "m³";
    case "ValueForward":
      return "m³";
    case "ValueReverse":
      return "m³";
    case "Temp":
      return "℃";
    case "Voltage":
      if(unit !== undefined && unit !== null){
        return unit
      }
      return "";
    case "voltage_ac_quy":
      return "V";
    case "measure_delta":
      if(unit !== undefined && unit !== null){
        return return_measure_unit(unit)
      }
      return "";
    case "measure_static":
      if(unit !== undefined && unit !== null){
        return return_measure_unit(unit)
    }
    return "";
    case "measure_dynamic":
      if(unit !== undefined && unit !== null){
        return return_measure_unit(unit)
    }
    return "";
    case "measure_sensor":
      if(unit !== undefined && unit !== null){
        return return_measure_unit(unit)
      }
      return "";
    case "VoltageOfMeter":
      return "%";
    default:
      return "";
  }
}


function return_measure_unit(x){
  switch(Number(x)){
    case 0: return null;
    case 1: return "cm";
    case 2: return "mm";
    case 3: return "Mpa";
    case 4: return "Pa";
    case 5: return "kPa";
    case 6: return "MA";
    case 7: return "m";
    default: return "m";

  }
}

function return_field_name(x){
  switch(x){
    case "data_field_config":
      return "Trường dữ liệu";
    case "location_lat":
      return "Vị trí lat";
    case "location_lng":
      return "Vị trí Long";
    case "meter_name":
      return "Tên thiết bị";
    case "address":
      return "Địa chỉ";
    case "ma_tram":
      return "Mã trạm";
    case "threshold_battery":
      return "Ngưỡng cảnh báo điện áp ắc quy";
    case "threshold_pin":
      return "Ngưỡng cảnh báo điện áp pin";
    case "field":
      return "Trường dữ liệu";
    case "start":
      return "Thời gian bắt đầu";
    case "end": 
       return "Thời gian kết thúc";
    case "high":
      return "Ngưỡng trên";
    case "low":
      return "Ngưỡng dưới";
    case "multiplier":
      return "Hệ số xung";
    case "first_index":
      return "Chỉ số chốt cài đặt";
    case "compen_value":
      return "Bù mực nước";
    case "conver_value":
      return "Hệ số bù mực nước";
    case "tank_base_bottom":
      return "Diện tích đáy";
    case "in":
      return "Đầu vào";
    case "out":
      return "Đầu ra";
    case "Om":
      return " Hệ số";
    case "show_bar_to_m":
      return "Hiển thị bar sang mét";
    case "conver_factor":
      return "Hệ số chuyển đổi";
    case "compen_factor":
      return "Hệ số bù";
    case "min":
      return "Ngưỡng dưới";
    case "max":
      return "Ngưỡng trên";
    
    default: return x;
  }
}

// function return_unit_html(x){
//   if(x != null && x != ""){
//     return '&nbsp;<span style="font-size: 0.7rem;">('+x+')</span>'
//   }
//   return "";
// }


// $(document).ready(function(){
//   if (typeof user_id === 'undefined' || !user_id) {
//     console.error("user_id chưa tồn tại");
//     return;
//   }
//   var socket = io({
//     auth: {
//       user_id: user_id
//     }
//   });

// socket.on("notification", (data) => {
//     console.log("Nhận thông báo:", data);
//   });

// })




var socket;
$(document).ready(function(){
  if (typeof user_id === 'undefined' || !user_id) {
    console.error("user_id chưa tồn tại");
    return;
  }
  socket = io({
    auth: {
      user_id: user_id
    }
  });

  var alertContainer = $('#alert-container');
  let alertQueue = []; // Hàng đợi cảnh báo
  let alertDisplaying = false; // Cờ hiển thị cảnh báo

   // Hàm xử lý hàng đợi hiển thị popup
   function processQueue() {
    if (alertDisplaying || alertQueue.length === 0) return;

    alertDisplaying = true;
    var alertData = alertQueue.shift();

    showAlert(alertData);

    setTimeout(() => {
      alertDisplaying = false;
      processQueue();
    }, 3300); // 3.3 giây
  }

    // Hàm thêm popup cảnh báo
    function showAlert(message) {
      console.log("chạy")
      const alertId = `alert-${Date.now()}`;
      const alertElement = $(`
        <div id="${alertId}" class="alert alert-warning alert-popup" role="alert">
          ${message}
        </div>
      `);
  
      alertContainer.append(alertElement);
  
      setTimeout(() => {
        alertElement.addClass('show');
      }, 100);
  
      setTimeout(() => {
        alertElement.removeClass('show');
        setTimeout(() => alertElement.remove(), 500);
      }, 10000);
    }

socket.on("notification", (data) => {
    // console.log("Nhận thông báo:", data);

    // Format thông báo
    data.forEach(e => {
      if(e.type == 0){
        var start = return_date_format_ddmmyyhhmmss(e.start_time);
        var end = return_date_format_ddmmyyhhmmss(e.end_time);
        var alert_mess = "";
        alert_mess +=  "<strong> "+e.name+"</strong><br>"
          +"Bắt đầu: <strong>"+ start+"</strong><br>"
          if(end != "-"){
            alert_mess += "Kết thúc: <strong> "+end+"</strong><br>"
          }
          alert_mess += "Nội dung cảnh báo: <strong> "+e.message+"</strong>"
        
        alertQueue.push(alert_mess);
      }

    });

    processQueue();
  });


  // socket.on("notification", (data) => {
  //   console.log("Nhận thông báo:", data);
  //   let alert_mess = "<strong>"+ data.MeterCode + "</strong><br><strong>" + return_date_format_ddmmyyhhmmss(data.start_time) +"-"+return_date_format_ddmmyyhhmmss(data.end_time)+ "</strong><br><strong>" + data.message + "</strong>";
  //   alertQueue.push(alert_mess);
  //   processQueue();
  // });

//   // Hàm thêm popup cảnh báo
//   function showAlert(message) {
//     const alertId = `alert-${Date.now()}`; // Tạo ID duy nhất cho mỗi alert

//     // Tạo element alert
//     const alertElement = $(`
//         <div id="${alertId}" class="alert alert-warning alert-popup" role="alert">
//             ${message}
//         </div>
//     `);

// //     // Thêm vào container
//     alertContainer.append(alertElement);

//     // Hiển thị alert với hiệu ứng
//     setTimeout(() => {
//         alertElement.addClass('show');
//     }, 100); // Delay nhỏ để kích hoạt CSS transition

//     // Ẩn alert sau 3 giây
//     setTimeout(() => {
//         alertElement.removeClass('show');
//         setTimeout(() => alertElement.remove(), 500); // Xóa khỏi DOM sau khi hiệu ứng kết thúc
//     }, 10000);
// }

  // Hàm xử lý hàng đợi hiển thị popup
//   function processQueue() {
//     if (alertDisplaying || alertQueue.length === 0) return;

//     alertDisplaying = true; // Đánh dấu đang hiển thị
//     const alertData = alertQueue.shift(); // Lấy phần tử đầu tiên trong hàng đợi

//     showAlert(alertData);

//     setTimeout(() => {
//         alertDisplaying = false; // Cho phép hiển thị cảnh báo tiếp theo
//         processQueue(); // Xử lý tiếp
//     }, 3.3*1000); // Đợi 3.3 giây trước khi hiển thị tiếp
// }


})


function return_tooltip(note){
  if(note == null) return ""
  note = note.replace(/\n/g, "<br>");
  return note
}

function return_status_mayphatdien(x) {
  switch (x) {
    case 1:
      $("#trang_thai_may_phat").css("color", "#4CAF50");
      $("#trang_thai_may_phat").html("Đang hoạt động");
      break;
    case 0:
      $("#trang_thai_may_phat").css("color", "red");
      $("#trang_thai_may_phat").html("Mất kết nối");
      break;
  }
}

function return_status_nguon_nuoc(x) {
  switch (x) {
    case 1:
      return '<span class="status-indicator status-normal">Đang kết nối</span>'
    case 0:
      return '<span class="status-indicator status-danger">Mất kết nối</span>'
    case 2:
      return '<span class="status-indicator status-warning">Cảnh báo</span>'

  }
}

function show_if_null_number(x) {
  if (x === "" || x === null || x === undefined) return "-";

  const num = Number(x);
  if (isNaN(num)) return "-";

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function return_unit_html(x) {
  if (x != null && x != "") {
    return '<span>(' + x + ')</span>'
  }
  return "";
}

function show_if_null(x) {
  if (x === "" || x === null)
    return "-";
  return x;
}

function show_number_if_null(x) {
  if (typeof x == "undefined" || x == null || x == "") {
    return null;
  }
  return Number(x)

}

function show_dash_if_null(x) {
  if (typeof x == "undefined" || x == null || x == "") {
    return "-"
  }
  return Number(x)
}