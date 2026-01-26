const fix = 3;
var excel = require('exceljs');
var accessDB = require('./mysql-config');

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
    // if(x == 0){
    //   return numberWithCommas((0).toFixed(1));
    // }
    if(x ==="" || x === null){
      return "-";
    }
  
   if(!isNaN(Number(x))){
      return Number(x);
    }else{
      return x;
    }
}


// function return_date_title(x){
//     var d = new Date(x);
//     var mm = d.getMonth() + 1;
//     var dd = d.getDate();
//     var yy = d.getFullYear();
//     return dd + '_' + mm + '_' + yy;
//   }
  
  function return_if_null(x){
    if(x == null || x == ""){
      return " - ";
    }
    return x;
  }
  
  // function return_date(x){
  //   if(x == null || x == ""){
  //     return " - ";
  //   }
  //    return new Date(x).toLocaleString('en-GB');
  // }
  
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




function exportData(req,res,info,status,MeterCode,NodeCode){
    // let MeterCode = req.session.ideq;
    let from = req.query.fr;
    let to = req.query.to;
    // let node_code = req.session.node_code;
    let type = req.query.type;
    let node_id = req.query.node_id;
    let obj = [];
    let sql;
    // console.log(MeterCode, returnSQLDateFormat(from), returnSQLDateFormat(to));
    // console.log(info);
    let name_file = "DANH_SACH_CANH_BAO"+return_date(from)+"_"+return_date(to);
    if(type =="all"){
      sql = "SELECT para AS 'alert_types',CASE	WHEN para = 'POWER' AND alert_type = 'OFF' THEN 'Mất điện' WHEN para = 'POWER' AND alert_type = 'ON' THEN	'Có điện' WHEN para = 'SENSOR' AND alert_type = 'DISCONNECT' THEN	'Mất kết nối cảm biến Oxy' WHEN para = 'SENSOR' AND alert_type = 'CONNECT' THEN	'Có kết nối cảm biến' WHEN para = 'OXY' AND alert_type = 'LLOXY_LOW' THEN	'Lưu lượng Oxy thấp' WHEN para = 'OXY' AND alert_type = 'TTOXY_OVER' THEN	'Trạng thái Oxy cao' WHEN para = 'PH' AND alert_type = 'LLPH_LOW' THEN 'Lượng pH thấp' WHEN para = 'PH' AND alert_type = 'TTPH_OVER' THEN	'Lượng pH cao' WHEN para = 'TTPH' AND alert_type = 'DISCONNECTPH' THEN 'Mất kết nối cảm biến PH' WHEN para = 'LOIBOM' AND threshold > 0	AND alert_type = 'LOIBOMKETNOI' THEN CONCAT('Lỗi mất kết nối bơm số ',threshold) WHEN para = 'LOIBOM' AND threshold = 0 AND alert_type = 'LOIBOMKETNOI' THEN 'Lỗi mất kết nối bơm' 	WHEN para = 'LOIBOM' AND threshold > 0 AND alert_type = 'LOIBOMDIENAP' THEN	CONCAT('Lỗi điện áp bơm số ',threshold)	WHEN para = 'LOIBOM' AND threshold = 0 AND alert_type = 'LOIBOMDIENAP' THEN	'Lỗi điện áp bơm' WHEN para = 'LOIBOM' AND threshold > 0 AND alert_type = 'LOIBOMAPSUAT' THEN	CONCAT('Lỗi áp suất bơm số ',threshold)	WHEN para = 'LOIBOM' AND threshold = 0 AND alert_type = 'LOIBOMAPSUAT' THEN 'Lỗi áp suất bơm' WHEN para = 'CONNECT' AND alert_type = 'DISCONNECT' THEN 'Thiết bị mất kết nối'	ELSE '-' END alert_mess,id,created_at,1 AS type,alert_status AS `status` FROM alert_data WHERE MeterCode = ? AND NodeCode = ? AND created_at > ? AND created_at < ? ORDER BY created_at DESC;";
      obj = [MeterCode,NodeCode,returnSQLDateFormat(from),returnSQLDateFormat(to)];
    }else{
      sql = "SELECT para AS 'alert_types',CASE	WHEN para = 'POWER' AND alert_type = 'OFF' THEN 'Mất điện' WHEN para = 'POWER' AND alert_type = 'ON' THEN	'Có điện' WHEN para = 'SENSOR' AND alert_type = 'DISCONNECT' THEN	'Mất kết nối cảm biến Oxy' WHEN para = 'SENSOR' AND alert_type = 'CONNECT' THEN	'Có kết nối cảm biến' WHEN para = 'OXY' AND alert_type = 'LLOXY_LOW' THEN	'Lưu lượng Oxy thấp' WHEN para = 'OXY' AND alert_type = 'TTOXY_OVER' THEN	'Trạng thái Oxy cao' WHEN para = 'PH' AND alert_type = 'LLPH_LOW' THEN 'Lượng pH thấp' WHEN para = 'PH' AND alert_type = 'TTPH_OVER' THEN	'Lượng pH cao' WHEN para = 'TTPH' AND alert_type = 'DISCONNECTPH' THEN 'Mất kết nối cảm biến PH' WHEN para = 'LOIBOM' AND threshold > 0	AND alert_type = 'LOIBOMKETNOI' THEN CONCAT('Lỗi mất kết nối bơm số ',threshold) WHEN para = 'LOIBOM' AND threshold = 0 AND alert_type = 'LOIBOMKETNOI' THEN 'Lỗi mất kết nối bơm' 	WHEN para = 'LOIBOM' AND threshold > 0 AND alert_type = 'LOIBOMDIENAP' THEN	CONCAT('Lỗi điện áp bơm số ',threshold)	WHEN para = 'LOIBOM' AND threshold = 0 AND alert_type = 'LOIBOMDIENAP' THEN	'Lỗi điện áp bơm' WHEN para = 'LOIBOM' AND threshold > 0 AND alert_type = 'LOIBOMAPSUAT' THEN	CONCAT('Lỗi áp suất bơm số ',threshold)	WHEN para = 'LOIBOM' AND threshold = 0 AND alert_type = 'LOIBOMAPSUAT' THEN 'Lỗi áp suất bơm' WHEN para = 'CONNECT' AND alert_type = 'DISCONNECT' THEN 'Thiết bị mất kết nối'	ELSE '-' END alert_mess,id,created_at,1 AS type,alert_status AS `status` FROM alert_data WHERE MeterCode = ? AND NodeCode = ? AND created_at > ? AND created_at < ? AND para = ? ORDER BY created_at DESC;";
      obj = [MeterCode,NodeCode,returnSQLDateFormat(from),returnSQLDateFormat(to),type];
    }
    accessDB(sql,obj,async function(data){
            var result = JSON.parse(JSON.stringify(data));
            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet(MeterCode); //creating worksheet

            worksheet.getColumn('A').width = 6;
            worksheet.getColumn('B').width = 24;
            worksheet.getColumn('C').width = 35;
            worksheet.getColumn('D').width = 30;


            worksheet.mergeCells('A1:D1');
            worksheet.getCell('A1').value = "Cộng hòa xã hội chủ nghĩa Việt Nam";
            worksheet.getCell("A1").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A2:D2');
            worksheet.getCell('A2').value = "Độc lập - Tự do - Hạnh phúc";
            worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A3:D3');
            worksheet.getCell('A3').value = "----------------------------------------------------------";
            worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A4:D4');
            worksheet.getCell('A4').value = "DANH SÁCH CẢNH BÁO";
            worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A5:D5');
            worksheet.getCell('A5').value = "Vị trí điểm đo: " + return_if_null(info.address);
            worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A6:D6');
            worksheet.getCell('A6').value = "Mã thiết bị: "+ info.MeterCode;
            worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A7:D7');
            worksheet.getCell('A7').value = "Tên thiết bị: "+ info.meter_name;
            worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A8:D8');
            worksheet.getCell('A8').value = "Người xuất báo cáo: "+req.user.user_name;
            worksheet.getCell("A8").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A9:D9');
            worksheet.getCell('A9').value = "Có "+ result.length +" bản ghi từ "+ new Date(Number(from)).toLocaleString('en-GB') +" đến "+ new Date(Number(to)).toLocaleString('en-GB');
            worksheet.getCell("A9").font ={name: 'Arial', size: 10, bold: false };

            worksheet.getCell('A10').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('A10').value = "STT";
            worksheet.getCell('A10').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('B10').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('B10').value = "Loại cảnh cáo";
            worksheet.getCell('B10').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('B10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('C10').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('C10').value = "Nội dung cảnh báo";
            worksheet.getCell('C10').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('C10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('D10').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('D10').value = "Thời gian tạo";
            worksheet.getCell('D10').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('D10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };


            for(let i=0; i<result.length; i++){
              worksheet.getCell('A'+(11+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('B'+(11+i)).value =  result[i].alert_types
              worksheet.getCell('C'+(11+i)).value =  result[i].alert_mess;
              worksheet.getCell('D'+(11+i)).value =  new Date(result[i].created_at).toLocaleString('en-GB');
            }

            for(let i=0; i<result.length+1;i++){
                for(let j=1; j<5; j++){
                  worksheet.getCell(numToLetter(j)+(10+i)).border ={
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
    })
}



module.exports = exportData;