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

function exportEQ(req,res){
  let name_file = "DANH_SACH_THIET_BI_BAN_TU_DONG_"+retunr_date();
  let sql ="SELECT * FROM totaleq INNER JOIN (SELECT NodeCode, MAX(last_data_time) AS max_time FROM totaleq WHERE meter_type = ? GROUP BY NodeCode) t2 ON totaleq.NodeCode = t2.NodeCode AND totaleq.last_data_time = t2.max_time WHERE meter_type = ? ORDER BY totaleq.last_data_time DESC;"
  let sql_val = [2,2];
    let data = null;
  accessDB(sql,sql_val, async function(result){
    if(result.length > 0){
        data = result.filter((obj, index) => {
            return index === result.findIndex(o => obj.NodeCode === o.NodeCode);
          });
    }else{
        data = [];
    }
    let workbook = new excel.Workbook();
    //creating worksheet
    let worksheet = workbook.addWorksheet("Danh sách điểm đo bán tự động");
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
    worksheet.getCell('A4').value = "DANH SÁCH ĐIỂM ĐO BÁN TỰ ĐỘNG";
    worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A5:L5');
    worksheet.mergeCells('A6:L6');
    worksheet.mergeCells('A7:L7');
    worksheet.getCell('A7').value = "Người xuất báo cáo: "+ req.user.user_name;
    worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };


    worksheet.mergeCells('A8:L8');
    worksheet.getCell('A8').value = "Thời gian xuất báo cáo: "+ new Date().toLocaleString('en-GB');
    worksheet.getCell("A8").font ={name: 'Arial', size: 10, bold: false };

    worksheet.getColumn("A").width = 6;  //STT
    worksheet.getColumn("B").width = 15; //NodeCode
    worksheet.getColumn("C").width = 15;    // last pond
    worksheet.getColumn("D").width = 25;    //ten
    worksheet.getColumn("E").width = 30;    // Thoi gian
    worksheet.getColumn("F").width = 15;    // 
    worksheet.getColumn("G").width = 15;
    worksheet.getColumn("H").width = 15;
    worksheet.getColumn("I").width = 15;
    worksheet.getColumn("J").width = 15;
    worksheet.getColumn("K").width = 15;
    worksheet.getColumn("L").width = 25;


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
    worksheet.getCell('B9').value = "Mã thiết bị";
    worksheet.getCell('B9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('B9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('C9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('C9').value = "Ao mới nhất";
    worksheet.getCell('C9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('C9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('D9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }

    worksheet.getCell('D9').value = "Tên";
    worksheet.getCell('D9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('D9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('E9').fill = {
        type: "pattern",
        pattern: "solid",
        fgColor:{argb:'70CBFF'},
    }
    worksheet.getCell('E9').value = "Thời gian";
    worksheet.getCell('E9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('E9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };


    worksheet.getCell('F9').fill = {
        type: "pattern",
        pattern: "solid",
        fgColor:{argb:'70CBFF'},
    }
    worksheet.getCell('F9').value = "Nhiệt độ (°C)";
    worksheet.getCell('F9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('F9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('G9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('G9').value = "Độ PH";
    worksheet.getCell('G9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('G9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('H9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('H9').value = "Oxy (mg/l)";
    worksheet.getCell('H9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('H9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('I9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('I9').value = "Độ mặn (ppt)";
    worksheet.getCell('I9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('I9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('J9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('J9').value = "Oxy (%)";
    worksheet.getCell('J9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('J9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('K9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('K9').value = "Vận hành";
    worksheet.getCell('K9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('K9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    worksheet.getCell('L9').fill = {
      type: "pattern",
      pattern: "solid",
      fgColor:{argb:'70CBFF'},
  }
    worksheet.getCell('L9').value = "Trạng thái";
    worksheet.getCell('L9').font ={name: 'Arial', size: 10, bold: true };
    worksheet.getCell('L9').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

    for(let i=0; i<data.length; i++){
        worksheet.getCell('A'+(10+i)).value = " "+(i+1)+ " ";
      worksheet.getCell('B'+(10+i)).value = return_if_null(data[i].NodeCode);
      worksheet.getCell('C'+(10+i)).value = return_if_null(data[i].MeterCode);
      worksheet.getCell('D'+(10+i)).value = return_if_null(data[i].name);
      worksheet.getCell('E'+(10+i)).value = return_date(data[i].last_data_time);
      worksheet.getCell('E'+(10+i)).numFmt = 'm/d/yyyy\\ h:mm:ss\\ AM/PM';
      worksheet.getCell('F'+(10+i)).value = fixed_data(data[i].last_Temp);
      worksheet.getCell('G'+(10+i)).value = fixed_data(data[i].last_PH);
      worksheet.getCell('H'+(10+i)).value = fixed_data(data[i].last_DO);
      worksheet.getCell('I'+(10+i)).value = fixed_data(data[i].last_Salinity);
      worksheet.getCell('J'+(10+i)).value = fixed_data(data[i].last_ORP);
      worksheet.getCell('K'+(10+i)).value = return_operte(data[i].last_Operate);
      worksheet.getCell('L'+(10+i)).value = return_status(data[i].last_status);
    }

    for(let i=0; i<data.length+1;i++){
      for(let j=1; j<=12; j++){
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
module.exports = exportEQ;