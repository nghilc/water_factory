
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
    VIEW_TYPE = $("#view_type").val();
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
        url: "/report/get/meter_pressure_data",
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
    let view_type  = $("#view_type").val();
    console.log(data)

    if (view_type == "ngang"){
        let html = `
        <tr>
        <th>Điểm đo</th>
        <th>Chỉ số</th>
        ${[...new Set(data.map(d => d.time))].map(d => `<th>${getTodayDate(d)}</th>`).join('')}
        </tr>
    `;
        let map = {};
        data.forEach(d => {
            if (!map[d.MeterCode]) map[d.MeterCode] = {};
            map[d.MeterCode][d.time] = d;
        });

        Object.keys(map).forEach(MeterCode => {
            html += `<tr><td rowspan="2">${findNameByMeterCode(totaleq, MeterCode)}</td><td>Áp lực min</td>`;
            Object.keys(map[MeterCode]).forEach(day => {
                html += `<td>${map[MeterCode][day].min_day_pressure ?? ''}</td>`;
            });
            html += `</tr>`;

            html += `<tr><td>Áp lực max</td>`;
            Object.keys(map[MeterCode]).forEach(day => {
                html += `<td>${map[MeterCode][day].max_day_pressure ?? ''}</td>`;
            });
            html += `</tr>`;
        });

        $('#report_table').html(html);
    }else{
        const days = [...new Set(data.map(d => d.time))];
        const meters = [...new Set(data.map(d => d.MeterCode))];
        let map = {};
        data.forEach(d => {
            if (!map[d.time]) map[d.time] = {};
            map[d.time][d.MeterCode] = d;
        });

        let html = `<tr><th rowspan="2" class="align-middle">Ngày</th>`;
        meters.forEach(m => {
            html += `<th colspan="2" >${findNameByMeterCode(totaleq, m) }</th>`;
        });
        html += `</tr><tr>`;
        meters.forEach(() => {
            html += `<th>Min</th><th>Max</th>`;
        });
        html += `</tr>`;

        days.forEach(day => {
            html += `<tr><td>${getTodayDate(day)}</td>`;
            meters.forEach(m => {
                let d = map[day]?.[m];
                html += `<td>${d?.min_day_pressure ?? ''}</td>`;
                html += `<td>${d?.max_day_pressure ?? ''}</td>`;
            });
            html += `</tr>`;
        });

        $('#report_table').html(html);
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
    form.action = '/report/export_meter_pressure_data';
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

    const input4 = document.createElement('input');
    input4.type = 'hidden';
    input4.name = 'view_type';
    input4.value = VIEW_TYPE;

    form.appendChild(input);
    form.appendChild(input2);
    form.appendChild(input3);
    form.appendChild(input4);


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
                showWeekNumbers: true,
                timePicker: false,
                // timePickerIncrement: 1,
                // timePicker24Hour: true,
                opens: 'right',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-primary',
                cancelClass: 'btn-small',
                format: 'DD/MM/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Submit',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY'
                }
            }
        )
        $("#report_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#report_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#report_time_to").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: false,
                // timePickerIncrement: 1,
                // timePicker24Hour: true,
                opens: 'right',
                buttonClasses: ['btn btn-default'],
                applyClass: 'btn-small btn-primary',
                cancelClass: 'btn-small',
                format: 'DD/MM/YYYY',
                separator: ' to ',
                locale: {
                    applyLabel: 'Submit',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: 'Custom Range',
                    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    firstDay: 1,
                    format: 'DD/MM/YYYY'
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
        ? Array(XLSX.utils.decode_range(ws['!ref']).e.c + 1).fill({ wch: 15 })
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
    XLSX.writeFile(wb, 'bao_cao_ap_luc.xlsx');
}
  