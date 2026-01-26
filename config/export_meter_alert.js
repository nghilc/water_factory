const fix = 3;
var excel = require('exceljs');
const {access_db} = require("./mysql_config");
const path = require('path');
var pad = function(num) { return ('00'+num).slice(-2) };
function returnSQLDateFormat(dateObj){
  let date = new Date(Number(dateObj));
  let x = date.getFullYear()         + '-' +
  pad(date.getMonth() + 1)  + '-' +
  pad(date.getDate())       + ' ' +
  pad(date.getHours())      + ':' +
  pad(date.getMinutes())    + ':' +
  pad(date.getSeconds());
  return x;
}
var LANG = "vi"
function return_alert_type(x){
    switch(x){
        case "POWER": return "Nguồn điện";
        case "SENSOR": return "Trạng thái kết nối cảm biến";
        case "OXY": return "Thông báo lượng Oxy";
        case "PH": return "Độ PH";
        case "TTPH": return "Trạng thái cảm biến PH";
        case "LOIBOM": return "Trạng thái bơm";
        default: return x;
    }
}

function shortToFullName(name){     // Trả về tên đầy đủ
    if(LANG == "vi"){
        switch(name){
            case "Temp":
              return "Nhiệt độ (°C)";
            case "Salinity":
              return "Độ mặn (ppt)";
            case "DO":
              return "Oxy (mg/l)"
            case "ORP":
              return "Oxy (%)";
            case "DoManPer":
              return "Độ mặn (%)";
            case "CloDu":
              return "Clo (mg/l)";
            case "DoDuc":
              return "Độ đục (NTU)";
            case "EC":
              return "EC (uS/cm)";
            case "OP": 
            return "Vận hành";
            default:
              return name;
          }
    }else{
        switch(name){
            case "Temp":
              return "Temp (°C)";
            case "Salinity":
              return "Salinity (ppt)";
            case "DO":
              return "Oxy (mg/l)";
            case "ORP":
              return "Clo (mg/l)";
            case "DoManPer":
              return "Salinity (%)";
            case "CloDu":
              return "Clo (mg/l)";
            case "DoDuc":
              return "Turbidity (NTU)";
            case "EC":
              return "EC (uS/cm)";
            case "OP":
              return "Operate";
            default:
              return name;
          }
    }
}

function show_if_null_text(x){
    if(x === "" || x === null) 
      return "-";
    return x;
    }

