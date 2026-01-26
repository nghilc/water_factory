const { access_db, query } = require("../config/mysql_config");
const export_muc_nuoc_meter_data_func = require("../config/wt_export_meter_data")
const export_dien_ap_luoi_func = require("../config/export_dien_ap_luoi")
const export_dien_ap_ra_pha_func = require("../config/export_dien_ap_ra_pha")
const export_dien_ap_ra_day_func = require("../config/export_dien_ap_ra_day")
const overview_controller = {
    show_monitoring: async (req,res) => {
        try{
            let danh_sach_thiet_bị = [];
            let danh_sach_xi_nghiep_nha_may = [];
            let danh_sach_nha_may = [];

            danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ?;", [req.user.id]);

            danh_sach_xi_nghiep_nha_may = await access_db("SELECT t1.org_id, t2.org_name AS name, t1.parent_id AS parent_id, t3.org_name AS parent_name FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN organizations t3 ON t1.parent_id = t3.id INNER JOIN user_org t4 ON t1.org_id = t4.org_id OR t1.parent_id = t4.org_id WHERE t4 .user_id = ? ORDER BY t1.order_by;", [req.user.id]);

            danh_sach_nha_may = await access_db("SELECT DISTINCT *, t1.org_id AS id_nha_may FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t3.id = t1.org_id WHERE t2.user_id = ?;", [req.user.id]);

            res.render('layouts/monitoring',{
                danh_sach_thiet_bị, danh_sach_xi_nghiep_nha_may, danh_sach_nha_may,
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
                    var danhsachtram = await access_db("SELECT t1.MeterCode AS id, t3.name AS name, '' AS location, t3.status AS status, t3.last_data_time AS last_data_time, t3.last_measure_sensor AS wt_level, t3.last_DoDuc AS turbidity, last_PH AS ph FROM org_managers t1 LEFT JOIN meters t2 ON t1.MeterCode = t2.meter_serial LEFT JOIN view_totaleq t3 ON t1.MeterCode = t3.MeterCode WHERE t1.org_id = ? AND t2.meter_type = ?;", [org_id, "MUCNUOC"])
                    return res.render('partials/muc_nuoc', { danhsachtram })
                case "to-bom":
                    let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE meter_type = 'DONGHO' AND mpm.org_id = ?", [org_id]);
                    return res.render('partials/to_bom', {
                        pumps: result,
                    })
                case "chi-so-moi-truong":
                    return res.render('partials/chi_so_moi_truong', {})
                case "may-phat-dien":
                    let may_phat_dien = await access_db("SELECT vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE meter_type = 'GENERATOR' AND mpm.org_id = ?", [org_id]);

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
            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE mpm.org_id = ?", [req.session.factory_id]);
            let config_wmco = await access_db("SELECT * FROM config_wmco", []);
            res.json({
                success: true,
                data: result,
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

            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE mpm.org_id = ?", [req.session.factory_id]);

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
            var result = await access_db("SELECT t1.MeterCode AS MeterCode_, t3.name AS name, t4.* FROM org_managers t1 LEFT JOIN meters t2 ON t1.MeterCode = t2.meter_serial LEFT JOIN view_totaleq t3 ON t1.MeterCode = t3.MeterCode LEFT JOIN config_wmsv t4 ON t1.MeterCode = t4.MeterCode WHERE t1.org_id = ? AND t2.meter_type = ?;", [req.session.factory_id, "MUCNUOC"]);
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
            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE mpm.org_id = ?", [req.session.factory_id]);
            console.log(result)
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
    get_chi_so_moi_truong: async (req,res) => {
        try{
            if (!req.session.factory_id) {
                let factories = await access_db("SELECT t3.*, t3.id AS factory_id FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ?;", [req.user.id]);
                if (factories.length > 0) {
                    req.session.factory_id = factories[0].factory_id
                } else {
                    req.session.factory_id = null;
                }
            }

            let config = await access_db("SELECT * FROM config_wmco", []);
            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE meter_type = 'CSMT' AND mpm.org_id = ?", [req.session.factory_id]);
            let general = {
                chat_luong_nuoc_tho: "",
                chi_so_on_dinh: "",
                chat_luong_nuoc_sach: "",
                chi_so_dat_chuan: "",
                thoi_gian: new Date().toLocaleTimeString('vi-VN'),
                trang_thai: "",
                he_thong_giam_sat: 2
            }
            let nuoc_tho = {
                do_duc: null,
                tt_do_duc: null,
                ph: null,
                tt_ph: null,
                nhiet_do: null,
                tt_nhiet_do: null,
                do_cung: null,
                tt_do_cung: null

            }
            let nuoc_sach = {
                nhiet_do: null,
                tt_nhiet_do: null,
                ph: null,
                tt_ph: null,
                do_man: null,
                tt_do_man: null,
                clo_du: null,
                tt_clo_du: null,
                do_duc: null,
                tt_do_duc: null,
                EC: null,
                tt_EC: null
            }
            let tieu_chuan_nuoc_tho = {
                do_duc: 50,
                ph_min: 6.5,
                ph_max: 8.5,
                nhiet_do: 30
            }
            let tieu_chuan_nuoc_sach = {
                do_duc: 2,
                ph_min: 6.0,
                ph_max: 8.5,
                clo_du_min: 0.3,
                clo_du_max: 1.0,
                EC: 750
            }
            config.forEach(e => {
                if (e.device_type == 1) {
                    tieu_chuan_nuoc_tho = {
                        do_duc: e.do_duc_max,
                        ph_min: e.ph_min,
                        ph_max: e.ph_max,
                        nhiet_do: e.nhiet_do_max
                    }
                } else if (e.device_type == 2) {
                    tieu_chuan_nuoc_sach = {
                        nhiet_do: e.nhiet_do_max,
                        do_duc: e.do_duc_max,
                        ph_min: e.ph_min,
                        ph_max: e.ph_max,
                        clo_du_min: e.clo_du_min,
                        clo_du_max: e.clo_du_max,
                        EC: 750
                    }
                }
            });
            let chat_luong_nuoc_tho = 0;
            let chat_luong_nuoc_sach = 0;
            if (result.length > 0) {
                result.forEach(element => {
                    if (element.data_type == 1) {
                        //console.log(tieu_chuan_nuoc_tho.ph_min);
                        nuoc_tho = {
                            name: element.name,
                            last_data_time: element.last_data_time,
                            meter_code: element.MeterCode,
                            do_duc: null,
                            tt_do_duc: 0,
                            ph: element.last_PH,
                            tt_ph: tieu_chuan_nuoc_tho.ph_min <= element.last_PH && tieu_chuan_nuoc_tho.ph_max >= element.last_PH ? 1 : 0,
                            nhiet_do: element.last_Temp,
                            tt_nhiet_do: tieu_chuan_nuoc_tho.nhiet_do >= element.last_Temp ? 1 : 0,
                            do_cung: null,
                            tt_do_cung: 0
                        }
                        if (tieu_chuan_nuoc_tho.ph_min <= element.last_PH && tieu_chuan_nuoc_tho.ph_max >= element.last_PH &&
                            tieu_chuan_nuoc_tho.nhiet_do >= element.last_Temp) {
                            chat_luong_nuoc_tho = 1;
                        }
                    } else if (element.data_type == 2) {
                        nuoc_sach = {
                            name: element.name,
                            last_data_time: element.last_data_time,
                            nhiet_do: element.last_Temp,
                            meter_code: element.MeterCode,
                            tt_nhiet_do: tieu_chuan_nuoc_sach.nhiet_do >= element.last_Temp ? 1 : 0,
                            ph: element.last_PH,
                            tt_ph: tieu_chuan_nuoc_sach.ph_min <= element.last_PH && tieu_chuan_nuoc_sach.ph_max >= element.last_PH ? 1 : 0,
                            do_man: null,
                            tt_do_man: null,
                            clo_du: element.last_CloDu,
                            tt_clo_du: tieu_chuan_nuoc_sach.clo_du_min <= element.last_CloDu && tieu_chuan_nuoc_sach.clo_du_max >= element.last_CloDu ? 1 : 0,
                            do_duc: element.last_DoDuc,
                            tt_do_duc: tieu_chuan_nuoc_sach.do_duc >= element.last_DoDuc ? 1 : 0,
                            EC: null,
                            tt_EC: null
                        }
                        if (tieu_chuan_nuoc_sach.nhiet_do >= element.last_Temp && tieu_chuan_nuoc_sach.ph_min <= element.last_PH && tieu_chuan_nuoc_sach.ph_max >= element.last_PH &&
                            tieu_chuan_nuoc_sach.clo_du_min <= element.last_CloDu && tieu_chuan_nuoc_sach.clo_du_max >= element.last_CloDu && tieu_chuan_nuoc_sach.do_duc >= element.last_DoDuc) {
                            chat_luong_nuoc_sach = 1;
                        }
                    }
                });
            } else {
                chat_luong_nuoc_tho = null;
                chat_luong_nuoc_sach = null;
            }

            general = {
                chat_luong_nuoc_tho: chat_luong_nuoc_tho != null && chat_luong_nuoc_tho != "" ? (chat_luong_nuoc_tho == 1 ? "TỐT" : "KHÔNG TỐT") : "-",
                chi_so_on_dinh: "2/2",
                chat_luong_nuoc_sach: chat_luong_nuoc_sach == 1 ? "TUYỆT VỜI" : "KHÔNG ĐẠT",
                chi_so_dat_chuan: "6/6",
                thoi_gian: new Date().toLocaleTimeString('vi-VN'),
                trang_thai: chat_luong_nuoc_tho != null && chat_luong_nuoc_sach != null ? (chat_luong_nuoc_tho == 1 && chat_luong_nuoc_sach == 1 ? "ỔN ĐỊNH" : "KHÔNG ỔN ĐỊNH") : "-",
                he_thong_giam_sat: 2
            }
            res.json({
                message: true,
                general: general,
                nuoc_tho: nuoc_tho,
                nuoc_sach: nuoc_sach,
                tieu_chuan_nuoc_tho: tieu_chuan_nuoc_tho,
                tieu_chuan_nuoc_sach: tieu_chuan_nuoc_sach,

            })
        }catch(error){
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