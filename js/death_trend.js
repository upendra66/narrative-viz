const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const url_state_name = urlParams.get('state');
console.log(url_state_name);

var state = JSON.parse(states);
var ele = document.getElementById('sel_state');

for (var i = 0; i < state.length; i++) {
    ele.innerHTML = ele.innerHTML + '<option value="' + state[i] + '">' + state[i] + '</option>';
}



function parse_data(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].date = d3.timeParse("%Y-%m-%d")(data[i].date)
    }
    return data;
}

function formatNumber(num) {
    return String(num).replace(/(.)(?=(\d{3})+$)/g, '$1,');

}

// set margins
var margin = { top: 60, right: 200, bottom: 60, left: 60 };
var width = 1160 - margin.left - margin.right;
var height = 460 - margin.top - margin.bottom;



var states_data = "";
var usa_data = "";
async function init_data(data_file) {
    await d3.csv(data_file, function (d) {
        if (data_file == "data/us.csv") {
            usa_data = parse_data(d);
            if(url_state_name == null || url_state_name == "All"){
                draw_graph(usa_data);
            }
            
        } else {
            states_data = parse_data(d);
            if(url_state_name != null){
                
                ele.value = url_state_name;
                onStateChange(url_state_name);
            }
        }

    });
}

init_data("data/us-states.csv");
init_data("data/us.csv");

function draw_graph(data) {
    var svg = d3.select("#state_covid_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //x-axis 
    var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return d.date;
        }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    //y-axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return +d.deaths_avg;
        })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));


    svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -height / 2)
        .text("7-day avg. deaths");

    //line chart
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", '#C70039')
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.date)
            })
            .y(function (d) {
                return y(d.deaths_avg)
            })
        )

    var tooltip = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    tooltip.append("circle")
        .attr("r", 5);

    tooltip.append("rect")
        .attr("class", "tooltip")
        .attr("width", 160)
        .attr("height", 66)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    tooltip.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    tooltip.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("7-day average: ");

    tooltip.append("text")
        .attr("class", "tooltip-cases")
        .attr("x", 106)
        .attr("y", 18);

    tooltip.append("text")
        .attr("x", 18)
        .attr("y", 34)
        .text("New Deaths: ");

    tooltip.append("text")
        .attr("class", "tooltip-new-cases")
        .attr("x", 95)
        .attr("y", 34);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function () {
            tooltip.style("display", "block");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", mousemove);

    var bisectDate = d3.bisector(function (d) {
        return d.date;
    }).left;
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            date0 = data[i - 1],
            date1 = data[i];
        var d = x0 - date0.date > date1.date - x0 ? date1 : date0;
        tooltip.attr("transform", "translate(" + x(d.date) + "," + y(d.deaths_avg) + ")");
        tooltip.select(".tooltip-date").text(parse_date(d.date));
        tooltip.select(".tooltip-cases").text(formatNumber(Math.round(d.deaths_avg)));
        tooltip.select(".tooltip-new-cases").text(formatNumber(d.deaths));
    }

}

function parse_date(date) {
    date = new Date(date);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    var monthName = months[date.getMonth()];
    var day = date.getDate();
    return monthName + ", " + day;
}


function onStateChange(ele) {
    document.getElementById("state_covid_chart").innerHTML = "";
    if (ele == "All") {
        draw_graph(usa_data);
        document.getElementById("state_name").innerText = "";

        return;
    }
    document.getElementById("state_name").innerText = ele + ", ";
    let stateData = [];
    for (var i = 0; i < states_data.length; i++) {
        if (ele == states_data[i].state) {
            stateData.push({
                date: states_data[i].date,
                deaths_avg: states_data[i].deaths_avg,
                deaths: states_data[i].deaths
            });
        }
    }
    draw_graph(stateData);
}