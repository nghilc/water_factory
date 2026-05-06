const { access_db, query } = require("../config/mysql_config");
const export_muc_nuoc_meter_data_func = require("../config/wt_export_meter_data")
const export_dien_ap_luoi_func = require("../config/export_dien_ap_luoi")
const export_dien_ap_ra_pha_func = require("../config/export_dien_ap_ra_pha")
const export_dien_ap_ra_day_func = require("../config/export_dien_ap_ra_day")
var pad = function (num) { return ('00' + num).slice(-2) };
function returnSQLDateFormat(dateObj) {
    if (dateObj == "" || dateObj == null) return "-";
    let date = new Date(dateObj);
    let x = date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds());
    return x;
}

function return_tt(status, value, min, max) {
    if (status == 0) return 0;
    if (value != null && min != null && value < min) return 2;
    if (value != null && max != null && value > max) return 2;
    return 1;

}
function return_date_format_ddmmyyhhmmss(dateObj) {
    if (dateObj == "" || dateObj == null) return "-";
    let date = new Date(dateObj);
    let x = pad(date.getDate()) + '-' +
        pad(date.getMonth() + 1) + '-' + '20' +
        pad(date.getFullYear()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds());
    return x;
}
const overview_controller = {
    show_monitoring: async (req,res) => {
        try{
            let danh_sach_thiet_bị = [];
            let danh_sach_xi_nghiep_nha_may = [];
            let danh_sach_nha_may = [];
            let org_id = null;
            if(req.query.MeterCode){
                let get_org_id = await access_db("SELECT org_id FROM org_managers WHERE MeterCode = ?;",[req.query.MeterCode]);
                if(get_org_id.length == 1){
                    org_id = get_org_id[0].org_id
                }
            }
            danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t4.device_type = t5.device_type;", [req.user.id]);

            danh_sach_xi_nghiep_nha_may = await access_db("SELECT t1.org_id, t2.org_name AS name, t1.parent_id AS parent_id, t3.org_name AS parent_name FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN organizations t3 ON t1.parent_id = t3.id INNER JOIN user_org t4 ON t1.org_id = t4.org_id OR t1.parent_id = t4.org_id WHERE t4 .user_id = ? ORDER BY t1.order_by;", [req.user.id]);

            danh_sach_nha_may = await access_db("SELECT DISTINCT *, t1.org_id AS id_nha_may FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t3.id = t1.org_id WHERE t2.user_id = ?;", [req.user.id]);
            res.render('layouts/monitoring',{
                danh_sach_thiet_bị, danh_sach_xi_nghiep_nha_may, danh_sach_nha_may, 
                org_id: JSON.stringify(org_id),
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/monitoring",
                t: req.__ 
            })
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_pages: async (req,res) => {
        try{
            let pages = req.query.pages;
            let org_id = req.query.org_id;
            if (req.query.org_id){
                req.session.factory_id = org_id;
            }
            switch(pages){
                case "all":
                    var danh_sach_xi_nghiep_nha_may = await access_db("SELECT t1.org_id, t2.org_name AS name, t1.parent_id AS parent_id, t3.org_name AS parent_name FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN organizations t3 ON t1.parent_id = t3.id INNER JOIN user_org t4 ON t1.org_id = t4.org_id OR t1.parent_id = t4.org_id WHERE t4 .user_id = ? ORDER BY t1.order_by;", [req.user.id]);
                    return res.render('partials/danh_sach_xi_nghiep', { danh_sach_xi_nghiep_nha_may })

                case "tong-quan":
                    return res.render('partials/tong_quan',{})
                case "muc-nuoc":
                    var danhsachtram = await access_db("SELECT t1.MeterCode AS id, t3.name AS name, '' AS location, t3.status AS status, t3.last_data_time AS last_data_time, t3.last_measure_sensor AS wt_level, t3.last_DoDuc AS turbidity, last_PH AS ph FROM org_managers t1 LEFT JOIN meters t2 ON t1.MeterCode = t2.meter_serial LEFT JOIN view_totaleq t3 ON t1.MeterCode = t3.MeterCode WHERE t1.org_id = ? AND t2.meter_type = ? AND t2.device_type = t3.device_type;", [org_id, "MUCNUOC"])
                    return res.render('partials/muc_nuoc', { danhsachtram })
                case "to-bom":
                    let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE m.meter_type = 'DONGHO' AND mpm.org_id = ? AND m.device_type = vm.device_type", [org_id]);
                    return res.render('partials/to_bom', {
                        pumps: result,
                    })
                case "chi-so-moi-truong":
                    return res.render('partials/chi_so_moi_truong', {})
                case "may-phat-dien":
                    // let may_phat_dien = await access_db("SELECT vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE m.meter_type = 'GENERATOR' AND mpm.org_id = ? AND m.device_type = vm.device_type", [org_id]);
                    // console.log(may_phat_dien)

                    let may_phat_dien = await access_db("SELECT t3.MeterCode AS MeterCode_, t6.*, t4.name, CASE WHEN timestampdiff(SECOND, t6.dcu_time, NOW()) < 1620 THEN 1 ELSE 0 END point_status  FROM measurement_point t1 INNER JOIN dcu t2 ON t1.dcu_id = t2.dcu_id INNER JOIN org_managers t3 ON t2.dcu_code = t3.MeterCode LEFT JOIN view_totaleq t4  ON t1.point_code = t4.MeterCode LEFT JOIN meters t5 ON t5.meter_serial = t3.MeterCode LEFT JOIN instant t6 ON t1.point_id = t6.point_id WHERE t5.meter_type = 'GENERATOR' AND t3.org_id = ? AND t5.device_type = t4.device_type;", [org_id])
                    return res.render('partials/may_phat_dien', {
                        may_phat_dien: may_phat_dien,
                        may_phat_dien1: JSON.stringify(may_phat_dien),

                    })


            }
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_tong_quan: async (req, res) => {
        try {
            let result = await access_db("SELECT m.*, (vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE mpm.org_id = ? AND m.device_type = vm.device_type", [req.session.factory_id]);
            let may_phat_dien = await access_db("SELECT t3.MeterCode AS MeterCode_, t6.*, t4.name, CASE WHEN timestampdiff(SECOND, t6.dcu_time, NOW()) < 1620 THEN 1 ELSE 0 END point_status  FROM measurement_point t1 INNER JOIN dcu t2 ON t1.dcu_id = t2.dcu_id INNER JOIN org_managers t3 ON t2.dcu_code = t3.MeterCode LEFT JOIN view_totaleq t4  ON t1.point_code = t4.MeterCode LEFT JOIN meters t5 ON t5.meter_serial = t3.MeterCode LEFT JOIN instant t6 ON t1.point_id = t6.point_id WHERE t5.meter_type = 'GENERATOR' AND t3.org_id = ? AND t5.device_type = t4.device_type;", [req.session.factory_id])
            let config_wmco = await access_db("SELECT * FROM config_wmco", []);
            res.json({
                success: true,
                data: result,
                may_phat_dien,
                config_wmco: config_wmco,
            })

        } catch (error) {
            console.error('API dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_muc_nuoc: async (req,res) => {
        try{
            if (!req.session.factory_id) {
                let factories = await access_db("SELECT t3.*, t3.id AS factory_id FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ?;", [req.user.id]);
                if (factories.length > 0) {
                    req.session.factory_id = factories[0].factory_id
                } else {
                    req.session.factory_id = null;
                }
            }

            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE mpm.org_id = ? AND m.device_type = vm.device_type", [req.session.factory_id]);

            res.json({
                data: result
            })
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_muc_nuoc_data: async (req,res) => {
        try{
            const meter_code = req.query.METERCODE;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
            let result = await query(`SELECT "MeterTime" as "time", "measure_sensor", "measure_dynamic" FROM "Operation" WHERE "MeterCode" = $1 AND "MeterTime" >= $2 AND "MeterTime" <= $3 ORDER BY "MeterTime"`, [meter_code, start_date, end_date]);
          
            res.json({
                message: true,
                data: result
            })
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_muc_nuoc_threshold_setting: async (req,res) => {
        try{
            var result = await access_db("SELECT t1.MeterCode AS MeterCode_, t3.name AS name, t4.* FROM org_managers t1 LEFT JOIN meters t2 ON t1.MeterCode = t2.meter_serial LEFT JOIN view_totaleq t3 ON t1.MeterCode = t3.MeterCode LEFT JOIN config_wmsv t4 ON t1.MeterCode = t4.MeterCode WHERE t1.org_id = ? AND t2.meter_type = ? AND t2.device_type = t3.device_type;", [req.session.factory_id, "MUCNUOC"]);
            res.json({
                data: result
            })
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_muc_nuoc_save_threshold: async (req,res) => {
        try{
            let data = req.body;
            let val = [];
            val_insert = [];
            for (let i = 0; i < data.length; i++) {
                val.push(data[i].metercode);
                val_insert.push([data[i].metercode, (data[i].lower_threshold == "") ? null : data[i].lower_threshold, (data[i].upper_threshold == "") ? null : data[i].upper_threshold, new Date()]);
            }
            await access_db("DELETE FROM config_wmsv WHERE MeterCode IN (?);", val);
            await access_db("INSERT INTO config_wmsv (MeterCode, lower_threshold, upper_threshold, created_at) VALUES ?;", [val_insert])
            res.json({
                success: true
            })
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_to_bom: async (req,res) => {
        try{
            if (!req.session.factory_id) {
                let factories = await access_db("SELECT t3.*, t3.id AS factory_id FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ?;", [req.user.id]);
                if (factories.length > 0) {
                    req.session.factory_id = factories[0].factory_id
                } else {
                    req.session.factory_id = null;
                }
            }
            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE mpm.org_id = ? AND m.device_type = vm.device_type", [req.session.factory_id]);
            res.json({
                data: result
            })
        }catch(error){
            console.error('API Monitoring error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_to_bom_data: async (req, res) => {
        try {
            const meter_code = req.query.METERCODE;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
            let result = await query(`SELECT "MeterTime" as "time", "flowRate", "pressure" FROM "Operation" WHERE "MeterCode" = $1 AND "MeterTime" >= $2 AND "MeterTime" <= $3 ORDER BY "MeterTime"`, [meter_code, start_date, end_date]);
            res.json({
                message: true,
                data: result
            })
        } catch (error) {
            console.error('API setting error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_chi_so_moi_truong: async (req, res) => {
        try {
            if (!req.session.factory_id) {
                let factories = await access_db("SELECT t3.*, t3.id AS factory_id FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ?;", [req.user.id]);
                if (factories.length > 0) {
                    req.session.factory_id = factories[0].factory_id
                } else {
                    req.session.factory_id = null;
                }
            }

            // let config = await access_db("SELECT * FROM config_wmco", []);
            let result = await access_db("SELECT m.*, (vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE meter_type = 'CSMT' AND mpm.org_id = ? AND m.device_type = vm.device_type", [req.session.factory_id]);
            let general = {
                chat_luong_nuoc_tho: "",
                chi_so_on_dinh: "",
                chat_luong_nuoc_sach: "",
                chi_so_dat_chuan: "",
                thoi_gian: returnSQLDateFormat(new Date()),
                trang_thai: "",
                he_thong_giam_sat: 2
            }
            let nuoc_tho = [];
            let nuoc_sach = [];
            if (result.length > 0) {
                result.forEach(element => {
                    if (element.data_type == 1) {
                        nuoc_tho.push({
                            name: element.name,
                            last_data_time: returnSQLDateFormat(element.last_data_time),
                            meter_code: element.MeterCode,
                            do_duc: element.last_DoDuc,
                            tt_do_duc: return_tt(element.status, element.last_DoDuc, element.min_doduc, element.max_doduc),
                            ph: element.last_PH,
                            tt_ph: return_tt(element.status, element.last_PH, element.min_ph, element.max_ph),
                            nhiet_do: element.last_Temp,
                            tt_nhiet_do: return_tt(element.status, element.last_Temp, element.min_nhietdo, element.max_nhietdo),
                            do_cung: null,
                            tt_do_cung: 1
                        })
                    } else if (element.data_type == 2) {
                        nuoc_sach.push({
                            name: element.name,
                            last_data_time: returnSQLDateFormat(element.last_data_time),
                            nhiet_do: element.last_Temp,
                            meter_code: element.MeterCode,
                            tt_nhiet_do: return_tt(element.status, element.last_Temp, element.min_nhietdo, element.max_nhietdo),
                            ph: element.last_PH,
                            tt_ph: return_tt(element.status, element.last_PH, element.min_ph, element.max_ph),
                            do_man: null,
                            tt_do_man: 1,
                            clo_du: element.last_CloDu,
                            tt_clo_du: return_tt(element.status, element.last_CloDu, element.min_clodu, element.max_clodu),
                            do_duc: element.last_DoDuc,
                            tt_do_duc: return_tt(element.status, element.last_DoDuc, element.min_doduc, element.max_doduc),
                            EC: null,
                            tt_EC: 1
                        })
                    }
                });
            } else {
                chat_luong_nuoc_tho = null;
                chat_luong_nuoc_sach = null;
            }

            general = {
                thoi_gian: returnSQLDateFormat(new Date()),
                he_thong_giam_sat: nuoc_tho.length + nuoc_sach.length
            }
            res.json({
                message: true,
                general: general,
                nuoc_tho: nuoc_tho,
                nuoc_sach: nuoc_sach,
            })
        } catch (error) {
            console.error('API Monitoring error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    export_muc_nuoc_meter_data: (req, res) => {
        try {
            export_muc_nuoc_meter_data_func(req, res);
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_may_phat_dien_data: async (req, res) => {
        try {
            let MeterCode = req.query.MeterCode;
            let start_date = req.query.start_date;
            let end_date = req.query.end_date;
            let result = await access_db("SELECT * FROM operations WHERE meter_serial = ? AND server_time >= ? AND server_time <= ? ORDER BY server_time DESC;", [MeterCode, start_date, end_date]);

            res.json({
                success: true,
                data: result
            })
        } catch (error) {

        }
    },
    export_may_phat_dien: async (req, res) => {
        try {
            if (req.query.type) {
                let type = req.query.type;
                switch (type) {
                    case "dien_ap_luoi_btn":
                        export_dien_ap_luoi_func(req, res);
                        break;
                    case "dien_ap_ra_pha_btn":
                        export_dien_ap_ra_pha_func(req, res);
                        break;
                    case "dien_ap_ra_day_btn":
                        export_dien_ap_ra_day_func(req, res);
                        break;
                    default:
                        return res.json({
                            success: false,
                            message: "Lỗi export API server"
                        })
                }
            } else {
                res.json({
                    success: false,
                    message: "Lỗi export API server"
                })
            }


        } catch (error) {

        }
    },
    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API Monitoring error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = overview_controller;