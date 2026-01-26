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


function exportData(req,res){
    let from = req.query.fr;
    let to = req.query.to;
    let node_code = req.session.handhel_nodecode;
    let name_file = "CHI_SO_TUNG_THOI_DIEM_METER_"+return_date(from)+"_"+return_date(to);
    accessDB("SELECT * FROM Operation WHERE NodeCode = ? AND MeterTime > ? AND MeterTime < ? ORDER BY MeterTime DESC",[node_code,returnSQLDateFormat(from),returnSQLDateFormat(to)],async function(data){
            var result = JSON.parse(JSON.stringify(data));
            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet(node_code); //creating worksheet

            worksheet.getColumn('A').width = 6;
            worksheet.getColumn('B').width = 15;
            worksheet.getColumn('C').width = 30;
            worksheet.getColumn('D').width = 15;
            worksheet.getColumn('E').width = 15;
            worksheet.getColumn('F').width = 15;
            worksheet.getColumn('G').width = 15;
            worksheet.getColumn('H').width = 15;




            worksheet.mergeCells('A1:I1');
            worksheet.getCell('A1').value = "Cộng hòa xã hội chủ nghĩa Việt Nam";
            worksheet.getCell("A1").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A2:I2');
            worksheet.getCell('A2').value = "Độc lập - Tự do - Hạnh phúc";
            worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A3:I3');
            worksheet.getCell('A3').value = "----------------------------------------------------------";
            worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A4:I4');
            worksheet.getCell('A4').value = "CHỈ SỐ TỪNG THỜI ĐIỂM THIẾT BỊ";
            worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A5:I5');
            worksheet.getCell('A5').value = "Vị trí điểm đo: ";
            worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A6:I6');
            worksheet.getCell('A6').value = "Mã thiết bị: "+ req.session.handhel_nodecode;
            worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A7:I7');
            worksheet.getCell('A7').value = "Người xuất báo cáo: "+req.user.user_name;
            worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };

            worksheet.mergeCells('A8:I8');
            worksheet.getCell('A8').value = "Có "+ result.length +" bản ghi từ "+ return_local_date_string(new Date(Number(from))) +" đến "+ return_local_date_string(new Date(Number(to)));
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
            worksheet.getCell('B9').value = "Thứ tự ao";
            worksheet.getCell('B9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('B9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('C9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('C9').value = "Thời gian";
            worksheet.getCell('C9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('C9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
            
            worksheet.getCell('D9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('D9').value = "Nhiệt độ (°C)";
            worksheet.getCell('D9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('D9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('E9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('E9').value = "Độ PH";
            worksheet.getCell('E9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('E9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('F9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('F9').value = "Oxy (mg/l)";
            worksheet.getCell('F9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('F9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('G9').fill = {
              type: "pattern",
              pattern: "solid",
              fgColor:{argb:'70CBFF'},
          }
            worksheet.getCell('G9').value = "Độ mặn (ppt)";
            worksheet.getCell('G9').font ={name: 'Arial', size: 10, bold: true };
            worksheet.getCell('G9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

            worksheet.getCell('H9').fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'70CBFF'},
            }
              worksheet.getCell('H9').value = "Oxy (%)";
              worksheet.getCell('H9').font ={name: 'Arial', size: 10, bold: true };
              worksheet.getCell('H9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
            

            for(let i=0; i<result.length; i++){
              worksheet.getCell('A'+(10+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('A'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('B'+(10+i)).value =  result[i].MeterCode;
              worksheet.getCell('B'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('C'+(10+i)).value =  return_local_date_string(new Date(result[i].MeterTime));
              worksheet.getCell('C'+(10+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

              worksheet.getCell('D'+(10+i)).value =  fixed_data(result[i].Temp);
              worksheet.getCell('E'+(10+i)).value =  fixed_data(result[i].PH);
              worksheet.getCell('F'+(10+i)).value =  fixed_data(result[i].DO);
              worksheet.getCell('G'+(10+i)).value =  fixed_data(result[i].Salinity);
              worksheet.getCell('H'+(10+i)).value =  fixed_data(result[i].ORP);
            }

            for(let i=0; i<result.length+1;i++){
                for(let j=1; j<=8; j++){
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
    })
}



module.exports = exportData;