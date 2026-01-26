const fix = 3;
var excel = require('exceljs');
const { access_db, query } = require("./mysql_config");
const path = require('path');
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

function show_if_null_text(x) {
    if (x === "" || x === null)
        return "-";
    return x;
}

function return_meter_status(x) {
    switch (x) {
        case 0: return 'Mất kết nối';
        case 1: return 'Trong ngưỡng';
        case 2: return 'Vượt ngưỡng';
        default: return 'Mất kết nối';
    }
}

function return_local_date_string(date) {
    let x = pad(date.getDate()) + '/' +
        pad(date.getMonth() + 1) + '/' +
        date.getFullYear() + ', ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds());
    return x;
}

function return_status_relay(x) {
    if (x == 1 || x == "1") {
        return "On"
    }
    return "Off"
}

function numberWithCommas(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
}

function return_date(x) {
    var d = new Date(Number(x));
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    var yy = d.getFullYear();
    return dd + '_' + mm + '_' + yy;
}


function lamtron(x) {
    return Math.ceil(x * 1000) / 1000;
}

function fixed_data(x) {
    if (x === "" || x === null) {
        return "-";
    }
    if (!isNaN(Number(x))) {
        return Number(x);
    } else {
        return x;
    }
}


function return_if_null(x) {
    if (x == null || x == "") {
        return " - ";
    }
    return x;
}

function return_status(x) {
    if (x == null || x == "") {
        return " - ";
    } else if (x == 1 || x == "1") {
        return "Kết nối"
    } else {
        return "Mất kết nối"
    }
}

// function numToLetter(num) {
//     switch (num) {
//         case 1: return "A";
//         case 2: return "B";
//         case 3: return "C";
//         case 4: return "D";
//         case 5: return "E";
//         case 6: return "F";
//         case 7: return "G";
//         case 8: return "H";
//         case 9: return "I";
//         case 10: return "J";
//         case 11: return "K";
//         case 12: return "L";
//         case 13: return "M";
//         case 14: return "N";
//         case 15: return "O";
//         case 16: return "P";
//         case 17: return "Q";
//         case 18: return "R";
//         case 19: return "S";
//         case 20: return "T";
//         case 21: return "U";
//         case 22: return "V";
//         case 23: return "W";

//     }
// }
function numToLetter(num) {
    let result = '';
    while (num > 0) {
        let mod = (num - 1) % 26;
        result = String.fromCharCode(65 + mod) + result;
        num = Math.floor((num - 1) / 26);
    }
    return result;
}

function fixNum(num) {
    if (Number.isNaN(Number(num)) || num == null) {
        return null;
    } else {
        return Number(num).toFixed(fix)
    }
}

function toISO(x) {
    if (Number.isNaN(Number(x))) {
        var y = new Date(x);
        return y;
    } else {
        var y = new Date(Number(x));
        return y;
    }
}


function change_mode_text(x) {
    switch (x) {
        case 1:
            return "Tự động";
        case 2:
            return "Thủ công";
        case 3:
            return "Tắt";
    }
}

function getTodayDate(x) {
    const d = new Date(x);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
}

function findNameByMeterCode(arr, metercode) {
    const item = arr.find(e => e.MeterCode === metercode);
    return item ? item.name : metercode;
}

function formatNumber(num) {
    if (num == null) return '';
    return Number(num).toLocaleString('vi-VN');
}

