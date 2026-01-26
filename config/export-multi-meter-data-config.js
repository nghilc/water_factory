var excel = require('exceljs');
var accessDB = require('./mysql-config');

function return_date(x){
    var d = new Date(x);
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    var yy = d.getFullYear();
    return dd + '_' + mm + '_' + yy;
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

  function numberWithCommas(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
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

  var pad = function(num) { return ('00'+num).slice(-2) };

  function return_local_date_string(date){
    if(date){
      let x = pad(date.getDate()) + '/' +
      pad(date.getMonth() + 1)   + '/' +
      date.getFullYear() + ', '+
      pad(date.getHours())      + ':' +
      pad(date.getMinutes())    + ':' +
      pad(date.getSeconds());
    return x;
    }
    return "-"
  }


function exportData(from,to,meter_list,req,res){
    let arr_for_sql = [];
    let sql = "SELECT * FROM Operation WHERE ";
    for(let i=0; i<meter_list.length; i++){
        let x = meter_list[i].split("-");
        arr_for_sql.push(x[0],x[1]);
        if(i == meter_list.length - 1){
            sql += "(NodeCode = ? AND MeterCode = ?)) AND MeterTime > ? AND MeterTime < ? ORDER BY MeterTime DESC LIMIT 1000;"
        }else if(i == 0){
            sql += "((NodeCode = ? AND MeterCode = ?) OR "
        }
        else{
            sql += "(NodeCode = ? AND MeterCode = ?) OR "
        }
    }
    arr_for_sql.push(from,to);
    let name_file = "CHI_SO_TUNG_THOI_DIEM_NHIEU_THIET_BI_"+return_date(from)+"_"+return_date(to);
    accessDB(sql,arr_for_sql, async function(result){
        let data = JSON.parse(JSON.stringify(result));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet("sheet1"); //creating worksheet

        worksheet.getColumn('A').width = 6;
        worksheet.getColumn('B').width = 25;
        worksheet.getColumn('C').width = 25;
        worksheet.getColumn('D').width = 30;
        worksheet.getColumn('E').width = 15;
        worksheet.getColumn('F').width = 15;
        worksheet.getColumn('G').width = 15;
        worksheet.getColumn('H').width = 15;
        worksheet.getColumn('I').width = 15;

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
        worksheet.getCell('A4').value = "CHỈ SỐ TỪNG THỜI ĐIỂM NHIỀU THIẾT BỊ";
        worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };


        worksheet.mergeCells('A5:I5');
        worksheet.getCell('A5').value = "Người xuất báo cáo: "+req.user.user_name;
        worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A6:I6');
        worksheet.getCell('A6').value = "Có "+ data.length +" bản ghi từ "+ from +" đến "+ to;
        worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };

        worksheet.getCell('A7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('A7').value = "STT";
          worksheet.getCell('A7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('B7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('B7').value = "Mã thiết bị";
          worksheet.getCell('B7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('B7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('C7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('C7').value = "Thứ tự ao";
          worksheet.getCell('C7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('C7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('D7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('D7').value = "Thời gian";
          worksheet.getCell('D7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('D7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('E7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('E7').value = "Nhiệt độ (°C)";
          worksheet.getCell('E7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('E7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('F7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('F7').value = "Độ PH";
          worksheet.getCell('F7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('F7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('G7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('G7').value = "Oxy (mg/l)";
          worksheet.getCell('G7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('G7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('H7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('H7').value = "Độ mặn (ppt)";
          worksheet.getCell('H7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('H7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('I7').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('I7').value = "Oxy (%)";
          worksheet.getCell('I7').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('I7').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          for(let i=0; i<data.length; i++){
            if(data[i].NodeCode == 'TESTVER00000013' && ((i !=0 && return_local_date_string(new Date(data[i].MeterTime)) == return_local_date_string(new Date(data[i-1].MeterTime))) || (i != data.length - 1 && return_local_date_string(new Date(data[i].MeterTime)) == return_local_date_string(new Date(data[i+1].MeterTime))))){
              if((i !=0 && return_local_date_string(new Date(data[i].MeterTime)) == return_local_date_string(new Date(data[i-1].MeterTime)))){
                worksheet.getCell('A'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('B'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('C'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('D'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('E'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('F'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('G'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('H'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('I'+(7+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
              }
              if(i != data.length - 1 && return_local_date_string(new Date(data[i].MeterTime)) == return_local_date_string(new Date(data[i+1].MeterTime))){
                worksheet.getCell('A'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('B'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('C'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('D'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('E'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('F'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('G'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('H'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
                worksheet.getCell('I'+(9+i)).fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor:{argb:'ff4d4d'},
                }
              }
              worksheet.getCell('A'+(8+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('A'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('A'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('B'+(8+i)).value =  data[i].NodeCode;
              worksheet.getCell('B'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('B'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('C'+(8+i)).value =  data[i].MeterCode;
              worksheet.getCell('C'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('C'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('D'+(8+i)).value =  return_local_date_string(new Date(data[i].MeterTime));
              worksheet.getCell('D'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
              worksheet.getCell('D'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('E'+(8+i)).value =  fixed_data(data[i].Temp);
              worksheet.getCell('E'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('F'+(8+i)).value =  fixed_data(data[i].PH);
              worksheet.getCell('F'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('G'+(8+i)).value =  fixed_data(data[i].DO);
              worksheet.getCell('G'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('H'+(8+i)).value =  fixed_data(data[i].Salinity);
              worksheet.getCell('H'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
              worksheet.getCell('I'+(8+i)).value =  fixed_data(data[i].ORP);
              worksheet.getCell('I'+(8+i)).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor:{argb:'e6e600'},
              }
            }else{
              worksheet.getCell('A'+(8+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('A'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('B'+(8+i)).value =  data[i].NodeCode;
              worksheet.getCell('B'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('C'+(8+i)).value =  data[i].MeterCode;
              worksheet.getCell('C'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('D'+(8+i)).value =  return_local_date_string(new Date(data[i].MeterTime));
              worksheet.getCell('D'+(8+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('E'+(8+i)).value =  fixed_data(data[i].Temp);
              worksheet.getCell('F'+(8+i)).value =  fixed_data(data[i].PH);
              worksheet.getCell('G'+(8+i)).value =  fixed_data(data[i].DO);
              worksheet.getCell('H'+(8+i)).value =  fixed_data(data[i].Salinity);
              worksheet.getCell('I'+(8+i)).value =  fixed_data(data[i].ORP);
            }
          }

          for(let i=0; i<data.length+1;i++){
            for(let j=1; j<=9; j++){
              worksheet.getCell(numToLetter(j)+(7+i)).border ={
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