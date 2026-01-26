const fix = 3;
var excel = require('exceljs');
var accessDB = require('./mysql-config');
var accessDB_old = require("./mysql-config-get-water-data")

function configDataWmeter(arrData){
  let data=[];
  for(let i=1; i<arrData.length; i++){
    if((arrData[i].TIME-arrData[i-1].TIME)>0 && (arrData[i].ValOfNum - arrData[i-1].ValOfNum)>= 0){
    // let flr = (arrData[i].ValOfNum - arrData[i-1].ValOfNum)*3600*1000/(arrData[i].TIME-arrData[i-1].TIME);
    let x = {
      ValOfNum: arrData[i].ValOfNum,
      pressure: arrData[i].pressure,
      quanity: arrData[i].ValOfNum - arrData[i-1].ValOfNum,
      flowRate: arrData[i].flowRate,
      TIME: arrData[i].TIME,
      Voltage: arrData[i].Voltage
    };
    data.push(x);
  };
  }
  return data;
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
      // console.log(x);
      var y = new Date(x);
      return y;
    }else{
    var y = new Date(Number(x));
    // console.log(y);
    return y;
    }
  }

function shortToFullName(name){
   switch(name){
    case "pressure":
      name = "Pressure";
      break;
    case "flowRate":
      name = "Flow rate";
      break;
    case "quanity":
      name = "Quanity";
      break;
    case "pin_votage":
      name = "Pin Voltage";
    case "ValOfNum":
      name = "Value of number"
  }
    return name;
  }

