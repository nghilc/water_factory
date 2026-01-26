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

function show_if_null(x){
    if(x === "" || x === null) 
      return "-";
    return x;
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
function return_date(x){
    const date = new Date(x);
    
    const day = String(date.getDate()).padStart(2, '0');  // Lấy ngày và thêm '0' nếu cần
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Lấy tháng và thêm '0' nếu cần
    const year = date.getFullYear();  // Lấy năm
    
    return `${day}/${month}/${year}`;  // Trả về chuỗi theo định dạng "DD/MM/YYYY"
  }

function numberWithCommas(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

// function return_date(x){
//   var d = new Date(Number(x));
//   var mm = d.getMonth() + 1;
//   var dd = d.getDate();
//   var yy = d.getFullYear();
//   return dd + '_' + mm + '_' + yy;
// }


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
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;
        let name_file = "BAO_CAO_TY_LE_SO_LIEU_THU_DUOC_"+start_date+"_"+end_date;
        let meter_list = JSON.parse(JSON.parse(req.body.meter_list));
        
        if(meter_list){
            if(meter_list.length == 0){
                return res.json({
                    success: false,
                    message: "Chưa chọn trạm quan trắc"
                })
            }
        }
        let placeholder = meter_list.map(() => "(?,?)").join(",");
        let value = [start_date, end_date, start_date, end_date, start_date, end_date, start_date, start_date, end_date];
        for(let i=0; i<meter_list.length; i++){
            value.push(meter_list[i].MeterCode);
            value.push(meter_list[i].NodeCode);
        }
    
    
        let data = await access_db("SELECT eq.MeterCode,eq.NodeCode, eq.`name`, ? as 'thoi_gian_thu_thap',eq.FreqOpreation as 'tan_suat',IFNULL(a.total,0) as 'ban_ghi_thuc_te', CASE WHEN eq.FreqOpreation IS NULL OR eq.FreqOpreation = 0 THEN 0 ELSE CAST(((DATEDIFF(? ,?) + 1) * 24 * 60 / eq.FreqOpreation) as SIGNED) END as 'ban_ghi_thiet_ke', CASE WHEN eq.FreqOpreation IS NULL OR eq.FreqOpreation = 0 OR a.total IS NULL OR a.total = 0 THEN 0 WHEN a.total >= ((DATEDIFF(?,?) + 1) * 24 * 60 / eq.FreqOpreation) THEN 100 ELSE ROUND((a.total / ((DATEDIFF(?,?) + 1) * 24 * 60 / eq.FreqOpreation)) * 100, 2) END AS 'ty_le' FROM totaleq as eq LEFT JOIN (SELECT MeterCode,NodeCode,COUNT(*) as 'total' FROM Operation  WHERE DATE(MeterTime) >= ? AND DATE(MeterTime) <= ? GROUP BY MeterCode,NodeCode) as a ON eq.MeterCode = a.MeterCode AND eq.NodeCode = a.NodeCode WHERE (eq.Metercode, eq.NodeCode) IN ("+placeholder+");", value );
        var result = JSON.parse(JSON.stringify(data));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet("Data"); //creating worksheet
        worksheet.getColumn('A').width = 12;
        worksheet.getColumn('B').width = 25;
        worksheet.getColumn('C').width = 30;
        worksheet.getColumn('D').width = 20;
        worksheet.getColumn('E').width = 20;
        worksheet.getColumn('F').width = 20;
        worksheet.getColumn('G').width = 20;
        worksheet.getColumn('H').width = 20;
        // worksheet.getColumn('I').width = 20;
    
        worksheet.getRow(1).height = 66;
        // const imagePath =  'https://quawaco.saovietgroup.com.vn/images/logo_quawaco.jpg';
        const imagePath = path.join(__dirname, "..", 'public', 'images', 'logoSaoViet.jpg')
        console.log(imagePath)
        const imageId = workbook.addImage({
            filename: imagePath, // Đường dẫn ảnh
            extension: 'jpg'
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, // Top-left: B2 (cột 1, hàng 1 => B2)
            br: { col: 1, row: 1 }  // Bottom-right: mở rộng đến C4 (cột 2, hàng 3)
        });
    
    
        worksheet.mergeCells('B1:I1');
        worksheet.getCell('B1').value = "SAO VIỆT";
        worksheet.getCell("B1").font ={name: 'Arial', size: 15, bold: true };
        worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
    
        worksheet.mergeCells('A2:I2');
        worksheet.getCell('A2').value = "BÁO CÁO TỶ LỆ SỐ LIỆU THU ĐƯỢC";
        worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    
        worksheet.mergeCells('A3:I3');
        worksheet.getCell('A3').value = "Người xuất báo cáo: " + req.user.user_name;
        worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: false };
        worksheet.mergeCells('A4:I4');
        worksheet.getCell('A4').value = "Thời điểm xuất báo cáo: " + return_local_date_string(new Date());
        worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: false };
    
        worksheet.getCell('A5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('A5').value = "STT";
          worksheet.getCell('A5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('B5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('B5').value = "Mã thiết bị";
          worksheet.getCell('B5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('B5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('C5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('C5').value = "Tên trạm";
          worksheet.getCell('C5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('C5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('D5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('D5').value = "Thời gian thu thập";
          worksheet.getCell('D5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('D5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('E5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('E5').value = "Tần suất (phút/lần)";
          worksheet.getCell('E5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('E5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('F5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('F5').value = "Bản ghi thực tế";
          worksheet.getCell('F5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('F5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('G5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('G5').value = "Bản ghi thiết kế";
          worksheet.getCell('G5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('G5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
          worksheet.getCell('H5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('H5').value = "Tỷ lệ nhận dữ liệu (%)";
          worksheet.getCell('H5').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('H5').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

   
    
          for(let i=0; i<result.length; i++){
            worksheet.getCell('A'+(6+i)).value =  " "+(i+1)+" ";
            worksheet.getCell('A'+(6+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
            worksheet.getCell('B'+(6+i)).value =  result[i].MeterCode;
            worksheet.getCell('B'+(6+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
            worksheet.getCell('C'+(6+i)).value =  result[i].name;
            worksheet.getCell('C'+(6+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
    
            worksheet.getCell('D'+(6+i)).value =  return_date(result[i].thoi_gian_thu_thap);
            worksheet.getCell('D'+(6+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('E'+(6+i)).value =  (result[i].tan_suat);

            worksheet.getCell('F'+(6+i)).value =  result[i].ban_ghi_thuc_te;
            worksheet.getCell('G'+(6+i)).value =  result[i].ban_ghi_thiet_ke;
            worksheet.getCell('H'+(6+i)).value =  result[i].ty_le;

          }
    
    
          for(let i=0; i<result.length+1;i++){
            for(let j=1; j<=8; j++){
              worksheet.getCell(numToLetter(j)+(5+i)).border ={
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