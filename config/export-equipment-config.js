var excel = require('exceljs');
var accessDB = require('./mysql-config');

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

function lamtron(x){
  return Math.ceil(x * 1000)/1000;
}

function return_operte(x){
  if(x == 1) return "Tự động";
  return "Thủ công"
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

function numberWithCommas(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

function retunr_date(){
  var d = new Date();
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  var yy = d.getFullYear();
  return dd + '_' + mm + '_' + yy;
}

function return_if_null(x){
  if(x == null || x == ""){
    return " - ";
  }
  return x;
}

function return_date(x){
  if(x == null || x == ""){
    return " - ";
  }
   return new Date(x).toLocaleString('en-GB');
}

function return_status(x){
  if(x == 1 || x == "1"){
    return "Kết nối"
  }else{
    return "Mất kết nối"
  }
}

function Count_on_eq(x){
  let count = 0;
  for(let i=0; i<x.length; i++){
    if(x[i].status == 1 || x[i].status == "1"){
      count ++;
    }
  }
  return count;
}

function exportEQ(res,req){
  let name_file = "DANH_SACH_THIET_BI_"+retunr_date();
  let user_id = req.user.id;
  let sql ="";
  let sql_val = []
  if(req.user.role == "admin"){
    sql = "SELECT * FROM totaleq;"
    sql_val = [];
  }else{
    sql = "SELECT * FROM totaleq INNER JOIN group_user ON totaleq.MeterCode = group_user.ideq WHERE group_user.user_id = ?";
    sql_val = [user_id];
  }
  accessDB(sql,sql_val, async function(result){

    let workbook = new excel.Workbook();
    //creating worksheet
    let worksheet = workbook.addWorksheet("Danh sách điểm đo");
    worksheet.mergeCells('A1:L1');
    worksheet.getCell('A1').value = "Cộng hòa xã hội chủ nghĩa Việt Nam";
    worksheet.getCell("A1").font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2:L2');
    worksheet.getCell('A2').value = "Độc lập - Tự do - Hạnh phúc";
    worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A3:L3');
    worksheet.getCell('A3').value = "----------------------------------------------------------";
    worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A4:L4');
    worksheet.getCell('A4').value = "DANH SÁCH ĐIỂM ĐO";
    worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A5:L5');
    worksheet.mergeCells('A6:L6');
    worksheet.mergeCells('A7:L7');
    worksheet.getCell('A7').value = "Người xuất báo cáo: "+ req.user.user_name;
    worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };

    worksheet.mergeCells('A8:L8');
    worksheet.getCell('A8').value = "Số thiết bị hoạt động / Tổng số: " + Count_on_eq(result) + " / " + result.length;
    worksheet.getCell("A8").font ={name: 'Arial', size: 10, bold: false };

    worksheet.mergeCells('A9:L9');
    worksheet.getCell('A9').value = "Thời gian xuất báo cáo: "+ new Date().toLocaleString('en-GB');
    worksheet.getCell("A9").font ={name: 'Arial', size: 10, bold: false };

    worksheet.getColumn("A").width = 20;
    worksheet.getColumn("B").width = 25;
    worksheet.getColumn("C").width = 30;
    worksheet.getColumn("D").width = 15;
    worksheet.getColumn("E").width = 15;
    worksheet.getColumn("F").width = 15;
    worksheet.getColumn("G").width = 15;
    worksheet.getColumn("H").width = 15;
    worksheet.getColumn("I").width = 20;
    worksheet.getColumn("J").width = 25;

    worksheet.getCell('A10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('A10').value = "ID";
    worksheet.getCell('A10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('A10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('B10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('B10').value = "Tên";
    worksheet.getCell('B10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('B10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('C10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('C10').value = "Thời gian";
    worksheet.getCell('C10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('C10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('D10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('D10').value = "Nhiệt độ (°C)";
    worksheet.getCell('D10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('D10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('E10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('E10').value = "Độ PH";
    worksheet.getCell('E10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('E10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('F10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('F10').value = "Oxy (mg/l)";
    worksheet.getCell('F10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('F10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('G10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('G10').value = "Độ mặn (ppt)";
    worksheet.getCell('G10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('G10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('H10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('H10').value = "Oxy (%)";
    worksheet.getCell('H10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('H10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('I10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('I10').value = "Vận hành";
    worksheet.getCell('I10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('I10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('J10').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('J10').value = "Trạng thái";
    worksheet.getCell('J10').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('J10').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    for(let i=0; i<result.length; i++){
      worksheet.getCell('A'+(11+i)).value = return_if_null(result[i].MeterCode);
      worksheet.getCell('B'+(11+i)).value = return_if_null(result[i].name);
      worksheet.getCell('C'+(11+i)).value = return_date(result[i].last_data_time);
      worksheet.getCell('C'+(11+i)).numFmt = 'm/d/yyyy\\ h:mm:ss\\ AM/PM';
      worksheet.getCell('D'+(11+i)).value = fixed_data(result[i].last_Temp);
      worksheet.getCell('E'+(11+i)).value = fixed_data(result[i].last_PH);
      worksheet.getCell('F'+(11+i)).value = fixed_data(result[i].last_DO);
      worksheet.getCell('G'+(11+i)).value = fixed_data(result[i].last_Salinity);
      worksheet.getCell('H'+(11+i)).value = fixed_data(result[i].last_ORP);
      worksheet.getCell('I'+(11+i)).value = return_operte(result[i].last_Operate);
      worksheet.getCell('J'+(11+i)).value = return_status(result[i].last_status);
    }

    for(let i=0; i<result.length+1;i++){
      for(let j=1; j<=10; j++){
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
module.exports = exportEQ;