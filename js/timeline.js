const parse = d3.timeParse("%Y-%m-%d");
const milestonesByType = {
    individual: [],
    championship: [],
    important_goal: [],
    transfer: []
};

class Timeline {
    /**
     * 
     * @param {*} _config class configurations
     * @param {*} _data data required for visualization
     * @param {*} startDate start date
     * @param {*} endDate end date
     * @param {*} updateFromTimeline update data from timeline
     */
    constructor(_config, _data, startDate, endDate, updateFromTimeline) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1200,
            containerHeight: _config.containerHeight || 200,
            margin: _config.margin || {
                top: 0,
                right: 5,
                bottom: 0,
                left: 50
            }
        };
        this.dataGoals = _data[0];
        this.dataMileStones = _data[1];
        this.championshipWinningGames = _data[2];
        this.startDate = startDate
        this.endDate = endDate
        this.updateFromTimeline = updateFromTimeline;

        // Initialize visualization
        this.initVis();
    }


    /**
     * Initializes the visualization.
     */
    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);


        // Convert date strings to Date objects
        this.initData(vis);

        vis.xScale = d3.scaleTime()
            .domain(d3.extent(vis.timelineData, d => d.date))
            .range([0, vis.width + 50]);


        const yPosition = vis.height - 20;

        this.createSliderEventLabels(vis, yPosition);

        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + yPosition + ")")
            .call(d3.axisBottom(vis.xScale)
                .tickFormat(d => {
                    const yearDifference = vis.xScale.domain()[1].getFullYear() - vis.xScale.domain()[0].getFullYear();
                    if (yearDifference <= 1) {
                        return d3.timeFormat("%b")(d);
                    } else {
                        return d3.timeFormat("%Y")(d);
                    }
                })
            );

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Update visualization
        vis.updateVis(this.startDate, this.endDate);
    }

    /**
     * Creates slider event labels.
     * @param {object} vis - The timeline visualization object.
     * @param {number} yPosition - The y-position for labels.
     */
    createSliderEventLabels(vis, yPosition) {
        vis.eventLabels = vis.svg.append("g")
            .selectAll(".eventLabel")
            .data(vis.timelineData)
            .enter()
            .append("text")
            .attr("class", "eventLabel")
            .attr("x", d => vis.xScale(d.date) + 30)
            .attr("y", yPosition)
            .text(d => d.event)
            .attr("dy", "0.25em")
            .style("visibility", "hidden");
    }

    /**
     * Creates timeline visualization data.
     * @param {object} vis - The timeline visualization object.
     */
    createTimelineVisData(vis) {
        // Define y positions for each milestone type
        const yPositions = {
            individual: vis.height - 35,
            championship: vis.height - 60,
            important_goal: vis.height - 85,
            transfer: vis.height - 110
        };
        Object.keys(milestonesByType).forEach(key => {
            vis.svg.selectAll(`.${key}-event`)
                .data(milestonesByType[key])
                .enter()
                .append("circle")
                .attr("class", `${key}-event event`)
                .attr("cx", d => vis.xScale(d.date))
                .attr("cy", yPositions[key])
                .attr("r", d => (d.milestone === "championship" ? 4 : 4))
                .style("fill", d => {
                    if (d.milestone === "individual") {
                        return "steelblue";
                    } else if (d.milestone === "championship") {
                        return "orange";
                    } else if (d.milestone === "important_goal") {
                        return "purple";
                    } else {
                        return "green";
                    }
                })
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .transition()
                        .duration(200)
                        .attr("r", d => (d.milestone === "championship" ? 6 : 6));
                    const tooltip = d3.select('#tooltip');
                        tooltip
                            .style('display', 'block')
                            .style('visibility', 'visible')
                            .style('left', (vis.config.containerWidth) / 2.7 + 'px')
                            .style('top', (vis.config.containerHeight) * 3 + 'px')
                            .html(`
                            <div class="tooltip-title">${d.title}</div>
                            <div><i>${d.description}</i></div>
                            <ul>
                                <li>Date: ${d.date}</li>
                            </ul>
                        `);

                    
                    const left = (this.ca - tooltipWidth) / 2 + window.scrollX;
                    const top = (window.innerHeight - tooltipHeight) / 2 + window.scrollY;
                    tooltip
                        .style('display', 'block')
                        .style('visibility', 'visible')
                        .style('left', (vis.config.containerWidth) / 2.7 + 'px')
                        .style('top', (vis.config.containerHeight) * 3 + 'px')
                        .html(`
                            <div class="tooltip-title">${d.title}</div>
                            <div><i>${d.description}</i></div>
                            <ul>
                                <li>Date: ${d.date}</li>
                            </ul>
                        `);
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("stroke", null)
                        .attr("stroke-width", null)
                        .transition()
                        .duration(200)
                        .attr("r", d => (d.milestone === "championship" ? 4 : 4));
                    const tooltip = d3.select('#tooltip');
                    tooltip.style('visibility', 'hidden');
                });
        });
    }

    /**
     * Creates a legend for the visualization.
     * @param {object} vis - The timeline visualization object.
     */
    createLegend(vis) {
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (vis.width - 150) + ", 0)"); // Adjust the position of the legend

        const legendData = Object.keys(milestonesByType);

        legend.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => {
                if (d === "individual") {
                    return "steelblue";
                } else if (d === "championship") {
                    return "orange";
                } else if (d === "important_goal") {
                    return "purple";
                } else {
                    return "green";
                }
            });

        legend.selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => {
                if (d === "individual") {
                    return "Individual Accolades";
                } else if (d === "championship") {
                    return "Team Trophies and Awards";
                } else if (d === "important_goal") {
                    return "Important Goals";
                } else {
                    return "Club Transfer";
                }
            }) // Capitalize first letter
            .style("font-size", "12px")
            .style("fill", "white");
    }

    /**
     * Initializes data for visualization.
     * @param {object} vis - The timeline visualization object.
     */
    initData(vis) {
        vis.timelineData = vis.dataMileStones.map(d => ({
            date: parse(d.date),
            milestone: d.milestone,
            title: d.title,
            description: d.description
        }));

        vis.championshipData = vis.championshipWinningGames.map(d => ({
            date: parse(d.Date),
            milestone: "championship",
            title: d.Team,
            description: d.Championship + ' - ' + d.Game
        }));

        vis.timelineData.forEach(d => {
            milestonesByType[d.milestone].push(d);
        });
        // Merge championship data with timeline data
        vis.timelineData = vis.timelineData.concat(vis.championshipData);

    }

    /**
     * Updates the visualization.
     */
    updateVis(startDate, endDate) {
        let vis = this;
        
        d3.select("#slider").select("*").remove();
        vis.xScale.domain([startDate, endDate]);
        vis.svg.selectAll(".event")
            .attr("cx", d => vis.xScale(d.date));

        const slider = d3.sliderBottom()
            .min(new Date(2000, 0))
            .max(new Date(2023, 0))
            .width(700)
            .tickFormat(d3.timeFormat("%Y"))
            .fill('green')
            .ticks(d3.timeYear.every(1))
            .default([startDate, endDate])
            .on('onchange', val => {
                vis.xScale.domain(val);
                vis.svg.selectAll(".event")
                    .attr("cx", d => vis.xScale(d.date));


                const yearDifference = vis.xScale.domain()[1].getFullYear() - vis.xScale.domain()[0].getFullYear();
                vis.eventLabels
                    .style("visibility", d => (yearDifference <= 1 ? "visible" : "hidden"))
                    .attr("x", d => vis.xScale(d.date))
                    .attr("y", vis.height - 30); // Adjusted y-position for labels

                vis.svg.select(".axis")
                    .call(d3.axisBottom(vis.xScale)
                        .tickFormat(d => {
                            if (yearDifference <= 1) {
                                return d3.timeFormat("%b")(d);
                            } else {
                                return d3.timeFormat("%Y")(d);
                            }
                        })
                    );

                vis.updateFromTimeline(vis.xScale.domain()[0], vis.xScale.domain()[1])

            })

        const sliderSvg = d3.select("#slider").append("svg")
            .attr("width", 800)
            .attr("height", 70)
            .append("g")
            .attr("transform", "translate(30,30)");

        // Apply styles to the slider
        sliderSvg.call(slider)
            .selectAll(".track")
            .selectAll(".handle")

        // Render visualization
        vis.renderVis();
    }

    /**
     * Renders the visualization.
     */
    renderVis() {
        let vis = this;

        // Create legend
        this.createLegend(vis);

        // Append circles for each milestone type
        this.createTimelineVisData(vis);
    }
}
