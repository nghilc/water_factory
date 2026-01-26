const {access_db, query} = require("../config/mysql_config");
function isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}
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

const alert_controller = {
    show_alert: async (req,res) => {
        try{ 
            // lấy danh sách các trạm
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let MeterCode = "all";
            let NodeCode = "all";
            let meter_list = [];
            let parent_id = "all";
            let donvinguoidung_id = null;
            let donviquanly_id = null;
            // if(!(typeof req.query.donvinguoidung_id === "undefined" || typeof req.query.donvinguoidung_id === "undefined" || req.query.donvinguoidung_id === null || req.query.donvinguoidung_id == "null")){
            //     donvinguoidung_id = req.query.donvinguoidung_id;
            // }
            // if(!(typeof req.query.donviquanly_id === "undefined" || typeof req.query.donviquanly_id === "undefined" || req.query.donviquanly_id === null || req.query.donviquanly_id == "null")){
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
                    // if(meter_list.length > 0){
                    //     MeterCode = meter_list[0].MeterCode;
                    //     NodeCode = meter_list[0].NodeCode;
                    // }
                    MeterCode = 'all';
                    NodeCode = 'all'

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

                // if(meter_list.length > 0){
                //     MeterCode = meter_list[0].MeterCode;
                //     NodeCode = meter_list[0].NodeCode;
                // }
                MeterCode = 'all';
                NodeCode = 'all'
                // // lấy tất cả các thiết bị được phân quyền
                // meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])
                // if(meter_list.length > 0){
                //     MeterCode = meter_list[0].MeterCode;
                //     NodeCode = meter_list[0].NodeCode;
                // }
                    // MeterCode = 'all';
                    // NodeCode = 'all'
            }
            let to = new Date().getTime();
            let from = new Date().getTime() - 24*60*60*1000;

            let data_field_config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter":1, "Temp": 1};
            let data = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(data.length > 0){
                data_field_config = JSON.parse(data[0].config);
                // field_config_type_auto = data[0].type_auto;
            }
            let sql_in = ["(?, ?)", "(?, ?)", "(?, ?)", "(?, ?)","(?, ?)", "(?, ?)", "(?, ?)", "(?, ?)"];
            let values = [];
            let sql = "";

            if(MeterCode == 'all' && NodeCode == 'all'){
                values = [returnSQLDateFormat(from), returnSQLDateFormat(to),"CHANGE_DIRECTION",1,"CHANGE_DIRECTION",0,"LOST_DEVICE",1,"LOST_DEVICE",0,"MAGNETIC_DETECT",1,"MAGNETIC_DETECT",0,"HARD_RESET",1,"HARD_RESET",0];
            }else{
                values = [MeterCode, NodeCode, returnSQLDateFormat(from), returnSQLDateFormat(to),"CHANGE_DIRECTION",1,"CHANGE_DIRECTION",0,"LOST_DEVICE",1,"LOST_DEVICE",0,"MAGNETIC_DETECT",1,"MAGNETIC_DETECT",0,"HARD_RESET",1,"HARD_RESET",0];
            }

            
            let data_field_config_low_high = {CHANGE_DIRECTION: 1, LOST_DEVICE: 1, MAGNETIC_DETECT: 1, HARD_RESET:1}
            for(const key in data_field_config){
                if(data_field_config[key] == 1){
                    switch(key){
                    case "terminal_index": 
                    data_field_config_low_high.low_terminal_index = 1; data_field_config_low_high.high_terminal_index = 1; 
                    sql_in.push("(?, ?)","(?, ?)");
                    values.push("terminal_index",1,"terminal_index",0)
                    break;
                    case "flowRate": 
                    data_field_config_low_high.low_flowRate = 1; data_field_config_low_high.high_flowRate = 1; 
                    sql_in.push("(?, ?)","(?, ?)");
                    values.push("flowRate",1,"flowRate",0)

                    break;
                    case "pressure": 
                    data_field_config_low_high.low_pressure = 1; data_field_config_low_high.high_pressure = 1; 
                    sql_in.push("(?, ?)","(?, ?)");
                    values.push("pressure",1,"pressure",0)

                    break;
                    case "PressureVol": 
                    data_field_config_low_high.low_PressureVol = 1; data_field_config_low_high.high_PressureVol = 1; 
                    sql_in.push("(?, ?)","(?, ?)");
                    values.push("PressureVol",1,"PressureVol",0)

                    break;
                    case "measure_sensor": 
                    data_field_config_low_high.low_measure_sensor = 1; data_field_config_low_high.high_measure_sensor = 1; 
                    sql_in.push("(?, ?)","(?, ?)");
                    values.push("measure_sensor",1,"measure_sensor",0)

                    break;
                }
            }
        }
        if(MeterCode == 'all' && NodeCode == 'all'){
            if (req.cookies.tram_id && req.cookies.dv_type) {
                let tram_id = req.cookies.tram_id;
                let dv_type = req.cookies.dv_type;
                if (dv_type == "dvql") {
                    // sql = "SELECT t1.*, COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR t1.para = ? ) ORDER BY t1.updated_at DESC;";
                    // values.push(req.user.id);
                    // values.push("loss");
                    let child_org_id = await access_db("SELECT org_id FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id WHERE t2.user_id = ?;", [req.user.id]);
                    let arr_child_org_id = child_org_id.map(item => item.org_id);
                    if (arr_child_org_id.length > 0) {
                        sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR (t1.para = ? AND t1.org_id IN (?)) ) ORDER BY t1.updated_at DESC;";
                        values.push(req.user.id);
                        values.push("loss");

                        values.push(arr_child_org_id)
                    } else {
                        sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) ) ORDER BY t1.updated_at DESC;";
                        values.push(req.user.id);
                    // values.push("loss");
                    }
                } else {
                    sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR (t1.para = ? AND t1.org_id = ? )) ORDER BY t1.updated_at DESC;";
                    values.push(req.user.id);
                    values.push("loss", tram_id);
                }
            } else {
                let child_org_id = await access_db("SELECT org_id FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id WHERE t2.user_id = ?;", [req.user.id]);
                let arr_child_org_id = child_org_id.map(item => item.org_id);
                if (arr_child_org_id.length > 0){
                    sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR (t1.para = ? AND t1.org_id IN (?)) ) ORDER BY t1.updated_at DESC;";
                    values.push(req.user.id);
                    values.push("loss");

                    values.push(arr_child_org_id)
                }else{
                    sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) ) ORDER BY t1.updated_at DESC;";
                    values.push(req.user.id);
                    // values.push("loss");
                }

            }

            // if (donvinguoidung_id == null || donvinguoidung_id == "null"){
            //     sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR t1.para = ? ) ORDER BY t1.updated_at DESC;";
            //     values.push(req.user.id);
            //     values.push("loss");
            // }else{
            //     sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR (t1.para = ? AND t1.org_id = ? )) ORDER BY t1.updated_at DESC;";
            //     values.push(req.user.id);
            //     values.push("loss", donvinguoidung_id);

            // }


        }else{
            sql = "SELECT t1.*,  COALESCE(t2.name, t4.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t4 ON t4.id = t1.org_id WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t1.updated_at > ? AND t1.updated_at < ? AND (para, alert_status) IN ("+sql_in.join(",")+") ORDER BY t1.updated_at DESC;";
        }
            let alert_data = await access_db(sql,values);

            res.render('layouts/data_alert',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                parent_id,
                meter_list,
                role: req.user.role,
                data_field_config: data_field_config_low_high,
                full_name: req.user.name,
                current_path: "/alert",
                danhsachtram: danhsachtram,
                MeterCode,
                NodeCode,
                alert_data: JSON.stringify(alert_data),
                t: req.__ 
            })
        }catch(error){
            console.error('API data alert error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_alert_data: async (req,res) => {
        try{
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let start_date = req.query.start_date;
            let end_date = req.query.end_date;
            let alert_type = JSON.parse(req.query.alert_type);
            let tram_id = req.query.tram_id;
            let dv_type = req.query.dv_type;
            let values = [];
            let sql = "";
            if(MeterCode == 'all' && NodeCode == 'all'){
                 values = [ start_date, end_date];
            }else{
                values = [MeterCode, NodeCode, start_date, end_date];
            }
            let sql_in = [];
            if(alert_type.length == 0){
               return res.json({
                    data: []
                })
            }
            for(let i=0; i<alert_type.length; i++){
                switch(alert_type[i]){
                    case "low_terminal_index":
                        sql_in.push("(?, ?)");
                        values.push("terminal_index",0);
                        break;
                    case "high_terminal_index":
                        sql_in.push("(?, ?)");
                        values.push("terminal_index",1);
                        break;
                    case "low_flowRate":
                        sql_in.push("(?, ?)");
                        values.push("flowRate",0);
                    break;
                    case "high_flowRate":
                        sql_in.push("(?, ?)");
                        values.push("flowRate",1);
                    break;
                    case "low_pressure":
                        sql_in.push("(?, ?)");
                        values.push("pressure",0);
                    break;
                    case "high_pressure":
                        sql_in.push("(?, ?)");
                        values.push("pressure",1);
                    break;
                    case "low_PressureVol":
                        sql_in.push("(?, ?)");
                        values.push("PressureVol",0);
                    break;
                    case "high_PressureVol":
                        sql_in.push("(?, ?)");
                        values.push("PressureVol",1);
                    break;
                    case "loW_measure_sensor":
                        sql_in.push("(?, ?)");
                        values.push("measure_sensor",0);
                    break;
                    case "high_measure_sensor":
                        sql_in.push("(?, ?)");
                        values.push("measure_sensor",1);
                    break;
                    case "CHANGE_DIRECTION":
                        sql_in.push("(?, ?)","(?, ?)");
                        values.push("CHANGE_DIRECTION",0);
                        values.push("CHANGE_DIRECTION",1);

                    break;
                    case "LOST_DEVICE":
                        sql_in.push("(?, ?)","(?, ?)");
                        values.push("LOST_DEVICE",0);
                        values.push("LOST_DEVICE",1);
                    break;
                    case "MAGNETIC_DETECT":
                        sql_in.push("(?, ?)","(?, ?)");
                        values.push("MAGNETIC_DETECT",0);
                        values.push("MAGNETIC_DETECT",1);
                    break;
                    case "HARD_RESET":
                        sql_in.push("(?, ?)","(?, ?)");
                        values.push("HARD_RESET",0);
                        values.push("HARD_RESET",1);
                    break;
                }
            }

            if(MeterCode == 'all' && NodeCode == 'all'){
                if(dv_type == "all"){
                //     sql = "SELECT t1.*, COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (( ((t1.para, t1.alert_status) IN (" + sql_in.join(",") +"))  AND t4.user_id = ? ) OR t1.para = ? ) ORDER BY t1.updated_at DESC;";
                // values.push(req.user.id);
                //     values.push("loss")
                    let child_org_id = await access_db("SELECT org_id FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id WHERE t2.user_id = ?;", [req.user.id]);
                    let arr_child_org_id = child_org_id.map(item => item.org_id);
                    if (arr_child_org_id.length > 0) {
                        sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR (t1.para = ? AND t1.org_id IN (?)) ) ORDER BY t1.updated_at DESC;";
                        values.push(req.user.id);
                        values.push("loss");

                        values.push(arr_child_org_id)
                    } else {
                        sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) ) ORDER BY t1.updated_at DESC;";
                        values.push(req.user.id);
                        // values.push("loss");
                    }

                }else if(dv_type == "dvql"){
                    // sql = "SELECT t1.*, COALESCE(t2.name, t4.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN organizations t4 ON t4.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") +") AND t3.org_id = ?) OR (t1.para = ?))  ORDER BY t1.updated_at DESC;";
                    // values.push(tram_id);
                    // values.push("loss");

                    let child_org_id = await access_db("SELECT org_id FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id WHERE t2.user_id = ?;", [req.user.id]);
                    let arr_child_org_id = child_org_id.map(item => item.org_id);
                    if (arr_child_org_id.length > 0) {
                        sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) OR (t1.para = ? AND t1.org_id IN (?)) ) ORDER BY t1.updated_at DESC;";
                        values.push(req.user.id);
                        values.push("loss");

                        values.push(arr_child_org_id)
                    } else {
                        sql = "SELECT t1.*,  COALESCE(t2.name, t5.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN user_donviquanly t4 ON t3.org_id = t4.donviquanly_id LEFT JOIN organizations t5 ON t5.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") + ") AND t4.user_id = ? ) ) ORDER BY t1.updated_at DESC;";
                        values.push(req.user.id);
                    // values.push("loss");
                    }


                }else{
                    sql = "SELECT t1.*, COALESCE(t2.name, t4.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN organizations t4 ON t4.id = t1.org_id WHERE t1.updated_at > ? AND t1.updated_at < ? AND (((t1.para, t1.alert_status) IN (" + sql_in.join(",") +") AND t3.org_id = ?) OR  (t1.para = ? AND t1.org_id = ?)) ORDER BY t1.updated_at DESC;"
                    values.push(tram_id);
                    values.push("loss");
                    values.push(tram_id);

                }

            }else{
                sql = "SELECT t1.*, COALESCE(t2.name, t4.org_name) AS name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t4 ON t4.id = t1.org_id WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t1.updated_at > ? AND t1.updated_at < ? AND (para, alert_status) IN ("+sql_in.join(",")+") ORDER BY t1.updated_at DESC;"
            }
            let alert_data = await access_db(sql,values);
            res.json({
                data: alert_data
            })
        }catch(error){
            console.error('API data alert error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    send_notification: async (req,res) => {
        try{
            let arr = req.body;
            console.log(arr)
            // let arr = [{"start_time":"2025-05-29T16:41:35","MeterCode":"SVWMNB25000005","NodeCode":"SVWMNB25000005","type":0,"message":"Cảnh báo tháo dỡ thiết bị"}]
            if(!Array.isArray(arr)){
                return res.json({ success: false, message: 'Dữ liệu không phải là mảng' })
            }
            let user_meter_list = await access_db("SELECT t1.MeterCode, t1.NodeCode, t2.user_id, t3.name, t2.popup_noti_status FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode;",[]);
            let user_org_id = await access_db("SELECT t1.org_id, t2.user_id, t2.popup_noti_status, t3.org_name FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id LEFT JOIN organizations t3 ON t1.org_id = t3.id;")
            const io = req.app.get('io');
            const userSocketMap = req.app.get('userSocketMap');
            if(userSocketMap.length > 0){
                for(let i=0; i< userSocketMap.length; i++){
                        let data = [];
                        for(let j=0; j< arr.length; j++){
                            // let result = await access_db("SELECT * FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t2.user_id = ?;",[arr[j].MeterCode, arr[j].NodeCode, userSocketMap[i].user_id]);
                            for(let x=0; x < user_meter_list.length; x ++){
                                if(user_meter_list[x].MeterCode == arr[j].MeterCode && user_meter_list[x].NodeCode === arr[j].NodeCode && user_meter_list[x].user_id === userSocketMap[i].user_id && user_meter_list[x].popup_noti_status == 1){
                                    arr[j].name = user_meter_list[x].name
                                    data.push(arr[j]);
                                    break;
                                }
                            }
                            for(let y=0; y < user_org_id.length; y++){
                                if (arr[j].org_id){
                                    if (user_org_id[y].org_id == arr[j].org_id && user_org_id[y].user_id == userSocketMap[i].user_id && user_org_id[y].popup_noti_status == 1){
                                        arr[j].name = user_org_id[y].org_name
                                        data.push(arr[j]);
                                    }
                                }
                            }
                            // if(exists){
                            //     data.push(arr[j])
                            // }
                        }
                        io.to(userSocketMap[i].socket.id).emit("notification", data);
                }
                return res.json({ success: true, message: 'Gửi thông báo tới '+ userSocketMap.length +' client' })
            }else{
                return res.json({ success: true, message: 'Không có user nào online' })
            }
        }catch(error){
            console.error('API data alert error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }

    },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data alert error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data alert error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data alert error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data alert error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data alert error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
        // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API data alert error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

}

module.exports = alert_controller;