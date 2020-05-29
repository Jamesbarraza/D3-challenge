// Bonus
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

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, chartWidth]);
  
    return xLinearScale;
  
  }

  function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([chartHeight, 0]);
  
    return yLinearScale;
  
  }

function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
function renderCircles(circlesGroup, textGroup, newXScale, chosenXAxis) {

circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));


textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

    return [circlesGroup, textGroup];
}

function renderYCircles(circlesGroup, textGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    
    textGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]));
    
        return [circlesGroup, textGroup];
    }

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xInfo = {
      poverty: "Poverty", 
      age: "Age",
      income: "Household Income",
  }

  var xLabel = xInfo[chosenXAxis];
  
  var yInfo = {
      healthcare: "Healthcare",
      smokes: "Smoker",
      obesity: "Obesity"
  }

  var yLabel = yInfo[chosenYAxis];

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br> ${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// // Append a div to the body to create tooltips, assign it a class
// d3.select(".chartGroup").append("div").attr("class", "tooltip").style("opacity", 0);

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
        var xAxis = chartGroup.append("g")
            .attr("transform",  `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        var yAxis = chartGroup.append("g")
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
        var textGroup = chartGroup.append("text")
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
          // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active aText", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            
        var healthcareLabel = ylabelsGroup.append("text")
            .attr("x", 0 - chartHeight /2)
            .attr("y", 0 - chartMargin.left + 70)
            .attr("transform", "rotate(-90)")
            .attr("value", "healthcare") // value to grab for event listener
            .classed("active aText", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("x", 0 - chartHeight /2)
            .attr("y", 0 - chartMargin.left + 50)
            .attr("transform", "rotate(-90)")
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokers (%)");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("x", 0 - chartHeight /2)
            .attr("y", 0 - chartMargin.left + 30)
            .attr("transform", "rotate(-90)")
            .attr("class", "axis-text")
            .attr("value", "obesity") // value to grab for event listener
            .classed("inactive", true)
            .text("Population Obesity (%)");      

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        // x axis labels event listener
        xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value =  d3.select(this).attr("value");
            if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;
            console.log(chosenXAxis)
            
            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);
            
            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);
            
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis)[0];
            textGroup = renderCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis)[1];
            
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            xlabelsGroup.select('.active').classed("active", false).classed("inactive", true)
            d3.select(this).classed("inactive", false).classed("active", true)
               
            
            }
        });

        // x axis labels event listener
        ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value =  d3.select(this).attr("value");
            if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;
            console.log(chosenYAxis);

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderYCircles(circlesGroup, textGroup, yLinearScale, chosenYAxis)[0];
            textGroup = renderYCircles(circlesGroup, textGroup, yLinearScale, chosenYAxis)[1];
            
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            ylabelsGroup.select('.active').classed("active", false).classed("inactive", true)
            d3.select(this).classed("inactive", false).classed("active", true)
               
            
            }
        });
        ; 
        updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);   
})()