const {access_db, query} = require("../config/mysql_config");
const export_nuoc_tho_func = require("../config/evm_export_nuoc_tho")
const export_nuoc_sach_func = require("../config/evm_export_nuoc_sach")

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
    // hiển thị trang overview - giám sát tổng quan
    show_overview: async (req,res) => {
        try{
            let danh_sach_thiet_bị = [];
            let danh_sach_xi_nghiep_nha_may = [];
            let danh_sach_nha_may = [];

            danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t5.device_type = ?;", [req.user.id, "WMCO"]);

            danh_sach_xi_nghiep_nha_may = await access_db("SELECT t1.org_id, t2.org_name AS name, t1.parent_id AS parent_id, t3.org_name AS parent_name FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN organizations t3 ON t1.parent_id = t3.id INNER JOIN user_org t4 ON t1.org_id = t4.org_id OR t1.parent_id = t4.org_id WHERE t4 .user_id = ? ORDER BY t1.order_by;", [req.user.id]);

            danh_sach_nha_may = await access_db("SELECT DISTINCT *, t1.org_id AS id_nha_may FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t3.id = t1.org_id WHERE t2.user_id = ?;",[req.user.id]);

            let count_status = "Tất cả (" + danh_sach_thiet_bị.filter(item => item.status_meter == 1).length + "/" + danh_sach_thiet_bị.length + ")";
 
            res.render('layouts/overview',{
                danh_sach_thiet_bị, danh_sach_xi_nghiep_nha_may, count_status, danh_sach_nha_may,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path : "/overview",
            })
        }catch(error){
            console.error('API overview error:', error);
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
                console.log(org_id)
                if (type == "all") {
                    danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t5.device_type = ?;", [req.user.id, "WMCO"]);

                } else if (type == "xi_nghiep") {
                    danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t2.parent_id = ? AND t5.device_type = ?;", [req.user.id, org_id, "WMCO"]);

                } else {
                    danh_sach_thiet_bị = await access_db("SELECT DISTINCT t1.MeterCode, t1.NodeCode, t4.name AS meter_name, t5.lat, t5.lng, t4.status AS status_meter, t5.meter_type, t5.data_type FROM org_managers t1 INNER JOIN org_mapping t2 ON t1.org_id = t2.org_id INNER JOIN user_org t3 ON t2.parent_id = t3.org_id LEFT JOIN view_totaleq t4 ON t1.MeterCode = t4.MeterCode LEFT JOIN meters t5 ON t1.MeterCode = t5.meter_serial WHERE t3.user_id = ? AND t2.org_id = ? AND t5.device_type = ?;", [req.user.id, org_id, "WMCO"]);

                }
                let count_status = "(" + danh_sach_thiet_bị.filter(item => item.status_meter == 1).length + "/" + danh_sach_thiet_bị.length + ")";


                res.json({
                    success: true,
                    danh_sach_thiet_bị, count_status
                })

            }catch(error){
                console.error('API overview error:', error);
                res.status(500).json({ 
                    success: false,
                    message: 'Lỗi server' 
                  });
            }
        },
    
        get_danhsachnhamay: async (req,res) => {
            try{
                let type = req.query.type;
                let org_id = req.query.org_id;
                let danh_sach_nha_may = [];
                if(type == "all"){
                    danh_sach_nha_may = await access_db("SELECT DISTINCT *, t1.org_id AS id_nha_may FROM org_mapping t1 INNER JOIN user_org t2 ON t1.parent_id = t2.org_id LEFT JOIN organizations t3 ON t3.id = t1.org_id WHERE t2.user_id = ?;", [req.user.id]);
                }else{
                    danh_sach_nha_may = await access_db("SELECT DISTINCT *, t1.org_id AS id_nha_may FROM org_mapping t1 LEFT JOIN organizations t3 ON t3.id = t1.org_id WHERE t1.parent_id = ?;", [org_id]);
                }


                res.json({
                    success: true,
                    danh_sach_nha_may
                })

            }catch(error){
                console.error('API dashboard error:', error);
                res.status(500).json({ 
                    success: false,
                    message: 'Lỗi server' 
                  });
            }
        },
    get_dulieunhamay: async (req, res) => {
        try {
            let config = await access_db("SELECT * FROM config_wmco", []);
            let result = await access_db("SELECT m.meter_type, m.data_type,(vm.last_ValOfNum - vm.last_ValOfNum_24h) as 'san_luong_tu_0h',(vm.tank_base_bottom * vm.last_measure_sensor) as 'dung_tich_be_hien_tai', vm.* FROM org_managers as mpm LEFT JOIN meters as m ON m.meter_serial = mpm.MeterCode LEFT JOIN view_totaleq as vm ON vm.MeterCode = mpm.MeterCode WHERE meter_type = 'CSMT' AND mpm.org_id = ?", [req.query.org_id]);
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
                        nuoc_tho.push({
                            name: element.name,
                            last_data_time: element.last_data_time,
                            meter_code: element.MeterCode,
                            do_duc: element.last_DoDuc,
                            tt_do_duc: 0,
                            ph: element.last_PH,
                            tt_ph: tieu_chuan_nuoc_tho.ph_min <= element.last_PH && tieu_chuan_nuoc_tho.ph_max >= element.last_PH ? 1 : 0,
                            nhiet_do: element.last_Temp,
                            tt_nhiet_do: tieu_chuan_nuoc_tho.nhiet_do >= element.last_Temp ? 1 : 0,
                            do_cung: null,
                            tt_do_cung: 0
                        })
                        if (tieu_chuan_nuoc_tho.ph_min <= element.last_PH && tieu_chuan_nuoc_tho.ph_max >= element.last_PH &&
                            tieu_chuan_nuoc_tho.nhiet_do >= element.last_Temp) {
                            chat_luong_nuoc_tho = 1;
                        }
                    } else if (element.data_type == 2) {
                        nuoc_sach.push({
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
                        })
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
                thoi_gian: returnSQLDateFormat(new Date()),
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
        } catch (error) {
            console.error('API dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
        },
            get_du_lieu_nuoc: async (req,res) => {
                try{
                    const meter_code = req.query.meter_code;
                    const start_date = req.query.start_date;
                    const end_date = req.query.end_date;
                    let result = await access_db("SELECT * FROM web_environment.Operation WHERE MeterCode = ?	AND MeterTime >= ? AND MeterTime <= ? ORDER BY MeterTime", [meter_code, start_date,end_date]);
                    res.json({
                        message: true,
                        data: result
                    })
                }catch(error){
                    console.error('API dashboard error:', error);
                    res.status(500).json({ 
                        success: false,
                        message: 'Lỗi server' 
                      });
                }
            },
            export_nuoc_sach: (req, res) => {
                try {
                    export_nuoc_sach_func(req, res);
                } catch (error) {
                    console.error('API evm error:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi server'
                    });
                }
            },
            export_nuoc_tho: (req, res) => {
                try {
                    export_nuoc_tho_func(req, res);
                } catch (error) {
                    console.error('API evm error:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi server'
                    });
                }
                    },

    get_standards: async (req, res) => {
        try {
            let result = await access_db("SELECT * FROM config_wmco");
            let standards_nuoc_tho = {};
            let standards_nuoc_sach = {};
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].device_type == 1) {
                        standards_nuoc_tho = result[i]
                    }
                    if (result[i].device_type == 2) {
                        standards_nuoc_sach = result[i]
                    }
                }
            }
            res.json({
                message: true,
                standards_nuoc_tho, standards_nuoc_sach
            })
        } catch (error) {
            console.error('API evm error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    post_save_standards: async (req, res) => {
        try {
            let standards_nuoc_tho = req.body.standards_nuoc_tho;
            let standards_nuoc_sach = req.body.standards_nuoc_sach;
            await access_db("UPDATE config_wmco SET do_duc_min =?, do_duc_max = ?, ph_min = ?, ph_max = ?, updated_at = ? WHERE device_type = ?;", [standards_nuoc_tho.do_duc_min, standards_nuoc_tho.do_duc_max, standards_nuoc_tho.ph_min, standards_nuoc_tho.ph_max, new Date(), 1]);
            await access_db("UPDATE config_wmco SET nhiet_do_min =?, nhiet_do_max = ?, ph_min = ?, ph_max = ?, clo_du_min=?, clo_du_max=?, updated_at = ? WHERE device_type = ?;", [standards_nuoc_sach.nhiet_do_min, standards_nuoc_sach.nhiet_do_max, standards_nuoc_sach.ph_min, standards_nuoc_sach.ph_max, standards_nuoc_sach.clo_du_min, standards_nuoc_sach.clo_du_max, new Date(), 2]);
            res.json({
                success: true,
            })

        } catch (error) {
            console.error('API evm error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
        },

            // get_general_status: (req,res) => {
            //     try{

            //     }catch(error){
            //         console.error('API dashboard error:', error);
            //         res.status(500).json({ 
            //             success: false,
            //             message: 'Lỗi server' 
            //           });
            //     }
            // },

    get_meter_data: async (req,res) => {
        try{
            if (!req.query.time_range || isNaN(parseInt(req.query.time_range, 10))) {
                return res.status(400).json({ error: "time_range is required and must be a valid number" });
            }

            let time_range = parseInt(req.query.time_range, 10);

            let MeterCode = req.query.MeterCode;
            let NodeCode = req.query.NodeCode;
           // let chart_data = await access_db("SELECT t1.*, t2.unit_pin FROM Operation t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.NodeCode = ? AND t1.MeterCode = ? AND t1.MeterTime >= NOW() - INTERVAL ? DAY ORDER BY t1.MeterTime ASC;",[NodeCode, MeterCode, time_range]);
            let chart_data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= NOW( ) - INTERVAL '${time_range} day' ORDER BY "MeterTime";`,[NodeCode, MeterCode]);
            
            let data_field = await access_db("SELECT * FROM totaleq as t2 INNER JOIN data_field_config as c ON c.MeterCode = t2.MeterCode AND c.NodeCode = t2.NodeCode WHERE t2.MeterCode = ? AND t2.NodeCode = ?;",[MeterCode, NodeCode]);
            let x = {};
            x.config = '{"ValOfNum":1,"terminal_index":1,"flowRate":1,"pressure":1,"measure_sensor":1,"measure_static":1,"measure_dynamic":1,"measure_delta":1,"ValueReverse":1,"ValueForward": 1,"Voltage":1,"voltage_ac_quy":1,"PressureVol":1, "VoltageOfMeter":1, "Temp": 1}';
            // console.log((data_field.length > 0) ? data_field[0] :  x)
            res.json({
                success: true,
                chart_data,
                data_field: (data_field.length > 0) ? data_field[0] :  x
            })

        }catch(error){
            console.error('API overview error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_meter_list_tram: async (req,res) => {
        try{
            let tram_id = req.query.tram_id;
            let type = req.query.type;
            if(type =="all"){
                res.clearCookie('tram_id');
                res.clearCookie('dv_type');
            }else{
                res.cookie("tram_id", tram_id, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    // httpOnly: true,
                    // secure: true,
                });
                res.cookie("dv_type", type, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    // httpOnly: true,
                    // secure: true,
                });
            }
            let tram_dau_tien ="";
            let meter_list = [];
            let meter_dau_tien = {
                name: "",
                chart_data: [],
                meter_field: {},
                last_data_time: "-",
                last_warning: "-",
                MeterCode: "",
                NodeCode: "",
            }

            let danhsachtram;
                if(type == "all"){
                        tram_dau_tien += "Tất cả";
                    meter_list = await access_db(`SELECT t4.last_data_time, t4.warning AS last_warning, t4.name AS meter_name, t4.MeterCode, t4.NodeCode, t4.status AS status_meter, t1.org_id AS donviquanly_id FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? ORDER BY t4.name;`,[req.user.id]);
                        let online_meter = 0;
                        for(let i=0; i<meter_list.length; i++){
                            if(meter_list[i].status_meter == 1 || meter_list[i].status_meter == 2){
                                online_meter += 1;
                            }
                        }
                        tram_dau_tien += "("+online_meter+"/"+meter_list.length+")";
                        if(meter_list.length > 0){
                            meter_dau_tien.name = meter_list[0].meter_name;
                            meter_dau_tien.MeterCode = meter_list[0].MeterCode;
                            meter_dau_tien.NodeCode = meter_list[0].NodeCode;
                            meter_dau_tien.last_data_time = meter_list[0].last_data_time;
                            meter_dau_tien.last_warning = meter_list[0].last_warning;
                            meter_dau_tien.donviquanly_id = meter_list[0].donviquanly_id;
                            // meter_dau_tien.donvinguoidung_id = meter_list[0].donvinguoidung_id;
                            meter_dau_tien.meter_status = meter_list[0].status_meter;
    
                            // meter_dau_tien.chart_data = await access_db("SELECT t1.*, t2.unit_pin FROM Operation t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.NodeCode = ? AND t1.MeterCode = ? AND t1.MeterTime >= NOW() - INTERVAL 1 DAY ORDER BY t1.MeterTime ASC;",[meter_list[0].NodeCode, meter_list[0].MeterCode ]);
                            meter_dau_tien.chart_data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= NOW() - INTERVAL '1 DAY' ORDER BY "MeterTime" ASC;`, [meter_list[0].NodeCode, meter_list[0].MeterCode]);

                            let get_data_field = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[meter_list[0].MeterCode, meter_list[0].NodeCode]);
                            if(get_data_field.length > 0){
                                meter_dau_tien.meter_field = get_data_field[0]
                            }else{
                                meter_dau_tien.meter_field.config = '{"ValOfNum":1,"terminal_index":1,"flowRate":1,"pressure":1,"measure_sensor":1,"measure_static":1,"measure_dynamic":1,"measure_delta":1,"ValueReverse":1,"ValueForward": 1,"Voltage":1,"voltage_ac_quy":1,"PressureVol":1, "VoltageOfMeter":1, "Temp": 1}'
                            }
                        
                        res.json({
                            meter_list,
                            ten_meter_dau_tien: meter_dau_tien.name,
                            meter_dau_tien,
                            tram_dau_tien
                        })
                    }else{
                        res.status(400).json({success: false, message: "ID trạm không hợp lệ"})
                    }
                
                }else{
                    danhsachtram  = await access_db("SELECT t1.org_name AS tendonvi, t1.id FROM organizations t1 WHERE t1.id = ?;",[tram_id]);

                    if(danhsachtram.length > 0){
                        tram_dau_tien += danhsachtram[0].tendonvi;
                        if(type =="all"){
                            meter_list = await access_db(`SELECT t4.last_data_time, t4.warning AS last_warning, t4.name AS meter_name, t4.MeterCode, t4.NodeCode, t4.status AS status_meter, t1.org_id AS donviquanly_id FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? ORDER BY t4.name;`,[req.user.id]);
                        }else if(type == "dvql"){
                            meter_list = await access_db(`SELECT t4.last_data_time, t4.warning AS last_warning, t4.name AS meter_name, t4.MeterCode, t4.NodeCode, t4.status AS status_meter, t1.org_id AS donviquanly_id FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND t1.org_id = ? ORDER BY t4.name;`,[req.user.id, danhsachtram[0].id]);
                        }else{
                            meter_list = await access_db(`SELECT t4.last_data_time, t4.warning AS last_warning, t4.name AS meter_name, t4.MeterCode, t4.NodeCode, t4.status AS status_meter, t1.org_id AS donviquanly_id, t3.is_pipe FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id INNER JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND t3.org_id = ? ORDER BY t3.is_pipe DESC;`,[req.user.id, danhsachtram[0].id])
                        }
    
                        let online_meter = 0;
                        for(let i=0; i<meter_list.length; i++){
                            if(meter_list[i].status_meter == 1 || meter_list[i].status_meter == 2){
                                online_meter += 1;
                            }
                        }
                        tram_dau_tien += "("+online_meter+"/"+meter_list.length+")";
                        if(meter_list.length > 0){
                            meter_dau_tien.name = meter_list[0].meter_name;
                            meter_dau_tien.MeterCode = meter_list[0].MeterCode;
                            meter_dau_tien.NodeCode = meter_list[0].NodeCode;
                            meter_dau_tien.last_data_time = meter_list[0].last_data_time;
                            meter_dau_tien.last_warning = meter_list[0].last_warning;

                            meter_dau_tien.donviquanly_id = meter_list[0].donviquanly_id;
                            // meter_dau_tien.donvinguoidung_id = meter_list[0].donvinguoidung_id;
                            meter_dau_tien.meter_status = meter_list[0].status_meter;
    
                            // meter_dau_tien.chart_data = await access_db("SELECT t1.*, t2.unit_pin FROM Operation t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.NodeCode = ? AND t1.MeterCode = ? AND t1.MeterTime >= NOW() - INTERVAL 1 DAY ORDER BY t1.MeterTime ASC;",[meter_list[0].NodeCode, meter_list[0].MeterCode ]);
                            meter_dau_tien.chart_data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= NOW() - INTERVAL '1 DAY' ORDER BY "MeterTime" ASC;`, [meter_list[0].NodeCode, meter_list[0].MeterCode]);

                            let get_data_field = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;",[meter_list[0].MeterCode, meter_list[0].NodeCode]);
                            if(get_data_field.length > 0){
                                meter_dau_tien.meter_field = get_data_field[0]
                            }else{
                                meter_dau_tien.meter_field.config = '{"ValOfNum":1,"terminal_index":1,"flowRate":1,"pressure":1,"measure_sensor":1,"measure_static":1,"measure_dynamic":1,"measure_delta":1,"ValueReverse":1,"ValueForward": 1,"Voltage":1,"voltage_ac_quy":1,"PressureVol":1, "VoltageOfMeter":1, "Temp": 1}'
                            }
                        
                        res.json({
                            meter_list,
                            ten_meter_dau_tien: meter_dau_tien.name,
                            meter_dau_tien,
                            tram_dau_tien
                        })
                    }else{
                        res.status(400).json({success: false, message: "ID trạm không hợp lệ"})
                    }
                }else{
                    res.json({ 
                        success: false,
                        message: 'tram_id không hợp lệ' 
                      });
                }
                }



        }catch(error){
            console.error('API overview error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_read_instant: async (req,res) => {
        try{
            let MeterCode = req.body.MeterCode;
            let NodeCode = req.body.NodeCode;
            let get_dcu_code = await access_db("SELECT * FROM totaleq WHERE MeterCode = ? AND NodeCode = ?;", [MeterCode, NodeCode]);
            if(get_dcu_code.length == 0){
                return res.json({
                    success: false,
                    message: "Không tìm thấy DcuCode cho thiết bị"
                })
            }else{
                let DcuCode = get_dcu_code[0].DcuCode;
                let topic = "AMI/"+DcuCode+"/Intan";
                let server_address = get_dcu_code[0].server_address;
                if(server_address == null || server_address == ""){
                    return res.json({ success: false, message: "Gửi lệnh thất bại" }); 
                }
                let result = await access_db("INSERT INTO command (device, created_at, topic, payload, server_address, user_id) VALUES (?,?,?,?,?,?);", [DcuCode, new Date(), topic, "01", server_address, req.user.id]);
                if(result.affectedRows > 0){
                    return res.json({ success: true, message: "Gửi lệnh thành công" });
                }
                return res.json({ success: false, message: "Gửi lệnh thất bại" }); 
            }
        }catch(error){
            console.error('API overview error:', error);
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
                let tram_id = req.body.tram_id;
                let dv_type = req.body.dv_type;
                console.log(MeterCode)
                if(dv_type == "dvql"){
                    let dvnd = await access_db("SELECT t1.id FROM organizations t1 INNER JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t3.donviquanly_id = t2.id WHERE t3.user_id = ?;",[req.user.id]);
                    if(dvnd.length > 0){
                        let val_dvnd = [];
                        let ids = [];
                        for(let i=0; i<dvnd.length; i++){
                            val_dvnd.push(dvnd[i].id)
                            ids.push(dvnd[i].id)

                        }
                        let placeholders = val_dvnd.map(() => '?').join(',');
                        val_dvnd.unshift(NodeCode);
                        val_dvnd.unshift(MeterCode);
                        await access_db("DELETE FROM org_groups WHERE MeterCode = ? AND NodeCode = ? AND org_id IN ("+placeholders+")", val_dvnd);
                        // console.log("xoadvql",placeholders, val_dvnd)

                        const baseValues = [MeterCode, NodeCode];
                        const placeholders_postgre = ids.map((_, i) => `$${baseValues.length + i + 1}`).join(",");
                        await query(`DELETE FROM "org_groups" WHERE "MeterCode" = $1 AND "NodeCode" = $2 AND "org_id" IN (` + placeholders_postgre + `)`, [...baseValues, ...ids]);


                    }
                    let dvql = await access_db("SELECT donviquanly_id FROM user_donviquanly WHERE user_donviquanly.user_id = ?;",[req.user.id]);
                    if(dvql.length > 0){
                        let val_dvql = [];
                        for(let i=0; i<dvql.length; i++){
                            val_dvql.push(dvql[i].donviquanly_id)
                        }
                        let placeholder2 = val_dvql.map(() => '?').join(",");
                        val_dvql.unshift(NodeCode);
                        val_dvql.unshift(MeterCode);
                        val_dvql.unshift(tram_id);
                        await access_db("UPDATE org_managers SET org_id = ? WHERE MeterCode = ? AND NodeCode = ? AND org_id IN ("+placeholder2+")",val_dvql);
                        // console.log("updatedvql",placeholder2, val_dvql)
    
                    }
    
                }else if(dv_type == "dvnd"){
                    let dvnd = await access_db("SELECT t1.id FROM organizations t1 INNER JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t3.donviquanly_id = t2.id WHERE t3.user_id = ?;",[req.user.id]);
                    if(dvnd.length > 0){
                        let val_dvnd = [];
                        let ids = []; 
                        for(let i=0; i<dvnd.length; i++){
                            val_dvnd.push(dvnd[i].id);
                            ids.push(dvnd[i].id)
                        }
                        let placeholders = val_dvnd.map(() => '?').join(',');
                        val_dvnd.unshift(NodeCode);
                        val_dvnd.unshift(MeterCode);
                        // val_dvnd.unshift(tram_id);
                        let check_exist_groups = await access_db("SELECT * FROM org_groups WHERE MeterCode = ? AND NodeCode = ? AND org_id IN ("+placeholders+");",val_dvnd);
                        if(check_exist_groups.length > 0){
                            val_dvnd.unshift(tram_id);
                            await access_db("UPDATE org_groups SET org_id = ? WHERE MeterCode = ? AND NodeCode = ? AND org_id IN ("+placeholders+")",val_dvnd);
                            // cho postgresql
                            const baseValues = [tram_id, MeterCode, NodeCode];
                            const placeholders_postgre = ids.map((_, i) => `$${i + 4}`).join(",");
                            await query(`UPDATE "org_groups" SET "org_id" = $1 WHERE "MeterCode" = $2 AND "NodeCode" = $3 AND "org_id" IN (${placeholders_postgre})`, [...baseValues, ...ids]);
                            //
                        }else{
                            await access_db("INSERT INTO org_groups (MeterCode, NodeCode, org_id, created_at) VALUES (?,?,?,?);",[MeterCode, NodeCode, tram_id, new Date()]);
                            // cho postgresql
                            await query('INSERT INTO "org_groups" ("MeterCode", "NodeCode", "org_id", "created_at") VALUES ($1, $2, $3, $4);',[MeterCode, NodeCode, tram_id, new Date()]);
                        }
    
                        // console.log("dvnd",placeholders, val_dvnd)
    
                    }else{
                       return res.json({
                            success: false,
                            message: "Lưu thông tin không thành công"
                        })
                    }
                }
    
                res.json({
                    success: true,
                    message: "Lưu thông tin thành công"
                })
        }catch(error){
            console.error('API overview error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    get_group_info: async (req,res) => {
        try{
            let dvnd = req.query.dvnd;
            let data = await access_db("SELECT * FROM organizations WHERE id = ?;",[dvnd]);
            if(data.length > 0){
                res.json({data: data[0]})
            }else{
                res.json({
                    success: false,
                    message: "dvnd không tồn tại!"
                })
            }
        }catch(error){
            console.error('API overview error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    post_save_group_info: async (req,res) => {
        try{
            let dvnd = (req.body.dvnd == "") ? null : req.body.dvnd;
            let note = (req.body.note == "") ? null : req.body.note;
            let loss_threshold = (req.body.loss_threshold == "") ? null : req.body.loss_threshold;
            let loss_fre = (req.body.loss_fre == "") ? null : req.body.loss_fre;

            let result = await access_db("UPDATE organizations SET note = ?, loss_threshold=?, loss_fre=? WHERE id = ?;",[note, loss_threshold, loss_fre, dvnd]);
            if(result.affectedRows > 0){
                return res.json({ success: true, message: "Cập nhật thành công" });
            }else{
                return res.json({ success: false, message: "Cập nhật không thành công" });
            }


        }catch(error){
            console.error('API overview error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API overview error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API dashboard error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API dashboard error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API dashboard error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

    // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API dashboard error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },

    

}


module.exports = overview_controller;