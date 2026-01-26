const fix = 3;
var excel = require('exceljs');
const { access_db, query } = require("../config/mysql_config");
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
var LANG = "vi"


function show_if_null(x) {
    if (x === "" || x === null)
        return "-";
    return x;
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







function numToLetter(num) {
    switch (num) {
        case 1: return "A";
        case 2: return "B";
        case 3: return "C";
        case 4: return "D";
        case 5: return "E";
        case 6: return "F";
        case 7: return "G";
        case 8: return "H";
        case 9: return "I";
        case 10: return "J";
        case 11: return "K";
        case 12: return "L";
        case 13: return "M";
        case 14: return "N";
        case 15: return "O";
        case 16: return "P";
        case 17: return "Q";
        case 18: return "R";
        case 19: return "S";
        case 20: return "T";
        case 21: return "U";
        case 22: return "V";
        case 23: return "W";

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




async function export_data(req, res) {
    try {
        let MeterCode = req.query.MeterCode;
        let start_date = req.query.start_date;
        let end_date = req.query.end_date;
        let name_file = "BAO_CAO_CHI_SO_TUNG_THOI_DIEM_" + start_date + "_" + end_date

        let data = await access_db("SELECT MeterTime as time, DoDuc as do_duc, Temp as nhiet_do,PH as ph, NULL as do_cung,CloDu as clo_du, DoManPer AS do_man FROM web_environment.Operation WHERE MeterCode = ?	AND MeterTime >= ? AND MeterTime <= ? ORDER BY MeterTime", [MeterCode, start_date, end_date]);


        let info = await access_db("SELECT name AS meter_name FROM view_totaleq WHERE MeterCode = ?; ", [MeterCode]);

        if (info.length == 0) {
            return res.json({
                success: false,
                message: "Mã trạm không hợp lệ"
            })
        }

        var result = JSON.parse(JSON.stringify(data));
        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet("Data"); //creating worksheet

        worksheet.getColumn('A').width = 12;
        worksheet.getColumn('B').width = 25;
        worksheet.getColumn('C').width = 20;
        worksheet.getColumn('D').width = 20;
        worksheet.getColumn('E').width = 20;
        worksheet.getColumn('F').width = 20;
        worksheet.getColumn('G').width = 20;
        worksheet.getColumn('H').width = 20;


        worksheet.getRow(1).height = 66;
        // const imagePath = path.join(__dirname, "..", 'public', 'images', 'logo_quawaco.jpg')

        // const imageId = workbook.addImage({
        //     filename: imagePath, // Đường dẫn ảnh
        //     extension: 'jpg'
        // });
        // worksheet.addImage(imageId, {
        //     tl: { col: 0, row: 0 }, // Top-left: B2 (cột 1, hàng 1 => B2)
        //     br: { col: 1, row: 1 }  // Bottom-right: mở rộng đến C4 (cột 2, hàng 3)
        // });







        // worksheet.mergeCells('B1:E1');
        // worksheet.getCell('B1').value = "KIỂM SOÁT NGUỒN NƯỚC";
        // worksheet.getCell("B1").font ={name: 'Arial', size: 15, bold: true };
        // worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };

        worksheet.mergeCells('A2:D2');
        worksheet.getCell('A2').value = "BÁO CÁO CHỈ SỐ TỪNG THỜI ĐIỂM NƯỚC SẠCH";
        worksheet.getCell("A2").font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.mergeCells('A3:D3');
        worksheet.getCell('A3').value = "Người xuất báo cáo: " + req.user.user_name;
        worksheet.getCell("A3").font = { name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A4:D4');
        worksheet.getCell('A4').value = "Thời điểm xuất báo cáo: " + return_local_date_string(new Date());
        worksheet.getCell("A4").font = { name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A5:D5');
        worksheet.getCell('A5').value = "Báo cáo dữ liệu từ ngày: " + start_date + " đến ngày: " + end_date;
        worksheet.getCell("A5").font = { name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A6:D6');
        worksheet.getCell('A6').value = "Mã trạm: " + MeterCode;
        worksheet.getCell("A6").font = { name: 'Arial', size: 10, bold: false };

        worksheet.mergeCells('A7:D7');
        worksheet.getCell('A7').value = "Tên trạm: " + info[0].meter_name;
        worksheet.getCell("A7").font = { name: 'Arial', size: 10, bold: false };


        worksheet.getCell('A8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('A8').value = "STT";
        worksheet.getCell('A8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('A8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('B8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('B8').value = "Thời gian";
        worksheet.getCell('B8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('B8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('C8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('C8').value = "Độ đục";
        worksheet.getCell('C8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('C8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('D8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('D8').value = "Nhiệt độ";
        worksheet.getCell('D8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('D8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('E8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('E8').value = "PH";
        worksheet.getCell('E8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('E8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('F8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('F8').value = "Độ cứng";
        worksheet.getCell('F8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('F8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('G8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('G8').value = "Clo dư";
        worksheet.getCell('G8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('G8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        worksheet.getCell('H8').fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: '70CBFF' },
        }
        worksheet.getCell('H8').value = "Độ mặn (%)";
        worksheet.getCell('H8').font = { name: 'Arial', size: 10, bold: true };
        worksheet.getCell('H8').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };


        for (let i = 0; i < result.length; i++) {
            worksheet.getCell('A' + (9 + i)).value = " " + (i + 1) + " ";
            worksheet.getCell('A' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            worksheet.getCell('B' + (9 + i)).value = new Date(result[i].time).toLocaleString('en-GB');
            worksheet.getCell('B' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            worksheet.getCell('C' + (9 + i)).value = show_if_null(result[i].do_duc)
            worksheet.getCell('C' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

            worksheet.getCell('D' + (9 + i)).value = show_if_null(result[i].nhiet_do)
            worksheet.getCell('D' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

            worksheet.getCell('E' + (9 + i)).value = show_if_null(result[i].ph)
            worksheet.getCell('E' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

            worksheet.getCell('F' + (9 + i)).value = show_if_null(result[i].do_cung)
            worksheet.getCell('F' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

            worksheet.getCell('G' + (9 + i)).value = show_if_null(result[i].clo_du)
            worksheet.getCell('G' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

            worksheet.getCell('H' + (9 + i)).value = show_if_null(result[i].do_man)
            worksheet.getCell('H' + (9 + i)).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };




        }


        for (let i = 0; i < result.length + 1; i++) {
            for (let j = 1; j <= 8; j++) {
                worksheet.getCell(numToLetter(j) + (8 + i)).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            }
        }

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