function formatMonth(dateStr) {
    const d = new Date(dateStr);
    return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatDateTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

async function export_data(req, res) {
    try {
        let name_file = "BAO_CAO_SAN_LUONG"
        let meter_list = JSON.parse(JSON.parse(req.body.meter_list));
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;

        let arr_MeterCode = [];

        if (meter_list) {
            if (meter_list.length == 0) {
                return res.json({
                    success: false,
                    message: "Chưa chọn trạm quan trắc"
                })
            }
        }
        for (let i = 0; i < meter_list.length; i++) {
            arr_MeterCode.push(meter_list[i].MeterCode)
        }
        let data = await query(
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

        // let data = await access_db(`SELECt t4.*, t4.name AS meter_name, t1.org_id AS donviquanly_id, t4.status AS status_meter FROM org_managers t1 INNER JOIN user_donviquanly t2 ON t1.org_id = t2.donviquanly_id LEFT JOIN totaleq t4 ON t4.MeterCode = t1.MeterCode AND t4.NodeCode = t1.NodeCode WHERE t2.user_id = ? AND  (t1.Metercode, t1.NodeCode) IN (` + placeholder + `) ORDER BY t4.name;`, value);
        var result = JSON.parse(JSON.stringify(data));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet("Data"); //creating worksheet


        worksheet.getRow(1).height = 66;
        const imagePath = path.join(__dirname, "..", 'public', 'images', 'logoSaoViet.jpg')

        const imageId = workbook.addImage({
            filename: imagePath, // Đường dẫn ảnh
            extension: 'jpg'
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, // Top-left: B2 (cột 1, hàng 1 => B2)
            br: { col: 1, row: 1 }  // Bottom-right: mở rộng đến C4 (cột 2, hàng 3)
        });


        worksheet.mergeCells('B1:M1');
        worksheet.getCell('B1').value = "SAO VIỆT";
        worksheet.getCell("B1").font = { name: 'Arial', size: 15, bold: true };
        worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };

        worksheet.mergeCells('A2:M2');
        worksheet.getCell('A2').value = "BÁO CÁO SẢN LƯỢNG";
        worksheet.getCell("A2").font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.mergeCells('A3:M3');
        worksheet.getCell('A3').value = "Người xuất báo cáo: " + req.user.user_name;
        worksheet.getCell("A3").font = { name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A4:M4');
        worksheet.getCell('A4').value = "Thời điểm xuất báo cáo: " + return_local_date_string(new Date());
        worksheet.getCell("A4").font = { name: 'Arial', size: 10, bold: false };

        // worksheet.getCell('A5').fill = {
        //     type: "pattern",
        //     pattern: "solid",
        //     fgColor: { argb: '70CBFF' },
        // }
        // worksheet.getCell('A5').value = "STT";
        // worksheet.getCell('A5').font = { name: 'Arial', size: 10, bold: true };
        // worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            worksheet.getColumn('A').width = 20;
            worksheet.getColumn('B').width = 35;
            worksheet.getColumn('C').width = 20;
            worksheet.getColumn('D').width = 20;
            worksheet.getColumn('E').width = 20;

            worksheet.getCell('A5').value = "Tháng";
            worksheet.getCell('A5').font = { name: 'Arial', size: 10, bold: true };
            worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            worksheet.getCell('A5').border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
            worksheet.getCell('A5').fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: '70CBFF' },
            }

            worksheet.getCell('B5').value = "Điểm đo";
            worksheet.getCell('B5').font = { name: 'Arial', size: 10, bold: true };
            worksheet.getCell('B5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            worksheet.getCell('B5').border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
            worksheet.getCell('B5').fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: '70CBFF' },
            }

        worksheet.getCell('C5').value = "Chỉ số đầu";
        worksheet.getCell('C5').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('C5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getCell('C5').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
        worksheet.getCell('C5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }

        worksheet.getCell('D5').value = "Chỉ số cuối";
        worksheet.getCell('D5').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('D5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getCell('D5').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
        worksheet.getCell('D5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }

        worksheet.getCell('E5').value = "Sản lượng";
        worksheet.getCell('E5').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('E5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getCell('E5').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
        worksheet.getCell('E5').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }

        const monthMap = {};
        result.forEach(item => {
            const m = formatMonth(item.month);
            if (!monthMap[m]) monthMap[m] = [];
            monthMap[m].push(item);
        });
        let count = 0;
        let count1 = 0;

        Object.keys(monthMap).forEach((month, i) => {
            var rows = monthMap[month];
            var monthRowspan = rows.length * 2;

            rows.forEach((row, index) => {
                /* ===== DÒNG 1: CHỈ SỐ ===== */
                // let tr1 = '<tr>';
                // console.log(monthRowspan, count, index)

                if (index === 0) {
                    worksheet.mergeCells('A' + (6 + count) + ':A' + (6 + count + monthRowspan - 1));

                    worksheet.getCell('A' + (6 + index + count)).value = month;
                    worksheet.getCell('A' + (6 + index + count)).font = { name: 'Arial', size: 10, bold: true };
                    worksheet.getCell('A' + (6 + index + count)).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    worksheet.getCell('A' + (6 + index + count)).border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                    // tr1 += `<td rowspan="${monthRowspan}" class="col-month">${month}</td>`;
                }

                worksheet.mergeCells('B' + (6 + index * 2 + count1) + ':B' + (6 + index * 2 + 1 + count1));
                worksheet.getCell('B' + (6 + index * 2 + count1)).value = findNameByMeterCode(totaleq, row.MeterCode);
                worksheet.getCell('B' + (6 + index * 2 + count1)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }

                worksheet.getCell('C' + (6 + index * 2 + count1)).value = formatNumber(row.first_value);
                worksheet.getCell('C' + (6 + index * 2 + count1)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
                worksheet.getCell('D' + (6 + index * 2 + count1)).value = formatNumber(row.last_value);
                worksheet.getCell('D' + (6 + index * 2 + count1)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }

                worksheet.mergeCells('E' + (6 + index * 2 + count1) + ':E' + (6 + index * 2 + 1 + count1));
                worksheet.getCell('E' + (6 + index * 2 + count1)).value = formatNumber(row.production)
                worksheet.getCell('E' + (6 + index * 2 + count1)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }

                worksheet.getCell('C' + (6 + index * 2 + 1 + count1)).value = formatDateTime(row.first_time)
                worksheet.getCell('C' + (6 + index * 2 + 1 + count1)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }

                worksheet.getCell('D' + (6 + index * 2 + 1 + count1)).value = formatDateTime(row.last_time)
                worksheet.getCell('D' + (6 + index * 2 + 1 + count1)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }

                if (index == 0) {
                    count += monthRowspan;
                }
                // tr1 += `
                //     <td rowspan="2" class="col-name">
                //         <b>${findNameByMeterCode(totaleq, row.MeterCode)}</b>
                //     </td>
    
                //     <td class="col-value">
                //         ${formatNumber(row.first_value)}
                //     </td>
    
                //     <td class="col-value">
                //         ${formatNumber(row.last_value)}
                //     </td>
    
                //     <td rowspan="2" class="col-production">
                //         ${formatNumber(row.production)}
                //     </td>
                // </tr>`;

                /* ===== DÒNG 2: THỜI GIAN ===== */
                // let tr2 = `
                // <tr>
                //     <td class="col-time">
                //         ${formatDateTime(row.first_time)}
                //     </td>
                //     <td class="col-time">
                //         ${formatDateTime(row.last_time)}
                //     </td>
                // </tr>`;

                // tbody.insertAdjacentHTML('beforeend', tr1 + tr2);
            });

            count1 += monthRowspan;

        });

            res.setHeader('Content-Disposition', 'attachment; filename=' + name_file + ".xlsx");
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            await workbook.xlsx.write(res);
            res.end();
        

    } catch (error) {
        console.error('API Monitoring error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }

}



module.exports = export_data;