class Goal {

    /**
     * 
     * @param {*} _config class configurations
     * @param {*} _data data required for visualization
     */
    constructor(_config, _data) {
        // Configuration object with defaults
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 250,
            containerHeight: _config.containerHeight || 125,
            margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 35 }
        }
        this.data = [];
        this.initVis();
    }

    /**
     * Initializes the visualization
     */
    initVis() {
        let vis = this;

        // Calculate inner chart size
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // padding for the goal so the goals don't touch the goal posts
        let padding = 50;

        // Initialize scales
        vis.xScale = d3.scaleOrdinal()
            .range([padding, vis.width / 4 + padding, vis.width / 2, 3 * vis.width / 4 - padding, vis.width - padding])

        vis.yScale = d3.scaleLinear()
            .range([vis.height - padding, padding]);

        vis.powerColorScale = d3.scaleLinear()
            .range(["#ffcccc", "#ff0000"]);

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
        this.drawSoccerNet()

        // Append axis groups
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.updateVis()
    }

    /**
     * Updates the visualization
     */
    updateVis() {
        let vis = this;

        // specify the access functions
        vis.xValue = d => d.area_of_shot;
        vis.yValue = d => d.power_of_shot;
        vis.powerValue = d => d.power_of_shot;

        // Set the scale input domains
        vis.xScale.domain(['Left Side(L)', 'Left Side Center(LC)',
            'Center(C)', 'Right Side Center(RC)', 'Right Side(R)']);
        vis.yScale.domain([1, 5]);
        vis.powerColorScale.domain([1, 5]);

        vis.renderVis();
    }

    /**
     * Renders the visualization based on the provided data
     */
    renderVis() {
        let vis = this;
        // Bind data to circles and handle click event
        vis.chart.selectAll('.point')
            .data(vis.data)
            .join('image')
            .attr('class', 'point')
            .attr('x', d => vis.xScale(vis.xValue(d)) - 7) // Adjust for image size
            .attr('y', d => vis.yScale(vis.yValue(d)) - 7) // Adjust for image size
            .attr('width', 20)
            .attr('height', 20)
            .attr('href', 'data/goals.svg'); // Path to your SVG image
    }

    /**
     * Draw the boarder of a Soccer goal 
     */
    drawSoccerNet() {
        let vis = this;

        // Set the net dimensions equal to the full dimensions of the SVG container
        const netWidth = vis.width, netHeight = vis.height;
        const netColor = '#FFFFFF', thickLineWidth = 8; // Thick line width for the net's outline
        const thinLineWidth = 0.2;

        // Left line
        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thickLineWidth);

        // Top line
        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 4)
            .attr('x2', netWidth)
            .attr('y2', 4)
            .attr('stroke', netColor)
            .attr('stroke-width', thickLineWidth);

        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 20)
            .attr('x2', netWidth)
            .attr('y2', 20)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 30)
            .attr('x2', netWidth)
            .attr('y2', 30)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 40)
            .attr('x2', netWidth)
            .attr('y2', 40)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 50)
            .attr('x2', netWidth)
            .attr('y2', 50)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 60)
            .attr('x2', netWidth)
            .attr('y2', 60)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 0)
            .attr('y1', 70)
            .attr('x2', netWidth)
            .attr('y2', 70)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);
        // Right line
        vis.chart.append('line')
            .attr('x1', netWidth)
            .attr('y1', 0)
            .attr('x2', netWidth)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thickLineWidth);

        vis.chart.append('line')
            .attr('x1', 20)
            .attr('y1', 0)
            .attr('x2', 20)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 40)
            .attr('y1', 0)
            .attr('x2', 40)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 60)
            .attr('y1', 0)
            .attr('x2', 60)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 80)
            .attr('y1', 0)
            .attr('x2', 80)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 100)
            .attr('y1', 0)
            .attr('x2', 100)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 120)
            .attr('y1', 0)
            .attr('x2', 120)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 140)
            .attr('y1', 0)
            .attr('x2', 140)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 160)
            .attr('y1', 0)
            .attr('x2', 160)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 180)
            .attr('y1', 0)
            .attr('x2', 180)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);

        vis.chart.append('line')
            .attr('x1', 200)
            .attr('y1', 0)
            .attr('x2', 200)
            .attr('y2', netHeight)
            .attr('stroke', netColor)
            .attr('stroke-width', thinLineWidth);
    }
}
