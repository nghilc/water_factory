
var LANG = "vi";
$(document).ready(function () {
    $.ajax({
        url: "/get/lang",
        type: "GET",
        success: function (res) {
            // LANG = res.lang;
            // console.log(LANG)
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        }
    })
});


function translate_data_table(lang) {
    if (lang == "vi") {
        return {
            "aria": {
                "sortAscending": " - click / quay lại để sắp xếp tăng dần"
            },
            "info": "",
            "infoEmpty": "Không có dữ liệu",
            "loadingRecords": "Đang tải...",
            "search": "Tìm kiếm: ",
            "zeroRecords": "Không có giá trị nào",
            "infoFiltered": "(Đã lọc từ _MAX_ tổng số bản ghi)",
            "lengthMenu": "  _MENU_ ",
            "paginate": {
                "previous": "Trước",
                "next": "Sau",
            }
        }
    }
    return {
        "aria": {
            "sortAscending": " - click/return to sort ascending"
        },
        "info": "",
        "infoEmpty": "Data Empty!",
        "loadingRecords": "Loading...",
        "search": "Search: ",
        "zeroRecords": "Zero records",
        "lengthMenu": "  _MENU_ ",
        "paginate": {
            "previous": "prev",
            "next": "next",
        }
    }
}



$(document).ready(function () {
    $("#filter_tram").on("change", function (result) {
        let tram_id = $(this).children("option:selected").val();
        let dv_type = $(this).children("option:selected").attr("dv_type");
        $("#filter_meter").empty();
        $.ajax({
            url: "/data_search/get/child_meter",
            type: "GET",
            data: { tram_id: tram_id, dv_type: dv_type },
            beforeSend: function () {
                // showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                let meter_list = res.meter_list;
                $("#checkAll").prop("checked", false)
                let x = "";
                for (let i = 0; i < meter_list.length; i++) {
                    x += "<option metercode ='" + meter_list[i].MeterCode + "' nodecode='" + meter_list[i].NodeCode + "' data-tokens ='" + meter_list[i].MeterCode + "'>" + meter_list[i].name + "</option>";
                }
                $("#filter_meter").append(x);
                $('.select2bs4').select2({
                    theme: 'bootstrap4',
                    closeOnSelect: false
                })
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    alert(xhr.responseText);
                    window.location.href = "/login"
                } else {
                    console.error("Lỗi:", error);
                }
            },
            complete: function () {
                //    hideLoading()  // Ẩn overlay sau khi tải xong
            }
        })
    })
})

$(document).ready(function () {
    $("#checkAll").change(function () {
        if ($(this).is(':checked')) {
            var allValues = $('#filter_meter option').map(function () { return this.value; }).get();
            $('#filter_meter').val(allValues).trigger('change');
        } else {
            $('#filter_meter').val(null).trigger('change');

        }
    })
})


var METER_LIST = null;
let START_DATE, END_DATE;

function init_report() {
    let meter_list = [];
    let start_date = $("#report_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#report_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    START_DATE = start_date;
    END_DATE = end_date;
    $("#filter_meter option:selected").each(function () {
        meter_list.push({
            MeterCode: $(this).attr("MeterCode"),
            NodeCode: $(this).attr("NodeCode")
        })
    })
    if (meter_list.length > 0) {
        $("#export_report").prop("disabled", false);
    }
    METER_LIST = JSON.stringify(meter_list)


    $.ajax({
        url: "/report/get/meter_terminal_index_data",
        type: "POST",
        data: { meter_list: JSON.stringify(meter_list), start_date, end_date },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            if (res.success) {
                render_report_table(res.report_data, res.totaleq)
            } else {
                show_notification(res.message, "error")
            }
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert(xhr.responseText);
                window.location.href = "/login"
            } else {
                console.error("Lỗi:", error);
            }
        },
        complete: function () {
            hideLoading()  // Ẩn overlay sau khi tải xong
        }
    })
}

