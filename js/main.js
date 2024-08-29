let startDate = new Date("2000-01-01")
let endDate = new Date("2023-10-10")

Promise.all([
    d3.csv('data/yds_data.csv'),
    d3.csv('data/cristiano-ronaldo-milestones.csv'),
    d3.csv('data/championship-winning-games.csv'),
    d3.json('data/countries.geojson'),
    d3.csv('data/ronaldo-countries-trophies.csv') // Assuming this is your missing ronaldoData
]).then(function (files) {
    // Process each file
    const updateDatesCallback = (newStartDate, newEndDate) => {
        // Update startDate and endDate in main.js
        startDate = newStartDate;
        endDate = newEndDate;
        timeline.updateVis(startDate, endDate)
        heatmap.filterData(startDate, endDate)
    };

    const updateFromTimeline = (startDate, endDate) => {
        worldmap.highlightCountries(startDate, endDate)
        heatmap.filterData(startDate, endDate)
    };

    const timeline = new Timeline({ parentElement: '#timeline' }, files, startDate, endDate, updateFromTimeline);

    let unique = new Set();
    let filteredData = files[0]
        // filter for NULLS and keep only goals
        .filter(d =>
            d.power_of_shot !== null &&
            d.is_goal == 1 &&
            d.location_x !== null &&
            d.location_y !== null
        )
        .map(d => {
            Object.keys(d).forEach(attr => {
                // Parsing and transformations, ensuring that there's no outliers and NULLS
                if (attr === 'power_of_shot') {
                    d[attr] = (d[attr] === null) ? 3 : +d[attr];
                    d[attr] = (d[attr] >= 5) ? 5 : +d[attr];
                    d[attr] = (d[attr] <= 0) ? 1 : +d[attr];
                } else if (attr === 'location_x' || attr === 'location_y') {
                    d[attr] = parseInt(d[attr], 10);
                } else if (attr === "area_of_shot") {
                    d[attr] = (d[attr] === null) ? "Center(C)" : d[attr];
                }
            });
            return d;
        })
        // filter outliers
        .filter(d =>
            !isNaN(d.location_y) &&
            !isNaN(d.location_x) &&
            d.location_x >= -200 &&
            d.location_x <= 200 &&
            d.location_y >= -20 &&
            d.location_y <= 200
        )
        // filter duplicates
        .filter(d => {
            const uniqueKey = `${d.match_event_id}}`;
            if (unique.has(uniqueKey)) {
                return false;
            } else {
                unique.add(uniqueKey);
                return true;
            }
        });

    // Global variable to store the selected data point
    const dispatcher = d3.dispatch('selectedGoal');
    let heatmap = new Heatmap({ parentElement: '#heatmap' }, dispatcher, filteredData);
    let goal = new Goal({ parentElement: '#goal' }, filteredData);
    dispatcher.on('selectedGoal', selectedGoal => {
        // Filter the data based on the shot_id_number
        let goalData = filteredData.filter(d => d.shot_id_number === selectedGoal.shot_id_number
            && d.power_of_shot === selectedGoal.power_of_shot
            && d.area_of_shot === selectedGoal.area_of_shot);

        goal.data = goalData;
        goal.updateVis();
    });
    const ronaldoData = files[4];
    const countryTrophiesMap = {};
    const countryGoalsMap = {}; // New map for goals
    ronaldoData.forEach(row => {
        countryTrophiesMap[row.country] = parseInt(row.trophies, 10);
        countryGoalsMap[row.country] = parseInt(row.goals, 10); // Process goals
    });

    let worldmap = new WorldMap({
        parentElement: '#worldmap',
        width: 400,
        height: 400
    }, files[3], new Set(Object.keys(countryTrophiesMap)), countryTrophiesMap, countryGoalsMap, updateDatesCallback);

    // Hide the loading spinner
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('box').style.display = 'none';

    document.getElementById('navbar').style.display = 'flex';
    document.querySelector('.main-container').style.display = 'flex';

}).catch(function (err) {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('box').style.display = 'none';
});