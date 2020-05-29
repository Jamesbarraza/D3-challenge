 // @TODO: YOUR CODE HERE!

// Set up chart:
var svgWidth = 960;
var svgHeight = 660;

// Set borders:
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Append a div to the body to create tooltips, assign it a class
d3.select(".chartGroup").append("div").attr("class", "tooltip").style("opacity", 0);

// Import data from the data.csv file
(async function() {
    var healthData = await d3.csv("assets/data/data.csv")
        console.log(healthData);
        // Parse Data as numbers
        healthData.forEach(function(data) {
            data.smokes = +data.smokes;
            data.age = +data.age;
            data.healthcare = +data.healthcare;
            data.poverty = +data.poverty;
        });

       // Create Scales
        var xLinearScale = d3.scaleLinear()
            .domain([0.8*d3.min(healthData, d => d.poverty), 1.2*d3.max(healthData, d => d.poverty)])
            .range([0, chartWidth]);
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([chartHeight, 0]);

        // Create Axis
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axis
        chartGroup.append("g")
            .attr("transform",  `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        chartGroup.append("g")
            .call(leftAxis);

        // Create Circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("fill", "red")
            .attr("opacity", ".5");
         // Appending a label to each data point
         chartGroup.append("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .selectAll("tspan")
            .data(healthData)
            .enter()
            .append("tspan")
                .attr("x", function(data) {
                    return xLinearScale(data.poverty - 0);
                })
                .attr("y", function(data) {
                    return yLinearScale(data.healthcare - 0.2);
                })
                .text(function(data) {
                    return data.abbr
                });
        
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
          return (`${d.state}<br> Poverty: ${d.poverty} <br> Healthcare: ${d.healthcare}`);
        }); 
       
        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
          toolTip.show(data);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });

            // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active aText", true)
            .text("In Poverty (%)");

        var ylabelsGroup = chartGroup.append("g")
            .call(leftAxis);

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("x", 0 - chartHeight /2)
            .attr("y", 0 - chartMargin.left + 70)
            .attr("transform", "rotate(-90)")
            .attr("value", "healthcare") // value to grab for event listener
            .classed("active aText", true)
            .text("Lacks Healthcare (%)");
})()