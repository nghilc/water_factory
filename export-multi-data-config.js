var excel = require('exceljs');
var accessDB = require('./mysql-config');
var accessDB_old = require("./mysql-config-get-water-data")
const fix = 3;

function configDataWmeter(arrData){
  let data=[];
  for(let i=1; i<arrData.length; i++){
    if((arrData[i].TIME-arrData[i-1].TIME)>0 && (arrData[i].ValOfNum - arrData[i-1].ValOfNum)>= 0){
    // let flr = (arrData[i].ValOfNum - arrData[i-1].ValOfNum)*3600*1000/(arrData[i].TIME-arrData[i-1].TIME);
    let x = {
      pressure: arrData[i].pressure,
      quanity: arrData[i].ValOfNum - arrData[i-1].ValOfNum,
      flowRate: arrData[i].flowRate,
      TIME: arrData[i].TIME,
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
    case 19:return "S";
    case 20:return "T";
    case 21:return "U";
    case 22:return "V";
    case 23:return "W";
    case 24:return "X";
    case 25:return "Y";
    case 26:return "Z";
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
   }
     return name;
   }

   function returnSqlQuery(eq,moment){
    let sql;
    switch(eq){
        case "wt":
          switch(moment){
            case "raw": sql = 'SELECT DISTINCT * FROM wmeterdata WHERE ID = ? AND TIME > ? AND TIME < ? ORDER BY TIME'; break;
            case "30minute": sql = "call groupbytime_wmeter(1*30,?, ?, ?)"; break;
            case "hour": sql = "call groupbytime_wmeter(1*60,?, ?, ?)"; break;
            case "day": sql = "call groupbytime_wmeter(1*60*24,?, ?, ?)"; break;
            case "week": sql = "call groupbytime_wmeter(24*60*7,?,?,?) "; break; 
            case "month": sql = "call groupbytime_wmeter(24*60*30,?,?,?)"; break; 
            case "year": sql = "call groupbytime_wmeter(24*60*365,?,?,?)"; break;
            }
            break;
    }
    return sql;
   }

   function returnInfor(ID, information){
      for(let i=0; i< information.length; i++){
        if(ID == information[i].id){
          return {
            name: information[i].name,
            frequency: information[i].frequency,
            status: information[i].status,
            // pow: information[i].powratio,
            // serimeter: information[i].meter
          }
        }
      }
   }



async function getdatamax(moment,arreq,from,to,eq,callback){
  console.log(moment,arreq,from,to)
  let data = [];
  let data1;
    for(let i = 0; i< arreq.length; i++){
      let sql = returnSqlQuery(arreq[i].TYPE,moment)
      accessDB(sql,[arreq[i].ID,from,to],function(result){
        if(result.length>0){
          switch(moment){
            case "raw": data1 = result; break;
            case "30minute":  data1 = result[0]; console.log('30minute'); break;
            case "hour":  data1 = result[0]; console.log('hour'); break;
            case "day": data1 = result[0];  console.log('day');break;
            case "week": data1 = result[0];console.log('week'); break;
            case "month": data1 = result[0];console.log('month'); break; 
            case "year": data1 = result[0];console.log('year'); break;
          }
          for(let j=0;j<data1.length;j++){
            data1[j].ID = arreq[i].ID;
            data1[j].TYPE = arreq[i].TYPE;
            data.push(data1[j]);
          }
        }
        if(i == (arreq.length - 1)){
          callback(data);
        }
      })
    }
}

function takeData(moment,EQi,from,to){
  let sql = returnSqlQuery(EQi.TYPE,moment);
  let data1;
  return new Promise (function(resolve){
    accessDB(sql,[EQi.ID,from,to],function(result){
      if(result.length > 0){
        switch(moment){
          case "raw": data1 = result; break;
          case "30minute":  data1 = result[0]; console.log('30minute'); break;
          case "hour":  data1 = result[0]; console.log('hour'); break;
          case "day": data1 = result[0];  console.log('day');break;
          case "week": data1 = result[0];console.log('week'); break;
          case "month": data1 = result[0];console.log('month'); break; 
          case "year": data1 = result[0];console.log('year'); break;
        }
        for(let j=0;j<data1.length;j++){
          data1[j].ID = EQi.ID;
          data1[j].TYPE = EQi.TYPE;
        }
        resolve(data1)
      }else{
        resolve([]);
      }
    })
  })  
}

async function pushdata(moment,arreq,from,to,eq){
  return arreq.map(async function(EQi){
      const result = await takeData(moment,EQi,from,to);
      return result;
  })
}












  function fullToShortType(name){
    switch(name){
      case "Wmeter": return "wt";
    }
  }

  function returnArrayEQ(type,arr){
    let x; let a =[];
    switch(type){
       case "wt":
        x = ["quanity","flowRate","pressure"];
         a =[];
        for(let i=0; i<x.length; i++){
          if(arr.indexOf(x[i]) > -1){
            a.push(x[i]);
          }
        }
        return a;
    }
  }

   async function exportData(to,from,NAME,para,usr,moment,eq,selectedEQ1,res){
     
     let arrEQ = [];
     let arrchange1 =[];
        let arrchange = selectedEQ1.split(",");
        for(let i = 0; i<arrchange.length; i++){
          // let y = arrchange[i].split("_");
          let a = {
            ID: arrchange[i],
            TYPE: fullToShortType("Wmeter")
          }
          // let a = "'"+x[0]+"'";
          arrEQ.push(a);
          arrchange1.push("'"+arrchange[i]+"'");
        }
        let selectedEQ = arrchange1.join();
        let arrPara1 = para.split(",");
        let arrPara;
        // let sql;
        // let leng = arrPara1.length;
        let workbook = new excel.Workbook(); //creating workbook
        accessDB("SELECT * FROM totaleq WHERE totaleq.id IN ("+selectedEQ+")",[],function(information){
          pushdata(moment,arrEQ,from,to,eq)
          .then(result => Promise.all(result))
          .then(async function(result){   
            // console.log(result[0][0].ID)
            let data = [];
            for(let i=0; i<arrEQ.length;i++){
              let datax = [];
              for(let j=0; j<result.length; j++){
                if(result[j].length >0){
                  if(result[j][0].ID == arrEQ[i].ID){
                    datax = result[j];
                  }
                }
              }
              let x = {
                ID: arrEQ[i].ID,
                TYPE: arrEQ[i].TYPE,
                data: datax
              };
              data.push(x);
            }
            for(let i=0; i<arrEQ.length; i++){
              let datasheet;
                datasheet = configDataWmeter(data[i].data)
              // console.log(datasheet);
              let id = data[i].ID;
              let a = returnInfor(id, information);
              let name = a.name, frequency = a.frequency, status = a.status;
              var jsonData = JSON.parse(JSON.stringify(datasheet));
              let heigh = jsonData.length;
              let worksheet = workbook.addWorksheet(id); //creating worksheet
              worksheet.views = [{
                showGridLines: false,
                wrapText: true 
              }];
              let columnName =["","STT","TIME"];
  
            arrPara = returnArrayEQ(arrEQ[i].TYPE,arrPara1)
            let leng = arrPara.length;
            for(let i=0; i< arrPara.length; i++){
              columnName.push(shortToFullName(arrPara[i]))
            }
            worksheet.getRow(10).values = columnName;
            let colum = [{width:5},{key:"STT", width:10},{key: 'TIME', width: 40}];
            for(let i=0; i<arrPara.length; i++){
              let a = {
                key: arrPara[i],
                width: 35
              }
              colum.push(a);
            }
            worksheet.columns = colum;
              for(let i=0;i<jsonData.length;i++){
                  jsonData[i].STT = i+1;
                  jsonData[i].TIME = toISO(jsonData[i].TIME).toString().slice(0,25);
                  jsonData[i].quanity =fixNum(jsonData[i].quanity)
                  jsonData[i].flowRate = fixNum(jsonData[i].flowRate)
                  jsonData[i].pressure = fixNum(jsonData[i].pressure)
  
                  // jsonData[i].PIN_STATUS = fixNum(jsonData[i].PIN_STATUS)
                }
                worksheet.addRows(jsonData);
          worksheet.mergeCells('C2', 'D2');
          worksheet.mergeCells('C3', 'D3');
          worksheet.mergeCells('C4', 'D4');
          worksheet.mergeCells('C5', 'D5');
          worksheet.mergeCells('C6', 'D6');
          worksheet.mergeCells('C7', 'D7');
          worksheet.mergeCells('C8', 'D8');
          for(let i=1; i<heigh+2;i++){
            for(let j=0; j<leng+3;j++){
              worksheet.getCell(numToLetter(j+1) + (i+9)).border = {
                bottom: {style:"dotted"},
                left : {style: "thin"}
              }
            }
          }
          if(leng > 2){
            worksheet.getCell('C2').value = " INDUSTRIAL";
            worksheet.getCell("C2").font ={name: 'Arial', size: 28, bold: true }
            worksheet.getCell('C3').value = " ID:";
            worksheet.getCell("C3").font ={name: 'Arial'}
            worksheet.getCell('E3').value = id;
            worksheet.getCell('C4').value = " Name:";
            worksheet.getCell("C4").font ={name: 'Arial'}
            worksheet.getCell('E4').value = name;
            worksheet.getCell('C5').value = " Frequency";
            worksheet.getCell("C5").font ={name: 'Arial'}
            worksheet.getCell('E5').value = frequency;
            worksheet.getCell('C6').value = " Status";
            worksheet.getCell("C6").font ={name: 'Arial' }
            worksheet.getCell('E6').value = status;
            // worksheet.getCell('C7').value = " Voltage tranformer Ratio:";
            // worksheet.getCell("C7").font ={name: 'Arial' }
            // worksheet.getCell('E7').value = volRatio;
            // worksheet.getCell("C7").font ={name: 'Arial' }
            // worksheet.getCell('C7').value = " Name: "+ a.name ;
            // worksheet.getCell("C7").font ={name: 'Arial' }
          }else{
            worksheet.getCell('C2').value = " INDUSTRIAL";
            worksheet.getCell("C2").font ={name: 'Arial', size: 28, bold: true }
            worksheet.getCell('C3').value = " ID:" + id;
            worksheet.getCell("C3").font ={name: 'Arial'}
            worksheet.getCell('C4').value = " Name: "+name;
            worksheet.getCell("C4").font ={name: 'Arial'}
            worksheet.getCell('C5').value = " Frequency: "+ frequency;
            worksheet.getCell("C5").font ={name: 'Arial'}
            worksheet.getCell('C6').value = " Status: "+ status;
            // worksheet.getCell("C6").font ={name: 'Arial' }
            // worksheet.getCell('C7').value = " Voltage tranformer Ratio: "+ volRatio ;
            // worksheet.getCell("C7").font ={name: 'Arial' }
            // worksheet.getCell('C7').value = " Name: "+ a.name ;
            // worksheet.getCell("C7").font ={name: 'Arial' }
          }
            worksheet.getRow(2).height = 35;
            worksheet.getRow(3).height = 22;
            for(let i=1; i<heigh+16; i++){
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
          worksheet.getCell("C9").value = "Time export: " + (new Date()).toLocaleString();
  
          for(let i=9; i<heigh+16; i++){
            worksheet.getRow(i+1).alignment ={horizontal: "center", wrapText : true}
            }
          
  
            }
            let filepath = NAME + (new Date()).getTime();
            await addlog(to,from,NAME,para,usr,moment,selectedEQ1,"./excelfile/"+filepath+".xlsx");
            // await workbook.xlsx.writeFile("./excelfile/"+filepath+".xlsx")
            res.setHeader('Content-Disposition', 'attachment; filename=' +NAME+ ".xlsx");
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
              await workbook.xlsx.write(res);
              res.end();
          })
          .catch(err => console.error(err))       
          
          
        //   getdatamax(moment,arrEQ,from,to,eq, async function(result){

            
        // })
      })
   }

   function addlog(to,from,name,para,usr,moment,selectedEQ,url){
 
     let timescale = from.toString() +","+to.toString();
   
     accessDB("INSERT INTO report_table (name,timeScale,moment,para,creatby,url,exportTime,selecteq) VALUES (?,?,?,?,?,?,?,?)",[name, timescale,moment,para,usr,url,new Date(),selectedEQ],function(result){

    })
   }

   module.exports = exportData;