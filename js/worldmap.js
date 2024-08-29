/**
 *  Object defining date ranges for different countries
 *  Each country has a start and end date
 */
const countryDateRanges = {
    "Spain": {
        startDate: new Date("2009-06-01"),
        endDate: new Date("2018-06-01")
    },
    "Italy": {
        startDate: new Date("2018-06-02"),
        endDate: new Date("2021-06-01")
    },
    "United Kingdom": {
        startDate: new Date("2003-06-02"),
        endDate: new Date("2009-06-01")
    },
    "Saudi Arabia": {
        startDate: new Date("2021-06-02"),
        endDate: new Date("2023-06-01")
    },
    "Portugal": {
        startDate: new Date("2002-01-01"),
        endDate: new Date("2003-06-01")
    },
}

class WorldMap {
    /**
     * 
     * @param {*} _config required configuration
     * @param {*} _worldData data regions in the world map
     * @param {*} _ronaldoData data for ronaldo's achievments
     * @param {*} _countryTrophiesMap data for tooltip trophies
     * @param {*} _countryGoalsMap data for tooltip goals
     * @param {*} updateDatesCallback required callbacks
     */
    constructor(_config, _worldData, _ronaldoData, _countryTrophiesMap, _countryGoalsMap, updateDatesCallback) {
        this.config = _config;
        this.worldData = _worldData;
        this.ronaldoData = new Set(_ronaldoData); // Use a Set for faster lookups
        this.countryTrophiesMap = _countryTrophiesMap;
        this.countryGoalsMap = _countryGoalsMap; // New property for goals
        this.trophyIcon = '<img src="data/trophy-white.svg" width="14" height="14">';
        this.soccerBallIcon = '<img src="data/goals.svg" width="14" height="14">';

        this.hoveredCountry = null;
        this.currentHover = null;
        this.highlightedCountries = new Map();
        this.highlightedCountries2 = new Map();

        this.clickedCountry = null; // Track the currently clicked country

        this.initMap();
        this.bindEvents();
        this.updateDatesCallback = updateDatesCallback;
        this.worldData2 = this.worldData.features.filter((feature) => {
            let countryName = feature.properties.ADMIN;
            return countryDateRanges.hasOwnProperty(countryName);
        });
    }

    /**
     * Initializes the class
     */
    initMap() {
        this.canvas = d3.select(this.config.parentElement)
            .append("canvas")
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .node();

        this.context = this.canvas.getContext("2d");

        this.projection = d3.geoMercator()
            .center([20, 40])  // Center around a point that is roughly between Europe and Asia
            .scale(this.config.width * 2.2 / (Math.PI)) // Increase the scale factor here
            .translate([this.config.width / 2, this.config.height / 2]);

        this.geoGenerator = d3.geoPath()
            .projection(this.projection)
            .context(this.context);


        this.update();
    }

    /**
     * 
     * @param {*} startDate country start date
     * @param {*} endDate country end date
     *  Highlights countries based on the provided date range
     */
    highlightCountries(startDate, endDate) {
        let vis = this;
        this.update(); // Clear existing highlights
        this.worldData2.forEach((feature) => {
            let countryName = feature.properties.ADMIN;
            let dateRange = countryDateRanges[countryName]; // Replace with the actual date property

            if (dateRange && this.dateRangesOverlap(dateRange.startDate, dateRange.endDate, startDate, endDate)) {
                this.context.fillStyle = "red";
                this.context.beginPath();
                this.geoGenerator(feature);
                this.context.fill();
                this.context.stroke();
            }
        });
    }

    /**
     * 
     * @param {*} start1 first start date
     * @param {*} end1 first end date
     * @param {*} start2 second start data
     * @param {*} end2 second end date
     * @returns true if the countrie dates overlap, false otherwise
     */
    dateRangesOverlap(start1, end1, start2, end2) {
        return start1 <= end2 && end1 >= start2;
    }

