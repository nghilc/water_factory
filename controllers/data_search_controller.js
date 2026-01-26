const { access_db, query } = require("../config/mysql_config");
function isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}

var pad = function(num) { return ('00'+num).slice(-2) };
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


const data_search_controller = {
    show_data_search: async (req,res) => {
        try{ 
            let danhsachtram = [];
                // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let MeterCode = null;
            let NodeCode = null;
            let meter_list = [];
            let parent_id = "all";
            let donvinguoidung_id = null;
            let donviquanly_id = null;
            // if(!(typeof req.query.donvinguoidung_id === "undefined" || typeof req.query.donvinguoidung_id === "undefined" || req.query.donvinguoidung_id === null || req.query.donvinguoidung_id === "null")){
            //     donvinguoidung_id = req.query.donvinguoidung_id;
            // }
            // if(!(typeof req.query.donviquanly_id === "undefined" || typeof req.query.donviquanly_id === "undefined" || req.query.donviquanly_id === null || req.query.donviquanly_id === "null")){
            //     donviquanly_id = req.query.donviquanly_id;
            // }
            // if(donvinguoidung_id != null && donvinguoidung_id != "null"){
            //     parent_id = "dvnd"+donvinguoidung_id;
            // }else{
            //     if(donviquanly_id != null && donviquanly_id != "null"){
            //         parent_id = "dvql"+donviquanly_id;
            //     }
            // }
            // nếu truyền vào MeterCode, NodeCode, Thiết bị truyền vào được phân quyền cho user này thì lấy MeterCode, NodeCode đó
            if(!(typeof req.query.MeterCode === "undefined" || typeof req.query.NodeCode === "undefined" || req.query.MeterCode === null || req.query.NodeCode === null || req.query.MeterCode === "null" || req.query.NodeCode === "null")){
                let check_meter = await access_db("SELECT * FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t1.MeterCode = ? AND t1.MeterCode = ? AND t3.user_id = ?;",[req.query.MeterCode,req.query.NodeCode,req.user.id]);
                if(check_meter.length > 0){
                    MeterCode = req.query.MeterCode;
                    NodeCode = req.query.NodeCode;
                    // if(donvinguoidung_id != null && donvinguoidung_id != "null"){
                    //     meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[donvinguoidung_id]);
                    // }else{
                    //     if(donviquanly_id != null && donviquanly_id != "null"){
                    //         meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[donviquanly_id]);
                    //     }else{
                    //         meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])
                    //     }
                    // }
                    if (req.cookies.tram_id && req.cookies.dv_type) {
                        parent_id = req.cookies.dv_type + req.cookies.tram_id;
                        let tram_id = req.cookies.tram_id;
                        let dv_type = req.cookies.dv_type;

                        if (dv_type == "dvql") {
                            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;", [tram_id])
                        } else {
                            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;", [tram_id])
                        }
                    } else {
                        // lấy tất cả các thiết bị được phân quyền
                        meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;", [req.user.id])

                    }
                }else{
                    // lấy tất cả các thiết bị được phân quyền
                    meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])
                    if(meter_list.length > 0){
                        MeterCode = meter_list[0].MeterCode;
                        NodeCode = meter_list[0].NodeCode;
                    }
                }
            }else{
                if(req.cookies.tram_id && req.cookies.dv_type){
                    parent_id = req.cookies.dv_type + req.cookies.tram_id;
                    let tram_id = req.cookies.tram_id;
                    let dv_type = req.cookies.dv_type;

                    if(dv_type == "dvql"){
                        meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[tram_id])
                    }else{
                        meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[tram_id])
                    }                
                }else{
                // lấy tất cả các thiết bị được phân quyền
                meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])

                }
                if(meter_list.length > 0){
                    MeterCode = meter_list[0].MeterCode;
                    NodeCode = meter_list[0].NodeCode;
                }

            }
            let data_field_config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };
            let data = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(data.length > 0){
                data_field_config = JSON.parse(data[0].config)
            }
            if (data_field_config.hasOwnProperty("OP")) {
                delete data["OP"];
            }
            res.render('layouts/data_search',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                parent_id,
                role: req.user.role,
                meter_list,
                full_name: req.user.name,
                current_path: "/data_search",
                danhsachtram: danhsachtram,
                MeterCode,
                NodeCode,
                data_field_config: data_field_config,
                t: req.__ 
            })
        }catch(error){
            console.error('API data search error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_meter_data: async (req,res) => {
        try{
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let start_date = req.query.start_date;
            let end_date = req.query.end_date;
            let data_search_moment = req.query.DATA_SEARCH_MOMENT;
            //let data = await access_db("SELECT t1.*, t2.unit_pin FROM Operation t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.NodeCode = ? AND t1.MeterCode = ? AND t1.MeterTime >= ? AND t1.MeterTime <= ? ORDER BY t1.MeterTime ASC;",[NodeCode, MeterCode, start_date, end_date]);
            let data = [];
            switch(data_search_moment){
                case "hour":
                    data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime";`,[NodeCode, MeterCode, start_date, end_date]);
                    break;
                case "day":
                    data = await query(`SELECT * FROM "daily_meter_usage" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime";`,[NodeCode, MeterCode, returnSQLDateFormatDayStart(start_date), returnSQLDateFormatDayEnd(end_date)]);
                    break;
                case "month":
                    data = await query(`SELECT * FROM "monthly_meter_usage" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime";`,[NodeCode, MeterCode, returnSQLDateFormatMonthStart(start_date), returnSQLDateFormatMonthEnd(end_date)]);
                    break;
                default: 
                    data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime";`,[NodeCode, MeterCode, start_date, end_date]);
                    break;
            }
            res.json({
                data
            })
        }catch(error){
            console.error('API data search error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_child_meter: async (req,res) => {
        try{
            let tram_id = req.query.tram_id;
            let dv_type = req.query.dv_type;

            if(dv_type =="all"){
                res.clearCookie('tram_id');
                res.clearCookie('dv_type');
            }else{
                res.cookie("tram_id", tram_id, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    // httpOnly: true,
                    // secure: true,
                });
                res.cookie("dv_type", dv_type, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    // httpOnly: true,
                    // secure: true,
                })
            }
            let meter_list = [];
            // if(dv_type == "dvql"){
            //     meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[tram_id])
            // }else{
            //     meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[tram_id])
            // }
            if(dv_type == "all"){
                meter_list = await access_db(`SELECT t4.* FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? ORDER BY t4.name;`,[req.user.id]);
            }else if(dv_type == "dvql"){
                // meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t2.org_id = ? ORDER BY t1.name;",[tram_id])
                meter_list = await access_db(`SELECT t4.* FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND t1.org_id = ? ORDER BY t4.name;`,[req.user.id, tram_id]);
            }else{
                meter_list = await access_db(`SELECT t4.* FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id INNER JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND t3.org_id = ? ORDER BY t4.name;`,[req.user.id, tram_id])
            }
            res.json({
                meter_list
            })
        }catch(error){
            console.error('API data search error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_field: async (req,res) => {
        try{
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let data = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;", [MeterCode, NodeCode]);
            let data_field_config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };
            if(data.length > 0){
                data_field_config = JSON.parse(data[0].config)
            }
            if (data_field_config.hasOwnProperty("OP")) {
                delete data["OP"];
            }
            res.json({
                data_field_config
            })
        }catch(error){
            console.error('API data search error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data search error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data search error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = data_search_controller;