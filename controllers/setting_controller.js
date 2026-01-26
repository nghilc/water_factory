const {access_db, query} = require("../config/mysql_config");
function isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}
function replace_obs(x){
    switch(x){
        case "LLPH": return "PH";
        case "OXYMG": return "DO";
        case "OXY" : return "ORP";
        default: return x;
    }
}

function shortToFullName(name){     // Trả về tên đầy đủ
        switch(name){
            case "ValOfNum":
              return "Chỉ số";
            case "terminal_index":
              return "Sản lượng";
            case "flowRate":
              return "Lưu lượng";
            case "pressure":
              return "Áp suất";
            case "measure_sensor":
              return "Mực nước đo được"
            case "measure_static":
              return "Mực nước tĩnh";
            case "measure_dynamic":
              return "Mực nước động";
            case "measure_delta":
              return "Hiệu số mực nước";
            case "ValueReverse":
              return "Chỉ số ngược";
            case "ValueForward":
                return "Chỉ số thuận";
            case "Voltage":
              return "Điện áp pin";
            case "voltage_ac_quy":
              return "Điện áp ắc quy";
            case "PressureVol":
              return "Điện áp";
            case "VoltageOfMeter":
                return "Điện áp đồng hồ";
            case "Temp":
                return "Nhiệt độ"
            default:
              return name;
          }
}

