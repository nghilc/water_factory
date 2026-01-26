const { access_db, query } = require("../config/mysql_config");
const util = require("../config/util");
function replace_obs(x){
    switch(x){
        case "LLPH": return "PH";
        case "OXYMG": return "DO";
        case "OXY" : return "ORP";
        default: return x;
    }
}


const config_meter_controller = {
    show_config_meter: async (req,res) => {
        try{ 
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])
            let MeterCode = null;
            let NodeCode = null;
            let DcuCode = null;
            let server_address = null;
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
                    //     if(donviquanly_id != null && donviquanly_id != "null" ){
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
                // lấy tất cả các thiết bị được phân quyền
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




            
            let meter_info = {
                name: null,
                lat: null,
                lng: null,
                address: null,
                donvi: null,
                bar_to_met: null,
                conver_factor: null,
                compen_factor: null,
                sync_tnmt_data: null,
                multiplier: null,
                first_index: null,
                pin_threshold: null,
                ac_quy_threshold: null,
                X1: null,
                X2: null,
                UX: null,
                Y1:null,
                Y2: null,
                UY: null,
                Om: null,
                compen_value: null,
                conver_value: null,
                threshold_pin: null,
                threshold_battery: null,
                collection_channel_device: null,
                frequency: null,
                low_flowRate_threshold: null,
                high_flowRate_threshold: null,
                low_terminal_index_threshold: null, 
                high_terminal_index_threshold: null, 
                dcu_code: null,
                AnalogType: null,
                wire_length: null,
                last_measure_static: null
            };

            let get_meter_info = await access_db("SELECT t3.*, t3.name AS meter_name FROM org_managers t1 LEFT JOIN totaleq t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t1.MeterCode = ? AND t1.NodeCode = ?;",[MeterCode, NodeCode]);
            if(get_meter_info.length > 0){
                meter_info.name = get_meter_info[0].meter_name;
                meter_info.lat = get_meter_info[0].location_lat;
                meter_info.lng = get_meter_info[0].location_long;
                meter_info.address = get_meter_info[0].address;
                meter_info.bar_to_met =  get_meter_info[0].bar_to_met
                meter_info.conver_factor =  get_meter_info[0].conver_factor
                meter_info.compen_factor =  get_meter_info[0].compen_factor
                meter_info.sync_tnmt_data =  get_meter_info[0].sync_tnmt_data
                meter_info.multiplier =  get_meter_info[0].multiplier
                meter_info.first_index =  get_meter_info[0].first_index
                meter_info.X1 =  get_meter_info[0].X1
                meter_info.X2 =  get_meter_info[0].X2
                meter_info.UX =  get_meter_info[0].UX
                meter_info.Y1 =  get_meter_info[0].Y1
                meter_info.Y2 =  get_meter_info[0].Y2
                meter_info.UY =  get_meter_info[0].UY
                meter_info.Om =  get_meter_info[0].Om
                meter_info.AnalogType = get_meter_info[0].AnalogType
                meter_info.wire_length = get_meter_info[0].wire_length
                meter_info.last_measure_static = get_meter_info[0].last_unit != null && get_meter_info[0].last_unit == 1 ? (get_meter_info[0].last_measure_static / 100) : get_meter_info[0].last_measure_static
                meter_info.compen_value =  get_meter_info[0].compen_value
                meter_info.conver_value =  get_meter_info[0].conver_value
                meter_info.threshold_pin =  get_meter_info[0].threshold_pin
                meter_info.threshold_battery =  get_meter_info[0].threshold_battery
                meter_info.collection_channel_device =  get_meter_info[0].collection_channel_device
                meter_info.frequency =  get_meter_info[0].frequency,
                DcuCode =  get_meter_info[0].DcuCode  ,
                server_address  = get_meter_info[0].server_address
            }
            let flowRate_threshold = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ? AND start_time = ? AND (end_time = ? OR end_time = ?) AND config_type = ? ORDER BY id DESC;",[MeterCode, NodeCode, "00:00:00", "23:59:00","23:59:59", "flowRate"]);
            if(flowRate_threshold.length > 0){
                meter_info.low_flowRate_threshold = flowRate_threshold[0].min_value;
                meter_info.high_flowRate_threshold = flowRate_threshold[0].max_value;
            }
            let terminal_index_threshold = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ? AND start_time = ? AND (end_time = ? OR end_time = ?) AND config_type = ? ORDER BY id DESC;",[MeterCode, NodeCode, "00:00:00", "23:59:00","23:59:59", "terminal_index"]);
            if(terminal_index_threshold.length > 0){
                meter_info.low_terminal_index_threshold = terminal_index_threshold[0].min_value;
                meter_info.high_terminal_index_threshold = terminal_index_threshold[0].max_value;
            }
            let field_config_type_auto = 1;
            let data_field_config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };
            let data = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(data.length > 0){
                data_field_config = JSON.parse(data[0].config);
                field_config_type_auto = data[0].type_auto;

            }
            if (data_field_config.hasOwnProperty("OP")) {
                delete data["OP"];
            }

            let rows = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ?;",[MeterCode,NodeCode]);
            let grouped_alert_config = {
                "ValOfNum": [], "terminal_index": [], "flowRate": [], "pressure": [], "measure_sensor": [], "measure_static": [], "measure_dynamic": [], "measure_delta": [], "ValueReverse": [], "Voltage": [], "voltage_ac_quy": [], "PressureVol": [], "water_output_month": [], "water_output_year": [], "Temp": []}
            rows.forEach(row => {
                row.config_type = replace_obs(row.config_type);
                if(!grouped_alert_config[row.config_type]){
                    grouped_alert_config[row.config_type] = []
                }
                grouped_alert_config[row.config_type].push(row)
            });


            Object.keys(grouped_alert_config).forEach(field => {
                while (grouped_alert_config[field].length < 6) {
                    grouped_alert_config[field].push({ start_time: null, end_time: null, min_value: null, max_value: "" });
                }
            });
            res.render('layouts/config_meter',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                parent_id,
                role: req.user.role,
                field_config_type_auto,
                grouped_alert_config,
                meter_info,
                meter_list,
                full_name: req.user.name,
                current_path: "/config_meter",
                danhsachtram: danhsachtram,
                MeterCode,
                NodeCode,DcuCode,server_address,
                data_field_config: data_field_config,
                donvinguoidung_id, donviquanly_id,
                t: req.__ 
            })
        }catch(error){
            console.error('API config_meter error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_meter_info: async (req,res) => {
        try{
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let DcuCode = null;
            let server_address = null;
            let meter_info = {
                name: null,
                lat: null,
                lng: null,
                address: null,
                donvi: null, 
                bar_to_met: null,
                conver_factor: null,
                compen_factor: null,
                sync_tnmt_data: null,
                multiplier: null,
                first_index: null,
                pin_threshold: null,
                ac_quy_threshold: null,
                X1: null,
                X2: null,
                UX: null,
                Y1:null,
                Y2: null,
                UY: null,
                Om: null,
                AnalogType: null,
                wire_length: null,
                last_measure_static: null,
                compen_value: null,
                conver_value: null,
                threshold_pin: null,
                threshold_battery: null,
                collection_channel_device: null,
                frequency: null,
                low_flowRate_threshold: null,
                high_flowRate_threshold: null,
                low_terminal_index_threshold: null, 
                high_terminal_index_threshold: null

            };
            let get_meter_info = await access_db("SELECT t3.*, t3.name AS meter_name FROM org_managers t1 LEFT JOIN totaleq t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t1.MeterCode = ? AND t1.NodeCode = ?;",[MeterCode, NodeCode]);
            if(get_meter_info.length > 0){
                meter_info.name = get_meter_info[0].meter_name;
                meter_info.lat = get_meter_info[0].location_lat;
                meter_info.lng = get_meter_info[0].location_long;
                meter_info.address = get_meter_info[0].address;
                meter_info.bar_to_met =  get_meter_info[0].bar_to_met
                meter_info.conver_factor =  get_meter_info[0].conver_factor
                meter_info.compen_factor =  get_meter_info[0].compen_factor
                meter_info.sync_tnmt_data =  get_meter_info[0].sync_tnmt_data
                meter_info.multiplier =  get_meter_info[0].multiplier
                meter_info.first_index =  get_meter_info[0].first_index
                meter_info.X1 =  get_meter_info[0].X1
                meter_info.X2 =  get_meter_info[0].X2
                meter_info.UX =  get_meter_info[0].UX
                meter_info.Y1 =  get_meter_info[0].Y1
                meter_info.Y2 =  get_meter_info[0].Y2
                meter_info.UY =  get_meter_info[0].UY
                meter_info.Om =  get_meter_info[0].Om
                meter_info.AnalogType = get_meter_info[0].AnalogType
                meter_info.wire_length = get_meter_info[0].wire_length
                meter_info.last_measure_static = get_meter_info[0].last_measure_static
                meter_info.compen_value =  get_meter_info[0].compen_value
                meter_info.conver_value =  get_meter_info[0].conver_value
                meter_info.threshold_pin =  get_meter_info[0].threshold_pin
                meter_info.threshold_battery =  get_meter_info[0].threshold_battery
                meter_info.collection_channel_device =  get_meter_info[0].collection_channel_device
                meter_info.frequency =  get_meter_info[0].frequency,
                DcuCode =  get_meter_info[0].DcuCode  ,
                server_address  = get_meter_info[0].server_address


            }
            let flowRate_threshold = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ? AND start_time = ? AND (end_time = ? OR end_time = ?) AND config_type = ? ORDER BY id DESC;",[MeterCode, NodeCode, "00:00:00", "23:59:00","23:59:59", "flowRate"]);
            if(flowRate_threshold.length > 0){
                meter_info.low_flowRate_threshold = flowRate_threshold[0].min_value;
                meter_info.high_flowRate_threshold = flowRate_threshold[0].max_value;
            }
            let terminal_index_threshold = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ? AND start_time = ? AND (end_time = ? OR end_time = ?) AND config_type = ? ORDER BY id DESC;",[MeterCode, NodeCode, "00:00:00", "23:59:00","23:59:59", "terminal_index"]);
            if(terminal_index_threshold.length > 0){
                meter_info.low_terminal_index_threshold = terminal_index_threshold[0].min_value;
                meter_info.high_terminal_index_threshold = terminal_index_threshold[0].max_value;
            }


            let field_config_type_auto = 1;
            let data_field_config =
                { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };
            let data = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(data.length > 0){
                data_field_config = JSON.parse(data[0].config);
                field_config_type_auto = data[0].type_auto;
            }
     

            let rows = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ?;",[MeterCode,NodeCode]);
            let grouped_alert_config = {
                "ValOfNum": [], "terminal_index": [], "flowRate": [], "pressure": [], "measure_sensor": [], "measure_static": [], "measure_dynamic": [], "measure_delta": [], "ValueReverse": [], "Voltage": [], "voltage_ac_quy": [], "PressureVol": [], "water_output_month": [], "water_output_year": [], "Temp": []}
            rows.forEach(row => {
                row.config_type = replace_obs(row.config_type);
                if(!grouped_alert_config[row.config_type]){
                    grouped_alert_config[row.config_type] = []
                }
                grouped_alert_config[row.config_type].push(row)
            });


            Object.keys(grouped_alert_config).forEach(field => {
                while (grouped_alert_config[field].length < 6) {
                    grouped_alert_config[field].push({ start_time: null, end_time: null, min_value: null, max_value: "" });
                }
            });

            res.render('partials/config_meter',{
                field_config_type_auto,
                grouped_alert_config,
                meter_info,
                MeterCode,
                NodeCode,
                data_field_config: data_field_config,
                DcuCode,
                server_address ,

                t: req.__ 
            })
        }catch(error){
            console.error('API config_meter error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_config_freq: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let DcuCode = req.body.DcuCode;
            let freq_coefficient = req.body.freq_coefficient;
            let freq_time = req.body.freq_time;
            let retain_config_freq = req.body.retain_config_freq;
            let server_address = req.body.server_address_read;
            let topic = "AMI/"+DcuCode+"/sCoFi";
            let payload_temp = "0102" + util.fixZero(util.intToHex(freq_time), 4) +"0601"+ util.fixZero(util.intToHex(freq_coefficient), 2);
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id,retain_config_freq]);
            let log = {
                DcuCode: DcuCode,
                fre: freq_time + " x " + freq_coefficient + " lần ",
                server_address: server_address,
                retain: retain_config_freq
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình tần suất", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-tan-suat", 2, retain_config_freq]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_freq error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_config_reset_and_save:async (req,res) => {
        try{
            let DcuCode = req.body.DcuCode;
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let type  = req.body.type;
            let retain_reset_and_save = req.body.retain_reset_and_save;
            let server_address = req.body.server_address_read;
            let topic = "AMI/"+DcuCode+"/sCoFi";
            let payload_temp = "";
            if(type=='reset'){
                payload_temp = "020101";
            }else if(type=='saveware'){
                payload_temp = "030101";
            }else{
                return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" });     
            }
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id,retain_reset_and_save]);
            let log = {
                DcuCode: DcuCode,
                retain: retain_reset_and_save,
                server_address: server_address,
                type: type
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình lưu kho", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-luu-kho", 2, retain_reset_and_save]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_reset_and_save error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_config_meter:async (req,res) => {
        try{
            let DcuCode = req.body.DcuCode;
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let multiplier  = req.body.multiplier;
            let first_index  = req.body.first_index;
            let retain = req.body.retain;
            let server_address = req.body.server_address_read;
            let topic = "AMI/"+DcuCode+"/sSett";
            let payload_temp = "";
            if(DcuCode != MeterCode){
                var serialhex = util.stringToHex(MeterCode.replace(DcuCode, "")).replace(/\s+/g, "").toUpperCase();
                payload_temp = "0A"+util.intToHex(serialhex.length / 2) + serialhex;
            }

            if(multiplier > 1000){
                return res.json({ success: false, message: "Hệ số xung không vượt quá 1000." });     
            }else{
                var hesoxunghex = util.getDecimalHex(multiplier);
                payload_temp += "C0" + hesoxunghex;
            }

            if(first_index){
                var chisohex = util.getDecimalHex(first_index);
                payload_temp += "C1" + chisohex;
            }
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id,retain]);
            let log = {
                DcuCode: DcuCode,
                retain: retain,
                server_address: server_address,
                multiplier:multiplier,
                first_index: first_index,
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình đồng hồ", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-dong-ho", 2, retain]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_meter error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_config_pressure:async (req,res) => {
        try{
            let DcuCode = req.body.DcuCode;
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let retain = req.body.retain;
            let server_address = req.body.server_address_read;
            let X1  = req.body.X1;
            let X2  = req.body.X2;
            let Ux  = req.body.Ux;
            let Y1  = req.body.Y1;
            let Y2  = req.body.Y2;
            let Uy  = req.body.Uy;
            let cbxAnalog  = req.body.cbxAnalog;
            let Om  = req.body.Om;
            let send_lcd_cm  = req.body.send_lcd_cm;
            let config_pressure_measure  = req.body.config_pressure_measure;
            let topic = "AMI/"+DcuCode+"/sSett";
            let payload_temp = "";
            let wire_length = (req.body.wire_length == "") ? null : req.body.wire_length;
            let measure_static = (req.body.measure_static == "") ? null : req.body.measure_static;


            if(DcuCode != MeterCode){
                const serialhex = util.stringToHex(MeterCode.replace(DcuCode, "")).replace(/\s+/g, "").toUpperCase();
                payload_temp = "0A"+util.intToHex(serialhex.length / 2) + serialhex;
            }

            if(X1){
                const inputMin = util.getDecimalHex(X1);
                payload_temp += "C4" + inputMin;
            }
            if(X2){
                const inputMax = util.getDecimalHex(X2);
                payload_temp += "C5" + inputMax;
            }
            if(Ux){
                // const unitMap = {
                //     "mA": "01",
                //     "mV": "00",
                //     "V": "02"
                // };
                let inputUnit = '';//unitMap[Ux] || "";
                switch(Ux){
                    case "mA":
                        inputUnit = "01";
                    break;
                    case "mV":
                        inputUnit = "00";
                    break;
                    case "V":
                        inputUnit = "02";
                    break;
                }
                payload_temp += "C601" + inputUnit;
            }
            if(Y1){
                const outputMin = util.getDecimalHex(Y1);
                payload_temp += "C7" + outputMin;
            }
            if(Y2){
                const outputMax = util.getDecimalHex(Y2);
                payload_temp += "C8" + outputMax;
            }

            if(Uy){
                // const unitMap = {
                //     "mV": "00",
                //     "mA": "01",
                //     "V": "02","Met" : "03","Bar":"04"
                // };
                let outputUnit = "";// unitMap[Uy] || "";
                switch(Uy){
                    case "mA":
                        outputUnit = "01";
                    break;
                    case "mV":
                        outputUnit = "00";
                    break;
                    case "V":
                        outputUnit = "02";
                    break;
                    case "Met":
                        outputUnit = "03";
                    break;
                    case "Bar":
                        outputUnit = "04";
                    break;
                    case "C":
                        outputUnit = "05";
                    break;
                }
                payload_temp += "C901" + outputUnit;
            }

            if(Om){
                const pressureFactor = util.getDecimalHex(Om);
                payload_temp += "CA" + pressureFactor;
            }

            if (cbxAnalog) {
                payload_temp += "CB01" + cbxAnalog.toString().padStart(2, '0').toUpperCase();
            }

            // if(wire_length){
            //     const wireLength = util.getDecimalHex(wire_length);
            //     payload_temp += "DB" + wireLength;
            // }

            // if(measure_static){
            //     const measureStatic = util.getDecimalHex(measure_static);
            //     payload_temp += "DD" + measureStatic;
            // }
            if ((cbxAnalog == 5 || cbxAnalog == 6) && wire_length) {
                const wireLength = util.getDecimalHex(wire_length);
                payload_temp += "DB" + wireLength;
            }

            if ((cbxAnalog == 5 || cbxAnalog == 6) && measure_static) {
                const measureStatic = util.getDecimalHex(measure_static);
                payload_temp += "DD" + measureStatic;
            }
            if(cbxAnalog && wire_length && measure_static){
                await access_db("UPDATE totaleq SET AnalogType = ?, wire_length = ?, last_measure_static = ? WHERE MeterCode = ? AND NodeCode = ?;", [cbxAnalog, wire_length, measure_static, MeterCode, NodeCode]);
            }else{
                if (cbxAnalog && (cbxAnalog < 3 || cbxAnalog == 7)){
                    await access_db("UPDATE totaleq SET AnalogType = ?, wire_length = null, last_measure_static = null WHERE MeterCode = ? AND NodeCode = ?;", [cbxAnalog, MeterCode, NodeCode]);
                }
            }
           
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id, retain]);
            let log = {
                DcuCode: DcuCode,
                retain: retain,
                server_address: server_address,
                X1: X1,
                X2 :X2,
                Ux: Ux,
                Y1: Y1,
                Y2: Y2,
                Uy: Uy,
                cbxAnalog: cbxAnalog,
                wire_length: wire_length,
                measure_static: measure_static,
                Om: Om
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình cổng đo áp suất", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-cong-do-ap-suat", 2, retain]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_pressure error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_config_alert_terminal_index:async (req,res) => {
        try{
            let DcuCode = req.body.DcuCode;
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let retain = req.body.retain;
            let server_address = req.body.server_address_read;
            let min  = req.body.min;
            let max  = req.body.max;
            let topic = "AMI/"+DcuCode+"/sSet2";
            let payload_temp = "";


            if(DcuCode != MeterCode){
                const serialhex = util.stringToHex(MeterCode.replace(DcuCode, "")).replace(/\s+/g, "").toUpperCase();
                payload_temp = "0A"+util.intToHex(serialhex.length / 2) + serialhex;
            }

            if(max){
                const inputMax = util.getDecimalHex(max);
                payload_temp += "F0" + inputMax;
            }

            if(min){
                const inputMin = util.getDecimalHex(min);
                payload_temp += "F1" + inputMin;
            }
            
            
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id,retain]);
            let log = {
                DcuCode: DcuCode,
                retain: retain,
                server_address: server_address,
                min: min,
                max: max
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình cảnh báo sản lượng", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-canh-bao-san-luong", 2, retain]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_alert_terminal_index error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_config_alert_flow_rate:async (req,res) => {
        try{
            let DcuCode = req.body.DcuCode;
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let retain = req.body.retain;
            let server_address = req.body.server_address_read;
            let min  = req.body.min;
            let max  = req.body.max;
            let topic = "AMI/"+DcuCode+"/sSet3";
            let payload_temp = "";


            if(DcuCode != MeterCode){
                const serialhex = util.stringToHex(MeterCode.replace(DcuCode, "")).replace(/\s+/g, "").toUpperCase();
                payload_temp = "0A"+util.intToHex(serialhex.length / 2) + serialhex;
            }

            if(max){
                const inputMax = util.getDecimalHex(max);
                payload_temp += "F2" + inputMax;
            }

            if(min){
                const inputMin = util.getDecimalHex(min);
                payload_temp += "F3" + inputMin;
            }
            
            
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id,retain]);
            let log = {
                DcuCode: DcuCode,
                retain: retain,
                server_address: server_address,
                min: min,
                max: max
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình cảnh báo lưu lượng", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-canh-bao-luu-luong", 2, retain]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_alert_flow_rate error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    
    post_config_alert_pin:async (req,res) => {
        try{
            let DcuCode = req.body.DcuCode;
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let retain = req.body.retain;
            let server_address = req.body.server_address_read;
            let min  = req.body.min;
            let topic = "AMI/"+DcuCode+"/sSet4";
            let payload_temp = "";


            if(DcuCode != MeterCode){
                const serialhex = util.stringToHex(MeterCode.replace(DcuCode, "")).replace(/\s+/g, "").toUpperCase();
                payload_temp = "0A"+util.intToHex(serialhex.length / 2) + serialhex;
            }

            if(min){
                const inputMin = util.getDecimalHex(min);
                payload_temp += "F4" + inputMin;
            }
            
            
            let payload = payload_temp + util.genCrc(payload_temp);
            let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id,retain,command_status) VALUES (?,?,?,?,?,?,?,0);", [DcuCode, new Date(), topic, payload, server_address, req.user.id,retain]);
               let log = {
                DcuCode: DcuCode,
                retain: retain,
                server_address: server_address,
                min: min,
            }
            if(result.affectedRows > 0){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, retain) VALUES (?,?,?,?,?,?,?,?,?);",[req.user.user_name, "Cấu hình cảnh báo điện áp pin", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cau-hinh-canh-bao-pin", 2, retain]);

                return res.json({ success: true, message: "Gửi lệnh thành công" });
            }
            return res.json({ success: false, message: "Lỗi khi gửi lệnh. Xin mời thử lại" }); 
        }catch(error){
            console.error('API post_config_alert_pin error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    
            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API config_meter error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API config_meter error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API config_meter error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API config_meter error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API config_meter error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = config_meter_controller;