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

  function minus(x1,x2){
    if(x1 == "-" || x2 == "-"){
        return "-"
    }
    return x1-x2;
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
    let NodeCode_arr = meter_list;
    let NodeCode_1 = NodeCode_arr[0].split("-")[0];
    let MeterCode_1 = NodeCode_arr[0].split("-")[1];
    let NodeCode_2 = NodeCode_arr[1].split("-")[0];
    let MeterCode_2 = NodeCode_arr[1].split("-")[1];
    let name_file = "SO_SANH_CHI_SO_HAI_THIET_BI_"+return_date(from)+"_"+return_date(to);
    let sql = "SELECT DISTINCT * FROM Operation WHERE ((NodeCode = ? AND MeterCode = ?) OR (NodeCode = ? AND MeterCode = ?)) AND MeterTime > ? AND MeterTime < ? ORDER BY MeterTime DESC;"
    accessDB(sql,[NodeCode_1,MeterCode_1,NodeCode_2,MeterCode_2,from,to], async function(result){
        let data = JSON.parse(JSON.stringify(result));
        let DATA = [];
        for(let i=0;i<data.length-1;i++){
            let x = {};
            if(data[i].MeterTime == data[i+1].MeterTime){
                x.NodeCode = "";
                x.MeterCode = "";
                x.time = data[i].MeterTime;
                if(data[i].NodeCode == NodeCode_1 && data[i].MeterCode == MeterCode_1 ){
                    x.NodeCode +=  data[i].NodeCode;
                    x.MeterCode += data[i].MeterCode;
                    x.Temp_1 = data[i].Temp;
                    x.PH_1 = data[i].PH;
                    x.DO_1 = data[i].DO;
                    x.Salinity_1 = data[i].Salinity;
                    x.ORP_1 = data[i].ORP;
                  }
                  if(data[i+1].NodeCode == NodeCode_1 && data[i+1].MeterCode == MeterCode_1 ){
                    x.NodeCode +=  data[i+1].NodeCode;
                    x.MeterCode +=  data[i+1].MeterCode;
                    x.Temp_1 = data[i+1].Temp;
                    x.PH_1 = data[i+1].PH;
                    x.DO_1 = data[i+1].DO;
                    x.Salinity_1 = data[i+1].Salinity;
                    x.ORP_1 = data[i+1].ORP;
                  }
                if(data[i].NodeCode == NodeCode_2 && data[i].MeterCode == MeterCode_2 ){
                    x.NodeCode += "-" +  data[i].NodeCode;
                    x.MeterCode += "-" +  data[i].MeterCode;
                    x.Temp_2 = data[i].Temp;
                    x.PH_2 = data[i].PH;
                    x.DO_2 = data[i].DO;
                    x.Salinity_2 = data[i].Salinity;
                    x.ORP_2 = data[i].ORP;
                  }
                if(data[i+1].NodeCode == NodeCode_2 && data[i+1].MeterCode == MeterCode_2 ){
                    x.NodeCode += "-" +  data[i+1].NodeCode;
                    x.MeterCode += "-" +  data[i+1].MeterCode;
                    x.Temp_2 = data[i+1].Temp;
                    x.PH_2 = data[i+1].PH;
                    x.DO_2 = data[i+1].DO;
                    x.Salinity_2 = data[i+1].Salinity;
                    x.ORP_2 = data[i+1].ORP;
                  }
                DATA.push(x)
                i+=1;
            }
            x = {};
          }

        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet("Dữ liệu so sánh"); //creating worksheet

        worksheet.getColumn('A').width = 6;
        worksheet.getColumn('B').width = 40;
        worksheet.getColumn('C').width = 20;
        worksheet.getColumn('D').width = 35;
        worksheet.getColumn('E').width = 15;
        worksheet.getColumn('F').width = 15;
        worksheet.getColumn('G').width = 25;
        worksheet.getColumn('H').width = 15;
        worksheet.getColumn('I').width = 15;
        worksheet.getColumn('J').width = 15;
        worksheet.getColumn('K').width = 15;
        worksheet.getColumn('L').width = 25;
        worksheet.getColumn('M').width = 15;
        worksheet.getColumn('N').width = 15;
        worksheet.getColumn('O').width = 25;
        worksheet.getColumn('P').width = 15;
        worksheet.getColumn('Q').width = 15;

        worksheet.mergeCells('A1:Q1');
        worksheet.getCell('A1').value = "Cộng hòa xã hội chủ nghĩa Việt Nam";
        worksheet.getCell("A1").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.mergeCells('A2:Q2');
        worksheet.getCell('A2').value = "Độc lập - Tự do - Hạnh phúc";
        worksheet.getCell("A2").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.mergeCells('A3:Q3');
        worksheet.getCell('A3').value = "----------------------------------------------------------";
        worksheet.getCell("A3").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.mergeCells('A4:Q4');
        worksheet.getCell('A4').value = "BẢNG SO SÁNH HAI THIẾT BỊ";
        worksheet.getCell("A4").font ={name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };


        worksheet.mergeCells('A5:Q5');
        worksheet.getCell('A5').value = "Người xuất báo cáo: "+req.user.user_name;
        worksheet.getCell("A5").font ={name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A6:Q6');
        worksheet.getCell('A6').value = "Có "+ DATA.length +" bản ghi từ "+ from +" đến "+ to;
        worksheet.getCell("A6").font ={name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A7:Q7');
        worksheet.getCell('A7').value = NodeCode_arr[0] + "(1);  "+ NodeCode_arr[1] + "(2)";
        worksheet.getCell("A7").font ={name: 'Arial', size: 10, bold: false };

        worksheet.getCell('A8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('A8').value = "STT";
          worksheet.getCell('A8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('A8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('B8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('B8').value = "Mã thiết bị";
          worksheet.getCell('B8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('B8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('C8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('C8').value = "Thứ tự ao";
          worksheet.getCell('C8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('C8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('D8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('D8').value = "Thời gian";
          worksheet.getCell('D8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('D8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('E8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('E8').value = "Nhiệt độ (1) (°C)";
          worksheet.getCell('E8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('E8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('F8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('F8').value = "Nhiệt độ (2) (°C)";
          worksheet.getCell('F8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('F8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('G8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('G8').value = "Sai số nhiệt độ";
          worksheet.getCell('G8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('G8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('H8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('H8').value = "Độ PH (1)";
          worksheet.getCell('H8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('H8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('I8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('I8').value = "ĐỘ PH (2)";
          worksheet.getCell('I8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('I8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('J8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('J8').value = "Oxy (1) (mg/l)";
          worksheet.getCell('J8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('J8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('K8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('K8').value = "Oxy (2) (mg/l)";
          worksheet.getCell('K8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('K8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('L8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('L8').value = "Sai số Oxy (mg/l)";
          worksheet.getCell('L8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('L8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('M8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('M8').value = "Độ mặn (1) (ppt)";
          worksheet.getCell('M8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('M8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('N8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('N8').value = "Độ mặn (2) (ppt)";
          worksheet.getCell('N8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('N8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('O8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('O8').value = "Sai số độ mặn";
          worksheet.getCell('O8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('O8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('P8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('P8').value = "Oxy (1) (%)";
          worksheet.getCell('P8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('P8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };

          worksheet.getCell('Q8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor:{argb:'70CBFF'},
        }
          worksheet.getCell('Q8').value = "Oxy (2) (%)";
          worksheet.getCell('Q8').font ={name: 'Arial', size: 10, bold: true };
          worksheet.getCell('Q8').alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };


          for(let i=0; i<DATA.length; i++){
  
              worksheet.getCell('A'+(9+i)).value =  " "+(i+1)+" ";
              worksheet.getCell('A'+(9+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('B'+(9+i)).value =  DATA[i].NodeCode;
              worksheet.getCell('B'+(9+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('C'+(9+i)).value =  DATA[i].MeterCode;
              worksheet.getCell('C'+(9+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('D'+(9+i)).value =  return_local_date_string(new Date(DATA[i].time));
              worksheet.getCell('D'+(9+i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText : true };
  
              worksheet.getCell('E'+(9+i)).value =  fixed_data(DATA[i].Temp_1);
              worksheet.getCell('F'+(9+i)).value =  fixed_data(DATA[i].Temp_2);
              worksheet.getCell('G'+(9+i)).value =  minus(DATA[i].Temp_1,DATA[i].Temp_2);
              worksheet.getCell('H'+(9+i)).value =  fixed_data(DATA[i].PH_1);
              worksheet.getCell('I'+(9+i)).value =  fixed_data(DATA[i].PH_2);
              worksheet.getCell('J'+(9+i)).value =  fixed_data(DATA[i].DO_1);
              worksheet.getCell('K'+(9+i)).value =  fixed_data(DATA[i].DO_2);
              worksheet.getCell('L'+(9+i)).value =  minus(DATA[i].DO_1,DATA[i].DO_2);

              worksheet.getCell('M'+(9+i)).value =  fixed_data(DATA[i].Salinity_1);
              worksheet.getCell('N'+(9+i)).value =  fixed_data(DATA[i].Salinity_2);
              worksheet.getCell('O'+(9+i)).value =  minus(DATA[i].Salinity_1,DATA[i].Salinity_2);

              worksheet.getCell('P'+(9+i)).value =  fixed_data(DATA[i].ORP_1);
              worksheet.getCell('Q'+(9+i)).value =  fixed_data(DATA[i].ORP_2);
           
          }

          for(let i=0; i<DATA.length+1;i++){
            for(let j=1; j<=17; j++){
              worksheet.getCell(numToLetter(j)+(8+i)).border ={
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