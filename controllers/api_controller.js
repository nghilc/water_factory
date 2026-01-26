const {access_db, query} = require("../config/mysql_config");
var bcrypt = require('bcrypt');
var saltRounds = 10;
const jwt = require('jsonwebtoken');
const  TOKEN_SECRET = "mySecret";
const REFESH_TOKEN = "refreshMySecret"

function shortToFullName(name){     // Trả về tên đầy đủ
        switch(name){
            case "ValOfNum":
              return "chiSo";
            case "terminal_index":
              return "sanLuong";
            case "flowRate":
              return "luuLuong";
            case "pressure":
              return "apSuat";
            case "measure_sensor":
              return "mucNuocDoDuoc"
            case "measure_static":
              return "mucNuocTinh";
            case "measure_dynamic":
              return "mucNuocDong";
            case "measure_delta":
              return "hieuSoMucNuoc";
            case "ValueReverse":
              return "sanLuongNguoc";
            case "Voltage":
              return "dienApPin";
            case "voltage_ac_quy":
              return "dienApAcQuy";
            case "PressureVol":
              return "dienAp";
            case "Temp":
              return "nhietDo";
            default:
              return name;
          }
}


function return_last_data(key){
    switch(key){
      case "terminal_index": return "last_terminal_index";
      case "flowRate": return "last_flow_rate"
      case "ValOfNum": return "last_ValOfNum"
      case "measure_sensor": return "last_measure_sensor"
      case "ValueReverse": return "last_ValueReverse"
      case "measure_delta": return "last_measure_delta"
      case "measure_static": return "last_measure_static"
      case "measure_dynamic": return "last_measure_dynamic"
      case "pressure": return "last_pressure"
      case "Voltage": return "last_voltage_pin"
      case "PressureVol": return "last_PressureVol"
      case "voltage_ac_quy": return "last_voltage_ac_quy"
      case "ValOfNum": return "last_ValOfNum"
      case "Temp": return "last_Temp"

      default: return "last_" + key
    }
  }

  function show_if_2550_pressure(x){
    if (x === null || x === "" || x === undefined || isNaN(Number(x))) {
        return null;
    }
  
    const num = Number(x);
    // const rounded = Math.round(num * 1000) / 1000;
    if(num == 2550){
      return 'NaN';
    }else{
      return  num;
    }
  }

  function show_if_null(x){
    if (x === null || x === "" || x === undefined || isNaN(Number(x))) {
      return null;
    }
    // Ép x thành số và làm tròn tối đa 3 chữ số thập phân
    const num = Number(x);
    const rounded = Math.round(num * 1000) / 1000;

    // Format số với dấu phẩy cho phần nghìn, dấu chấm cho thập phân
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  }

  function show_if_null_text(x){
    if(x === "" || x === null) 
      return null;
    return x;
    }

    function show_if_null_pin(x, unit){
        if(unit == '%'){
          return show_if_null_0(x)
        }else{
          return show_if_null(x)
        }
    }


    function show_if_null_0(x){
        if (x === null || x === "" || x === undefined || isNaN(Number(x))) {
          return null;
        }
        // Ép x thành số và làm tròn tối đa 3 chữ số thập phân
        const num = Number(x);
        const rounded = Math.round(num * 1000) / 1000;
        // Kiểm tra có phần thập phân không
        const hasDecimal = !Number.isInteger(rounded);
        // Format số với dấu phẩy cho phần nghìn, dấu chấm cho thập phân
        return rounded.toLocaleString('en-US', {
          minimumFractionDigits: hasDecimal ? 1 : 0,
          maximumFractionDigits: 3
        });
      }

      function returnUnit(field, unit){  //trả về đơn bị vs đầu vào là biến 
        switch(field){
          case "pressure":
            if(unit !== undefined && unit !== null){
              return unit
            }
            return null;
          case "PressureVol":
            if(unit !== undefined && unit !== null){
              return unit
            }
            return null;
          case "quanity":
            return "m³";
          case "flowRate":
            return "m³/h";
          case "terminal_index":
            return "m³";
          case "ValueForward":
            return "m³";
          case "ValueReverse":
            return "m³";
          case "Temp":
            return "℃"
          case "Voltage":
            if(unit !== undefined && unit !== null){
              return unit
            }
            return null;
          case "voltage_ac_quy":
            return "V";
          case "measure_delta":
            if(unit !== undefined && unit !== null){
              return return_measure_unit(unit)
            }
            return null;
          case "measure_static":
            if(unit !== undefined && unit !== null){
              return return_measure_unit(unit)
          }
          return null;
          case "measure_dynamic":
            if(unit !== undefined && unit !== null){
              return return_measure_unit(unit)
          }
          return null;
          case "measure_sensor":
            if(unit !== undefined && unit !== null){
              return return_measure_unit(unit)
            }
            return null;
          default:
            return null;
        }
      }

      function return_measure_unit(x){
        switch(Number(x)){
          case 0: return null;
          case 1: return "cm";
          case 2: return "mm";
          case 3: return "Mpa";
          case 4: return "Pa";
          case 5: return "kPa";
          case 6: return "MA";
          case 7: return "m";
          default: return "m";
      
        }
      }

