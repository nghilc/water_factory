var excel = require('exceljs');
var accessDB = require('./mysql-config');

function returnDateFormat(x){
    return x.getDate() + "/" + (x.getMonth() + 1) +"/"+ x.getFullYear();
}




function creatSheet1(res,EQ,to,from,name,workbook,result,callback){
    let worksheet = workbook.addWorksheet("source"); //creating worksheet
    worksheet.columns = [
        {header: "ID", key: "id",width:30},
        {header: "SiteName", key: "site",width:15},
        {header: "SerialNumber", key: "serial",width:15},
        {header: "Name", key: "name",width:15},
        {header: "EanNumber", key: "ean",width:15},
        {header: "MeterNumber", key: "meter",width:15},
        {header: "EnergyType" , key: "sourceType",width:15},
        {header: "EnergyUsage", key: "energyUsage",width:15},
        {header: "SourceId", key: "",width:15},
        {header: "SiteId", key: "",width:15},
        {header: "Description", key: "decript",width:15},
        {header: "Tags", key: "tag",width:15},
        {header: "TYPE", key: "type_pro",width:15},
        {header: "PURPOSE", key: "purpose",width:15},
        {header: "SERIAL NUMBER", key: "serial",width:15},
        {header: "POWER RATIO", key: "powratio",width:15},
        {header: "VOLTAGE TRANSFORMER RATIO", key: "volRatio",width:15},
        {header: "CURRENT TRANSFORMER RATIO", key: "curratio",width:15},
        {header: "GRID", key: "grid",width:15},
        {header: "ZONE", key: "timezone",width:15},
        {header: "CABINET", key: "cabinet",width:15},
        {header: "REGISTERED CAPACITY", key: "",width:15},
      ];
      worksheet.addRows(result);
      callback(res,EQ,to,from,name,workbook,result);
}

function creatSheet2(res,EQ,to,from,name,workbook,result,callback){
    let worksheet2 = workbook.addWorksheet("Sites"); //creating worksheet
    worksheet2.columns = [
        {header: "Name", key: "name",width:30},
        {header: "Address", key: "",width:15},
        {header: "PostalCode", key: "",width:15},
        {header: "City", key: "",width:15},
        {header: "Country", key: "",width:15},
        {header: "SiteType", key: "",width:15},
        {header: "SiteId" , key: "",width:15},
        {header: "Latitude", key: "",width:15},
        {header: "Longitude", key: "",width:15},
        {header: "Ratio", key: "",width:15},
        {header: "Voltage Transformer Ratio", key: "volRatio",width:15},
        {header: "Current Transformer Ratio", key: "curratio",width:15},
        {header: "COMPANY NAME (EN)", key: "",width:15},
        {header: "COMPANY NAME (VN)", key: "",width:15},
        {header: "NAVISION CODE", key: "",width:15},
        {header: "BusinessKey", key: "",width:15},
      ];
      worksheet2.addRows(result);
      callback(res,EQ,name,to,from,workbook);
}

async function pushdata(EQ,from,to){
    // from += 7*3600000;
    // to += 7*3600000;
    return EQ.map(async function(EQi){
        const DATA = await getdata(EQi,from,to);
        // console.log(EQi,DATA)
        return DATA;
    })
}

function getdata(EQi,from,to){
    return new Promise (function(resolve){
        accessDB(return_TYPE_SQL(EQi.TYPE),[EQi.ID,from,to],function(result1){
            // console.log(result1)
            if(result1.length > 0){
                let data ={
                    ID: EQi.ID,
                    TOTAL: ""
                };
                let startDate2 = from;
                let endDate2 = to;
                while(startDate2 < endDate2){
                    // let date = new Date(startDate2).toLocaleDateString();
                    let date = returnDateFormat(new Date(startDate2))
                    startDate2 += 1000*60*60*24
                    data[date] = 1;
                }
                for(let o =0; o<result1.length - 1;o++){
                    let t1 = Number(result1[o].TIME);
                    let t2 = Number(result1[o+1].TIME);
                    if(t2-t1 > 1.49*1000*3600){
                        while(t2 > t1){
                            t1 += 24*1000*3600;
                            // let y = new Date(t1).toLocaleDateString();
                            let y = returnDateFormat(new Date(t1))
                            if(data[y] == null || data[y] == undefined) continue;
                            data[y] = 0;
                            
                        }
                    }
                }
                // console.log(data);
                resolve(data)
            }else{
                resolve({
                    ID: EQi.ID,
                    TOTAL: ""});
            }
        })
    })
    

}