function exportData(id,fr,to,moment,usr_id,res,req,name,fre,address,status){
    let sql,sheet;
    switch(moment){
      case "raw": sql = "SELECT DISTINCT * FROM wmeterdata WHERE ID = ? AND TIME > ? AND TIME < ? ORDER BY TIME"; break;
     case "30minute": sql = "call groupbytime_wmeter(1*30,?, ?, ?)"; break; 
      case "hour": sql = "call groupbytime_wmeter(1*60,?, ?, ?)"; break; 
      case "day": sql = "call groupbytime_wmeter(1*60*24,?, ?, ?)"; break;
      case "week": sql = "call groupbytime_wmeter(24*60*7,?,?,?) "; break; 
      case "month": sql = "call groupbytime_wmeter(24*60*30,?,?,?)"; break; 
      case "year": sql = "call groupbytime_wmeter(24*60*365,?,?,?)"; break;
    }        
    sheet = id;
    
    accessDB(sql,[id,fr,to],async function(result){
      // var jsonData = JSON.parse(JSON.stringify(result));
      switch(moment){
        case "raw": jsonData=configDataWmeter(result); break;
       case "30minute": jsonData=configDataWmeter(result[0]); break;
        case "hour":  jsonData=configDataWmeter(result[0]); console.log('hour'); break;
        case "day": jsonData=configDataWmeter(result[0]);  console.log('day');break;
        case "week": jsonData=configDataWmeter(result[0]);console.log('week'); break;
        case "month": jsonData=configDataWmeter(result[0]);console.log('month'); break; 
        case "year": jsonData=configDataWmeter(result[0]);console.log('year'); break;
      }
              // jsonData = configDataWmeter(jsonData)

            let heigh = jsonData.length;
            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet(sheet); //creating worksheet
            worksheet.views = [{
              showGridLines: false,
              wrapText: true 
            }];
            let columnName =["","STT","TIME","Value of number","Pressure","Flow rate","Quanity","Pin Voltage"];
            
          // for(let i=0; i< arr.length; i++){
          //   columnName.push(shortToFullName(arr[i]))
          // }
          worksheet.getRow(10).values = columnName;
          let colum = [{width:5},{key:"STT", width:10},{key: 'TIME', width: 40},{key: "ValOfNum", width: 35},{key: "pressure", width: 35},
                          {key:"flowRate",width: 35},{key:"quanity",width: 35},{key:"Voltage",width: 35}];
          console.log(colum)
          worksheet.columns = colum;
            for(let i=0;i<jsonData.length;i++){
                jsonData[i].STT = i+1;
                jsonData[i].TIME = toISO(jsonData[i].TIME).toString().slice(0,25);
                jsonData[i].ValOfNum =fixNum(jsonData[i].ValOfNum)
                jsonData[i].quanity =fixNum(jsonData[i].quanity)
                jsonData[i].flowRate = fixNum(jsonData[i].flowRate)
                jsonData[i].pressure = fixNum(jsonData[i].pressure)
                jsonData[i].Voltage = fixNum(jsonData[i].Voltage)
              }
              console.log(jsonData)
              worksheet.addRows(jsonData);
        worksheet.mergeCells('C2', 'D2');
        worksheet.mergeCells('C3', 'D3');
        worksheet.mergeCells('C4', 'D4');
        worksheet.mergeCells('C5', 'D5');
        worksheet.mergeCells('C6', 'D6');
        worksheet.mergeCells('C7', 'D7');
        worksheet.mergeCells('C8', 'D8');
        let leng = 5;
        for(let i=1; i<heigh+2;i++){
          for(let j=0; j<leng+3;j++){
            worksheet.getCell(numToLetter(j+1) + (i+9)).border = {
              bottom: {style:"dotted"},
              left : {style: "thin"}
            }
          }
        }
          worksheet.getCell('C2').value = " INDUSTRIAL";
          worksheet.getCell("C2").font ={name: 'Arial', size: 28, bold: true }
          worksheet.getCell('C3').value = " ID:";
          worksheet.getCell("C3").font ={name: 'Arial'}
          worksheet.getCell('E3').value = id;
          worksheet.getCell('C4').value = " Name:";
          worksheet.getCell("C4").font ={name: 'Arial'}
          worksheet.getCell('E4').value = name;
          worksheet.getCell('C5').value = " Frequence:";
          worksheet.getCell("C5").font ={name: 'Arial'}
          worksheet.getCell('E5').value = fre;
          // worksheet.getCell('C6').value = " Group name";
          // worksheet.getCell("C6").font ={name: 'Arial' }
          // worksheet.getCell('E6').value = group_name;
          worksheet.getCell('C7').value = " Address";
          worksheet.getCell("C7").font ={name: 'Arial' }
          worksheet.getCell('E7').value = address;
          worksheet.getCell('C8').value = " Status";
          worksheet.getCell("C8").font ={name: 'Arial' }
          worksheet.getCell('E8').value = status ;

          worksheet.getRow(2).height = 35;
          worksheet.getRow(3).height = 22;
          for(let i=1; i<heigh+16; i++){
            // worksheet.getRow(i+1).alignment ={horizontal: "center"}
            worksheet.getCell("A"+(i)).border = {
              left: {style: 'medium'},               //trái cột A
              right: {style: 'medium'},              // phải cột A
            }
            if(i<11 || i >= heigh+11){
              worksheet.getCell(numToLetter(leng+3)+(i)).border = {
                right: {style: 'medium'},
              }
            }else if(i<heigh+11 && i >= 10){
              worksheet.getCell(numToLetter(leng+3)+(i)).border = {
                right: {style: 'medium'},
                bottom : {style: "dotted"},
                left:{style:"thin"}                // phải cột cuối
              }
            }
          }
          for(let i=0; i< leng+3; i++){
            worksheet.getCell(numToLetter(i+1)+"10").alignment = {
              wrapText: true                         // trên hàng đầu
          }
          worksheet.getCell(numToLetter(i+1)+"1").border = {
            top: {style: 'medium'}                          // trên hàng đầu
          }
          worksheet.getCell(numToLetter(i+1)+(heigh+15).toString()).border = {
            top: {style: 'medium'}                            //trên hàng cuối + 1
          }
          if(i==0){
            worksheet.getCell(numToLetter(i+1)+(9).toString()).border = {
              // bottom: {style: 'medium'},                        //trên dưới hàng 9
              // top: {style:"medium"}
            }
          }else if(i == leng + 2){
            worksheet.getCell(numToLetter(i+1)+(9).toString()).border = {
              bottom: {style: 'medium'},                        //trên dưới hàng 9
              top: {style:"medium"},
              right: {style: "medium"}
            }
            worksheet.getCell(numToLetter(i+1)+(2).toString()).border = {
              bottom: {style: 'thin'},                          // trên dưới hàng 2
              top: {style: "medium"},
              right: {style: "medium"}
            }
          }else{
            worksheet.getCell(numToLetter(i+1)+(9).toString()).border = {
              bottom: {style: 'medium'},                        //trên dưới hàng 9
              top: {style:"medium"}
            }
            worksheet.getCell(numToLetter(i+1)+(2).toString()).border = {
              bottom: {style: 'thin'},                          // trên dưới hàng 2
              top: {style: "medium"}
            }
          }
          worksheet.getCell(numToLetter(i+1)+(10).toString()).border = {
            bottom: {style: 'thin'},                        // hang 10
            top: {style:"medium"},
            left:  {style:"thin"},
          }
        }
        worksheet.getRow(3).alignment = {horizontal: "left"};
        worksheet.getRow(4).alignment = {horizontal: "left"};
        worksheet.getRow(5).alignment = {horizontal: "left"};
        worksheet.getRow(6).alignment = {horizontal: "left"};
        worksheet.getRow(7).alignment = {horizontal: "left"};
        worksheet.getCell("A2").border = {

        };
        worksheet.getCell("B2").border = {
          top: {style: "medium"},
          left: {style: "medium"},
          right: {style: "thin"},
          bottom: {style: "thin"},
        }
        worksheet.getCell("C2").border ={
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"},
          top: {style: "medium"},
        }
        worksheet.getCell("C3").border ={
          left: {style: "thin"},
          right: {style: "thin"},
        }
        worksheet.getCell("C4").border ={
          left: {style: "thin"},
          right: {style: "thin"},
        }
        worksheet.getCell("C5").border ={
          left: {style: "thin"},
          right: {style: "thin"},
        }
        worksheet.getCell("C6").border ={
          left: {style: "thin"},
          right: {style: "thin"},
        }
        worksheet.getCell("C7").border ={
          left: {style: "thin"},
          right: {style: "thin"},
        }
        worksheet.getCell("C8").border ={
          left: {style: "thin"},
          right: {style: "thin"},
        }
        worksheet.getCell("B9").border ={
          left: {style: "medium"},
          right: {style: "thin"},
          bottom: {style: "medium"},
          top: {style: "medium"},
        }

        worksheet.getCell("A10").border ={
          left: {style: "medium"},
          right: {style: "medium"},
        }
        worksheet.getCell(numToLetter(leng+3)+10).border ={
          left: {style: "thin"},
          right: {style: "medium"},
          top: {style:"medium"},
          bottom: {style:"thin"}
        }
        console.log(numToLetter(leng+3)+10);
        worksheet.getCell("C9").value = "Time export: " + (new Date()).toLocaleString();

        for(let i=9; i<heigh+16; i++){
          worksheet.getRow(i+1).alignment ={horizontal: "center", wrapText : true}
          }
        

        accessDB("UPDATE account SET lastExportData = ? WHERE id = ?",[(new Date()).toString(),usr_id],function(result){
            
        })
            
            res.setHeader('Content-Disposition', 'attachment; filename=' +sheet+ ".xlsx");
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            await workbook.xlsx.write(res);
            // await workbook.xlsx.writeFile("./excelfile/"+filepath+".xlsx")
            let filepath = sheet + (new Date()).getTime()/1000;
            // addlog(to,fr,sheet,arr.join(),usr,moment,EQ,id,"./excelfile/"+filepath+".xlsx");
            res.end();
        
    })
}

function addlog(to,from,name,para,usr,moment,eq,selectedEQ,url){
 
  let timescale = from.toString() +","+to.toString();
  console.log(to,from,name,para,usr,moment,eq,selectedEQ,timescale)
  accessDB("INSERT INTO report_table (name,timeScale,moment,para,creatby,url,exportTime,eq,selecteq) VALUES (?,?,?,?,?,?,?,?,?)",[name, timescale,moment,para,usr,url,new Date(),eq,selectedEQ],function(result){
    console.log(result);
  })
}


module.exports = exportData;