function return_meter_status(data){
    if(data.meter_status == 0) return 'Mất kết nối';
    let data_field_config;
    if(data.data_field_config){
        data_field_config = data.data_field_config
    }else{
        data_field_config = {"Temp":1,"PH":1,"DO":1,"Salinity":1,"ORP":1,"DoManPer":1,"CloDu":1,"DoDuc":1,"EC":1};    
    }
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
        let tram_id = req.query.tram_id;
        let dv_type = req.query.dv_type;

        let name_file = "BAO_CAO_CANH_BAO_"+start_date+"_"+end_date
        let values = [];
        let sql = "";   
        if(MeterCode == 'all' && NodeCode == 'all'){
          values = [ start_date, end_date];
          if(dv_type == "all"){
          sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.updated_at > ? AND t1.updated_at < ?  ORDER BY t1.updated_at DESC;";
          }else if(dv_type == "dvql"){
          sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t1.updated_at > ? AND t1.updated_at < ? AND t3.org_id = ? ORDER BY t1.updated_at DESC;";
          values.push(tram_id);
          }else{
          sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t1.updated_at > ? AND t1.updated_at < ? AND t3.org_id = ? ORDER BY t1.updated_at DESC;"
          values.push(tram_id)
          }

      }else{
          values = [MeterCode, NodeCode, start_date, end_date];

          sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t1.updated_at > ? AND t1.updated_at < ? ORDER BY t1.updated_at DESC;"
      }
        // let data = await access_db("SELECT * FROM alert_data WHERE MeterCode = ? AND NodeCode = ? AND created_at > ? AND created_at < ? ORDER BY created_at DESC;",[MeterCode, NodeCode, start_date, end_date]);
        let data = await access_db(sql,values);

        let info = await access_db("SELECT t1.name AS meter_name, t3.org_name AS ten_donvi FROM totaleq t1 LEFT JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t3 ON t2.org_id = t3.id WHERE t1.MeterCode = ? AND t1.NodeCode = ?; ", [MeterCode, NodeCode]);
        
        // if(info.length == 0){
        //     return res.json({
        //         success: false,
        //         message: "Mã trạm không hợp lệ"
        //     })
        // }
    
        var result = JSON.parse(JSON.stringify(data));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet("Data"); //creating worksheet
    
        worksheet.getColumn('A').width = 12;
        worksheet.getColumn('B').width = 32;
        worksheet.getColumn('C').width = 60;
        worksheet.getColumn('D').width = 25;
        worksheet.getColumn('E').width = 25;
        worksheet.getColumn('F').width = 25;

    
    
    
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
    
    
    
    
    
        worksheet.mergeCells('B1:D1');
        worksheet.getCell('B1').value = "SAO VIỆT";
        worksheet.getCell("B1").font ={name: 'Arial', size: 15, bold: true };
        worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
    
        worksheet.mergeCells('A2:D2');
        worksheet.getCell('A2').value = "BÁO CÁO CẢNH BÁO";
        worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    
        worksheet.mergeCells('A3:D3');
        worksheet.getCell('A3').value = "Người xuất báo cáo: " + req.user.user_name;
        worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: false };
    
        worksheet.mergeCells('A4:D4');
        worksheet.getCell('A4').value = "Thời điểm xuất báo cáo: " + return_local_date_string(new Date());
        worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: false };
    
        worksheet.mergeCells('A5:D5');
        worksheet.getCell('A5').value = "Báo cáo dữ liệu từ ngày: " + start_date + " đến ngày: " + end_date;
        worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };
    
        worksheet.mergeCells('A6:D6');
        worksheet.getCell('A6').value = "Mã trạm: " + ((MeterCode == "all" && NodeCode == "all") ? "-" : MeterCode);
        worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };
    
        worksheet.mergeCells('A7:D7');
        worksheet.getCell('A7').value = "Tên trạm: " + ((MeterCode == "all" && NodeCode == "all") ? "-" : info[0].meter_name);
        worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };
    
        worksheet.mergeCells('A8:D8');
        worksheet.getCell('A8').value = "Đơn vị: " + ((MeterCode == "all" && NodeCode == "all") ? "-" : show_if_null_text(info[0].ten_donvi));
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
          worksheet.getCell('B9').value = "Thời gian cảnh báo";
          worksheet.getCell('B9').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('B9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('C9').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('C9').value = "Nội dung cảnh báo";
          worksheet.getCell('C9').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('C9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
    
          worksheet.getCell('D9').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('D9').value = "Ngưỡng cảnh báo";
          worksheet.getCell('D9').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('D9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('E9').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('E9').value = "Giá trị cảnh báo";
          worksheet.getCell('E9').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('E9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
        //   worksheet.getCell('F9').fill = {
        //     type: "pattern",
        //     pattern: "solid",
        //     fgColor:{argb:'70CBFF'},
        // }
        //   worksheet.getCell('F9').value = "Giá trị cảnh báo";
        //   worksheet.getCell('F9').font ={name: 'Arial', size: 10, bold: true };
        //   worksheet.getCell('F9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          for(let i=0; i<result.length; i++){
            worksheet.getCell('A'+(10+i)).value =  " "+(i+1)+" ";
            worksheet.getCell('A'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('B'+(10+i)).value =  ((data[i].alert_time != null && data[i].alert_time != "") ? ("Bắt đầu:" + new Date(data[i].alert_time).toLocaleString('en-GB')) : "-") + ((data[i].alert_end_time != null && data[i].alert_end_time != "") ? ("\nKết thúc:" + new Date(data[i].alert_end_time).toLocaleString('en-GB') +"") : "")
            worksheet.getCell('B'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
            worksheet.getCell('C'+(10+i)).value =   data[i].name + "\n"+ data[i].alert_type;
            worksheet.getCell('C'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
            worksheet.getCell('D'+(10+i)).value =  show_if_null_text(data[i].threshold)
            worksheet.getCell('D'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('E'+(10+i)).value =  show_if_null_text(data[i].alert_value)
            worksheet.getCell('E'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
          }
    
    
          for(let i=0; i<result.length+1;i++){
            for(let j=1; j<=5; j++){
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
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server' 
          });
    }
   
}



module.exports = export_data;