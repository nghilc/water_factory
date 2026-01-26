const { access_db, query } = require("../config/mysql_config");

function startOfDay(dateStr) {
    let d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return returnSQLDateFormat(d);
}

function endOfDay(dateStr) {
    let d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return returnSQLDateFormat(d);
}

function startOfMonth(dateStr) {
    let d = new Date(dateStr);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return returnSQLDateFormat(d);
}

function endOfMonth(dateStr) {
    let d = new Date(dateStr);
    d = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); // ngày cuối tháng
    return returnSQLDateFormat(d);
}


var pad = function (num) { return ('00' + num).slice(-2) };
function returnSQLDateFormat(dateObj) {
    let date = new Date(Number(dateObj));
    let x = date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds());
    return x;
}




const dma_controller = {
    show_dma_manage: async (req, res) => {
        try {
            dma_list = await access_db("SELECT * FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ? ORDER BY t3.created_at DESC;", [req.user.id])
            res.render('layouts/dma_manage', {
                access_menu: req.user.access_tab,
                DMA: dma_list,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/DMA/DMA_manage",
                t: req.__
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    show_dma_loss: async (req, res) => {
        dma_list = await access_db("SELECT * FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id LEFT JOIN organizations t3 ON t1.org_id = t3.id WHERE t2.user_id = ? ORDER BY t3.created_at DESC;", [req.user.id])

        try {
            res.render('layouts/dma_loss', {
                access_menu: req.user.access_tab,
                DMA: dma_list,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/DMA/DMA_loss",
                t: req.__
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_DMA_loss_data: async (req, res) => {
        try {
            let dma_id = req.query.dma_id;
            let start_date = req.query.start_date;
            let end_date  = req.query.end_date;
            let moment = req.query.moment;
            let data = [];
            switch(moment){
                case "hour":
                    console.log(start_date, end_date)

                    data = await access_db("SELECT time AS time_, sum_tong AS sum_tong_, sum_nhanh AS sum_nhanh_, chenh_lech AS chenh_lech_, threshold FROM dma_loss WHERE time >= ? AND time <= ? AND org_id = ? ORDER BY time ASC;",[start_date, end_date, dma_id]);
                    break;
                case "day":
                    start_date = startOfDay(start_date);
                    end_date = endOfDay(end_date)
                    console.log(start_date, end_date)

                    data = await access_db("SELECT DATE_FORMAT(time, '%Y-%m-%d') AS time_, SUM(sum_tong) AS sum_tong_, SUM(sum_nhanh) AS sum_nhanh_, SUM(chenh_lech) AS chenh_lech_ FROM dma_loss WHERE time >= ? AND time <= ? AND org_id = ? GROUP BY  time_ ORDER BY time_ ASC;", [start_date, end_date, dma_id]);
                    break;
                case "month":

                    start_date = startOfMonth(start_date);
                    end_date = endOfMonth(end_date)
                    console.log(start_date, end_date)

                    data = await access_db("SELECT DATE_FORMAT(time, '%Y-%m') AS time_, SUM(sum_tong) AS sum_tong_, SUM(sum_nhanh) AS sum_nhanh_, SUM(chenh_lech) AS chenh_lech_ FROM dma_loss WHERE time >= ? AND time <= ? AND org_id = ? GROUP BY time_ ORDER BY time_  ASC;", [start_date, end_date, dma_id]);
                    break;
            }
            let location = await access_db(`SELECt t4.*, t3.is_pipe, t4.MeterCode AS MeterCode_, t4.NodeCode AS NodeCode_, CASE WHEN t4.status = 0 THEN 0 WHEN t4.status = 1 AND t4.warning IS NOT NULL THEN 2 ELSE 1 END AS meter_status, t4.name AS meter_name, t1.org_id AS donviquanly_id , COALESCE(t5.config, '{"ValOfNum":1,"terminal_index":1,"flowRate":1,"pressure":1,"measure_sensor":1,"measure_static":1,"measure_dynamic":1,"measure_delta":1,"ValueReverse":1,"ValueForward": 1,"Voltage":1,"voltage_ac_quy":1,"PressureVol":1, "VoltageOfMeter":1, "Temp": 1}') AS data_field_config FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id INNER JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode LEFT JOIN data_field_config t5 ON t1.MeterCode = t5.MeterCode AND t1.NodeCode = t5.NodeCode WHERE t2.user_id = ? AND t3.org_id = ? ORDER BY t4.name;`, [req.user.id, dma_id]);
            res.json({
                data,
                location
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_DMA_list: async (req, res) => {
        try {
            let data = await access_db("SELECT * FROM (SELECT t4.id, t4.org_code, t4.org_name, t4.note AS org_note, SUM(CASE WHEN t3.is_pipe = 1 THEN 1 ELSE 0 END) AS number_meter_in, SUM(CASE WHEN t3.is_pipe = 0 THEN 1 ELSE 0 END) AS number_meter_out FROM org_mapping t1 INNER JOIN user_donviquanly t2 ON t1.parent_id = t2.donviquanly_id LEFT JOIN org_groups t3 ON t1.org_id = t3.org_id LEFT JOIN organizations t4 ON t4.id = t1.org_id WHERE t2.user_id = ? GROUP BY t4.id,t4.org_code,t4.org_name,t4.note) as m ORDER BY m.id DESC;",[req.user.id]);
            // let data = await access_db("")
            res.json({
                data
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_uncheck_meter_list: async (req, res) => {
        try {
            let data = await access_db("SELECT t5.MeterCode, t5.NodeCode, t5.name AS meter_name FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN organizations t4 ON t1.org_id = t4.id LEFT JOIN totaleq t5 ON t1.MeterCode = t5.MeterCode AND t1.NodeCode = t5.NodeCode WHERE t2.user_id = ? ;",[req.user.id])
            res.json({
                data
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    post_save_add_dma: async (req, res) => {
        try {
            let dvql_id = req.body.dvql_id;
            let dma_name = req.body.dma_name;
            let dma_code = req.body.dma_code;
            let dma_note = req.body.dma_note;
            let loss_fre = (req.body.loss_fre == "") ? null : req.body.loss_fre;
            let loss_threshold = (req.body.loss_threshold == "") ? null : req.body.loss_threshold == "";
            let sum_in = req.body.sum_in;
            let sum_out = req.body.sum_out;
            let hasCommon = sum_in.some(item => sum_out.includes(item));
            if (hasCommon){
                return res.json({
                    success: false,
                    message: "Một thiết bị không thể vừa làm nhánh vừa làm tổng"
                })
            }
            if (dma_name == "" || dma_name == null){
                return res.json({
                    success: false,
                    message: "Tên DMA không được để trống"
                })
            }

            if (dma_code == "" || dma_code == null) {
                return res.json({
                    success: false,
                    message: "Mã DMA không được để trống"
                })
            }

            let check_dma_name =  await access_db("SELECT * FROM organizations WHERE parent_id = ? AND org_name = ?;",[dvql_id, dma_name]);
            if(check_dma_name.length > 0){
                return res.json({
                    success: false,
                    message: 'Tên DMA đã tồn tại'
                });
            }
            let check_dma_code = await access_db("SELECT * FROM organizations WHERE parent_id = ? AND org_code = ?;", [dvql_id, dma_code]);
            if (check_dma_code.length > 0) {
                return res.json({
                    success: false,
                    message: 'Mã DMA đã tồn tại'
                });
            }
            let result = await access_db("INSERT INTO organizations (org_code, org_name, parent_id, created_at, created_by, note, loss_threshold, loss_fre) VALUES (?,?,?,?,?,?,?,?);", [dma_code, dma_name, dvql_id, new Date(), req.user.id, dma_note, loss_threshold, loss_fre])
            await access_db("INSERT INTO org_mapping (org_id, parent_id, created_at, updated_at) VALUES (?,?,?,?);", [result.insertId, dvql_id, new Date(), new Date()])
            let val_in = [];
            for (let i = 0; i < sum_in.length; i++) {
                val_in.push([sum_in[i], sum_in[i], result.insertId, new Date(), 1]);
            }
            let val_out = [];
            for (let i = 0; i < sum_out.length; i++) {
                val_out.push([sum_out[i], sum_out[i], result.insertId, new Date(), 0]);
            }
            if(val_in.length > 0){
                await access_db("INSERT INTO org_groups (MeterCode, NodeCode, org_id, created_at, is_pipe) VALUES ?;", [val_in]);
            }
            if(val_out.length > 0){
                await access_db("INSERT INTO org_groups (MeterCode, NodeCode, org_id, created_at, is_pipe) VALUES ?;", [val_out]);

            }

            const valuesFlat_in = [].concat(...val_in)
            const placeholders_in = val_in
                .map(
                    (row, rowIndex) =>
                        `(${row.map((_, colIndex) => `$${rowIndex * row.length + colIndex + 1}`).join(",")})`
                )
                .join(",");

            const query_in = `INSERT INTO "org_groups" ("MeterCode", "NodeCode", "org_id", "created_at", "is_pipe") VALUES ${placeholders_in};`;
            if(val_in.length > 0){
                await query(query_in, valuesFlat_in);
            }
            const valuesFlat_out = [].concat(...val_out)
            const placeholders_out = val_out
                .map(
                    (row, rowIndex) =>
                        `(${row.map((_, colIndex) => `$${rowIndex * row.length + colIndex + 1}`).join(",")})`
                )
                .join(",");

            const query_out = `INSERT INTO "org_groups" ("MeterCode", "NodeCode", "org_id", "created_at",  "is_pipe") VALUES ${placeholders_out};`;

            if (valuesFlat_out.length > 0){
                await query(query_out, valuesFlat_out);
            }

                if(result.affectedRows > 0){
                    let log = {
                        org_id: result.insertId,
                        note: "Thêm mới DMA"
                    }
                    await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, org_id) VALUES (?,?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt DMA", JSON.stringify(log), new Date(), null, null, "cai-dat-dma", 1, log.org_id]);
                    return res.json({ 
                        success: true,
                        message: 'Thêm DMA thành công!' 
                      });
                }else{
                    return res.json({ 
                        success: false,
                        message: 'Thêm DMA thất bại!' 
                      });
                }


        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_dma_info: async (req, res) => {
        try {
            let org_id = req.query.org_id;
            let data = await access_db("SELECT t5.MeterCode, t5.NodeCode, t5.name AS meter_name, t3.is_pipe, t3.org_id AS dvnd_id FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode AND t3.org_id = ? LEFT JOIN organizations t4 ON t1.org_id = t4.id LEFT JOIN totaleq t5 ON t1.MeterCode = t5.MeterCode AND t1.NodeCode = t5.NodeCode WHERE t2.user_id = ? ;", [org_id, req.user.id]);
            // let data2 = await access_db("SELECT t1.*, t2.name AS meter_name FROM org_groups t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode WHERE t1.org_id = ?;",org_id);
            let info = await access_db("SELECT t2.org_name,t2.org_code,t2.note,t2.loss_threshold,t2.loss_fre, t1.parent_id  FROM org_mapping t1 LEFT JOIN organizations t2 ON t1.org_id = t2.id LEFT JOIN user_donviquanly t3 ON t1.parent_id = t3.donviquanly_id WHERE t1.org_id = ? AND t3.user_id = ?;",[org_id, req.user.id]);
            res.json({
                data,
                info
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }, 
    post_save_edit_dma: async (req, res) => {
        try {
            let dvql_id = req.body.dvql_id;
            let dma_name = req.body.dma_name;
            let dma_code = req.body.dma_code;
            let dma_note = req.body.dma_note;
            let loss_fre = (req.body.loss_fre == "") ? null : req.body.loss_fre;
            let loss_threshold = (req.body.loss_threshold == "") ? null : req.body.loss_threshold == "";
            let sum_in = req.body.sum_in;
            let sum_out = req.body.sum_out;
            let org_id = req.body.org_id;
            let hasCommon = sum_in.some(item => sum_out.includes(item));
            if (hasCommon) {
                return res.json({
                    success: false,
                    message: "Một thiết bị không thể vừa làm nhánh vừa làm tổng"
                })
            }
            if (dma_name == "" || dma_name == null) {
                return res.json({
                    success: false,
                    message: "Tên DMA không được để trống"
                })
            }

            if (dma_code == "" || dma_code == null) {
                return res.json({
                    success: false,
                    message: "Mã DMA không được để trống"
                })
            }

            // let result = await access_db("INSERT INTO organizations (org_code, org_name, parent_id, created_at, created_by, note, loss_threshold, loss_fre) VALUES (?,?,?,?,?,?,?,?);", [dma_code, dma_name, dvql_id, new Date(), req.user.id, dma_note, loss_threshold, loss_fre])
            let result = await access_db("UPDATE organizations SET org_code = ?, org_name = ?, note = ?, loss_threshold = ?, loss_fre = ? WHERE id = ?;",[dma_code, dma_name, dma_note, loss_threshold, loss_fre, org_id]);
            await access_db('DELETE FROM org_groups WHERE org_id = ?;', org_id);
            await query(`DELETE FROM "org_groups" WHERE org_id = $1`, [org_id]);
            let val_in = [];
            for (let i = 0; i < sum_in.length; i++) {
                val_in.push([sum_in[i], sum_in[i], org_id, new Date(), 1]);
            }
            let val_out = [];
            for (let i = 0; i < sum_out.length; i++) {
                val_out.push([sum_out[i], sum_out[i], org_id, new Date(), 0]);
            }
            if(val_in.length > 0){
                await access_db('INSERT INTO org_groups (MeterCode, NodeCode, org_id, created_at, is_pipe) VALUES ?;', [val_in]);
            }
            if(val_out.length > 0){
                await access_db('INSERT INTO org_groups (MeterCode, NodeCode, org_id, created_at, is_pipe) VALUES ?;', [val_out]);

            }
            // dùng cho postgresql
            const valuesFlat_in = [].concat(...val_in)
            const placeholders_in = val_in
                .map(
                    (row, rowIndex) =>
                        `(${row.map((_, colIndex) => `$${rowIndex * row.length + colIndex + 1}`).join(",")})`
                )
                .join(",");

            const query_in = `INSERT INTO "org_groups" ("MeterCode", "NodeCode", "org_id", "created_at",  "is_pipe") VALUES ${placeholders_in};`;
            if (valuesFlat_in.length > 0){
                await query(query_in, valuesFlat_in);
            }
            const valuesFlat_out = [].concat(...val_out)
            const placeholders_out = val_out
                .map(
                    (row, rowIndex) =>
                        `(${row.map((_, colIndex) => `$${rowIndex * row.length + colIndex + 1}`).join(",")})`
                )
                .join(",");

            const query_out = `INSERT INTO "org_groups" ("MeterCode", "NodeCode", "org_id", "created_at",  "is_pipe") VALUES ${placeholders_out};`;
            if (valuesFlat_out.length > 0){
                await query(query_out, valuesFlat_out);
            }

            if (result.affectedRows > 0) {
                let log = {
                    note: "Sửa DMA",
                    dma_name: dma_name,
                    dma_code: dma_code,
                    dma_note: dma_note,
                    loss_fre: loss_fre,
                    loss_threshold: loss_threshold,
                    org_id: org_id

                }
                await access_db("INSERT INTO log_user (user, action, value, time, MeterCode, NodeCode, alias, type, org_id) VALUES (?,?,?,?,?,?,?,?,?);", [req.user.user_name, "Cài đặt DMA", JSON.stringify(log), new Date(), null, null, "cai-dat-dma", 1, log.org_id]);
                return res.json({
                    success: true,
                    message: 'Sửa DMA thành công!'
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Thêm đơn vị thất bại!'
                });
            }


        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    // show_dma_manage: async (req, res) => {
    //     try {

    //     } catch (error) {
    //         console.error('API DMA error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Lỗi server'
    //         });
    //     }
    // },
}


module.exports = dma_controller;