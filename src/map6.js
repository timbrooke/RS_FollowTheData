$(document).ready(function () {
    var map;
    var map2;
    var dataProvider;
    var dataProvider2;
    var currentYear = 2000;
    var theData;

    var sectionDataMoo = [null, null];
    loadAllData();


    function loadAllData(){
        console.log("ABOUT TO LOAD ALL DATA");
        $.ajax({
            url: "data/broadband.json",
            type: 'get',
            dataType: 'json',
            error:function (jqXHR, textStatus, errorThrown ){
                console.log("ERROR:"+textStatus+" "+errorThrown);
            },
            success: function (data) {
                theData = data;
                //updateYear();
                //map.validateData();
                console.log(theData);
            }
        });
    }

    function makeColorFromRGB(r, g, b) {
        var num = r << 16 | g << 8 | b;
        var col = num.toString(16);
        var l = 6 - col.length;
        for (var i = 0; i < l; i++) {
            col = "0" + col;
        }
        return "#" + col;
    }

    function updateYear() {
        var year = document.getElementById('amount').innerHTML;
        var yearStr = year.toString();
        dataProvider.areas = [];
        dataProvider2.areas = [];
        for (var mapId = 1; mapId < 3; mapId++) {
            if (sectionDataMoo[mapId - 1] != null) {
                var dataBlob = sectionDataMoo[mapId - 1][yearStr];
                $.each(dataBlob, function (i, user) {
                    var v = user.value;
                    v = (v - sectionDataMoo[mapId - 1].query.min) / (sectionDataMoo[mapId - 1].query.max - sectionDataMoo[mapId - 1].query.min);
                    var hue = mapId == 1 ? 0.5 : 0.25;
                    var rgb = hsv2rgb(hue, 1.0, 0.8 - (0.6 * v));
                    var col = makeColorFromRGB(rgb["red"], rgb["green"], rgb["blue"]);
                    if(mapId==1){
                        dataProvider.areas.push({id: "" + user.id, color: col, description: user.description});
                    } else {
                        dataProvider2.areas.push({id: "" + user.id, color: col, description: user.description});
                    }
                });
            }
        }
        map.validateData();
        map2.validateData();
    }

    function fullReloadData(mapId) {

        var names = {
            "broadband": "Fixed broadband Internet subscribers",
            "population": "Total population",
            "life": "Life expectancy at birth",
            "child": "Child mortality",
            "health": "Government expenditure on health per-capita",
            "electricity": "Electricity use per-capita",
            "eiti_gov": "Government Revenue (as reported by Government)",
            "eiti_company": "Government Revenue (as reported by Companies)",
            "gas": "Gross Natural Gas Production",
            "oil": "Total Oil Supply",
            "coal": "Total Primary Coal Production",
            "out_of_school": "Primary children out of school",
            "roads": "Roads paved",
            "gdp": "Income per person",
            "unemployment": "Long term unemployment",
            'btu_total_production': 'Total oil, gas and coal production in BTU',
            'us_total_production': 'Total oil, gas and coal production in US$'
        };

        var fieldName;
        var titleText;

        var year = document.getElementById('amount').innerHTML;

        if (mapId == 1) {
            fieldName = document.getElementById('sort').value;
            titleText = names[fieldName];
            $("#mapTitle01").html(titleText);
            dataProvider.areas = [];
            map.validateData();
            $.ajax({
                url: "http://172.16.3.8:9999/new?field=" + fieldName,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    sectionDataMoo[0] = data;
                    updateYear();
                    //setLegendByField(fieldName);
                    //map.validateData();
                }
            });
        } else {
            fieldName = document.getElementById('sort2').value;
            titleText = names[fieldName];
            $("#mapTitle02").html(titleText);
            dataProvider2.areas = [];
            map2.validateData();
            $.ajax({
                url: "http://172.16.3.8:9999/new?field=" + fieldName,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    sectionDataMoo[1] = data;
                    updateYear();
                    //map.validateData();
                }
            });
        }
    }

    $(function () {
        $("#sort").change(function (event) {
            $("option:selected", $(this)).each(function () {
                var obj = document.getElementById('sort').value;
                fullReloadData(1);
            });
        });
    });

    $(function () {
        $("#sort2").change(function (event) {
            $("option:selected", $(this)).each(function () {
                fullReloadData(2);
            });
        });
    });

    AmCharts.ready(function () {

        map = new AmCharts.AmMap();
        map.areaSettings = {
            rollOverColor: "#00FF00",
            color: "#003333",
            colorSolid: "#00CCCC",
            selectedColor: "#0000CC"
        }

        map.pathToImages = "ammap/images/";
        //map.panEventsEnabled = true; // this line enables pinch-zooming and dragging on touch devices

        map.colorSteps = 10;
        map.balloon.color = "#000000";

        dataProvider = {     mapVar: AmCharts.maps.worldLow,
            areas: []
        };

        dataProvider2 = {     mapVar: AmCharts.maps.worldLow,
            areas: []
        };

        map2 = new AmCharts.AmMap();

        map2.pathToImages = "ammap/images/";
        //map.panEventsEnabled = true; // this line enables pinch-zooming and dragging on touch devices

        map2.colorSteps = 10;
        map2.balloon.color = "#000000";

        map.areasSettings = {
            autoZoom: true
        };
        map.dataProvider = dataProvider;

        map.write("mapdiv");

        map2.areasSettings = {
            autoZoom: true
        };
        map2.dataProvider = dataProvider2;

        map2.write("mapdiv2");

        fullReloadData(1);
        fullReloadData(2);

        $("#timeSlider").slider({
            value: 2000,
            min: 2000,
            max: 2010,
            step: 1,
            slide: function (event, ui) {
                $("#amount").html(ui.value);
                //dataProvider.areas[0].value = (ui.value - 2000) * 100;
                console.log("updates");
                updateYear();
                //reloadData2();
            }
        });
        $("#amount").html($("#timeSlider").slider("value"));
    });

    function hsv2rgb(h, s, v) {
// Adapted from http://www.easyrgb.com/math.html
// hsv values = 0 - 1, rgb values = 0 - 255
        var r, g, b;
        var RGB = new Array();
        if (s == 0) {
            RGB['red'] = RGB['green'] = RGB['blue'] = Math.round(v * 255);
        } else {
            // h must be < 1
            var var_h = h * 6;
            if (var_h == 6) var_h = 0;
            //Or ... var_i = floor( var_h )
            var var_i = Math.floor(var_h);
            var var_1 = v * (1 - s);
            var var_2 = v * (1 - s * (var_h - var_i));
            var var_3 = v * (1 - s * (1 - (var_h - var_i)));
            if (var_i == 0) {
                var_r = v;
                var_g = var_3;
                var_b = var_1;
            } else if (var_i == 1) {
                var_r = var_2;
                var_g = v;
                var_b = var_1;
            } else if (var_i == 2) {
                var_r = var_1;
                var_g = v;
                var_b = var_3
            } else if (var_i == 3) {
                var_r = var_1;
                var_g = var_2;
                var_b = v;
            } else if (var_i == 4) {
                var_r = var_3;
                var_g = var_1;
                var_b = v;
            } else {
                var_r = v;
                var_g = var_1;
                var_b = var_2
            }
            //rgb results = 0 ÷ 255
            RGB['red'] = Math.round(var_r * 255);
            RGB['green'] = Math.round(var_g * 255);
            RGB['blue'] = Math.round(var_b * 255);
        }
        return RGB;
    }

    function setLegend(minLabel, maxLabel) {
        var valueLegend = new AmCharts.ValueLegend();
        valueLegend.right = 10;
        valueLegend.width = 300;
        valueLegend.minValue = minLabel;
        valueLegend.maxValue = maxLabel; //
        map.valueLegend = valueLegend;
    }

    function setLegendByField(fieldName) {
        switch (fieldName) {
            case "oil":
                setLegend("little oil production", "huge oil production");
                break;
            case "broadband":
                setLegend("little broadband", "lots of broadband");
                break;
            case "population":
                setLegend("small population", "large population");
                break;
            case "life":
                setLegend("short life", "long life");
                break;
            case "child":
                setLegend("low child mortality", "high child mortality");
                break;
            case "health":
                setLegend("smaller government expenditure", "huge Government expenditure");
                break;
            case "electricity":
                setLegend("smaller use", "larger use");
                break;
            case "eiti_gov":
            case  "eiti_company":
                setLegend("small gov. revenue", "large gov. revenue");
                break;
            case  "gas":
                setLegend("small gas production", "large gas production");
                break;
            case "coal":
                setLegend("less coal production", "huge coal production");
                break;
            case "out_of_school":
                setLegend("less primary child out", "lot primary child out");
                break;
            case "roads":
                setLegend("less roads paved", "more roads paved");
                break;
            case "gdp":
                setLegend("less gdp", "big gdp");
                break;
            case "unemployment":
                setLegend("less unemployment", "huge unemployment");
                break;
            default :
                setLegend("", "");
        }
    }
});