// $(document).ready(function () {
//     render_report_table([]);
// })
function render_report_table(data, totaleq) {
    console.log(data)
    let str = `                                      
    <thead>
        <tr>
            <th>Tháng</th>
            <th>Điểm đo</th>
            <th>Chỉ số đầu</th>
            <th>Chỉ số cuối</th>
            <th>Sản lượng</th>
        </tr>
    </thead>                
    <tbody id="report-body"></tbody>`;

    $("#report_table").empty().append(str);

    const tbody = document.getElementById('report-body');

    // Group theo month
    const monthMap = {};
    data.forEach(item => {
        const m = formatMonth(item.month);
        if (!monthMap[m]) monthMap[m] = [];
        monthMap[m].push(item);
    });

    // Render
    Object.keys(monthMap).forEach(month => {
        const rows = monthMap[month];
        const monthRowspan = rows.length * 2;

        rows.forEach((row, index) => {

            /* ===== DÒNG 1: CHỈ SỐ ===== */
            let tr1 = '<tr>';

            if (index === 0) {
                tr1 += `<td rowspan="${monthRowspan}" class="col-month">${month}</td>`;
            }

            tr1 += `
                <td rowspan="2" class="col-name">
                    <b>${findNameByMeterCode(totaleq, row.MeterCode)}</b>
                </td>

                <td class="col-value">
                    ${formatNumber(row.first_value)}
                </td>

                <td class="col-value">
                    ${formatNumber(row.last_value)}
                </td>

                <td rowspan="2" class="col-production">
                    ${formatNumber(row.production)}
                </td>
            </tr>`;

            /* ===== DÒNG 2: THỜI GIAN ===== */
            let tr2 = `
            <tr>
                <td class="col-time">
                    ${formatDateTime(row.first_time)}
                </td>
                <td class="col-time">
                    ${formatDateTime(row.last_time)}
                </td>
            </tr>`;

            tbody.insertAdjacentHTML('beforeend', tr1 + tr2);
        });
    });
}
// function render_report_table(data, totaleq) {
//     console.log(data);
//     let str = `                                        
//     <thead>
//     <tr>
//         <th>Tháng</th>
//         <th>Điểm đo</th>
//         <th>Chỉ số đầu</th>
//         <th>Chỉ số cuối</th>
//         <th>Sản lượng</th>
//     </tr>
// </thead>                
// <tbody id="report-body"></tbody>`
//     $("#report_table").empty();
//     $("#report_table").append(str);

//     const tbody = document.getElementById('report-body');
//     tbody.innerHTML = '';

//     // Group theo month
//     const monthMap = {};
//     data.forEach(item => {
//         const m = formatMonth(item.month);
//         if (!monthMap[m]) monthMap[m] = [];
//         monthMap[m].push(item);
//     });

//     // Render
//     Object.keys(monthMap).forEach(month => {
//         const rows = monthMap[month];

//         rows.forEach((row, index) => {
//             let html = '<tr>';

//             // Chỉ render cột tháng ở dòng đầu
//             if (index === 0) {
//                 html += `<td rowspan="${rows.length}" class="col-month">${month}</td>`;
//             }

//             html += `
//           <td class="col-name">
//             <b>${row.name || row.MeterCode}</b>
//           </td>
  
//           <td class="col-value">
//             <div>${formatNumber(row.first_value)}</div>
//             <div class="time">${formatDateTime(row.first_time)}</div>
//           </td>
  
//           <td class="col-value">
//             <div>${formatNumber(row.last_value)}</div>
//             <div class="time">${formatDateTime(row.last_time)}</div>
//           </td>
  
//           <td class="col-production">
//             ${formatNumber(row.production)}
//           </td>
//         </tr>`;

//             tbody.insertAdjacentHTML('beforeend', html);
//         });
//     });

// }
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

function formatNumber(num) {
    if (num == null) return '';
    return Number(num).toLocaleString('vi-VN');
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



$(document).ready(function () {
    $("#export_report").on("click", function () {
        if (METER_LIST == null || METER_LIST.length == 0) {
            show_notification("Chưa thêm trạm quan trắc", "error");
            return false;
        }
        openReportInNewTab(METER_LIST)
        // exportExcel()
    })
})


function openReportInNewTab(meterList) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/report/export_meter_terminal_index';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'meter_list';
    input.value = JSON.stringify(meterList);

    const input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'start_date';
    input2.value = START_DATE;

    const input3 = document.createElement('input');
    input3.type = 'hidden';
    input3.name = 'end_date';
    input3.value = END_DATE;

    form.appendChild(input);
    form.appendChild(input2);
    form.appendChild(input3);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

$(document).ready(function () {
    $(function () {
        $("#report_time_from").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: false,
                timePicker: false,
                // timePickerIncrement: 1,
                // timePicker24Hour: true,
                opens: 'right',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-primary',
                cancelClass: 'btn-small',
                format: 'MM/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Submit',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    // daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'MM/YYYY'
                }
            }
        )
        $("#report_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#report_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#report_time_to").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: false,
                timePicker: false,
                // timePickerIncrement: 1,
                // timePicker24Hour: true,
                opens: 'right',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-primary',
                cancelClass: 'btn-small',
                format: 'MM/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Submit',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    // daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'MM/YYYY'
                }
            }
        )
        $("#report_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#report_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

function exportExcel() {
    // const table = document.getElementById('report_table');

    // const wb = XLSX.utils.book_new();
    // const ws = XLSX.utils.table_to_sheet(table);

    // XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // XLSX.writeFile(wb, 'bao_cao_ap_luc.xlsx');
    const table = document.getElementById('report_table');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table, { raw: true });
    ws['!cols'] = ws['!ref']
        ? Array(XLSX.utils.decode_range(ws['!ref']).e.c + 1).fill({ wch: 20 })
        : [];
    // Giả sử cột A là ngày
    const range = XLSX.utils.decode_range(ws['!ref']);

    for (let R = 1; R <= range.e.r; R++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
        const cell = ws[cellAddress];

        if (cell && typeof cell.v === 'string') {
            const d = new Date(cell.v);
            if (!isNaN(d)) {
                cell.v = d;
                cell.t = 'd';                 // type date
                cell.z = 'dd/mm/yyyy';        // format
            }
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'bao_cao_san_luong.xlsx');
}
