function formatNumber(num) {
    return String(num).replace(/(.)(?=(\d{3})+$)/g, '$1,');

}

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function (d) {
        var s1 = "<p><span style='font-weight:bold;font-size:16px'>" + d.properties.name + "</span></p><hr/>";
        var s2 = "<p>Total Cases:&nbsp; <span style='font-weight:bold'>" + formatNumber(d.properties.cases) + "</span></p>";
        var s3 = "<p>Total Deaths:&nbsp; <span style='font-weight:bold'>" + formatNumber(d.properties.deaths) + "</span></p>";
        return s1 + s2 + s3;
    })

var width = 960;
var height = 500;

var light_color = '#B6D0E2'
var dark_color = '#0F52BA'


var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]);


var path = d3.geoPath()
    .projection(projection);


var svg = d3.select("#total_cases_map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

svg.call(tip);


d3.csv("../data/us-states-live.csv", function (data) {
    var state_data = [];
    for (var d = 0; d < data.length; d++) {
        state_data.push(parseFloat(data[d].cases))
    }
    var min_cases = d3.min(state_data)
    var max_cases = d3.max(state_data)
    var color_scale = d3.scaleLinear().domain([min_cases, max_cases]).range([light_color, dark_color])


    d3.json("us-states.json", function (json) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < json.features.length; j++) {
                if (data[i].state == json.features[j].properties.name) {
                    json.features[j].properties.cases = data[i].cases;;
                    json.features[j].properties.deaths = data[i].deaths;;
                    break;
                }
            }
        }



        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "0.5")
            .style("fill", function (d) {
                return color_scale(d.properties.cases)
            })
            .on('mouseover', function (d, i) {
                tip.show(d, this),
                    d3.select(this).style('fill-opacity', .6).style("cursor", "pointer")
            })
            .on('mouseout', function (d, i) {
                tip.hide(d, this),
                    d3.selectAll('path').style('fill-opacity', 1)
            }).on("click", function (d) {

                var st = d.properties.name;
                window.open("cases_trend?state=" + st, "_self")
            });




        const annotations = [
            {
                note: {
                    label: "14-day change in cases: +129%, Fully Vaccinated: 53%",
                    title: "California"
                },
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 3
                },

                x: 170,
                y: 260,
                dy: 50,
                dx: -50
            },
            {
                note: {
                    label: "14-day change in cases: +197%, Fully Vaccinated: 44%",
                    title: "Texas"
                },
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 3
                },

                x: 450,
                y: 380,
                dy: 50,
                dx: 50
            },
            {
                note: {
                    label: "14-day change in cases: +144%, Fully Vaccinated: 49%",
                    title: "Florida"
                },
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 3
                },

                x: 720,
                y: 440,
                dy: -50,
                dx: 50
            }
        ]

        // Add annotation to the chart
        const makeAnnotations = d3.annotation()
            .annotations(annotations)
            .on("subjectover", function (annotation) {
                annotation.type.a
                    .selectAll("g.annotation-connector, g.annotation-note")
                    .classed("hidden", false)
            })
            .on("subjectout", function (annotation) {
                annotation.type.a
                    .selectAll("g.annotation-connector, g.annotation-note")
                    .classed("hidden", true);

            });

        d3.select("svg")
            .append("g")
            .attr("class", "annotation-test")
            .call(makeAnnotations)


        d3.selectAll("g.annotation-connector, g.annotation-note")
            .classed("hidden", true);















        var w = 115,
            h = 260;

        var key = d3.select("#total_cases_map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "legend");

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", dark_color)
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", light_color)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,10)");

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([min_cases, max_cases]);

        var yAxis = d3.axisRight(y);

        key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(41,10)")
            .call(yAxis)
    });
});