function return_alert_alias(x){
            switch(x){
            case "terminal_index":
              return "cai-dat-canh-bao-san-luong";
            case "flowRate":
              return "cai-dat-canh-bao-luu-luong";
            case "pressure":
              return "cai-dat-canh-bao-ap-suat";
            case "measure_sensor":
              return "cai-dat-canh-bao-muc-nuoc-do-duoc"
            case "measure_static":
              return "cai-dat-canh-bao-muc-nuoc-tinh";
            case "measure_dynamic":
              return "cai-dat-canh-bao-muc-nuoc-dong";
            case "measure_delta":
              return "cai-dat-canh-bao-hieu-so-muc-nuoc";
            case "ValueReverse":
              return "cai-dat-canh-bao-chi-so-nguoc";
            case "ValueForward":
                return "cai-dat-canh-bao-chi-so-thuan";
            case "Voltage":
              return "cai-dat-canh-bao-dien-ap-pin";
            case "voltage_ac_quy":
              return "cai-dat-canh-bao-dien-ap-ac-quy";
            case "PressureVol":
              return "cai-dat-canh-bao-dien-ap";
                case "VoltageOfMeter":
                return "cai-dat-canh-bao-dien-ap-dong-ho";
            case "Temp":
                return "cai-dat-canh-bao-nhiet-do"
            default:
              return x;
          }
}
const setting_controller = {
    show_setting: async (req,res) => {
        try{ 
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let MeterCode = null;
            let NodeCode = null;
            let meter_list = [];
            let parent_id = "all";
            let parent_id_2 = "all";
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
                tank_base_bottom: null,
                threshold_pin: null,
                threshold_battery: null,
                collection_channel_device: null,
                frequency: null,
                ma_tram: null,
                serial_sim: null,
                firmware_version: null,
                network_status: null,
                mode_power: null,
                Qmax: null,
                Qmin: null,
                note: null,
                min_exploitation_rate: null,
                max_exploitation_rate: null,
                daily_exploitation_limit: null,
                min_threshold_terminal_index: null,
                max_threshold_terminal_index: null,

            };

            let get_meter_info = await access_db("SELECT t3.*, t3.name AS meter_name, t1.org_id AS donviquanly_id FROM org_managers t1 LEFT JOIN totaleq t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode INNER JOIN user_donviquanly t4 ON t1.org_id = t4.donviquanly_id WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t4.user_id = ?;",[MeterCode, NodeCode, req.user.id]);
            if(get_meter_info.length > 0){
                meter_info.name = get_meter_info[0].meter_name;
                meter_info.lat = get_meter_info[0].location_lat;
                meter_info.lng = get_meter_info[0].location_long;
                meter_info.address = get_meter_info[0].address;
                // meter_info.donvi = get_meter_info[0].donvi;
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
                meter_info.compen_value =  get_meter_info[0].compen_value
                meter_info.conver_value =  get_meter_info[0].conver_value
                meter_info.tank_base_bottom = get_meter_info[0].tank_base_bottom

                meter_info.threshold_pin =  get_meter_info[0].threshold_pin
                meter_info.threshold_battery =  get_meter_info[0].threshold_battery
                meter_info.collection_channel_device =  get_meter_info[0].collection_channel_device
                meter_info.frequency =  get_meter_info[0].frequency
                meter_info.ma_tram =  get_meter_info[0].ma_tram
                meter_info.serial_sim =  get_meter_info[0].serial_sim
                meter_info.firmware_version =  get_meter_info[0].firmware_version
                meter_info.network_status =  get_meter_info[0].network_status
                meter_info.mode_power =  get_meter_info[0].mode_power
                meter_info.Qmax =  get_meter_info[0].Qmax
                meter_info.Qmin =  get_meter_info[0].Qmin
                meter_info.note =  get_meter_info[0].note
                meter_info.min_exploitation_rate = get_meter_info[0].min_exploitation_rate
                meter_info.max_exploitation_rate = get_meter_info[0].max_exploitation_rate
                meter_info.daily_exploitation_limit = get_meter_info[0].daily_exploitation_limit
                meter_info.min_threshold_terminal_index = get_meter_info[0].min_threshold_terminal_index
                meter_info.max_threshold_terminal_index = get_meter_info[0].max_threshold_terminal_index

                // if(get_meter_info[0].donvinguoidung_id == null){
                //     parent_id_2 = "dvql"+get_meter_info[0].donviquanly_id
                // }else{
                //     parent_id_2 = "dvnd"+get_meter_info[0].donvinguoidung_id
                // }

            }

            // meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN tram_diemdo_relation t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN group_user t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t2.parent_id = ? AND t3.user_id = ?",[tram_selected_id, req.user.id]);
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
            let grouped_alert_config =
                { "ValOfNum": [], "terminal_index": [], "flowRate": [], "pressure": [], "measure_sensor": [], "measure_static": [], "measure_dynamic": [], "measure_delta": [], "ValueReverse": [], "Voltage": [], "voltage_ac_quy": [], "PressureVol": [], "water_output_day": [], "water_output_month": [], "Temp": [] }
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
            let get_meter_cycle = await query(`SELECT * FROM "meter_cycle" WHERE "meter_code" = $1 AND "node_code" = $2;`,[MeterCode, NodeCode]);
            let meter_cycle = {
                meter_code: null,
                node_code: null,
                cycle_min: null,
                enabled: null,
                ip_ftp: null, 
                user_ftp: null,
                pass_ftp: null,
                field_ftp: "LUULUONG",
                ma_cong_trinh: null,
                ma_tram: null,
                ma_tinh: null,
                origin_min: null,
                cycle_time: null
            }
            if(get_meter_cycle.length > 0){
                meter_cycle = get_meter_cycle[0];
            }
            res.render('layouts/setting',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                parent_id, meter_cycle,
                role: req.user.role,
                parent_role: req.user.parent_role,
                field_config_type_auto,
                grouped_alert_config,
                meter_info,
                meter_list,
                full_name: req.user.name,
                current_path: "/setting",
                danhsachtram: danhsachtram,
                MeterCode,
                NodeCode,
                data_field_config: data_field_config,
                donvinguoidung_id, donviquanly_id,
                t: req.__ 
            })
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_meter_info: async (req,res) => {
        try{
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let parent_id = "all";
            let parent_id_2 = "all";
            let donvinguoidung_id = null;
            let donviquanly_id = null;

            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
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
                tank_base_bottom: null,
                threshold_pin: null,
                threshold_battery: null,
                collection_channel_device: null,
                frequency: null,
                ma_tram: null,
                serial_sim: null,
                firmware_version: null,
                network_status: null,
                mode_power: null,
                Qmax: null,
                Qmin: null,
                note: null,
                min_exploitation_rate: null,
                max_exploitation_rate: null,
                daily_exploitation_limit: null,
                min_threshold_terminal_index: null,
                max_threshold_terminal_index: null,
            
            };
            let get_meter_info = await access_db("SELECT t3.*, t1.org_id AS donviquanly_id, t3.name AS meter_name FROM org_managers t1 LEFT JOIN totaleq t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode INNER JOIN user_donviquanly t4 ON t1.org_id = t4.donviquanly_id WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t4.user_id = ?;",[MeterCode, NodeCode, req.user.id]);
            if(get_meter_info.length > 0){
                meter_info.name = get_meter_info[0].meter_name;
                meter_info.lat = get_meter_info[0].location_lat;
                meter_info.lng = get_meter_info[0].location_long;
                meter_info.address = get_meter_info[0].address;
                meter_info.donvi = get_meter_info[0].donvi;
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
                meter_info.compen_value =  get_meter_info[0].compen_value
                meter_info.conver_value =  get_meter_info[0].conver_value
                meter_info.tank_base_bottom = get_meter_info[0].tank_base_bottom
                meter_info.threshold_pin =  get_meter_info[0].threshold_pin
                meter_info.threshold_battery =  get_meter_info[0].threshold_battery
                meter_info.collection_channel_device =  get_meter_info[0].collection_channel_device
                meter_info.frequency =  get_meter_info[0].frequency
                meter_info.ma_tram =  get_meter_info[0].ma_tram
                meter_info.serial_sim =  get_meter_info[0].serial_sim
                // donvinguoidung_id = get_meter_info[0].donvinguoidung_id
                donviquanly_id = get_meter_info[0].donviquanly_id
                meter_info.firmware_version =  get_meter_info[0].firmware_version
                meter_info.network_status =  get_meter_info[0].network_status
                meter_info.mode_power =  get_meter_info[0].mode_power
                meter_info.Qmax =  get_meter_info[0].Qmax
                meter_info.Qmin =  get_meter_info[0].Qmin
                meter_info.note =  get_meter_info[0].note
                meter_info.min_exploitation_rate = get_meter_info[0].min_exploitation_rate
                meter_info.max_exploitation_rate = get_meter_info[0].max_exploitation_rate
                meter_info.daily_exploitation_limit = get_meter_info[0].daily_exploitation_limit
                meter_info.min_threshold_terminal_index = get_meter_info[0].min_threshold_terminal_index
                meter_info.max_threshold_terminal_index = get_meter_info[0].max_threshold_terminal_index

            }

        //   if(donvinguoidung_id != null && donvinguoidung_id != "null"){
        //         parent_id = "dvnd"+donvinguoidung_id;
        //     }else{
        //         if(donviquanly_id != null && donviquanly_id != "null"){
        //             parent_id = "dvql"+donviquanly_id;
        //         }
        //     }
 

            let field_config_type_auto = 1;
            let data_field_config = { "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 };
            let data = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(data.length > 0){
                data_field_config = JSON.parse(data[0].config);
                field_config_type_auto = data[0].type_auto;
            }


            let rows = await access_db("SELECT * FROM alert_config WHERE ideq = ? AND serial_sensor = ?;",[MeterCode,NodeCode]);
            let grouped_alert_config = { "ValOfNum": [], "terminal_index": [], "flowRate": [], "pressure": [], "measure_sensor": [], "measure_static": [], "measure_dynamic": [], "measure_delta": [], "ValueReverse": [], "Voltage": [], "voltage_ac_quy": [], "PressureVol": [], "water_output_day": [], "water_output_month": [], "Temp": [] }
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
            let get_meter_cycle = await query(`SELECT * FROM "meter_cycle" WHERE "meter_code" = $1 AND "node_code" = $2;`, [MeterCode, NodeCode]);
            let meter_cycle = {
                meter_code: null,
                node_code: null,
                cycle_min: null,
                enabled: null,
                ip_ftp: null,
                user_ftp: null,
                pass_ftp: null,
                field_ftp: "LUULUONG",
                ma_cong_trinh: null,
                ma_tram: null,
                ma_tinh: null,
                origin_min: null,
                cycle_time: null
            }
            if (get_meter_cycle.length > 0) {
                meter_cycle = get_meter_cycle[0];
            }

            res.render('partials/setting_info',{
                access_menu: req.user.access_tab,
                role: req.user.role, meter_cycle,
                parent_role: req.user.parent_role,
                parent_id,parent_id_2,
                danhsachtram: danhsachtram,
                field_config_type_auto,
                grouped_alert_config,
                meter_info,
                MeterCode,
                NodeCode,
                data_field_config: data_field_config,
                donvinguoidung_id, donviquanly_id,
                t: req.__ 
            })
        }catch(error){
            console.log(error)
            console.error(error.stack)
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_save_meter_info: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let data_field_config = req.body.data_field_config;
            let location = req.body.location;
            let meter_name = req.body.meter_name;
            let type_auto = req.body.type_auto;
            let address = req.body.address;
            let note = req.body.note;
            let ma_tram = req.body.ma_tram;
            let ma_tinh = req.body.ma_tinh;
            let ma_cong_trinh = req.body.ma_cong_trinh;
            // let tram_id = req.body.tram_id;
            // let dv_type = req.body.dv_type;

            if(meter_name.trim() =="" || meter_name == null){
                res.json({
                    success: false,
                    message: "Tên trạm không được để trống!"
                })
                return;
            }

            let save_info = await access_db("UPDATE totaleq SET `name` = ?, location_lat=?, location_long=?, address=?, note=? WHERE MeterCode = ? AND NodeCode = ?;",[meter_name, location.lat, location.lng, address, note, MeterCode, NodeCode]);
            let get_cycle_meter = await query(`SELECT * FROM "meter_cycle" WHERE "meter_code" = $1 AND "node_code" = $2;`,[MeterCode, NodeCode]);
            if(get_cycle_meter.length > 0){
                await query(`UPDATE "meter_cycle" SET "ma_cong_trinh" = $1, "ma_tinh" = $2, "ma_tram" = $3 WHERE "meter_code" = $4 AND "node_code" = $5;`,[ma_cong_trinh, ma_tinh, ma_tram, MeterCode, NodeCode])
            }else{
                await query(`INSERT INTO "meter_cycle" (meter_code, node_code, enabled, cycle_min, ma_cong_trinh, ma_tram, ma_tinh) VALUES ($1, $2, $3, $4, $5, $6, $7);`,[MeterCode, NodeCode, false, 0, ma_cong_trinh, ma_tram, ma_tinh]);
            }
            let check_field_config = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode,NodeCode]);
            let insert_update_field = null; 
            if(check_field_config.length > 0){
                insert_update_field = await access_db("UPDATE data_field_config SET config = ?, updated_at = ?, type_auto=? WHERE MeterCode=? AND NodeCode = ?;",[JSON.stringify(data_field_config), new Date(), type_auto, MeterCode, NodeCode]);
            }else{
                insert_update_field = await access_db("INSERT INTO data_field_config (MeterCode, NodeCode, config, created_at, type_auto) VALUES(?,?,?,?,?);",[MeterCode, NodeCode, JSON.stringify(data_field_config), new Date(), type_auto])
            }
            
            if(save_info.affectedRows > 0 && insert_update_field.affectedRows > 0){
                let log = {
                    location_lat: location.lat,
                    location_lng: location.lng,
                    meter_name: meter_name,
                    address: address,
                    note: note,
                    ma_tram: ma_tram,
                    data_field_config: ""
                }
                let arr_field = [];
                for(const key in data_field_config){
                    if(data_field_config[key] == 1){
                        arr_field.push(shortToFullName(key))
                    }
                }
                log.data_field_config = arr_field.join(",");
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt thông tin điểm đo", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-thong-tin-diem-do", 1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
            // res.json({
            //     success: true,
            //     message: "Lưu thông tin không thành công"
            // })

        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_save_alert_config: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let field = req.body.field;
            let thresh_hold = JSON.parse(req.body.thresh_hold);
            let log = [];
            // if(field == "terminal_index"){
            //     await access_db("UPDATE totaleq SET Qmax = ?, Qmin = ? WHERE MeterCode = ? AND NodeCode = ?;",[req.body.Qmax, req.body.Qmin, MeterCode, NodeCode]);
            //     log.push({
            //         Qmax: req.body.Qmax,
            //         Qmin: req.body.Qmin
            //     })

            // }
            await access_db("DELETE FROM alert_config WHERE ideq = ? AND serial_sensor = ? AND config_type = ?;",[MeterCode, NodeCode, field]);
            if(thresh_hold.length > 0){
                let insert_data = [];
                for(let i=0; i<thresh_hold.length; i++){
                    insert_data.push([
                        thresh_hold[i].start,
                        thresh_hold[i].end,
                        thresh_hold[i].low,
                        thresh_hold[i].high,
                        new Date(),
                        MeterCode, 
                        field,
                        NodeCode,
                        new Date()
                    ]);
                    log.push(
                       {
                            start:  thresh_hold[i].start,
                            end:    thresh_hold[i].end,
                            low: thresh_hold[i].low,
                            high:  thresh_hold[i].high,
                            field: shortToFullName(field)
                        }
                    )
                }
                await access_db("INSERT INTO alert_config (start_time, end_time, min_value, max_value, updated_at, ideq, config_type, serial_sensor, created_at) VALUES ?;",[insert_data]);
                }
                if(log.length > 0){
                    await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt cảnh báo " +shortToFullName(field), JSON.stringify(log), new Date(), MeterCode, NodeCode, return_alert_alias(field), 1]);

                }

            res.json({
                success: true, message: "Cập nhật cài đặt cảnh báo thành công!"
            })

        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    save_water_output: async (req, res) => {
        try {
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let min_exploitation_rate = (req.body.min_exploitation_rate == '') ? null : req.body.min_exploitation_rate;
            let max_exploitation_rate = (req.body.max_exploitation_rate == '') ? null : req.body.max_exploitation_rate;
            let daily_exploitation_limit = (req.body.daily_exploitation_limit == '') ? null : req.body.daily_exploitation_limit;
            console.log(MeterCode, NodeCode, daily_exploitation_limit, max_exploitation_rate, min_exploitation_rate)

            // let water_output_year_min = (req.body.water_output_year_min == '') ? null : req.body.water_output_year_min;
            // let water_output_year_max = (req.body.water_output_year_max == '') ? null : req.body.water_output_year_max;
            try{
                // await access_db("DELETE FROM alert_config WHERE ideq = ? AND serial_sensor = ? AND config_type IN (?, ?);", [MeterCode, NodeCode, "water_output_month", "water_output_day"]);
                // if (!(water_output_day_min == null && water_output_day_max == null)) {
                //     await access_db("INSERT INTO alert_config (start_time, end_time, min_value, max_value, updated_by, ideq, config_type, serial_sensor, created_at) VALUES (?,?,?,?,?,?,?,?,?);", ["00:00:00", "23:59:59", water_output_day_min, water_output_day_max, req.user.user_name, MeterCode, "water_output_day", NodeCode, new Date()])
                // }
                // if (!(water_output_month_min == null && water_output_month_max == null)){
                //     await access_db("INSERT INTO alert_config (start_time, end_time, min_value, max_value, updated_by, ideq, config_type, serial_sensor, created_at) VALUES (?,?,?,?,?,?,?,?,?);",["00:00:00","23:59:59",water_output_month_min, water_output_month_max, req.user.user_name, MeterCode, "water_output_month", NodeCode, new Date()])
                // }
                // if (!(water_output_year_min == null && water_output_year_max == null)) {
                //     await access_db("INSERT INTO alert_config (start_time, end_time, min_value, max_value, updated_by, ideq, config_type, serial_sensor, created_at) VALUES (?,?,?,?,?,?,?,?,?);", ["00:00:00", "23:59:59", water_output_year_min, water_output_year_max, req.user.user_name, MeterCode, "water_output_year", NodeCode, new Date()])
                // }
                await access_db("UPDATE totaleq SET min_exploitation_rate = ?, max_exploitation_rate = ?, daily_exploitation_limit = ? WHERE MeterCode = ? AND NodeCode = ?;", [min_exploitation_rate, max_exploitation_rate, daily_exploitation_limit, MeterCode, NodeCode]);
                let log = {
                    min_exploitation_rate: min_exploitation_rate,
                    max_exploitation_rate: max_exploitation_rate,
                    daily_exploitation_limit: daily_exploitation_limit,
                    // water_output_year_min: water_output_year_min,
                    // water_output_year_max: water_output_year_max,

                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt cảnh báo sản lượng khai thác", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-canh-bao-san-luong-khai-thac", 1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }catch(err){
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
              
        } catch (error) {
            console.error('API setting error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    save_threshold_terminal_index: async (req, res) => {
        try {
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let min_threshold_terminal_index = (req.body.min_threshold_terminal_index == '') ? null : req.body.min_threshold_terminal_index;
            let max_threshold_terminal_index = (req.body.max_threshold_terminal_index == '') ? null : req.body.max_threshold_terminal_index;
            // let water_output_year_min = (req.body.water_output_year_min == '') ? null : req.body.water_output_year_min;
            // let water_output_year_max = (req.body.water_output_year_max == '') ? null : req.body.water_output_year_max;
            console.log(MeterCode, NodeCode, min_threshold_terminal_index, max_threshold_terminal_index)
            try {
   
                await access_db("UPDATE totaleq SET  min_threshold_terminal_index = ?, max_threshold_terminal_index = ? WHERE MeterCode = ? AND NodeCode = ?;", [min_threshold_terminal_index, max_threshold_terminal_index, MeterCode, NodeCode]);
                let log = {
                    max_threshold_terminal_index: max_threshold_terminal_index,
                    min_threshold_terminal_index: min_threshold_terminal_index,

                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt cảnh báo sản lượng khai thác", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-canh-bao-san-luong-khai-thac", 1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            } catch (err) {
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }

        } catch (error) {
            console.error('API setting error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    save_setting_conversion: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let show_bar_to_m = req.body.show_bar_to_m;
            let conver_factor = req.body.conver_factor;
            let compen_factor = req.body.compen_factor;
            if(conver_factor.trim() =="" || conver_factor == null){
                res.json({
                    success: false,
                    message: "Hệ số chuyển đổi không được để trống!"
                })
                return;
            }
            if(compen_factor.trim() =="" || compen_factor == null){
                res.json({
                    success: false,
                    message: "Hệ số bù không được để trống!"
                })
                return;
            }
            let save_info = await access_db("UPDATE totaleq SET bar_to_met = ?, conver_factor=?, compen_factor=? WHERE MeterCode = ? AND NodeCode = ?;",[show_bar_to_m, conver_factor, compen_factor, MeterCode, NodeCode]);
            if(save_info.affectedRows > 0 ){
                let log = {
                    show_bar_to_m: (show_bar_to_m == 1) ? "Có" : "Không",
                    conver_factor: conver_factor,
                    compen_factor: compen_factor
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt điểm đo - chuyển đổi áp suất", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-chuyen-doi-ap-suat", 1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }

        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    save_alert_voltage: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode; 
            let threshold_pin = (req.body.threshold_pin == "") ? null : req.body.threshold_pin
            let threshold_battery = (req.body.threshold_battery == "") ? null : req.body.threshold_battery;
            let save_info = await access_db("UPDATE totaleq SET threshold_pin = ?, threshold_battery = ? WHERE MeterCode = ? AND NodeCode = ?;",[ threshold_pin, threshold_battery, MeterCode, NodeCode]);
            if(save_info.affectedRows > 0 ){
                let log = {
                    threshold_pin: threshold_pin,
                    threshold_battery: threshold_battery
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt cảnh báo điện áp pin, ác quy", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-canh-bao-dien-ap-pin-ac-quy",1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    save_multiplier_first_index: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode; 
            let multiplier = (req.body.multiplier == "") ? null : req.body.multiplier;
            let first_index = (req.body.first_index == "") ? null : req.body.first_index;
            let save_info = await access_db("UPDATE totaleq SET multiplier = ?, first_index=? WHERE MeterCode = ? AND NodeCode = ?;",[multiplier, first_index, MeterCode, NodeCode]);
            if(save_info.affectedRows > 0 ){
                let log = {
                    multiplier: multiplier,
                    first_index: first_index
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt điểm đo - cấu hình động xung", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-cau-hinh-dong-xung",1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    save_compen_value_conver_value: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode; 
            let compen_value = (req.body.compen_value == "") ? null : req.body.compen_value;
            let conver_value = (req.body.conver_value == "") ? null : req.body.conver_value;
            let tank_base_bottom = (req.body.tank_base_bottom == "") ? null : req.body.tank_base_bottom;

            let save_info = await access_db("UPDATE totaleq SET compen_value=?, conver_value = ?, tank_base_bottom = ? WHERE MeterCode = ? AND NodeCode = ?;", [compen_value, conver_value, tank_base_bottom, MeterCode, NodeCode]);
            if(save_info.affectedRows > 0 ){
                let log = {
                    compen_value: compen_value,
                    conver_value: conver_value,
                    tank_base_bottom: tank_base_bottom
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt điểm đo - cấu hình mực nước", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-cau-hinh-muc-nuoc",1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    save_pressure_config: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode; 
            let X1 = (req.body.X1 == "") ? null : req.body.X1;
            let X2 = (req.body.X2 == "") ? null : req.body.X2;
            let UX = (req.body.UX == "") ? null : req.body.UX;
            let Y1 = (req.body.Y1 == "") ? null : req.body.Y1;
            let Y2 = (req.body.Y2 == "") ? null : req.body.Y2;
            let UY = (req.body.UY == "") ? null : req.body.UY;
            let Om = (req.body.Om == "") ? null : req.body.Om;
            let config_pressure_measure = (req.body.config_pressure_measure == "") ? null : req.body.config_pressure_measure;
            let save_info = await access_db("UPDATE totaleq SET X1 = ?, X2 = ?, UX = ?, Y1 = ?, Y2 = ?, UY = ?, Om = ? WHERE MeterCode = ? AND NodeCode = ?;",[X1, X2, UX, Y1, Y2, UY, Om, MeterCode, NodeCode]);
            if(save_info.affectedRows > 0 ){
                let log = {
                    in: X1 + "-" + X2 + " ("+ UX + ")",
                    out:  Y1 + "-" + Y2 + " ("+ UY + ")",
                    Om: Om
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt điểm đo - cấu hình cổng đo áp suất", JSON.stringify(log), new Date(), MeterCode, NodeCode, "cai-dat-cau-hinh-cong-do-ap-suat", 1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    collection_channel_device: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode; 
            let collection_channel_device = req.body.collection_channel_device;
            let save_info = await access_db("UPDATE totaleq SET collection_channel_device = ? WHERE MeterCode = ? AND NodeCode = ?;",[collection_channel_device, MeterCode, NodeCode]);
            if(save_info.affectedRows > 0 ){
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);",[req.user.user_name, "Cài đặt thông tin điểm đo", (collection_channel_device == 1) ? "Bật kênh thiết bị thu thập" : "Tắt kênh thiết bị thu thập" , new Date(), MeterCode, NodeCode, "cai-dat-kenh-thiet-bi-thu-thap", 1]);
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    delete_meter_acc: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            // let delete_org_groups = await access_db("DELETE t1 FROM org_groups t1 INNER JOIN organizations t2 ON t1.org_id = t2.id INNER JOIN organizations t3 ON t2.parent_id = t3.id INNER JOIN user_donviquanly t4 ON t3.id = t4.donviquanly_id WHERE t4.user_id = ? AND t1.MeterCode = ? AND t1.NodeCode = ?;",[req.user.id, MeterCode, NodeCode]);

            let delete_org_groups = await access_db("SELECT t1.org_id FROM org_groups t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_donviquanly t3 ON t2.parent_id = t3.donviquanly_id LEFT JOIN organizations t4 ON t1.org_id = t4.id WHERE t3.user_id = ? AND t1.MeterCode = ? AND t1.NodeCode = ? AND t4.created_by = ?;", [req.user.id, MeterCode, NodeCode, req.user.id]);
            if(delete_org_groups.length > 0){
                for (let i = 0; i < delete_org_groups.length; i++){
                    await access_db("DELETE FROM org_groups WHERE MeterCode = ? AND NodeCode = ? AND org_id = ?;", [MeterCode, NodeCode, delete_org_groups[i].org_id]);
                    await query(`DELETE FROM "org_groups" WHERE "MeterCode" = $1 AND "NodeCode" = $2 AND "org_id" = $3;`, [MeterCode, NodeCode, delete_org_groups[i].org_id]);
                }

            }

            let delete_org_managers = await access_db("DELETE t1 FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id WHERE t2.user_id = ? AND t1.MeterCode = ? AND t1.NodeCode = ?;",[req.user.id, MeterCode, NodeCode]);


            if(delete_org_managers.affectedRows > 0){
                let log = {
                    action: "Xóa thiết bị khỏi tài khoản"
                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Phân quyền thiết bị", JSON.stringify(log), new Date(), MeterCode, NodeCode, "phan-quyen-thiet-bi", 3]);

                res.json({
                    success: true,
                    message: "Xóa thiết bị thành công"
                })
            }else{
                res.json({
                    success: false,
                    message: "Xóa thiết bị không thành công"
                })
            }
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_log_user: async (req,res) => {
        try{
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let start_date = req.query.start_date;
            let end_date = req.query.end_date;
            let data = await access_db("SELECT * FROM log_user WHERE MeterCode = ? AND NodeCode = ? AND time <= ? AND time >= ? ORDER BY time DESC;",[MeterCode,NodeCode, end_date, start_date]);
            // console.log(MeterCode, NodeCode, data)
            res.json({data});
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_delete_meter_data: async (req,res) => {
        try{
            let secret_role = req.user.parent_role;
            if(secret_role != 0){
                return res.json({
                    success: false,
                    message: "Bạn không có quyền truy cập api này"
                })
            }
            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
            let start_date = req.query.start_date;
            let end_date = req.query.end_date;
            let data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime";`,[NodeCode, MeterCode, start_date, end_date]);
            let data_field_config;
            let get_data_field = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[MeterCode, NodeCode]);
            if(get_data_field.length > 0){
            data_field_config= get_data_field[0].config
            }else{
                data_field_config = '{"ValOfNum":1,"terminal_index":1,"flowRate":1,"pressure":1,"measure_sensor":1,"measure_static":1,"measure_dynamic":1,"measure_delta":1,"ValueReverse":1,"ValueForward":1,"Voltage":1,"voltage_ac_quy":1,"PressureVol":1,"VoltageOfMeter":1, "Temp": 1}'
            }
            res.json({
                data,
                data_field_config
            })
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_delete_OP_data: async (req,res) => {
        try{
            let secret_role = req.user.parent_role;
            if(secret_role != 0){
                return res.json({
                    success: false,
                    message: "Bạn không có quyền truy cập api này"
                })
            }
            console.log(req.body.idkey)
            await access_db("DELETE FROM Operation WHERE id = ?;",[req.body.idkey]);
            await query(`DELETE FROM "Operation" WHERE "id" = $1;`,[req.body.idkey]);

            let log = {
                action: "Xóa bản tin",
                idkey: req.body.idkey
            }
            await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Xóa bản tin", JSON.stringify(log), new Date(), "-", "-", "xoa-ban-tin", 3]);

            res.json({
                success: true,
                message: "Xóa bản tin thành công"
            })

        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    post_save_meter_cycle: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let ip_ftp = req.body.ip_ftp ;
            let field_ftp = req.body.field_ftp;
            let cycle_min = req.body.cycle_min;
            let cycle_time = (req.body.cycle_time == '') ? null : req.body.cycle_time;
            let user_ftp = req.body.user_ftp;
            let pass_ftp = req.body.pass_ftp;
            let enabled = req.body.sync_tnmt_data;
            if (cycle_min == '' || cycle_min == null){
                return res.json({
                    success: false,
                    message: "Không được để trống chu kỳ gửi"
                })
            }
            if (ip_ftp == '' || ip_ftp == null) {
                return res.json({
                    success: false,
                    message: "Không được để trống đường dẫn ftp"
                })
            }
            let origin_min = 0;
            if(cycle_time){
                let [hours, minutes] = cycle_time.split(":").map(Number);
                origin_min = hours * 60 + minutes;
            }
            let get_meter_cycle = await query(`SELECT * FROM "meter_cycle" WHERE "meter_code" = $1 AND "node_code" = $2;`, [MeterCode, NodeCode]);
            if(get_meter_cycle.length > 0){
                await query(`UPDATE "meter_cycle" SET "ip_ftp" = $1, "field_ftp" = $2, "cycle_min" = $3, "cycle_time" = $4::time, "origin_min" = $5, "user_ftp" = $6, "pass_ftp" = $7, "enabled" = $8 WHERE "meter_code" = $9 AND "node_code" = $10;`, [ip_ftp, field_ftp, cycle_min, cycle_time, origin_min, user_ftp, pass_ftp, enabled, MeterCode, NodeCode])

            }else{
                await query(`INSERT INTO "meter_cycle" (meter_code, node_code, field_ftp, cycle_min, ip_ftp, user_ftp, pass_ftp, enabled, cycle_time, origin_min) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::time, $10);`, [MeterCode, NodeCode, field_ftp, cycle_min, ip_ftp, user_ftp, pass_ftp, enabled, cycle_time, origin_min]);

            }
            let log = {
                action: "Đồng bộ dữ liệu tại nguyên môi trường",
                ip_ftp: ip_ftp,
                field_ftp: field_ftp,
                cycle_min: cycle_min,
                cycle_time: cycle_time,
                user_ftp: user_ftp,
                enabled: enabled
            }
            await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type) VALUES (?,?,?,?,?,?,?,?);", [req.user.user_name, "Đồng bộ dữ liệu tại nguyên môi trường", JSON.stringify(log), new Date(), MeterCode, NodeCode, "dong-bo-tai-nguyen-moi-truong", 1]);

            res.json({
                success: true,
                message: "Lưu thông tin thành công"
            })
        }catch(error){
            console.error('API setting error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
            // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API setting error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = setting_controller;