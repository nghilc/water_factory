const fix = 3;
var excel = require('exceljs');
const {access_db, query} = require("./mysql_config");
const path = require('path');
var pad = function(num) { return ('00'+num).slice(-2) };
function returnSQLDateFormatDayStart(dateObj){
  let date = new Date(dateObj);
  let x = date.getFullYear()         + '-' +
  pad(date.getMonth() + 1)  + '-' +
  pad(date.getDate())       + ' ' + "00:00:00"
  return x;
}

function returnSQLDateFormatDayEnd(dateObj){
  let date = new Date(dateObj);
  let x = date.getFullYear()         + '-' +
  pad(date.getMonth() + 1)  + '-' +
  pad(date.getDate())       + ' ' + "23:59:59"
  return x;
}

function returnSQLDateFormatMonthStart(dateObj){
    let date = new Date(dateObj);
    let x = date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(1) + ' 00:00:00'; // đảm bảo '01' được format chuẩn
  
    return x;
  }
  
  function returnSQLDateFormatMonthEnd(dateObj){
    let date = new Date(dateObj);
    let year = date.getFullYear();
    let month = date.getMonth();
  
    // Ngày 0 của tháng kế tiếp = ngày cuối tháng hiện tại
    let lastDay = new Date(year, month + 1, 0);
  
    return lastDay.getFullYear() + '-' +
           pad(lastDay.getMonth() + 1) + '-' +
           pad(lastDay.getDate()) + ' 23:59:59';
  }
var LANG = "vi"

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
            return "Mực nước thực tế"
          case "measure_static":
            return "Mực nước tĩnh";
          case "measure_dynamic":
            return "Mực nước động";
          case "measure_delta":
            return "Hiệu số mực nước";
          case "ValueReverse":
            return "Sản lượng ngược";
          case "Voltage":
            return "Điện áp pin";
          case "voltage_ac_quy":
            return "Điện áp ắc quy";
          case "PressureVol":
            return "Điện áp";
          case "VoltageOfMeter":
            return "Điện áp đồng hồ";
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
          case "voltage_ac_quy":
            return "Battery voltage";
          case "PressureVol":
            return "Pressure voltage";
        case "VoltageOfMeter":
          return "Meter voltage";
        case "Temp":
          return "Temp";
          default:
            return name;
        }
  }
}


function show_if_null_text(x){
    if(x === "" || x === null) 
      return "-";
    return Number(x);
    }

