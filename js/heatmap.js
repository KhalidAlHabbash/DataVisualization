class Heatmap {


    /**
     * 
     * @param {*} _config class configuration
     * @param {*} _dispatcher required dispatcher
     * @param {*} _data required data for visualization
     */
    constructor(_config, _dispatcher, _data) {
        // Configuration object with defaults
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 650,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || { top: 0, right: 0, bottom: 0, left: 0 }
        }
        this.dispatcher = _dispatcher;
        this.data = _data;
        this.initVis();
    }

    /**
     * Filters the data based on start and end dates
     * @param {Date} startDate - Start date for filtering
     * @param {Date} endDate - End date for filtering
     */
    filterData(startDate, endDate) {
        let vis = this
        const filteredData = this.data.filter(d => {
            const currentDate = new Date(d.date_of_game); // Replace 'date' with the actual property name in your data
            return currentDate >= startDate && currentDate <= endDate;
        });
        vis.chart.selectAll('.selected-line-path').remove();
        vis.updateVis(filteredData); // Update the visualization with the filtered data
    }

    /**
     * Initializes the visualization
     */
    initVis() {
        let vis = this;

        // Calculate inner chart size
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Initialize scales
        vis.powerScale = d3.scaleLinear()
            .range([500, 200]);

        vis.powerColorScale = d3.scaleLinear()
            .range(["#ffcccc", "#ff0000"]);

        // goal scale
        // vis.goalScale = d3.scaleOrdinal()
        //     .range([0, vis.height / 4, vis.height / 2, 3 * vis.height / 4, vis.height])
        //     .domain(['Left Side(L)', 'Left Side Center(LC)', 
        //     'Center(C)', 'Right Side Center(RC)', 'Right Side(R)']);

        // vis.powerScale = d3.scaleLinear()
        //     .range([0, 100]);
            
        vis.xScale = d3.scaleLinear()
            .range([vis.width / 1.5, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(0)

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(0)

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element for the chart
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Draw the soccer field background
        this.drawSoccerFieldBackground();
        this.addLegend();

        vis.lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveBasis); // Use a curve like curveBasis for a smooth line

        // Append axis groups
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');


        vis.updateVis(vis.data)
    }

    /**
     * Updates the visualization with new data
     * @param {object[]} data - New data to update the visualization
     */
    updateVis(data) {
        let vis = this;

        // Specify accessor functions
        vis.goalValue = d => d.area_of_shot;
        vis.powerValue = d => d.power_of_shot;
        vis.xValue = d => d.location_y;
        vis.yValue = d => d.location_x;

        // Set the scale input domains

        vis.xScale.domain([0, 200]);
        vis.yScale.domain([-200, 200]);
        vis.powerScale.domain([1, 5]);
        vis.powerColorScale.domain([1, 5]);

        vis.renderVis(data);
    }


    /**
     * Renders the visualization based on the provided data
     * @param {object[]} data - Data to render in the visualization
     */
    renderVis(data) {
        let vis = this;

        // Bind data to circles and handle click event
        vis.chart.selectAll('.point')
            .data(data)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 5) // original radius
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('fill', d => vis.powerColorScale(vis.powerValue(d)))

            // Mouseover event to increase the circle's radius
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200) // transition duration in milliseconds
                    .attr('r', 10) // new, larger radius

            })

            // Mouseout event to reset the circle's radius
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 5) // revert to original radius

            })

            // On click, animate the lines and call the dispatcher to display the goal in Goal
            .on('click', function (event, d) {
                d3.select(this)
                    .attr('r', 8) // new, larger radius
                    .attr('fill', d => vis.powerColorScale(vis.powerValue(d)));
                vis.selectedPoint = d; // Store the selected data point


                vis.dispatcher.call('selectedGoal', null, d);
                vis.animateSelectedLine(); // Function to animate line for selected point
            });
    }

    /** 
     * Draws animation from the points to the goal
     */
    animateSelectedLine() {
        let vis = this;
        if (!vis.selectedPoint) return; // Do nothing if no point is selected

        // Remove any existing lines
        vis.chart.selectAll('.selected-line-path').remove();

        // Prepare data for the selected line
        let selectedLineData = [
            { x: vis.xScale(vis.xValue(vis.selectedPoint)), y: vis.yScale(vis.yValue(vis.selectedPoint)) },
            { x: vis.xScale(200), y: vis.yScale(0) }
        ];

        // Determine animation speed and point color based on the power value of the selected point
        let animation_speed = vis.powerScale(vis.powerValue(vis.selectedPoint)); // Use powerValue accessor
        let point_color = vis.powerColorScale(vis.powerValue(vis.selectedPoint)); // Use powerValue accessor

        // Append the new line
        let line = vis.chart.append('path')
            .data([selectedLineData])
            .attr('class', 'selected-line-path')
            .attr('fill', 'none')
            .attr('stroke', point_color)
            .attr('stroke-width', 2)
            .attr('d', vis.lineGenerator);

        // Animate the line
        const totalLength = line.node().getTotalLength();
        line
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(animation_speed)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
    }


    /**
     * Draws the soccer field background with various elements
     */
    drawSoccerFieldBackground() {
        let vis = this;

        const patternWidth = vis.width, patternHeight = vis.height;
        const lineColor = '#FFFFFF', lineWidth = 2;

        // Append a rectangle to simulate the soccer field
        vis.chart.append('rect')
            .attr('width', patternWidth)
            .attr('height', patternHeight)
            .attr('fill', 'green')
            .attr('stroke', 'white');

        // Center line
        vis.chart.append('line')
            .attr('x1', patternWidth / 2)
            .attr('y1', 0)
            .attr('x2', patternWidth / 2)
            .attr('y2', patternHeight)
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);

        // Center circle
        vis.chart.append('circle')
            .attr('cx', patternWidth / 2)
            .attr('cy', patternHeight / 2)
            .attr('r', patternHeight / 8)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);

        // Penalty areas
        const penaltyAreaWidth = patternWidth / 5;
        const penaltyAreaHeight = patternHeight / 2;

        // Left penalty area
        vis.chart.append('rect')
            .attr('x', 0)
            .attr('y', (patternHeight - penaltyAreaHeight) / 2)
            .attr('width', penaltyAreaWidth)
            .attr('height', penaltyAreaHeight)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);

        // Right penalty area
        vis.chart.append('rect')
            .attr('x', patternWidth - penaltyAreaWidth)
            .attr('y', (patternHeight - penaltyAreaHeight) / 2)
            .attr('width', penaltyAreaWidth)
            .attr('height', penaltyAreaHeight)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);

        // Goal areas
        const goalAreaWidth = penaltyAreaWidth / 2.5;
        const goalAreaHeight = penaltyAreaHeight / 2;

        // Left goal area
        vis.chart.append('rect')
            .attr('x', 0)
            .attr('y', (patternHeight - goalAreaHeight) / 2)
            .attr('width', goalAreaWidth)
            .attr('height', goalAreaHeight)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);

        // Right goal area
        vis.chart.append('rect')
            .attr('x', patternWidth - goalAreaWidth)
            .attr('y', (patternHeight - goalAreaHeight) / 2)
            .attr('width', goalAreaWidth)
            .attr('height', goalAreaHeight)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', lineWidth);
    }

    /**
     *  Code for adding legend
     */
    addLegend() {
        let vis = this;

        // Define dimensions and position for the legend
        const legendWidth = 150, legendHeight = 20;
        const legendPosX = 20, legendPosY = 20;

        // Create a group for the legend
        let legend = vis.chart.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${legendPosX},${legendPosY})`);

        // Create a gradient for the legend
        let gradient = vis.svg.append('defs')
            .append('linearGradient')
            .attr('id', 'gradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', vis.powerColorScale.range()[0]);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', vis.powerColorScale.range()[1]);

        // Append the color scale bar
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#gradient)');

        // Define a font color
        const fontColor = '#FFFFFF';

        // Append text labels to the legend
        legend.append('text')
            .attr('x', legendWidth / 3)
            .attr('y', legendHeight - 25)
            .style('fill', fontColor)
            .text('Shot Power');

        legend.append('text')
            .attr('x', 0)
            .attr('y', legendHeight + 15)
            .style('fill', fontColor)
            .text('Low');

        legend.append('text')
            .attr('x', legendWidth)
            .attr('y', legendHeight + 15)
            .attr('text-anchor', 'end')
            .style('fill', fontColor)
            .text('High');
    }
}
