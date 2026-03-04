const { access_db, query } = require("../config/mysql_config");
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
            let danh_sach_thiet_bị = [];
            let danh_sach_xi_nghiep_nha_may = [];
            let meter_type = null;
            let meter_alert = {
                min_nhietdo: null,
                max_nhietdo: null,
                min_ph: null,
                max_ph: null,
                min_doduc: null,
                max_doduc: null,
                min_clodu: null,
                max_clodu: null,
                min_mucnuoc: null,
                max_mucnuoc: null,
                min_EC: null,
                max_EC: null,
                min_docung: null,
                max_docung: null,
                min_doman: null,
                max_doman: null
            }
            danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t5.meter_status AS status_meter FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ?;", [req.user.id]);

            danh_sach_xi_nghiep_nha_may = await access_db("SELECT t1.org_id, t2.org_name AS name, t1.parent_id AS parent_id, t3.org_name AS parent_name FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN organizations t3 ON t1.parent_id = t3.id INNER JOIN user_org t4 ON t1.org_id = t4.org_id OR t1.parent_id = t4.org_id WHERE t4 .user_id = ? ORDER BY t1.order_by;", [req.user.id]);

            let meter_info =  {
                name: null,
                lat: null,
                lng: null,
                type: null,
                serial_sim: null,
                address: null
            }
     
            let MeterCode = null;
            res.render('layouts/setting',{
                danh_sach_thiet_bị, danh_sach_xi_nghiep_nha_may, meter_info, MeterCode, meter_type, meter_alert,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/setting",
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

    get_danhsachthietbi: async (req,res) => {
            try{
                let org_id = req.query.org_id;
                let danh_sach_thiet_bị = [];
                let type = req.query.type;
                if (type == "all") {
                    danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ?;", [req.user.id]);

                } else if (type == "xi_nghiep") {
                    danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t2.parent_id = ?;", [req.user.id, org_id]);

                } else {
                    danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t2.org_id = ?;", [req.user.id, org_id]);

                }

                res.json({
                    success: true,
                    danh_sach_thiet_bị
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
    get_meter_info: async (req,res) => {
        try{
            let MeterCode = req.query.MeterCode;
            let meter_type = null;
            let meter_info =  {
                name: null,
                lat: null,
                lng: null,
                meter_type: null,
                serial_sim: null,
            }
            let meter_alert = {
                min_nhietdo: null,
                max_nhietdo: null,
                min_ph:  null,
                max_ph: null,
                min_doduc: null,
                max_doduc: null,
                min_clodu: null,
                max_clodu: null,
                min_mucnuoc: null,
                max_mucnuoc: null,
                min_EC: null,
                max_EC: null,
                min_docung: null,
                max_docung: null,
                min_doman: null,
                max_doman: null
            }
            let get_meter_info = await access_db("SELECT * FROM meters t1 LEFT JOIN view_totaleq t2 ON t1.meter_serial = t2.MeterCode WHERE t1.meter_serial = ?;",[MeterCode]);
            if (get_meter_info.length > 0){
                meter_info.name = get_meter_info[0].name;
                meter_info.lat = get_meter_info[0].lat;
                meter_info.lng = get_meter_info[0].lng;
                meter_type = get_meter_info[0].meter_type;

                switch (meter_type){
                    case "MUCNUOC": 
                        meter_info.meter_type = "Thiết bị đo mực nước";
                        meter_alert.min_mucnuoc = get_meter_info[0].min_mucnuoc;
                        meter_alert.max_mucnuoc = get_meter_info[0].max_mucnuoc;
                        break;
                    case "CSMT":
                        meter_info.meter_type = "Thiết bị đo chỉ số môi trường";
                        meter_alert.min_nhietdo = get_meter_info[0].min_nhietdo;
                        meter_alert.max_nhietdo = get_meter_info[0].max_nhietdo;
                        meter_alert.min_ph = get_meter_info[0].min_ph;
                        meter_alert.max_ph = get_meter_info[0].max_ph;
                        meter_alert.min_doduc = get_meter_info[0].min_doduc;
                        meter_alert.max_doduc = get_meter_info[0].max_doduc;
                        meter_alert.min_clodu = get_meter_info[0].min_clodu;
                        meter_alert.max_clodu = get_meter_info[0].max_clodu;
                        meter_alert.min_EC = get_meter_info[0].min_EC;
                        meter_alert.max_EC = get_meter_info[0].max_EC;
                        meter_alert.min_docung = get_meter_info[0].min_docung;
                        meter_alert.max_docung = get_meter_info[0].max_docung;
                        meter_alert.min_doman = get_meter_info[0].min_doman;
                        meter_alert.max_doman = get_meter_info[0].max_doman;
                        break;
                    case "DONGHO":
                        meter_info.meter_type = "Máy bơm";
                        break;
                    case "GENERATOR":
                        meter_info.meter_type = "Máy phát điện";
                        break;
                }
            }

            res.render('partials/setting_info',{
                role: req.user.role,
                MeterCode, meter_info, meter_type, meter_alert,
                t: req.__ 
            })
        }catch(error){
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
            let meter_type = req.body.meter_type;
            let location = req.body.location;
            let meter_name = req.body.meter_name;
            if(meter_name.trim() =="" || meter_name == null){
                res.json({
                    success: false,
                    message: "Tên trạm không được để trống!"
                })
                return;
            }

            let save_info = await access_db("UPDATE meters SET lat = ?, lng=? WHERE meter_serial = ?",[location.lat, location.lng, MeterCode]);
            let save_db;
            switch(meter_type){
                case "MUCNUOC":
                    save_db = await access_db("UPDATE web_water_ver2.totaleq SET name = ?, location_lat = ?, location_long = ? WHERE MeterCode = ?;", [meter_name, location.lat, location.lng, MeterCode]);
                    break;
                case "CSMT":
                    save_db = await access_db("UPDATE web_environment.totaleq SET name = ?, location_lat = ?, location_long = ? WHERE MeterCode = ?;", [meter_name, location.lat, location.lng, MeterCode]);
                    break;
                case "DONGHO": 
                    save_db = await access_db("UPDATE web_environment.totaleq SET name = ?, location_lat = ?, location_long = ? WHERE MeterCode = ?;", [meter_name, location.lat, location.lng, MeterCode]);
                    break;
                case "GENERATOR":
                    save_db = await access_db("UPDATE measurement_point SET point_name = ? WHERE point_code = ?;", [meter_name, MeterCode]);
                    break;
            }
            if (save_info.affectedRows > 0 && save_db.affectedRows > 0){
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

    save_meter_alert: async (req, res) => {
        try {
            let MeterCode = req.body.MeterCode;
            let meter_type = req.body.meter_type;

            let min_doduc = req.body.min_doduc;
            let max_doduc = req.body.max_doduc;
            let min_ph = req.body.min_ph;
            let max_ph = req.body.max_ph;
            let min_nhietdo = req.body.min_nhietdo;
            let max_nhietdo = req.body.max_nhietdo;
            let min_clodu = req.body.min_clodu;
            let max_clodu = req.body.max_clodu;
            let min_EC = req.body.min_EC;
            let max_EC = req.body.max_EC;
            let min_docung = req.body.min_docung;
            let max_docung = req.body.max_docung;
            let min_doman = req.body.min_doman;
            let max_doman = req.body.max_doman;
            let min_mucnuoc = req.body.min_mucnuoc;
            let max_mucnuoc = req.body.max_mucnuoc;

            let save_db;
            switch (meter_type) {
                case "MUCNUOC":
                    save_db = await access_db("UPDATE meters SET min_mucnuoc =?, max_mucnuoc = ? WHERE meter_serial = ?;", [min_mucnuoc, max_mucnuoc, MeterCode]);
                    break;
                case "CSMT":
                    save_db = await access_db("UPDATE meters SET min_doduc =?, max_doduc = ?, min_ph =?, max_ph = ?, min_nhietdo =?, max_nhietdo = ?, min_clodu =?, max_clodu = ?, min_EC =?, max_EC = ?, min_docung =?, max_docung = ?, min_doman =?, max_doman = ? WHERE meter_serial = ?;", [min_doduc, max_doduc, min_ph, max_ph, min_nhietdo, max_nhietdo, min_clodu, max_clodu, min_EC, max_EC, min_docung, max_docung, min_doman, max_doman, MeterCode]);
                    break;
            }
            if (save_db.affectedRows > 0) {
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
            } else {
                res.json({
                    success: false,
                    message: "Lưu thông tin không thành công"
                })
            }
            // res.json({
            //     success: true,
            //     message: "Lưu thông tin không thành công"
            // })

        } catch (error) {
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