    /**
     * Binds mousemove and click events to the canvas
     * Calls respective handler functions
     */
    bindEvents() {
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event)
        });

        this.canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
    }

    /**
     * Clears the canvas and redraws the map
     * Iterates through features and draws countries
     */
    update() {
        this.context.clearRect(0, 0, this.config.width, this.config.height); // Clear the canvas

        this.worldData.features.forEach((feature) => {
            this.drawCountry(feature);
        });
    }

    /**
     * 
     * @param {*} feature feature to draw
     * Draws individual country shapes on the canvas
     * Handles color based on highlighting and clicking
     */
    drawCountry(feature) {

        this.context.beginPath();
        this.geoGenerator(feature);

        let countryName = feature.properties.ADMIN;
        let isHighlighted = this.ronaldoData.has(countryName);
        let isClicked = this.clickedCountry === countryName;

        if (isClicked) {
            this.context.fillStyle = 'red'; // Change the color for clicked country
        } else {
            this.context.fillStyle = isHighlighted ? "orange" : "#ccc";
        }

        if (this.currentHover === countryName) {
            this.context.fillStyle = 'red';

        }

        this.context.fill();
        this.context.stroke();

        if (isHighlighted) {
            this.highlightedCountries.set(countryName, this.geoGenerator.bounds(feature));
        }
    }

    /**
     * 
     * @param {*} event event to be handled
     * Handles mouse movement on the canvas
     * Determines the hovered country and updates display
     * Shows tooltip for the hovered country
     */
    handleMouseMove(event) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / canvasRect.width;
        const scaleY = this.canvas.height / canvasRect.height;
    
        const mouseX = (event.clientX - canvasRect.left) * scaleX;
        const mouseY = (event.clientY - canvasRect.top) * scaleY;
    
        let foundCountry = null
    
        this.highlightedCountries.forEach((bounds, countryName) => {
            if (
                mouseX >= bounds[0][0] &&
                mouseX <= bounds[1][0] &&
                mouseY >= bounds[0][1] &&
                mouseY <= bounds[1][1]
            ) {
                foundCountry = countryName;
            }
        });
    
        if (foundCountry !== this.currentHover) {
            this.currentHover = foundCountry;
            this.update();
            if (foundCountry) {
                this.showTooltip(foundCountry, mouseX, mouseY);
            } else {
                this.hideTooltip();
            }
        }
    }

    /**
     * 
     * @param {*} event event to be handled
     * Handles mouse clicks on the canvas
     * Determines the clicked country, updates the date range, and updates the display
     * Toggles clicked country and updates the map
     */
    handleClick(event) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / canvasRect.width;
        const scaleY = this.canvas.height / canvasRect.height;
    
        const mouseX = (event.clientX - canvasRect.left) * scaleX;
        const mouseY = (event.clientY - canvasRect.top) * scaleY;
    
        let foundCountry = null
    
        this.highlightedCountries.forEach((bounds, countryName) => {
            if (
                mouseX >= bounds[0][0] &&
                mouseX <= bounds[1][0] &&
                mouseY >= bounds[0][1] &&
                mouseY <= bounds[1][1]
            ) {
                foundCountry = countryName;
            }
        });


        this.highlightedCountries.forEach((bounds, countryName) => {
            if (
                mouseX >= bounds[0][0] &&
                mouseX <= bounds[1][0] &&
                mouseY >= bounds[0][1] &&
                mouseY <= bounds[1][1]
            ) {
                foundCountry = countryName;
            }
        });

        switch (foundCountry) {
            case "Spain":
                startDate = new Date("2009-06-01");
                endDate = new Date("2018-06-01");
                break;
            case "Italy":
                startDate = new Date("2018-06-02");
                endDate = new Date("2021-06-01");
                break;
            case "United Kingdom":
                startDate = new Date("2003-06-02");
                endDate = new Date("2009-06-01");
                break;
            case "Saudi Arabia":
                startDate = new Date("2021-06-02");
                endDate = new Date("2023-06-01");
                break;
            case "Portugal":
                startDate = new Date("2002-01-01");
                endDate = new Date("2003-06-01");
                break;
            default:
                // Default case if the clickedCountry is not in the switch statement
                startDate = new Date("2000-01-01");
                endDate = new Date("2023-06-01");
            break;
        }
        this.updateDatesCallback(startDate, endDate)
        this.clickedCountry = this.clickedCountry === foundCountry ? null : foundCountry;
        this.update()
    }

    /**
     * 
     * @param {*} countryName country that is hovered over
     * @param {*} mouseX mouse X position
     * @param {*} mouseY mouse Y position
     * Shows a tooltip for the hovered country
     * Displays country information like trophies and goals
     */
    showTooltip(countryName, mouseX, mouseY) {
        let tooltipContent = countryName;

        tooltipContent = `
          <div style="text-align: center;"><strong>${countryName}</strong></div><br>
          ${this.trophyIcon} Trophies: ${this.countryTrophiesMap[countryName]}<br>
          ${this.soccerBallIcon} Goals: ${this.countryGoalsMap[countryName]}
        `;

        const tooltip = d3.select("#worldmapTooltip");
        const canvasRect = this.canvas.getBoundingClientRect();

        let offsetX = 200;
        let offsetY = 150;
    
        let left = canvasRect.left + mouseX  - offsetX;
        let top = canvasRect.top + mouseY - offsetY;

        tooltip
            .html(tooltipContent)
            .style("left", left + "px")
            .style("top", top + "px")
            .classed("visible", true); // Add the visible class to show
    }

    /**
     * Hides the tooltip when mouse is not hovering over a country
     */
    hideTooltip() {
        d3.select("#worldmapTooltip").classed("visible", false);
    }
}