function creatSheet3(res,EQ,name,to,from,workbook){
    let worksheet3 = workbook.addWorksheet("quality");
    let columns3Name = ["ID","GRAND TOTAL"];
    let columns3 = [{key:"ID", width:30},{key: 'TOTAL', width: 30}]
    let startDate = from;
    let endDate = to;
    while(startDate < endDate){
        // let date = new Date(startDate).toLocaleDateString();
        let date = returnDateFormat(new Date(startDate));
        columns3Name.push(date);
        startDate += 1000*60*60*24
        columns3.push({
            key: date,
            width: 10
        })
    }
   worksheet3.getRow(1).values = columns3Name
   worksheet3.columns = columns3;
//    console.log(columns3);
   pushdata(EQ,from,to)
   .then(DATA => Promise.all(DATA))
   .then(async function(DATA){
    worksheet3.addRows(DATA);
    res.setHeader('Content-Disposition', 'attachment; filename=' + name+".xlsx");
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
   }

   )
   .catch(err => console.error(err))
}

function creatSheet4(res,EQ,to,from,name,workbook,result,callback){
    let worksheet4 = workbook.addWorksheet("Warning");
    let columns4Name = ["id"];
    let columns4 = [{key:"id", width:30}]
    let startDate4 = from;
    let endDate4 = to;
    while(startDate4 < endDate4){
        // let date = new Date(startDate4).toLocaleDateString();
        let date = returnDateFormat(new Date(startDate4))
        columns4Name.push(date);
        startDate4 += 1000*60*60*24
        columns4.push({
            key: date,
            width: 10
        })
    }
    worksheet4.getRow(1).values = columns4Name;
    worksheet4.columns = columns4;
    let DATA =[];
    let FR = new Date(Number(from));
    let TO = new Date(Number(to));
 
    accessDB("SELECT * FROM alert_data WHERE created_at BETWEEN ? AND ?",[FR,TO],function(result1){
        for(let i=0; i<EQ.length;i++){
            let data = {}
            data["id"] = EQ[i].ID;
            let startDate = from;
            let endDate = to;
            while(startDate < endDate){
                // let date = new Date(startDate).toLocaleDateString();
                let date = returnDateFormat(new Date(startDate))
                startDate += 1000*60*60*24
                data[date] = "";
            }
            for(let j=0;j<result1.length;j++){
                if(result1[j].ideq == data["id"]){
                    // let a = new Date(result1[j].created_at).toLocaleDateString();
                    let a = returnDateFormat(new Date(result1[j].created_at))
                    if(data[a] == null || data[a] == undefined) continue;
                    data[a] += pushPara(data[a],result1[j].para);
                }
            }
            DATA.push(data);
        }
        worksheet4.addRows(DATA);
        callback(res,EQ,to,from,name,workbook,result);
    })

    // callback(res,EQ,to,from,name,workbook,result)
}

function pushPara(val,valPush){
    // let x = val.includes(valPush);
    if(val.includes(valPush)){
        return "";
    }else return valPush+",";
}

async function exportData(to,from,name,usr,selectedEQ,res){
    from = Number(from);
    to = Number(to)
    // console.log("success",to,from,name,usr,selectedEQ)
    let EQ = [], eqSQL = [];
    let x = selectedEQ.split(",");
    for(let i=0; i< x.length; i++){
        // let p = x[i].split("_");
        let a = {
            ID: x[i],
            TYPE: "Wmeter"
        }
        EQ.push(a);
        eqSQL.push("'"+a.ID+"'");
    }
    let listEQ = eqSQL.join();
    let sql = "SELECT * FROM totaleq WHERE id IN ("+listEQ+")";
    // console.log(EQ)
    accessDB(sql,[],async function(result){
        // console.log(result);
        let workbook = new excel.Workbook(); //creating workbook
        creatSheet4(res,EQ,to,from,name,workbook,result,function(res,EQ,to,from,name,workbook,result){
            creatSheet1(res,EQ,to,from,name,workbook,result,function(res,EQ,to,from,name,workbook,result){
                creatSheet2(res,EQ,to,from,name,workbook,result,function(res,EQ,name,to,from,workbook){
                    creatSheet3(res,EQ,name,to,from,workbook)
                })
            })
        })
    })
}

function return_TYPE_SQL(type){
    switch(type){
        case "Wmeter": return "SELECT * FROM wmeterdata WHERE ID = ? AND TIME > ? AND TIME < ?"
        // case "Emeter": return "SELECT * FROM emeterdata WHERE ID = ? AND TIME > ? AND TIME < ? AND ImRea IS NOT NULL"
        // case "Temper-Humidity": return "SELECT * FROM temphumidata WHERE ID = ? AND TIME_INSERT > ? AND TIME_INSERT < ?"
    }
}


module.exports = exportData;