var pad = function(num) { return ('00'+num).slice(-2) };

function returnSQLDateFormat(dateObj){
    if(dateObj == "" || dateObj == null) return null;
    let date = new Date(dateObj);
    let x = date.getFullYear()         + '-' +
    pad(date.getMonth() + 1)  + '-' +
    pad(date.getDate())       + ' ' +
    pad(date.getHours())      + ':' +
    pad(date.getMinutes())    + ':' +
    pad(date.getSeconds());
    return x;
  }

  
function returnSQLDateFormatDayStart(dateObj){
  let date = new Date(dateObj);
  let x = date.getFullYear()         + '-' +
  pad(date.getMonth() + 1)  + '-' +
  pad(date.getDate())       + ' ' + "00:00:00"
  return x;
}

function returnSQLDateFormatDayEnd(dateObj){
  let date = new Date(dateObj);
  let x = date.getFullYear()         + '-' +
  pad(date.getMonth() + 1)  + '-' +
  pad(date.getDate())       + ' ' + "23:59:59"
  return x;
}

function returnSQLDateFormatMonthStart(dateObj){
    let date = new Date(dateObj);
    let x = date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(1) + ' 00:00:00'; // đảm bảo '01' được format chuẩn
  
    return x;
  }
  
  function returnSQLDateFormatMonthEnd(dateObj){
    let date = new Date(dateObj);
    let year = date.getFullYear();
    let month = date.getMonth();
  
    // Ngày 0 của tháng kế tiếp = ngày cuối tháng hiện tại
    let lastDay = new Date(year, month + 1, 0);
  
    return lastDay.getFullYear() + '-' +
           pad(lastDay.getMonth() + 1) + '-' +
           pad(lastDay.getDate()) + ' 23:59:59';
  }


  const api_controller = {
    login: async (req,res) => {
        try{
            let user = req.body.userName;
            let pass = req.body.password; 
            let result = await access_db("SELECT * FROM users WHERE user_name = ? AND status = ?;",[user,1]);
            // access_db("SELECT * FROM account WHERE usr = ? AND status = ?",[user,1], function(result){
              if(result.length > 0){
                if(bcrypt.compareSync(pass, result[0].password)){
                  var token = jwt.sign({ userId: result[0].id }, TOKEN_SECRET, {
                    expiresIn: '24h',
                    });
                  var refreshToken = jwt.sign({userId: result[0].id},REFESH_TOKEN,{expiresIn: '7d'});
                  req.userId = refreshToken.userId;
                    // res.cookie('jwt',refreshToken,{
                    //   maxAge: 7*24*60*60*1000
                    // })
                    res.status(200).json({ 
                      'token':token,
                      'refreshToken': refreshToken 
                    });
                    res.end()
                }else{
                  return res.status(401).json({ error: 'Authentication failed' });
                }
              }else{
                return res.status(401).json({ error: 'Authentication failed' });
              }
            // })
        }catch(error){
            console.error('API error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    refreshToken: (req,res) => {
        try{
            const refeshTokenDecoded = jwt.verify(req.body.refreshToken,REFESH_TOKEN);
            req.userId = refeshTokenDecoded.userId;
            var new_token = jwt.sign({userId: req.userId},TOKEN_SECRET,{expiresIn: '24h'});
            // console.log(new_token);
      
            res.status(200).json({ 
              'token':new_token,
              // 'refreshToken': refreshToken 
            });
        }catch(error){
            console.error('API error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Invalid refresh token' 
              });
        }
    },
    getMeasurementWaterMeter: async (req,res) => {
        try{
            let user_id = req.userId;
            let result;
            if(req.query.maThietBi){
              result = await access_db(`SELECT t4.*, t5.lat, t5.lng, t5.meter_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t1.MeterCode = ? AND t3.user_id = ?;`, [req.query.maThietBi, user_id]);
            }else{
              result = await access_db(`SELECT t4.*, t5.lat, t5.lng, t5.meter_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ?;`,[user_id]);
            }

            let data = [];
            for(let i=0; i<result.length; i++){
                let x = {
                    tenTram: result[i].name,
                    loaiThietBi: null,
                    maThietBi: result[i].MeterCode,
                    trangThai: (result[i].status == 0) ? "DISCONNECTED" : "CONNECTING",
                    viTri: {
                      lat: result[i].lat,
                      lng: result[i].lng
                    },        
                    // thoiDiemDuLieuGanNhat: result[i].last_data_time,
                    duLieuGanNhat: {}
                }
              x.duLieuGanNhat.thoiDiem = returnSQLDateFormat(result[i].last_data_time);

              switch (result[i].meter_type){
                case "MUCNUOC":
                  x.loaiThietBi = "Đo mực nước";
                  x.duLieuGanNhat.mucNuocHienTai = result[i].last_measure_sensor;
                  x.duLieuGanNhat.mucNuocHienTaiDonVi = result[i].last_unit;
                  x.duLieuGanNhat.mucNuocDong = result[i].last_measure_dynamic;
                  x.duLieuGanNhat.mucNuocDongDonVi = result[i].last_unit;
                  x.duLieuGanNhat.dungTich = null;
                  x.duLieuGanNhat.dungTichDonVi = null;
                  break;
                case "DONGHO":
                  x.loaiThietBi = "Đo lưu lượng";
                  x.duLieuGanNhat.luuLuong = result[i].last_flow_rate;
                  x.duLieuGanNhat.luuLuongDonVi = "m³/h";
                  x.duLieuGanNhat.apLuc = result[i].last_pressure != 2550 ? result[i].last_pressure : null;
                  x.duLieuGanNhat.apLucDonVi = "bar";
                  x.duLieuGanNhat.nhietDo = null;
                  x.duLieuGanNhat.nhietDoDonVi = null;
                  break;
                  case "CSMT":
                  x.loaiThietBi = "Đo chỉ số môi trường";
                  x.duLieuGanNhat.nhietDo = result[i].last_Temp;
                  x.duLieuGanNhat.nhietDoDonVi = "°C";

                  x.duLieuGanNhat.pH = result[i].last_PH;

                  x.duLieuGanNhat.doDuc = result[i].last_DoDuc;
                  x.duLieuGanNhat.doDucDonVi = "NTU";

                  x.duLieuGanNhat.doMan = result[i].last_DoManPer;
                  x.duLieuGanNhat.doManDonVi = "%";

                  x.duLieuGanNhat.doCung = null;
                  x.duLieuGanNhat.doCungDonVi = "mg/l";

                  x.duLieuGanNhat.cloDu = result[i].last_CloDu;
                  x.duLieuGanNhat.cloDuDonvi = "mg/l";

                  x.duLieuGanNhat.EC = result[i].last_EC;
                  x.duLieuGanNhat.ECDonVi = "uS/cm";
                break;
                case "GENERATOR":
                  x.loaiThietBi = "Đo máy phát điện";
                  x.duLieuGanNhat.V_A2_v = result[i].V_A2_v;
                  x.duLieuGanNhat.V_A2_u = result[i].V_A2_u;

                  x.duLieuGanNhat.V_B2_v = result[i].V_B2_v;
                  x.duLieuGanNhat.V_B2_u = result[i].V_B2_u;

                  x.duLieuGanNhat.V_C2_v = result[i].V_C2_v;
                  x.duLieuGanNhat.V_C2_u = result[i].V_C2_u;
                  
                  x.duLieuGanNhat.V_AB2_v = result[i].V_AB2_v;
                  x.duLieuGanNhat.V_AB2_u = result[i].V_AB2_u;

                  x.duLieuGanNhat.V_BC2_v = result[i].V_BC2_v;
                  x.duLieuGanNhat.V_BC2_u = result[i].V_BC2_u;

                  x.duLieuGanNhat.V_CA2_v = result[i].V_CA2_v;
                  x.duLieuGanNhat.V_CA2_u = result[i].V_CA2_u;

                  x.duLieuGanNhat.Freq2_v = result[i].Freq2_v;
                  x.duLieuGanNhat.Freq2_u = result[i].Freq2_u;

                  x.duLieuGanNhat.V_A_v = result[i].V_A_v;
                  x.duLieuGanNhat.V_A_u = result[i].V_A_u;

                  x.duLieuGanNhat.V_B_v = result[i].V_B_v;
                  x.duLieuGanNhat.V_B_u = result[i].V_B_u;

                  x.duLieuGanNhat.V_C_v = result[i].V_C_v;
                  x.duLieuGanNhat.V_C_u = result[i].V_C_u;

                  x.duLieuGanNhat.I_A_v = result[i].I_A_v;
                  x.duLieuGanNhat.I_A_u = result[i].I_A_u;

                  x.duLieuGanNhat.I_B_v = result[i].I_B_v;
                  x.duLieuGanNhat.I_B_u = result[i].I_B_u;

                  x.duLieuGanNhat.I_C_v = result[i].I_C_v;
                  x.duLieuGanNhat.I_C_u = result[i].I_C_u;

                  x.duLieuGanNhat.Freq_v = result[i].Freq_v;
                  x.duLieuGanNhat.Freq_u = result[i].Freq_u;

                  x.duLieuGanNhat.I_N_v = result[i].I_N_v;
                  x.duLieuGanNhat.I_N_u = result[i].I_N_u;

                  x.duLieuGanNhat.PF_T_v = result[i].PF_T_v;
                  x.duLieuGanNhat.PF_T_u = result[i].PF_T_u;

                  x.duLieuGanNhat.A_Inst_T_v = result[i].A_Inst_T_v;
                  x.duLieuGanNhat.A_Inst_T_u = result[i].A_Inst_T_u;
                  
                  x.duLieuGanNhat.Q_Inst_T_v = result[i].Q_Inst_T_v;
                  x.duLieuGanNhat.Q_Inst_T_u = result[i].Q_Inst_T_u;

                  x.duLieuGanNhat.S_Inst_T_v = result[i].S_Inst_T_v;
                  x.duLieuGanNhat.S_Inst_T_u = result[i].S_Inst_T_u;

                  x.duLieuGanNhat.V_AB_v = result[i].V_AB_v;
                  x.duLieuGanNhat.V_AB_u = result[i].V_AB_u;

                  x.duLieuGanNhat.V_BC_v = result[i].V_BC_v;
                  x.duLieuGanNhat.V_BC_u = result[i].V_BC_u;

                  x.duLieuGanNhat.V_CA_v = result[i].V_CA_v;
                  x.duLieuGanNhat.V_CA_u = result[i].V_CA_u;

                  // x.duLieuGanNhat.Speed_v = result[i].Speed_v;
                  // x.duLieuGanNhat.Speed_u = result[i].Speed_v;

                  // x.duLieuGanNhat.V_Bat_v = result[i].V_Bat_v;
                  // x.duLieuGanNhat.V_Bat_u = result[i].V_Bat_u;

                  // x.duLieuGanNhat.Tem_W_v = result[i].Tem_W_v;
                  // x.duLieuGanNhat.Tem_W_u = result[i].Tem_W_u;

                  // x.duLieuGanNhat.P_Oil_v = result[i].P_Oil_v;
                  // x.duLieuGanNhat.P_Oil_u = result[i].P_Oil_u;
                  break;

              }
              data.push(x);
            }
            res.json({data})
        }catch(error){
            console.error('API error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    getOperationWaterMeter: async (req,res) => {
        try{
            let MeterCode = req.query.maThietBi;
            let NodeCode = req.query.maThietBi;
            let start_date = req.query.startDate;
            let end_date = req.query.endDate;
            let user_id = req.userId;
            // console.log(req.query)
            if(!req.query.maThietBi || !req.query.startDate || !req.query.endDate){
                return res.status(400).json({
                    success: false,
                    message: "Thiếu trường dữ liệu maThietBi hoặc startDate hoặc endDate"
                })
            }
          let check_meter = await access_db(`SELECT t4.*, t5.lat, t5.lng, t5.meter_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t1.MeterCode = ? AND t3.user_id = ?;`, [MeterCode, user_id]);
            if(check_meter.length > 0){
                let data = [];
                let result = [];
                let meter_type = check_meter[0].meter_type;
                switch(meter_type){
                  case "MUCNUOC":
                    result = await query(`SELECT "MeterTime", "measure_sensor", "measure_dynamic" FROM "Operation" WHERE "MeterCode" = $1 AND "MeterTime" >= $2 AND "MeterTime" <= $3 ORDER BY "MeterTime"`, [MeterCode, start_date, end_date]);
                    for (let i = 0; i < result.length; i++) {
                      let x = {
                        maThietBi: MeterCode,
                        thoiDiem: returnSQLDateFormat(result[i].MeterTime),
                        mucNuocHienTai: result[i].measure_sensor,
                        mucNuocHienTaiDonVi: check_meter[0].last_unit,
                        mucNuocDong: result[i].measure_dynamic,
                        mucNuocDongDonVi: check_meter[0].last_unit,
                        dungTich: null,
                        dungTichDonVi: null
                      };
                      data.push(x)
                  }
                    break;
                    case "DONGHO":
                    result = await query(`SELECT "MeterTime", "flowRate", "pressure" FROM "Operation" WHERE "MeterCode" = $1 AND "MeterTime" >= $2 AND "MeterTime" <= $3 ORDER BY "MeterTime"`, [MeterCode, start_date, end_date]);

                    for (let i = 0; i < result.length; i++) {
                      let x = {
                        maThietBi: MeterCode,
                        thoiDiem: returnSQLDateFormat(result[i].MeterTime),
                        luuLuong: result[i].flowRate,
                        luuLuongDonVi: "m³/h",
                        apLuc: result[i].pressure != 2550 ? result[i].pressure : null,
                        apLucDonVi: "bar",
                        nhietDo: null,
                        nhietDoDonVi: null
                      };
                      data.push(x)
                    }
                      break;
                      case "CSMT":
                    result = await access_db("SELECT * FROM web_environment.Operation WHERE MeterCode = ?	AND MeterTime >= ? AND MeterTime <= ? ORDER BY MeterTime", [MeterCode, start_date, end_date]);

                    for (let i = 0; i < result.length; i++) {
                      let x = {
                        maThietBi: MeterCode,
                        thoiDiem: returnSQLDateFormat(result[i].MeterTime),
                        nhietDo: result[i].Temp,
                        nhietDoDonVi: "°C",
                        pH: result[i].PH,
                        doDuc: result[i].DoDuc,
                        doDucDonVi: "NTU",
                        doMan: result[i].DoManPer,
                        doManDonVi: "%",
                        doCung: null,
                        doCungDonVi: "mg/l",
                        cloDu: result[i].CloDu,
                        cloDuDonvi: "mg/l",
                        EC: result[i].EC,
                        ECDonVi: "uS/cm"
                      };
                      data.push(x)
                    }

  
                    break;
                    case "GENERATOR":
                    result = await access_db("SELECT * FROM operations WHERE meter_serial = ? AND server_time >= ? AND server_time <= ? ORDER BY server_time DESC;", [MeterCode, start_date, end_date]);

                    for (let i = 0; i < result.length; i++) {
                      let x = {
                        maThietBi: MeterCode,
                        thoiDiemCT: returnSQLDateFormat(result[i].meter_time),
                        thoiDiemHT: returnSQLDateFormat(result[i].server_time),
                        V_A2_v : result[i].V_A2_v,
                        V_A2_u : result[i].V_A2_u,
                        V_B2_v : result[i].V_B2_v,
                        V_B2_u :result[i].V_B2_u,
                        V_C2_v : result[i].V_C2_v,
                        V_C2_u : result[i].V_C2_u,
                        V_AB2_v :result[i].V_AB2_v,
                        V_AB2_u :result[i].V_AB2_u,
                        V_BC2_v : result[i].V_BC2_v,
                        V_BC2_u : result[i].V_BC2_u,
                        V_CA2_v : result[i].V_CA2_v,
                        V_CA2_u : result[i].V_CA2_u,
                        Freq2_v : result[i].Freq2_v,
                        Freq2_u : result[i].Freq2_u,
                        V_A_v : result[i].V_A_v,
                        V_A_u : result[i].V_A_u,
                        V_B_v : result[i].V_B_v,
                        V_B_u :result[i].V_B_u,
                        V_C_v :result[i].V_C_v,
                        V_C_u :result[i].V_C_u,
                        I_A_v :result[i].I_A_v,
                        I_A_u : result[i].I_A_u,
                        I_B_v : result[i].I_B_v,
                        I_B_u : result[i].I_B_u,
                        I_C_v : result[i].I_C_v,
                        I_C_u : result[i].I_C_u,
                        Freq_v : result[i].Freq_v,
                        Freq_u : result[i].Freq_u,
                        I_N_v :result[i].I_N_v,
                        I_N_u : result[i].I_N_u,
                        PF_T_v : result[i].PF_T_v,
                        PF_T_u :result[i].PF_T_u,
                        A_Inst_T_v : result[i].A_Inst_T_v,
                        A_Inst_T_u : result[i].A_Inst_T_u,
                        Q_Inst_T_v : result[i].Q_Inst_T_v,
                        Q_Inst_T_u : result[i].Q_Inst_T_u,
                        S_Inst_T_v : result[i].S_Inst_T_v,
                        S_Inst_T_u : result[i].S_Inst_T_u,
                        V_AB_v : result[i].V_AB_v,
                        V_AB_u : result[i].V_AB_u,
                        V_BC_v : result[i].V_BC_v,
                        V_BC_u : result[i].V_BC_u,
                        V_CA_v : result[i].V_CA_v,
                        V_CA_u : result[i].V_CA_u
                      };
                      data.push(x)
                    }

                      break;
                }
                // console.log(result)

                res.json({
                    data
                })
            }else{
                return res.status(403).json({ 
                    success: false,
                    message: "Bạn không được truy cập thông tin thiết bị này"
                 });
            }

        }catch(error){
            console.error('API error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
                // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
  }


  module.exports = api_controller;