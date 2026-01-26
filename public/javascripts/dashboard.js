let LANG = "vi";
var TABS = []
$(document).ready(function () {
    $.ajax({
        url: "/get/lang",
        type: "GET",
        success: function (res) {
            // console.log(res);
            // LANG = res.lang;
            render_map($("#filter_danhsachtram").children("option:selected").val(), $("#filter_danhsachtram").children("option:selected").attr("dv_type"));

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


function render_map(id, type) {
    $.ajax({
        url: "/dashboard/get/map_data",
        type: "GET",
        data: { org_id: id, type },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            init_map(res.danh_sach_thiet_bị);
            render_table_meter_list(res.danh_sach_thiet_bị)
            render_status(res.danh_sach_thiet_bị)
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

function render_status(meter_list){
    let onl = 0;
    let off = 0;
    let warning = 0;
    meter_list.forEach(e => {
        if (e.status_meter == 1 || e.status_meter == 2){
            onl += 1
        }
        if (e.status_meter == 2){
            warning += 1
        }
        if (e.status_meter == 0){
            off += 1
        }
    });
    $("#dash_board_total").html(meter_list.length);
    $("#dashboard_lost_connect").html(off);
    $("#dashboard_good").html(onl);
    $("#dashboard_exceeded").html(warning);

}


function render_table_meter_list(meter_list) {
    $("#danhsachtram_body").empty();
    let x = "";
    for (let i = 0; i < meter_list.length; i++) {
        x += '<tr class="' + (i == 0 ? 'selected-row' : "") + '" MeterCode="' + meter_list[i].MeterCode + '" NodeCode="' + meter_list[i].NodeCode + '" meter_name="' + meter_list[i].meter_name + '" meter_status="' + meter_list[i].status_meter + '" location_lat="' + meter_list[i].lat + '" location_long="' + meter_list[i].lng + '" type="' + meter_list[i].meter_type + '"><td class="text-left">' + meter_list[i].meter_name + '</td>';
        if (meter_list[i].status_meter == 2) {
            x += '<td class="text-center" meter_status="' + meter_list[i].status_meter + '"><span><i class="fa fa-circle text-warning"></i></span></td>';
        } else if (meter_list[i].status_meter == 1) {
            x += '<td class="text-center" meter_status="' + meter_list[i].status_meter + '"><span><i class="fa fa-circle text-success"></i></span></td>';
        } else {
            x += '<td class="text-center" meter_status="' + meter_list[i].status_meter + '"><span><i class="fa fa-circle text-danger"></i></span></td>';
        }
        x += '</tr>';
    }
    $("#danhsachtram_body").append(x);
}


//click vào 1 thiết bị trên danh sách trạm 
$(document).ready(function () {
    $(document).on("click", "#danhsachtram tbody tr", function () {
        let location_lat = $(this).attr("location_lat");
        let location_long = $(this).attr("location_long");
        let MeterCode = $(this).attr("MeterCode")
        if (location_lat != "" && location_lat != null && location_lat != "null" && location_long != "" && location_long != null && location_long != "null") {
            if (OBJ_MARKERS[MeterCode]) {
                Lmap.closePopup();

                let marker = OBJ_MARKERS[MeterCode];

                Lmap.setView(marker.getLatLng(), 16);
                marker.openPopup();
                // markers.zoomToShowLayer(marker, function () {
                //     marker.openPopup();
                // });
            }
        } else {
            show_notification("Điểm đo chưa cài đặt vị trí", "error")
        }
        $('#danhsachtram tbody tr').removeClass('selected-row');
        $(this).addClass('selected-row');
    })
})

var STATUS_TYPE = "all";

$(document).ready(function () {
    let current_sort_col = null;
    let sort_asc = true;
    $(".sortable").on("click", function () {
        let col = $(this).attr("data_column");

        let table = $("#danhsachtram_body");
        let rows = table.find("tr").toArray();
        if (current_sort_col == col) {
            sort_asc = !sort_asc;
        } else {
            current_sort_col = col;
            sort_asc = true;
        }

        rows.sort((a, b) => {
            let aValue, bValue;
            if (col == "status") {
                aValue = $(a).find(`td:nth-child(${$(this).index() + 1})`).attr("meter_status").trim();
                bValue = $(b).find(`td:nth-child(${$(this).index() + 1})`).attr("meter_status").trim();
            } else {
                aValue = $(a).find(`td:nth-child(${$(this).index() + 1})`).text().trim();
                bValue = $(b).find(`td:nth-child(${$(this).index() + 1})`).text().trim();
            }


            if (!isNaN(aValue) && !isNaN(bValue)) {
                return sort_asc ? aValue - bValue : bValue - aValue;
            }
            return sort_asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        })

        table.html(rows);

        $(".sortable i").removeClass("fa-sort-up fa-sort-down active-sort").addClass("fa-sort-down").css("color", "gray");
        if (sort_asc) {
            $(this).find("i").removeClass("fa-sort-down fa-sort-up").addClass("fa-sort-down active-sort");
        } else {
            $(this).find("i").removeClass("fa-sort-down fa-sort-up").addClass("fa-sort-up active-sort");
        }
    })

    $("#searchInput").on("keyup", function () {
        let searchValue = $("#searchInput").val().toLowerCase();
        let selectedType = $("#meter_type_filter").val(); // 1,2,3, all

        $("#danhsachtram tbody tr").each(function () {
            let $tr = $(this);

            let meterCode = ($tr.attr("MeterCode") || "").toLowerCase();
            let text = $tr.text().toLowerCase();
            let rowType = $tr.attr("type");
            let status = $tr.attr("meter_status")
            let matchSearch =
                !searchValue ||
                meterCode.includes(searchValue) ||
                text.includes(searchValue);

            let matchType =
                selectedType === "all" || rowType === selectedType;

            let statusType = 
                STATUS_TYPE === "all" || (STATUS_TYPE == "lost" && status == 0) || (STATUS_TYPE == "good" && (status == 1 || status == 2)) || (STATUS_TYPE == "exceeded" && status == 2)    
                $tr.toggle(matchSearch && matchType && statusType);
        });
    });

    $("#meter_type_filter").on("change", function () {
        let searchValue = $("#searchInput").val().toLowerCase();
        let selectedType = $("#meter_type_filter").val(); // 1,2,3, all

        $("#danhsachtram tbody tr").each(function () {
            let $tr = $(this);

            let meterCode = ($tr.attr("MeterCode") || "").toLowerCase();
            let text = $tr.text().toLowerCase();
            let rowType = $tr.attr("type");
            let status = $tr.attr("meter_status")

            let matchSearch =
                !searchValue ||
                meterCode.includes(searchValue) ||
                text.includes(searchValue);

            let matchType =
                selectedType === "all" || rowType === selectedType;
            let statusType =
                STATUS_TYPE === "all" || (STATUS_TYPE == "lost" && status == 0) || (STATUS_TYPE == "good" && (status == 1 || status == 2)) || (STATUS_TYPE == "exceeded" && status == 2)
            $tr.toggle(matchSearch && matchType && statusType);
        });
    });

    $(document).on("click", ".hover_class", function () {
        $(".hover_class").css("background-color", "#fff");
        $(this).css("background-color", "#d5d5d598");
        let type = $(this).attr("id");
        switch (type) {
            case "dashboard_total_link_monitoring":
                STATUS_TYPE = "all";
                arr_marker.forEach(m => {
                    m.marker.setOpacity(1);
                });
                break;
            case "dashboard_lost_link_monitoring":
                STATUS_TYPE = "lost";
                arr_marker.forEach(m => {
                    if (m.status == 0) {
                        m.marker.setOpacity(1); // giữ nguyên
                    } else {
                        m.marker.setOpacity(0); // làm mờ
                    }
                });
                break;
            case "dashboard_good_link_monitoring":
                STATUS_TYPE = "good";
                arr_marker.forEach(m => {
                    if (m.status == 1 || m.status == 2) {
                        m.marker.setOpacity(1); // giữ nguyên
                    } else {
                        m.marker.setOpacity(0); // làm mờ
                    }
                });
                break;
            case "dashboard_exceeded_link_monitoring":
                STATUS_TYPE = "exceeded";
                arr_marker.forEach(m => {
                    if (m.status == 2) {
                        m.marker.setOpacity(1); // giữ nguyên
                    } else {
                        m.marker.setOpacity(0); // làm mờ
                    }
                });
                break;
        }
        let searchValue = $("#searchInput").val().toLowerCase();
        let selectedType = $("#meter_type_filter").val(); // 1,2,3, all

        $("#danhsachtram tbody tr").each(function () {
            let $tr = $(this);

            let meterCode = ($tr.attr("MeterCode") || "").toLowerCase();
            let text = $tr.text().toLowerCase();
            let rowType = $tr.attr("type");
            let status = $tr.attr("meter_status")

            let matchSearch =
                !searchValue ||
                meterCode.includes(searchValue) ||
                text.includes(searchValue);

            let matchType =
                selectedType === "all" || rowType === selectedType;
            let statusType =
                STATUS_TYPE === "all" || (STATUS_TYPE == "lost" && status == 0) || (STATUS_TYPE == "good" && (status == 1 || status == 2)) || (STATUS_TYPE == "exceeded" && status == 2)
            $tr.toggle(matchSearch && matchType && statusType);
        });

    })

})

function add_meter() {
    $('#add_meter').modal('show');

}

$(document).ready(function () {
    $('#add_meter').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex', 0);
        $(this).find('input').not("#static_group").val("");
        $(this).find('textarea').not("#static_group").val("");
    })
})

$(document).ready(function () {

    $("#save_add_meter").on("click", function () {
        let arr_meter = $("#add_meter_metercode").val().split(/\r?\n/);
        let password = $("#add_meter_password").val();
        let dv_id = $("#add_meter_donvi").children("option:selected").val();
        let type = $("#add_meter_donvi").children("option:selected").attr("dv_type");
        if (arr_meter.length == 0) {
            show_notification("Mã thiết bị không được để trống", "error");
            return false;
        }
        $.ajax({
            url: "/dashboard/post/save_add_meter",
            type: "POST",
            data: { arr_meter: JSON.stringify(arr_meter), password, dv_id, type },
            beforeSend: function () {
                showLoading();  // Hiện overlay khi bắt đầu tải
            },
            success: function (res) {
                show_notification(res.message, (res.success) ? "success" : "error");
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
    })
})


var LEVEL_1_MAIN__MAP = null;
var Lmap = null;
var OBJ_MARKERS = {};
var markers;
var arr_marker = [];
function init_map(data) {
    arr_marker = [];
    let ZOOM = localStorage.getItem('zoom_store') || 13;
    markers = null;
    OBJ_MARKERS = {};
    let center = {
        lat: 21.029462138754397,
        lng: 105.78479111781412
    };
    // let ZOOM = 13;
    if (Lmap) {
        Lmap.off();
        Lmap.remove();
        Lmap = null;
    }
    if (L.DomUtil.get('level_1_main_map')) {
        L.DomUtil.get('level_1_main_map')._leaflet_id = null;
    }
    $("#level_1_main_map").empty();
    Lmap = new L.map('level_1_main_map', {
        popupMovable: false,//set 'true' for enable this plugin.
        popupMovableZoomMode: 'relative',
        // popupMovableZoomMode: 'absolute',
        closePopupOnClick: false,//when using the plugin ,this option are recommend 'false'.
        zoomControl: true,
        preferCanvas: true,
        // fullscreenControl: true,
        scrollWheelZoom: false, // disable original zoom function
        smoothWheelZoom: true,  // enable smooth zoom 
        smoothSensitivity: 1,   // zoom speed. default is 1
        // fullscreenControl: true, // Thêm nút full màn hình
        // fullscreenControlOptions: {
        //     position: 'topleft'
        // }

    }).setView(new L.LatLng(center.lat, center.lng), ZOOM);

    let typeMap = localStorage.getItem('type_map') || 'street';
    // L.tileLayer('https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}').addTo(Lmap);

    // Chế độ Đường phố (Street Map)
    // var streetLayer = L.tileLayer('https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    //     attribution: '© Google Maps'
    // });
    var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });
    // Chế độ Vệ tinh (Satellite)
    var satelliteLayer = L.tileLayer('https://mt.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google Maps'
    });
    if (typeMap === 'satellite') {
        satelliteLayer.addTo(Lmap);
    } else {
        streetLayer.addTo(Lmap);
    }
    // Thêm control để chuyển đổi giữa các chế độ
    var baseLayers = {
        "Đường phố": streetLayer,
        "Vệ tinh": satelliteLayer
    };
    L.control.layers(baseLayers, null, { position: 'topleft' }).addTo(Lmap);
    Lmap.on('baselayerchange', function (e) {
        console.log(e)
        if (e.name === 'Vệ tinh') {
            localStorage.setItem('type_map', 'satellite');
        } else {
            localStorage.setItem('type_map', 'street');
        }
    });

    Lmap.on('zoomend', function () {
        let zoom = Lmap.getZoom();
        localStorage.setItem('zoom_store', zoom);
    });
    // L.control.zoom({ position: 'topleft' }).addTo(Lmap);
    // var osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    //     attribution: '© OpenStreetMap contributors'
    // }).addTo(Lmap);
    const vietnamIslandsGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Quần đảo Hoàng Sa",
                    "country": "Việt Nam",
                    "description": "Quần đảo Hoàng Sa thuộc chủ quyền Việt Nam"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [111.608928, 16.534774]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Quần đảo Trường Sa",
                    "country": "Việt Nam",
                    "description": "Quần đảo Trường Sa thuộc chủ quyền Việt Nam"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [115.82882578861968, 10.72399845073377]
                }
            }
        ]
    };
    const hoangSaLabel = L.marker(
        [16.534774, 111.608928],
        {
            icon: L.divIcon({
                className: '',
                html: `
        <div style="
          font: 11px/1.5 Arial, Helvetica, sans-serif;
          text-align: center;
          color: black;
          text-shadow:
            1px  1px 0 #fff,
           -1px  1px 0 #fff,
            1px -1px 0 #fff,
           -1px -1px 0 #fff;
        ">
          Quần đảo Hoàng Sa
        </div>
      `,
                iconSize: [80, 20],
                iconAnchor: [40, 10]
            })
        }
    ).addTo(Lmap);

    const truongSaLabel = L.marker(
        [10.72399845073377, 115.82882578861968],
        {
            icon: L.divIcon({
                className: '',
                html: `
        <div style="
          font: 11px/1.5 Arial, Helvetica, sans-serif;
          text-align: center;
          color: black;
          text-shadow:
            1px  1px 0 #fff,
           -1px  1px 0 #fff,
            1px -1px 0 #fff,
           -1px -1px 0 #fff;
        ">
          Quần đảo Trường Sa
        </div>
      `,
                iconSize: [80, 20],
                iconAnchor: [40, 10]
            })
        }
    ).addTo(Lmap);
    L.geoJSON(vietnamIslandsGeoJSON, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: function (feature, layer) {
            // Popup
            layer.bindPopup(`
            <strong>${feature.properties.name}</strong><br/>
            ${feature.properties.description}
        `);

            // Label luôn hiển thị
            layer.bindTooltip(
                `${feature.properties.name}<br/>(${feature.properties.country})`,
                {
                    permanent: true,
                    direction: 'top',
                    className: 'island-label'
                }
            );
        }
    }).addTo(Lmap);

    // Fullscreen control
    L.control.fullscreen({
        position: 'topleft'
    }).addTo(Lmap);
    
    // nút lưu cấu hình
    // var save_btn = L.easyButton({
    //     states: [{
    //         stateName: "save setting",
    //         icon: "fas fa-save",
    //         title: "Lưu cấu hình bản đồ",
    //         onClick: function (btn, Lmap) {
    //             let center = {
    //                 lat: Lmap.getCenter().lat,
    //                 lng: Lmap.getCenter().lng
    //             }
    //             let post_data = {
    //                 zoom: Lmap.getZoom(),
    //                 center: center
    //             }
    //             $.ajax({
    //                 url: "/dashboard/post/map_setting",
    //                 type: "POST",
    //                 data: { map_setting: JSON.stringify(post_data) },
    //                 success: function (res) {
    //                     show_notification(res.message, "success")
    //                 },
    //                 error: function (xhr, status, error) {
    //                     if (xhr.status === 401) {
    //                         alert(xhr.responseText);
    //                         window.location.href = "/login"
    //                     } else {
    //                         console.error("Lỗi:", error);
    //                     }
    //                 }
    //             })
    //         }
    //     }]
    // });

    // save_btn.addTo(Lmap);

    const svgicon = 'data:image/png;base64,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';
    

    var redPinIcon = L.divIcon({
        className: 'custom-svg-marker',
        html: `
            <svg width="32" height="42" viewBox="0 0 38 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0C8.50667 0 0 8.50667 0 19C0 24.5101 2.5285 29.5135 6.55139 33.036L19 52L31.4486 33.036C35.4715 29.5135 38 24.5101 38 19C38 8.50667 29.4933 0 19 0Z"
                      fill="#ef4444" fill-opacity="0.9"/>
                <circle cx="19" cy="19" r="12" fill="white"/>
            </svg>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],   // mũi pin chạm tọa độ
        popupAnchor: [0, -42]
    });

    var bluePinIcon = L.divIcon({
        className: 'custom-svg-marker',
        html: `
        <svg class="absolute" width="32" height="42" viewBox="0 0 38 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0C8.50667 0 0 8.50667 0 19C0 24.5101 2.5285 29.5135 6.55139 33.036L19 52L31.4486 33.036C35.4715 29.5135 38 24.5101 38 19C38 8.50667 29.4933 0 19 0Z" fill="#1ca3e3" fill-opacity="0.9"></path>
        <circle cx="19" cy="19" r="12" fill="white"></circle>
      </svg>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],   // mũi pin chạm tọa độ
        popupAnchor: [0, -42]
    });

    const redicon = new L.icon({
        iconUrl: '/images/redicon-removebg-preview.png',
        iconSize: [80, 80],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })
    const blueicon = new L.icon({
        iconUrl: '/images/blueiconpng-removebg-preview.png',
        iconSize: [80, 80],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    const icon = new L.icon({
        iconUrl: svgicon,
        iconSize: [20, 40],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    const icon_disconnect = new L.icon({
        iconUrl: '/images/marker_red.png',
        iconSize: [35, 50],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    const icon_warning = new L.icon({
        iconUrl: '/images/marker_yellow.png',
        iconSize: [35, 50],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    const icon_success = new L.icon({
        iconUrl: '/images/marker_blue.png',
        iconSize: [35, 50],
        iconAnchor: [10, 40],
        popupAnchor: [0, -30],
    })

    // markers = L.markerClusterGroup();
    if (data.length > 0) {
        var myPoints = [];//
        for (var i = 0; i < data.length; i++) {
            if (data[i].lat != null && data[i].lng != null && data[i].lat != "" && data[i].lng != "") {
                let content = "";
                switch (data[i].meter_type) {
                    case "MUCNUOC":
                        content = `<div>
                        <div class="popup-device">
                            <div class="popup-header">${(data[i].name)}</div>
                            <table class="popup-table">
                                <tr><td>Dữ liệu gần nhất</td><td>${(new Date(data[i].last_data_time).toLocaleString('en-GB'))}</td></tr>
                                <tr><td>Mực nước hiện tại</td><td>${show_if_null(data[i].last_measure_sensor)} (${(data[i].data_type === 1 ? "m" : "cm")})</td></tr>
                                <tr><td>Mực nước động</td><td>${show_if_null(data[i].last_measure_dynamic)} (${(data[i].data_type === 1 ? "m" : "cm")})</td></tr>
                            </table>
                        </div>
                    </div>`;
                        break;
                    case "CSMT":
                        content = `<div>
                        <div class="popup-device">
                            <div class="popup-header">${(data[i].name)}</div>
                            <table class="popup-table">
                                <tr><td>Dữ liệu gần nhất</td><td>${(new Date(data[i].last_data_time).toLocaleString('en-GB'))}</td></tr>
                                <tr><td>Nhiệt độ</td><td>${show_if_null(data[i].last_Temp)} (°C)</td></tr>
                                <tr><td>Độ PH</td><td>${show_if_null(data[i].last_PH)}</td></tr>
                                <tr><td>Độ đục</td><td>${show_if_null(data[i].last_DoDuc)} (NTU)</td></tr>
                                <tr><td>Độ cứng</td><td>- (mg/l)</td></tr>
                                <tr><td>Clo dư</td><td>${show_if_null(data[i].last_CloDu)} (mg/l)</td></tr>
                                <tr><td>Độ mặn</td><td>${show_if_null(data[i].last_DoManPer)} (%)</td></tr>
                            </table>
                        </div>
                    </div>`;
                        break;
                    case "DONGHO":
                        content = `<div>
                        <div class="popup-device">
                            <div class="popup-header">${(data[i].name)}</div>
                            <table class="popup-table">
                                <tr><td>Dữ liệu gần nhất</td><td>${(new Date(data[i].last_data_time).toLocaleString('en-GB'))}</td></tr>
                                <tr><td>Nhiệt độ</td><td>${show_if_null(data[i].last_Temp)} (°C)</td></tr>
                                <tr><td>Lưu lượng</td><td>${show_if_null(data[i].last_flow_rate)} (m³/h)</td></tr>
                                <tr><td>Áp suất</td><td>${show_if_null(data[i].last_pressure)} (bar)</td></tr>
                                <tr><td>Độ cứng</td><td>- (mg/l)</td></tr>
                                <tr><td>Clo dư</td><td>${show_if_null(data[i].last_CloDu)} (mg/l)</td></tr>
                                <tr><td>Độ mặn</td><td>${show_if_null(data[i].last_DoManPer)} (%)</td></tr>
                               
                            </table>
                        </div>
                    </div>`;
                        break;
                    case "GENERATOR":
                        content = `<div>
                        <div class="popup-device">
                            <div class="popup-header">${(data[i].name)}</div>
                            <table class="popup-table">
                                <tr><td>Tốc độ</td><td>${show_if_null(data[i].Speed_v) + "&nbsp;" + return_unit_html(data[i].Speed_u)}</td></tr>
                                <tr><td>Điện áp ắc quy</td><td>${show_if_null(data[i].V_Bat_v) + "&nbsp;" + return_unit_html(data[i].V_Bat_u)}</td></tr>
                                <tr><td>Nhiệt độ nước</td><td>${show_if_null(data[i].Tem_W_v) + "&nbsp;" + return_unit_html(data[i].Tem_W_u)}</td></tr>
                                <tr><td>Áp suất dầu</td><td>${show_if_null(data[i].P_Oil_v) + "&nbsp;" + return_unit_html(data[i].P_Oil_u)}</td></tr>
                            </table>
                        </div>
                    </div>`;
                        break;
                }
                

          
     


                const popup2 = new L.Popup({
                    autoClose: false,
                    offset: [0, 10],
                    autoPan: true,
                    autoPanPadding: [50, 50]
                }).setContent(content);

                // L.marker([data[i].location_lat, data[i].location_long],{icon: icon}).addTo(Lmap).bindPopup(popup2).openPopup();
                var marker = L.marker([Number(data[i].lat), Number(data[i].lng)], { icon: (data[i].status_meter == 1) ? blueicon : ((data[i].status_meter == 2) ? blueicon : redicon) }).bindPopup(
                    popup2
                    //     content, {
                    //     autoPan: true, 
                    //     autoPanPadding: [50, 50] 
                    // }
                ).addTo(Lmap);
                OBJ_MARKERS[data[i].MeterCode] = marker;
                 arr_marker.push({
                    marker: marker,
                     status: data[i].status_meter
                 })

                // marker.on('mouseover', function () {
                //             let currentId = arr_marker.find(m => m.marker === this)?.donvinguoidung_id;
                //             arr_marker.forEach(m => {
                //                 if (m.donvinguoidung_id === currentId && m.donvinguoidung_id != null) {
                //                     m.marker.setOpacity(1); // giữ nguyên
                //                 } else {
                //                     m.marker.setOpacity(0.3); // làm mờ
                //                 }
                //             });
                // });

                // marker.on('mouseout', function () {
                //     arr_marker.forEach(m => m.marker.setOpacity(1));
                // });

                // markers.addLayer(marker);


                myPoints.push(new Array(data[i].lat, data[i].lng));
            }
        }

        // Lmap.addLayer(markers);

        // var myBounds = new L.LatLngBounds(myPoints);
        // var lcent =  Lmap.fitBounds(myBounds).getCenter(); 
  
            // Lmap.setView(myPoints[0], ZOOM);
        if (myPoints.length > 0){
            var centroid = calculateCentroid(myPoints);
            Lmap.setView(centroid, ZOOM);
        }
    }



    //L.popup({
    //    autoClose:false,
    //    popupmovable:false
    //}).setLatLng([35.36, 137.09])
    //  .setContent('It can also be disabled individually.')
    //  .openOn(Lmap);
    ////standalone popup(not bind for any markers.)
    //L.popup({autoClose:false})
    //  .setLatLng([35.36, 137.09])
    //  .setContent('Standalone popup are movable too.')
    //  .openOn(Lmap);






    // Disperses popups that are being displayed(only Marker binded Popup).
    // const pm = new L.Map.PopupMovable(Lmap);
    // pm.popupDispersion();
}

function calculateCentroid(points) {
    var totalPoints = points.length;
    var latSum = 0;
    var lngSum = 0;

    points.forEach(function (point) {
        latSum += Number(point[0]);
        lngSum += Number(point[1]);
    });

    var centroidLat = latSum / totalPoints;
    var centroidLng = lngSum / totalPoints;

    return [centroidLat, centroidLng];
}


$(document).ready(function () {
    $("#filter_danhsachtram").change(function () {
        let val = $(this).children("option:selected").val();
        let type = $(this).children("option:selected").attr("dv_type")
        // update_dashboard_general_status(val, type);
        $("#meter_type_filter").val("all");
        $(".hover_class").css("background-color", "#fff");
        $("#dashboard_total_link_monitoring").css("background-color", "rgb(213, 213, 213)");

        render_map(val, type);
    })
})

function show_0_if_null(x) {
    if (x == null) return 0;
    return x;
}

function update_dashboard_general_status(val, type) {
    $("#dash_board_total").html("-");
    $("#dashboard_lost_connect").html("-");
    $("#dashboard_good").html("-");
    $("#dashboard_exceeded").html("-");

    $.ajax({
        url: "/dashboard/get/general_status",
        type: "GET",
        data: { node_id: val, type: type },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            $("#dash_board_total").html('(' + show_0_if_null(res.meter_status.total) + ')');
            $("#dashboard_lost_connect").html(show_0_if_null(res.meter_status.lost_connect));
            $("#dashboard_good").html(show_0_if_null(res.meter_status.good));
            $("#dashboard_exceeded").html(show_0_if_null(res.meter_status.exceeded));
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



var METERCODE, NODECODE, FIELD, NAME;

$(document).ready(function () {
    $("#level_1_main_map").on("click", ".modal_field", function () {
        METERCODE = $(this).attr("MeterCode");
        NODECODE = $(this).attr("NodeCode");

        FIELD = $(this).attr("field");
        NAME = $("#"+METERCODE+"_header_name")[0].innerText;
        $('span.header-title').html($(this)[0].innerText.toLowerCase()+" - "+NAME);
        $("#modal_field_data").modal("show");
        get_field_data();
    })
})

function get_field_data() {
    let start_date = $("#chart_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#chart_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    // let DATA_SEARCH_MOMENT = $("#data_search_moment").val();
    let MeterCode = METERCODE;
    let NodeCode = NODECODE;
    $.ajax({
        url: "/data_search/get/meter_data",
        type: "GET",
        data: { start_date, end_date, MeterCode, NodeCode, DATA_SEARCH_MOMENT: "hour" },
        beforeSend: function () {
            showLoading();  // Hiện overlay khi bắt đầu tải
        },
        success: function (res) {
            render_chart_field(res.data, FIELD);
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

function export_field_data() {
    let start_date = $("#chart_time_from").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    let end_date = $("#chart_time_to").data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss");
    window.open("/report/export_field_meter_data?start_date=" + start_date + "&end_date=" + end_date + "&MeterCode=" + METERCODE + "&NodeCode=" + NODECODE + "&field=" + FIELD, "_blank");
}

var chart = null;

function render_chart_field(raw_data, key) {
    let color_config = { "ValOfNum": "#35610f", "terminal_index": "#ef4444", "flowRate": "#10b981", "pressure": "#000cff", "measure_sensor": "#0ea5e9", "measure_static": "#8b5cf6", "measure_dynamic": "#f59e0b", "measure_delta": "#ff66f2", "ValueReverse": "#62fc03", "ValueForward": "#03effcff", "Voltage": "#03fc24", "voltage_ac_quy": "#73153d", "PressureVol": "#8b50d9", "VoltageOfMeter": "#e3854fff", "Temp": "#5281e8ff" };

    let unit_config = { "ValOfNum": "", "terminal_index": "m³", "flowRate": "m³/h", "pressure": "", "measure_sensor": "", "measure_static": "", "measure_dynamic": "", "measure_delta": "", "ValueReverse": "m³", "ValueForward": "m³", "Voltage": "V", "voltage_ac_quy": "V", "PressureVol": "", "VoltageOfMeter": "%", "Temp": "℃" };
    if (raw_data.length > 0) {
        unit_config.measure_sensor = returnUnit("measure_sensor", raw_data[0].unit);
        unit_config.measure_static = returnUnit("measure_static", raw_data[0].unit);
        unit_config.measure_dynamic = returnUnit("measure_dynamic", raw_data[0].unit);
        unit_config.measure_delta = returnUnit("measure_delta", raw_data[0].unit);
        unit_config.PressureVol = returnUnit("PressureVol", raw_data[0].PressureUnit);
        unit_config.pressure = returnUnit("pressure", raw_data[0].PressureUnit);
        unit_config.Voltage = returnUnit("Voltage", raw_data[0].unit_pin);
    }
    let data = [];
    for (let i = 0; i < raw_data.length; i++) {
        let x = { time: new Date(raw_data[i].MeterTime) }
        if ((key == 'PressureVol' || key == 'pressure') && (raw_data[i][key] != null && parseInt(raw_data[i][key]) == 2550)) {
            // console.log("PressureVol or pressure error");
        } else {
            x[key] = stringtonum(raw_data[i][key]);
        }
        data.push(x);
    }
    am4core.useTheme(am4themes_animated);
    if (chart != null) {
        chart.dispose();
    }

    chart = am4core.create("chart_field", am4charts.XYChart);
    // chart.scrollbarX = new am4core.Scrollbar();
    chart.data = data;
    chart.logo.disabled = true;
    // Tối ưu kích thước biểu đồ
    chart.paddingRight = 15;
    chart.paddingLeft = 0;
    chart.maskBullets = false;

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    // dateAxis.startLocation = 0.5;
    // dateAxis.endLocation = 0.5;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 60;
    dateAxis.renderer.labels.template.fontSize = 11;

    // dateAxis.renderer.grid.template.disabled = true;
    // dateAxis.renderer.fullWidthTooltip = true;
    dateAxis.renderer.labels.template.fill = am4core.color("#6b7280");
    dateAxis.renderer.grid.template.strokeOpacity = 0.05;
    dateAxis.renderer.cellStartLocation = 0.1;
    dateAxis.renderer.cellEndLocation = 0.9;

    dateAxis.dateFormats.setKey("hour", "HH:mm");
    dateAxis.dateFormats.setKey("day", "dd/MM");
    dateAxis.periodChangeDateFormats.setKey("hour", "dd/MM");
    dateAxis.dateFormats.setKey("month", "MM/yyyy");
    dateAxis.periodChangeDateFormats.setKey("day", "MM/yyyy");
    dateAxis.tooltipDateFormat = "dd/MM/yyyy HH:mm";

    // Tạo các trục Y và series
    var leftAxisCount = 0;
    var rightAxisCount = 0;
    var seriesList = [];
    // Tạo trục Y
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fill = am4core.color(color_config[key]);
    valueAxis.renderer.labels.template.fontSize = 11;
    valueAxis.title.text = unit_config[key];
    valueAxis.title.fill = am4core.color(color_config[key]);
    valueAxis.title.fontSize = 11;
    // valueAxis.min = indicator.min;
    // valueAxis.max = indicator.max;
    valueAxis.renderer.grid.template.strokeOpacity = 0.05;
    valueAxis.cursorTooltipEnabled = false;
    // if (i % 2 == 0) {
    //     valueAxis.renderer.opposite = false;
    //     valueAxis.renderer.labels.template.paddingLeft = leftAxisCount > 0 ? 30 : 0;
    //     leftAxisCount++;
    // } else {
    //     valueAxis.renderer.opposite = true;
    //     valueAxis.renderer.labels.template.paddingRight = rightAxisCount > 0 ? 30 : 0;
    //     rightAxisCount++;
    // }

    var series;
    series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = key;
    series.dataFields.dateX = "time";
    series.name = shortToFullName(key) + unit_config[key];
    series.yAxis = valueAxis;

    series.strokeWidth = 2.5;
    series.fill = am4core.color(color_config[key]);
    series.stroke = am4core.color(color_config[key]);
    series.fillOpacity = 0.08;
    series.tensionX = 1;
    series.legendSettings.labelText = shortToFullName(key)
    series.tooltipText = shortToFullName(key) + ": {valueY} " + unit_config[key];
    series.showOnInit = true;
    // series.tooltip.pointerOrientation = "horizontal";
    series.bullets.clear();
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.cursor.lineY.disabled = true;
    chart.cursor.lineX.strokeOpacity = 0.2;
}

$(document).ready(function () {
    $(function () {
        $("#chart_time_from").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: true,
                timePickerIncrement: 1,
                timePicker24Hour: true,
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
                    format: 'DD/MM/YYYY H:mm'
                }
            }
        )
        $("#chart_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#chart_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#chart_time_to").daterangepicker(
            {
                singleDatePicker: true,
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: true,
                timePickerIncrement: 1,
                timePicker24Hour: true,
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
                    format: 'DD/MM/YYYY H:mm'
                }
            }
        )
        $("#chart_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#chart_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

$(document).ready(function () {
    $('#modal_field_data').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('select').prop('selectedIndex', 0);
        // $(this).find('input').not("#static_group").val("");
        $("#chart_time_from").data("daterangepicker").setStartDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#chart_time_from").data("daterangepicker").setEndDate(moment().startOf('minute').subtract(moment.duration("24:00:00")));
        $("#chart_time_to").data("daterangepicker").setStartDate(moment().startOf('minute'));
        $("#chart_time_to").data("daterangepicker").setEndDate(moment().startOf('minute'));
    })
})

