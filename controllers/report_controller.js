const {access_db,query} = require("../config/mysql_config");
const export_meter_rate_func = require("../config/export_meter_rate");
const export_meter_list_func = require("../config/export_meter_list");
const export_meter_pressure_data_func = require("../config/export_meter_pressure_data");
const export_meter_terminal_index_func = require("../config/export_meter_terminal_index");

const export_meter_data_func = require("../config/export_meter_data")
const export_meter_alert_func = require("../config/export_meter_alert")
const export_field_meter_data_func = require("../config/export_field_meter_data")

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

const alert_controller = {
    show_report_meter_rate: async (req,res) => {
        try{ 
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let meter_list = [];
            // lấy tất cả các thiết bị được phân quyền
            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])

            res.render('layouts/report_meter_rate',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                meter_list,
                danhsachtram,
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/report/meter_rate",
                t: req.__ 
            });

        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },


    show_report_meter_list: async (req,res) => {
        try{

            let danhsachtram = [];

            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let meter_list = [];
            // lấy tất cả các thiết bị được phân quyền

            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])
            res.render('layouts/report_meter_list',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                meter_list,
                danhsachtram,
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/report/meter_list",
                t: req.__ 
            })
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    show_report_meter_data: async (req,res) => {
        try{
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let meter_list = [];
            // lấy tất cả các thiết bị được phân quyền

            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])
            res.render('layouts/report_meter_data',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                danhsachtram,
                meter_list,
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/report/meter_data",
                t: req.__ 
            })
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    show_report_meter_alert: async (req,res) => {
        try{
            let danhsachtram = [];
            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let meter_list = [];
            // lấy tất cả các thiết bị được phân quyền
            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;",[req.user.id])
            res.render('layouts/report_meter_alert',{
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                danhsachtram,
                meter_list,
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/report/meter_alert",
                t: req.__ 
            })
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    show_report_meter_pressure: async (req, res) => {
        try {

            let danhsachtram = [];

            // danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id FROM organizations t1 LEFT JOIN organizations t2 ON t1.parent_id = t2.id INNER JOIN user_donviquanly t3 ON t1.id = t3.donviquanly_id OR t1.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;",[req.user.id])
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])

            let meter_list = [];
            // lấy tất cả các thiết bị được phân quyền

            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;", [req.user.id])
            res.render('layouts/report_meter_pressure', {
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                meter_list,
                danhsachtram,
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/report/meter_pressure",
                t: req.__
            })
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_pressure_data: async (req, res) => {
        try {
            let meter_list = JSON.parse(req.body.meter_list);
            let arr_MeterCode = [];
            if (meter_list) {
                if (meter_list.length == 0) {
                    return res.json({
                        success: false,
                        message: "Chưa chọn trạm quan trắc"
                    })
                }
            }
            let placeholder = meter_list.map(() => "(?,?)").join(",");
            let value = [];
            for (let i = 0; i < meter_list.length; i++) {
                value.push(meter_list[i].MeterCode);
                value.push(meter_list[i].NodeCode);
                arr_MeterCode.push(meter_list[i].MeterCode)
            }
            let start_date = returnSQLDateFormatDayStart(req.body.start_date);
            let end_date = returnSQLDateFormatDayEnd(req.body.end_date);
            value.push(start_date, end_date)
            // console.log(meter_list, start_date, end_date)
            // let report_data = await access_db("SELECT t1.*, t1.name AS meter_name, t3.org_name AS ten_donvi FROM totaleq t1 LEFT JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t3 ON t2.org_id = t3.id WHERE  (t1.Metercode, t1.NodeCode) IN ("+placeholder+");", value );
            // console.log(value)
            let report_data = await query(`SELECT DATE(t1."MeterTime") AS time, t1."MeterCode", MIN(t1."pressure") AS min_day_pressure, MAX(t1."pressure") AS "max_day_pressure" FROM "Operation" t1 WHERE t1."MeterCode" = ANY($1) AND t1."MeterTime" >= $2 AND t1."MeterTime" <= $3 GROUP BY DATE(t1."MeterTime"), t1."MeterCode" ORDER BY "time", t1."MeterCode";`, [arr_MeterCode, start_date, end_date])
            let totaleq = await access_db("SELECT MeterCode, name FROM totaleq WHERE MeterCode IN (?);", [arr_MeterCode])
            // let report_data = await access_db(`SELECt t4.*, t4.name AS meter_name, t1.org_id AS donviquanly_id, t4.status AS status_meter FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND  (t1.Metercode, t1.NodeCode) IN (` + placeholder + `) ORDER BY t4.name;`, value);

            res.json({
                success: true,
                report_data: report_data,
                totaleq: totaleq
            })
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    export_meter_pressure_data: (req, res) => {
        try {
            export_meter_pressure_data_func(req, res);
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    show_report_meter_terminal_index: async (req, res) => {
        try {

            let danhsachtram = [];
            danhsachtram = await access_db("SELECT t1.org_code AS org_code, t1.org_name AS name, t1.id AS id, t2.org_name AS donviquanly, t2.id AS donviquanly_id  FROM org_mapping as t LEFT JOIN organizations t1 ON t.org_id = t1.id LEFT JOIN organizations t2 ON t.parent_id = t2.id INNER JOIN user_donviquanly AS t3 ON t.org_id = t3.donviquanly_id OR t.parent_id = t3.donviquanly_id WHERE t3.user_id = ?;", [req.user.id])
            let meter_list = [];
            // lấy tất cả các thiết bị được phân quyền
            meter_list = await access_db("SELECT t1.* FROM totaleq t1 INNER JOIN org_managers t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN user_donviquanly t3 ON t2.org_id = t3.donviquanly_id WHERE t3.user_id = ? ORDER BY t1.name;", [req.user.id])
            res.render('layouts/report_meter_terminal_index', {
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                meter_list,
                danhsachtram,
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/report/meter_terminal_index",
                t: req.__
            })
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_terminal_index_data: async (req, res) => {
        try {
            let meter_list = JSON.parse(req.body.meter_list);
            let arr_MeterCode = [];
            if (meter_list) {
                if (meter_list.length == 0) {
                    return res.json({
                        success: false,
                        message: "Chưa chọn trạm quan trắc"
                    })
                }
            }
            let placeholder = meter_list.map(() => "(?,?)").join(",");
            let value = [];
            for (let i = 0; i < meter_list.length; i++) {
                value.push(meter_list[i].MeterCode);
                value.push(meter_list[i].NodeCode);
                arr_MeterCode.push(meter_list[i].MeterCode)
            }
            let start_date = returnSQLDateFormatMonthStart(req.body.start_date);
            let end_date = returnSQLDateFormatMonthEnd(req.body.end_date);
            value.push(start_date, end_date)
            // let report_data = await query(`SELECT DATE(t1."MeterTime") AS time, t1."MeterCode", MIN(t1."ValOfNum") AS min_day_valofnum, MAX(t1."ValOfNum") AS "max_day_valofnum" FROM "Operation" t1 WHERE t1."MeterCode" = ANY($1) AND t1."MeterTime" >= $2 AND t1."MeterTime" <= $3 GROUP BY DATE(t1."MeterTime"), t1."MeterCode" ORDER BY "time", t1."MeterCode";`, [arr_MeterCode, start_date, end_date])
            const report_data = await query(
                `
                WITH months AS (
                    SELECT
                      "MeterCode",
                      DATE_TRUNC('month', "MeterTime") AS month
                    FROM "Operation"
                    WHERE "MeterCode" = ANY($1)
                    AND "MeterTime" >= $2
                    AND "MeterTime" <  $3
                    GROUP BY "MeterCode", DATE_TRUNC('month', "MeterTime")
                  )
                  SELECT
                    m."MeterCode",
                    m.month,
                    f."ValOfNum" AS first_value,
                    f."MeterTime" AS first_time,
                    l."ValOfNum" AS last_value,
                    l."MeterTime" AS last_time,
                    l."ValOfNum" - f."ValOfNum" AS production
                  FROM months m
                  JOIN LATERAL (
                    SELECT "ValOfNum", "MeterTime"
                    FROM "Operation"
                    WHERE "MeterCode" = m."MeterCode"
                      AND "MeterTime" >= m.month
                      AND "MeterTime" <  m.month + INTERVAL '1 month'
                    ORDER BY "MeterTime"
                    LIMIT 1
                  ) f ON true
                  JOIN LATERAL (
                    SELECT "ValOfNum", "MeterTime"
                    FROM "Operation"
                    WHERE "MeterCode" = m."MeterCode"
                      AND "MeterTime" >= m.month
                      AND "MeterTime" <  m.month + INTERVAL '1 month'
                    ORDER BY "MeterTime" DESC
                    LIMIT 1
                  ) l ON true
                  ORDER BY m."MeterCode", m.month;
                `,
                [arr_MeterCode, start_date, end_date]
              );
            let totaleq = await access_db("SELECT MeterCode, name FROM totaleq WHERE MeterCode IN (?);", [arr_MeterCode])
            res.json({
                success: true,
                report_data: report_data,
                totaleq: totaleq
            })
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    export_meter_terminal_index: (req, res) => {
        try {
            export_meter_terminal_index_func(req, res);
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
    get_meter_rate_data: async (req,res) => {
        try{
            let start_date = req.body.start_date;
            let end_date = req.body.end_date;
            let meter_list = JSON.parse(req.body.meter_list);
            if(meter_list){
                if(meter_list.length == 0){
                    return res.json({
                        success: false,
                        message: "Chưa chọn trạm quan trắc"
                    })
                }
            }
            // let value = meter_list.map(i => [i.MeterCode, i.NodeCode]);
            let placeholder = meter_list.map(() => "(?,?)").join(",");
            // let value = meter_list.flatMap(i => [i.MeterCode, i.NodeCode]);
            let value = [start_date, end_date, start_date, end_date, start_date, end_date, start_date, start_date, end_date];
            for(let i=0; i<meter_list.length; i++){
                value.push(meter_list[i].MeterCode);
                value.push(meter_list[i].NodeCode);
            }
            
            let report_data = await access_db("SELECT eq.MeterCode,eq.NodeCode, eq.`name`, ? as 'thoi_gian_thu_thap',eq.FreqOpreation as 'tan_suat',IFNULL(a.total,0) as 'ban_ghi_thuc_te', CASE WHEN eq.FreqOpreation IS NULL OR eq.FreqOpreation = 0 THEN 0 ELSE CAST(((DATEDIFF(? ,?) + 1) * 24 * 60 / eq.FreqOpreation) as SIGNED) END as 'ban_ghi_thiet_ke', CASE WHEN eq.FreqOpreation IS NULL OR eq.FreqOpreation = 0 OR a.total IS NULL OR a.total = 0 THEN 0 WHEN a.total >= ((DATEDIFF(?,?) + 1) * 24 * 60 / eq.FreqOpreation) THEN 100 ELSE ROUND((a.total / ((DATEDIFF(?,?) + 1) * 24 * 60 / eq.FreqOpreation)) * 100, 2) END AS 'ty_le' FROM totaleq as eq LEFT JOIN (SELECT MeterCode,NodeCode,COUNT(*) as 'total' FROM Operation  WHERE DATE(MeterTime) >= ? AND DATE(MeterTime) <= ? GROUP BY MeterCode,NodeCode) as a ON eq.MeterCode = a.MeterCode AND eq.NodeCode = a.NodeCode WHERE (eq.Metercode, eq.NodeCode) IN ("+placeholder+");", value );
            res.json({
                success: true,
                report_data: report_data
            })
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    export_meter_rate: (req,res) => {
        try{
            export_meter_rate_func(req, res);
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    get_meter_list_data: async (req,res) => {
        try{
            let meter_list = JSON.parse(req.body.meter_list);
            if(meter_list){
                if(meter_list.length == 0){
                    return res.json({
                        success: false,
                        message: "Chưa chọn trạm quan trắc"
                    })
                }
            }
            let placeholder = meter_list.map(() => "(?,?)").join(",");
            let value = [req.user.id];
            for(let i=0; i<meter_list.length; i++){
                value.push(meter_list[i].MeterCode);
                value.push(meter_list[i].NodeCode);
            }
            
            // let report_data = await access_db("SELECT t1.*, t1.name AS meter_name, t3.org_name AS ten_donvi FROM totaleq t1 LEFT JOIN org_groups t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode LEFT JOIN organizations t3 ON t2.org_id = t3.id WHERE  (t1.Metercode, t1.NodeCode) IN ("+placeholder+");", value );

            let report_data = await access_db(`SELECt t4.*, t4.name AS meter_name, t1.org_id AS donviquanly_id, t4.status AS status_meter FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND  (t1.Metercode, t1.NodeCode) IN (`+placeholder+`) ORDER BY t4.name;`, value);

            res.json({
                success: true,
                report_data: report_data
            })
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    export_meter_list: (req,res) => {
        try{
            export_meter_list_func(req, res);
        }catch(error){
            console.error('API report error:', error);
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

            let data_field_config = JSON.stringify({ "ValOfNum": 1, "terminal_index": 1, "flowRate": 1, "pressure": 1, "measure_sensor": 1, "measure_static": 1, "measure_dynamic": 1, "measure_delta": 1, "ValueReverse": 1, "ValueForward": 1, "Voltage": 1, "voltage_ac_quy": 1, "PressureVol": 1, "VoltageOfMeter": 1, "Temp": 1 })
            let row = await access_db("SELECT * FROM data_field_config WHERE MeterCode = ? AND NodeCode = ?;", [MeterCode, NodeCode]);
            if(row.length > 0){
                data_field_config = row[0].config;
            }

            let data = [];
            // let data = await access_db("SELECT * FROM Operation WHERE NodeCode = ? AND MeterCode = ? AND MeterTime >= ? AND MeterTime <= ? ORDER BY MeterTime ASC;",[NodeCode, MeterCode, start_date, end_date]);
            switch(data_search_moment){
                case "hour":
                    data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" ASC;`,[NodeCode, MeterCode, start_date, end_date]);
                    break;
                case "day":
                    data = await query(`SELECT * FROM "daily_meter_usage" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" ASC;`,[NodeCode, MeterCode, returnSQLDateFormatDayStart(start_date), returnSQLDateFormatDayEnd(end_date)]);
                    break;
                case "month":
                    data = await query(`SELECT * FROM "monthly_meter_usage" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" ASC;`,[NodeCode, MeterCode, returnSQLDateFormatMonthStart(start_date), returnSQLDateFormatMonthEnd(end_date)]);
                    break;
                default: 
                    data = await query(`SELECT * FROM "Operation" WHERE "NodeCode" = $1 AND "MeterCode" = $2 AND "MeterTime" >= $3 AND "MeterTime" <= $4 ORDER BY "MeterTime" ASC;`,[NodeCode, MeterCode, start_date, end_date]);
                    break;
            }
            res.json({
                data,
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
    export_meter_data: (req,res) => {
        try{
            try{
                export_meter_data_func(req, res);
            }catch(error){
                console.error('API report error:', error);
                res.status(500).json({ 
                    success: false,
                    message: 'Lỗi server' 
                  });
            }
        }catch(error){
            console.error('API report error:', error);
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
            let tram_id = req.query.tram_id;
            let dv_type = req.query.dv_type;
            let values = [];
            let sql = "";

           if(MeterCode == 'all' && NodeCode == 'all'){
            values = [ start_date, end_date];
            if(dv_type == "all"){
            sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.updated_at > ? AND t1.updated_at < ?  ORDER BY t1.updated_at DESC;";
            }else if(dv_type == "dvql"){
            sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN org_managers t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t1.updated_at > ? AND t1.updated_at < ? AND t3.org_id = ? ORDER BY t1.updated_at DESC;";
            values.push(tram_id);
            }else{
            sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode INNER JOIN org_groups t3 ON t1.MeterCode = t3.MeterCode AND t1.NodeCode = t3.NodeCode WHERE t1.updated_at > ? AND t1.updated_at < ? AND t3.org_id = ? ORDER BY t1.updated_at DESC;"
            values.push(tram_id)
            }

        }else{
            values = [MeterCode, NodeCode, start_date, end_date];

            sql = "SELECT t1.*, t2.name FROM alert_data t1 LEFT JOIN totaleq t2 ON t1.MeterCode = t2.MeterCode AND t1.NodeCode = t2.NodeCode WHERE t1.MeterCode = ? AND t1.NodeCode = ? AND t1.updated_at > ? AND t1.updated_at < ? ORDER BY t1.updated_at DESC;"
        }
        let alert_data = await access_db(sql,values);
            // let alert_data = await access_db("SELECT * FROM alert_data WHERE MeterCode = ? AND NodeCode = ? AND created_at > ? AND created_at < ? ORDER BY created_at DESC;",[MeterCode, NodeCode, start_date, end_date])
            res.json({
                data: alert_data
            })
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    export_meter_alert: (req,res) => {
        try{
            export_meter_alert_func(req, res);
        }catch(error){
            console.error('API report error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
              });
        }
    },
    export_field_meter_data: (req, res) => {
        try {
            try {
                export_field_meter_data_func(req, res);
            } catch (error) {
                console.error('API report error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Lỗi server'
                });
            }
        } catch (error) {
            console.error('API report error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
                // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API report error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
                // get_general_status: (req,res) => {
    //     try{

    //     }catch(error){
    //         console.error('API report error:', error);
    //         res.status(500).json({ 
    //             success: false,
    //             message: 'Lỗi server' 
    //           });
    //     }
    // },
}

module.exports = alert_controller;