function return_meter_status(data){
    if(data.meter_status == 0) return 'Mất kết nối';
    let data_field_config;
    if(data.data_field_config){
        data_field_config = data.data_field_config
    }else{
      data_field_config = JSON.stringify({ "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1})    }
    for(const key in data_field_config){
        if(data_field_config[key] == 1 && key != "OP"){
            if(data["status_"+key] == 3) return 'Vượt ngưỡng'
        }
    }
    return 'Trong ngưỡng'
}

function return_local_date_string(date){
  let x = pad(date.getDate()) + '/' +
  pad(date.getMonth() + 1)   + '/' +
  date.getFullYear() + ', '+
  pad(date.getHours())      + ':' +
  pad(date.getMinutes())    + ':' +
  pad(date.getSeconds());
return x;
}

function return_status_relay(x){
  if(x == 1 || x == "1"){
      return "On"
  }
  return "Off"
}

function numberWithCommas(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

function return_date(x){
  var d = new Date(Number(x));
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  var yy = d.getFullYear();
  return dd + '_' + mm + '_' + yy;
}


function lamtron(x){
  return Math.ceil(x * 1000)/1000;
}

function fixed_data(x){
    if(x ==="" || x === null){
      return "-";
    }
   if(!isNaN(Number(x))){
      return Number(x);
    }else{
      return x;
    }
}

  
  function return_if_null(x){
    if(x == null || x == ""){
      return " - ";
    }
    return x;
  }
  
  function return_status(x){
    if(x == null || x == ""){
      return " - ";
    }else if(x == 1 || x == "1"){
      return "Kết nối"
    }else{
      return "Mất kết nối"
    }
  }

function numToLetter(num){
  switch(num){
    case 1:return "A";
    case 2:return "B";
    case 3:return "C";
    case 4:return "D";
    case 5:return "E";
    case 6:return "F";
    case 7:return "G";
    case 8:return "H";
    case 9:return "I";
    case 10:return "J";
    case 11:return "K";
    case 12:return "L";
    case 13:return "M";
    case 14:return "N";
    case 15:return "O";
    case 16:return "P";
    case 17:return "Q";
    case 18:return "R";
    case 19:return "S"; 
    case 20:return "T";
    case 21:return "U";
    case 22:return "V";
    case 23:return "W";

  }
}

function fixNum(num){
  if(Number.isNaN(Number(num)) || num == null){
    return null;
  }else{
    return Number(num).toFixed(fix)
  }
}

function toISO(x){
    if(Number.isNaN(Number(x))){
      var y = new Date(x);
      return y;
    }else{
    var y = new Date(Number(x));
    return y;
    }
}


function change_mode_text(x){
    switch(x){
      case 1:
        return "Tự động";
      case 2:
        return "Thủ công";
      case 3:
        return "Tắt";
    }
}


async function export_data(req,res){
    try {
        let MeterCode = req.query.MeterCode;
        let NodeCode = req.query.NodeCode;
        let start_date = req.query.start_date;
        let end_date = req.query.end_date;
        let name_file = "BAO_CAO_CHI_SO_TUNG_THOI_DIEM_"+start_date+"_"+end_date
        let data_search_moment = req.query.data_search_moment;
        let data = [];
        switch(data_search_moment){
          case "hour":
              data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" DESC;`,[NodeCode, MeterCode, start_date, end_date]);
              break;
          case "day":
              data = await query(`SELECT * FROM "daily_meter_usage" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" DESC;`,[NodeCode, MeterCode, returnSQLDateFormatDayStart(start_date), returnSQLDateFormatDayEnd(end_date)]);
              break;
          case "month":
              data = await query(`SELECT * FROM "monthly_meter_usage" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" DESC;`,[NodeCode, MeterCode, returnSQLDateFormatMonthStart(start_date), returnSQLDateFormatMonthEnd(end_date)]);
              break;
          default: 
              data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" DESC;`,[NodeCode, MeterCode, start_date, end_date]);
              break;
        }
        // let data = await access_db("SELECT * FROM Operation WHERE NodeCode = ? AND MeterCode = ? AND MeterTime >= ? AND MeterTime <= ? ORDER BY MeterTime DESC;",[NodeCode, MeterCode, start_date, end_date]);
        if(data_search_moment == "day" || data_search_moment == "month"){
      
          let info = await access_db("SELECT t1.name AS meter_name, t3.org_name AS ten_donvi FROM totaleq t1 LEFT JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t3 ON t2.org_id = t3.id WHERE t1.MeterCode = ? AND t1.NodeCode = ?; ", [MeterCode, NodeCode]);
          
          if(info.length == 0){
              return res.json({
                  success: false,
                  message: "Mã trạm không hợp lệ"
              })
          }
      
          var result = JSON.parse(JSON.stringify(data));
          let workbook = new excel.Workbook(); //creating workbook
          let worksheet = workbook.addWorksheet("Data"); //creating worksheet
      
          worksheet.getColumn('A').width = 12;
          worksheet.getColumn('B').width = 25;
          worksheet.getColumn('C').width = 20;
          worksheet.getColumn('D').width = 20;
          worksheet.getColumn('E').width = 20;
          worksheet.getColumn('F').width = 20;

          worksheet.getRow(1).height = 66;
          const imagePath = path.join(__dirname, "..", 'public', 'images', 'logoSaoViet.jpg')
      
          const imageId = workbook.addImage({
              filename: imagePath, // Đường dẫn ảnh
              extension: 'jpg'
          });
          worksheet.addImage(imageId, {
              tl: { col: 0, row: 0 }, // Top-left: B2 (cột 1, hàng 1 => B2)
              br: { col: 1, row: 1 }  // Bottom-right: mở rộng đến C4 (cột 2, hàng 3)
          });
      
      
          let index = 3;
          let last_key = "";
          let last_index = 3;
          // for(const key in data_field_config){
          //     if(data_field_config[key] == 1 && key != "OP"){
          //         last_key = key;
          //         worksheet.getColumn(numToLetter(index)).width = 20;
          //         last_index = index;
          //         index ++;
          //     }
          // } 
      
      
      
      
          worksheet.mergeCells('B1:'+numToLetter(last_index)+'1');
          worksheet.getCell('B1').value = "SAO VIỆT";
          worksheet.getCell("B1").font ={name: 'Arial', size: 15, bold: true };
          worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
      
          worksheet.mergeCells('A2:'+numToLetter(last_index)+'2');
          worksheet.getCell('A2').value = "BÁO CÁO CHỈ SỐ TỪNG THỜI ĐIỂM";
          worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
      
          worksheet.mergeCells('A3'+numToLetter(last_index)+'3');
          worksheet.getCell('A3').value = "Người xuất báo cáo: " + req.user.user_name;
          worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A4'+numToLetter(last_index)+'4');
          worksheet.getCell('A4').value = "Thời điểm xuất báo cáo: " + return_local_date_string(new Date());
          worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A5'+numToLetter(last_index)+'5');
          worksheet.getCell('A5').value = "Báo cáo dữ liệu từ ngày: " + start_date + " đến ngày: " + end_date;
          worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A6'+numToLetter(last_index)+'6');
          worksheet.getCell('A6').value = "Mã trạm: " + MeterCode;
          worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A7'+numToLetter(last_index)+'7');
          worksheet.getCell('A7').value = "Tên trạm: " + info[0].meter_name;
          worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A8'+numToLetter(last_index)+'8');
          worksheet.getCell('A8').value = "Đơn vị: " + return_if_null(info[0].ten_donvi);
          worksheet.getCell("A8").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.getCell('A9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('A9').value = "STT";
            worksheet.getCell('A9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
      
            worksheet.getCell('B9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('B9').value = "Thời gian";
            worksheet.getCell('B9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('B9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
      

            worksheet.getCell('C9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('C9').value = "Chỉ số đầu";
            worksheet.getCell('C9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('C9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('D9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('D9').value = "Chỉ số cuối";
            worksheet.getCell('D9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('D9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('E9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('E9').value = "Sản lượng";
            worksheet.getCell('E9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('E9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('F9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('F9').value = "Áp suất trung bình";
            worksheet.getCell('F9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('F9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
          let index_2 = 3
          // for(const key in data_field_config){
          //     if(data_field_config[key] == 1 && key != "OP"){
          //         worksheet.getCell(numToLetter(index_2)+'9').fill = {
          //             type: "pattern",
          //             pattern: "solid",
          //             fgColor:{argb:'70CBFF'},
          //         }
          //           worksheet.getCell(numToLetter(index_2)+'9').value = shortToFullName(key);
          //           worksheet.getCell(numToLetter(index_2)+'9').font ={name: 'Arial', size: 10, bold: true };
          //           worksheet.getCell(numToLetter(index_2)+'9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
          //           index_2 ++;
          //     }
          // }
      
          // let index_3 = 3;
          // for(const key in data_field_config){
          //     if(data_field_config[key] == 1 && key != "OP"){
          //         console.log(key)
          //         // worksheet.getCell(numToLetter(index_3)+(10+i)).value =  show_if_null((typeof result[i][key] !== 'undefined') ? (result[i][key]) : "-")
          //         index_3 ++;
          //     }
          // }
            for(let i=0; i<result.length; i++){
              worksheet.getCell('A'+(10+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('A'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('B'+(10+i)).value =  new Date(result[i].MeterTime).toLocaleString('en-GB');
              worksheet.getCell('B'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

              worksheet.getCell('C'+(10+i)).value =  show_if_null_text((typeof result[i].ValStart !== 'undefined') ? (result[i].ValStart) : "-")
              worksheet.getCell('D'+(10+i)).value =  show_if_null_text((typeof result[i].ValEnd !== 'undefined') ? (result[i].ValEnd) : "-")
              worksheet.getCell('E'+(10+i)).value =  show_if_null_text((typeof result[i].ValOfNum !== 'undefined') ? (result[i].ValOfNum) : "-")
              worksheet.getCell('F'+(10+i)).value =  show_if_null_text((typeof result[i].AvgPressure !== 'undefined') ? (result[i].AvgPressure) : "-")


              // let index_3 = 3;
              // for(const key in data_field_config){
              //     if(data_field_config[key] == 1 && key != "OP"){
              //         // console.log(key)
              //         worksheet.getCell(numToLetter(index_3)+(10+i)).value =  show_if_null_text((typeof result[i][key] !== 'undefined') ? (result[i][key]) : "-")
              //         index_3 ++;
              //     }
              // }
            }
      
      
            for(let i=0; i<result.length+1;i++){
              for(let j=1; j<=6; j++){
                worksheet.getCell(numToLetter(j)+(9+i)).border ={
                  top: {style:'thin'},
                  left: {style:'thin'},
                  bottom: {style:'thin'},
                  right: {style:'thin'}
                }
              }
          }
      
          res.setHeader('Content-Disposition', 'attachment; filename=' + name_file +".xlsx");
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          await workbook.xlsx.write(res);
          res.end();
        }else{
          let data_field_config = JSON.stringify({ "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 })
          let row = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;", [MeterCode, NodeCode]);
          if(row.length > 0){
              data_field_config = JSON.parse(row[0].config);
          }
      
          let info = await access_db("SELECT t1.name AS meter_name, t3.org_name AS ten_donvi FROM totaleq t1 LEFT JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t3 ON t2.org_id = t3.id WHERE t1.MeterCode = ? AND t1.NodeCode = ?; ", [MeterCode, NodeCode]);
          
          if(info.length == 0){
              return res.json({
                  success: false,
                  message: "Mã trạm không hợp lệ"
              })
          }
      
          var result = JSON.parse(JSON.stringify(data));
          let workbook = new excel.Workbook(); //creating workbook
          let worksheet = workbook.addWorksheet("Data"); //creating worksheet
      
          worksheet.getColumn('A').width = 12;
          worksheet.getColumn('B').width = 25;
      
          worksheet.getRow(1).height = 66;
          const imagePath = path.join(__dirname, "..", 'public', 'images', 'logoSaoViet.jpg')
      
          const imageId = workbook.addImage({
              filename: imagePath, // Đường dẫn ảnh
              extension: 'jpg'
          });
          worksheet.addImage(imageId, {
              tl: { col: 0, row: 0 }, // Top-left: B2 (cột 1, hàng 1 => B2)
              br: { col: 1, row: 1 }  // Bottom-right: mở rộng đến C4 (cột 2, hàng 3)
          });
      
      
          let index = 3;
          let last_key = "";
          let last_index = 3;
          for(const key in data_field_config){
              if(data_field_config[key] == 1 && key != "OP"){
                  last_key = key;
                  worksheet.getColumn(numToLetter(index)).width = 20;
                  last_index = index;
                  index ++;
              }
          } 
      
          last_index+=1;
      
      
          worksheet.mergeCells('B1:'+numToLetter(last_index)+'1');
          worksheet.getCell('B1').value = "SAO VIỆT";
          worksheet.getCell("B1").font ={name: 'Arial', size: 15, bold: true };
          worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
      
          worksheet.mergeCells('A2:'+numToLetter(last_index)+'2');
          worksheet.getCell('A2').value = "BÁO CÁO CHỈ SỐ TỪNG THỜI ĐIỂM";
          worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
      
          worksheet.mergeCells('A3'+numToLetter(last_index)+'3');
          worksheet.getCell('A3').value = "Người xuất báo cáo: " + req.user.user_name;
          worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A4'+numToLetter(last_index)+'4');
          worksheet.getCell('A4').value = "Thời điểm xuất báo cáo: " + return_local_date_string(new Date());
          worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A5'+numToLetter(last_index)+'5');
          worksheet.getCell('A5').value = "Báo cáo dữ liệu từ ngày: " + start_date + " đến ngày: " + end_date;
          worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A6'+numToLetter(last_index)+'6');
          worksheet.getCell('A6').value = "Mã trạm: " + MeterCode;
          worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A7'+numToLetter(last_index)+'7');
          worksheet.getCell('A7').value = "Tên trạm: " + info[0].meter_name;
          worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.mergeCells('A8'+numToLetter(last_index)+'8');
          worksheet.getCell('A8').value = "Đơn vị: " + return_if_null(info[0].ten_donvi);
          worksheet.getCell("A8").font ={name: 'Arial', size: 10, bold: false };
      
          worksheet.getCell('A9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('A9').value = "STT";
            worksheet.getCell('A9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
      
            worksheet.getCell('B9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('B9').value = "Thời gian";
            worksheet.getCell('B9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('B9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
      
          let index_2 = 3
          for(const key in data_field_config){
              if(data_field_config[key] == 1 && key != "OP"){
                  worksheet.getCell(numToLetter(index_2)+'9').fill = {
                      type: "pattern",
                      pattern: "solid",
                      fgColor:{argb:'70CBFF'},
                  }
                    worksheet.getCell(numToLetter(index_2)+'9').value = shortToFullName(key);
                    worksheet.getCell(numToLetter(index_2)+'9').font ={name: 'Arial', size: 10, bold: true };
                    worksheet.getCell(numToLetter(index_2)+'9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
                    index_2 ++;
              }
          }

          worksheet.getCell(numToLetter(index_2) + '9').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
          }
          worksheet.getCell(numToLetter(index_2) + '9').value = "RSSI";
          worksheet.getCell(numToLetter(index_2) + '9').font = { name: 'Arial', size: 10, bold: true };
          worksheet.getCell(numToLetter(index_2) + '9').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          index_2++;

          // let index_3 = 3;
          // for(const key in data_field_config){
          //     if(data_field_config[key] == 1 && key != "OP"){
          //         console.log(key)
          //         // worksheet.getCell(numToLetter(index_3)+(10+i)).value =  show_if_null((typeof result[i][key] !== 'undefined') ? (result[i][key]) : "-")
          //         index_3 ++;
          //     }
          // }
            for(let i=0; i<result.length; i++){
              worksheet.getCell('A'+(10+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('A'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('B'+(10+i)).value =  new Date(result[i].MeterTime).toLocaleString('en-GB');
              worksheet.getCell('B'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              let index_3 = 3;
              for(const key in data_field_config){
                  if(data_field_config[key] == 1 && key != "OP"){
                      // console.log(key)
                      worksheet.getCell(numToLetter(index_3)+(10+i)).value =  show_if_null_text((typeof result[i][key] !== 'undefined') ? (result[i][key]) : "-");
                      if(typeof result[i][key] !== 'undefined'){
                        worksheet.getCell(numToLetter(index_3)+(10+i)).numFmt = '#,##0.00'; // định dạng số

                      }
                      index_3 ++;
                  }
              }
              worksheet.getCell(numToLetter(index_3) + (10 + i)).value = show_if_null_text((typeof result[i]["wave_current_1"] !== 'undefined') ? (result[i]["wave_current_1"]) : "-");
              if (typeof result[i]["wave_current_1"] !== 'undefined') {
                worksheet.getCell(numToLetter(index_3) + (10 + i)).numFmt = '#,##0.00'; // định dạng số

              }
              index_3++;
            }
      
      
            for(let i=0; i<result.length+1;i++){
              for(let j=1; j<=last_index; j++){
                worksheet.getCell(numToLetter(j)+(9+i)).border ={
                  top: {style:'thin'},
                  left: {style:'thin'},
                  bottom: {style:'thin'},
                  right: {style:'thin'}
                }
              }
          }
      
          res.setHeader('Content-Disposition', 'attachment; filename=' + name_file +".xlsx");
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          await workbook.xlsx.write(res);
          res.end();
        }
       
    } catch (error) {
        console.error('API Monitoring error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
          });
    }
 
}



module.exports = export_data;