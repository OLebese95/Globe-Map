// Initialization 
var width = '100%',
    height = '100%',
    hue = 0, colors = {},
    meteorites;

var projection = d3.geoMercator()
    .translate([780, 360])
    .scale(300);

var zoom = d3.zoom()
    .scaleExtent([0.5, 18])
    .on("zoom", zoomed);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select('#container')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .call(zoom);

var map = svg.append('g');

d3.json('https://d3js.org/world-50m.v1.json').then(function(json) {
    map.selectAll('path')
        .data(topojson.feature(json, json.objects.countries).features)
        .enter()
        .append('path')
        .attr('fill', '#95E1D3')
        .attr('stroke', '#266D98')
        .attr('d', path);
});

d3.json('https://data.nasa.gov/resource/y77d-th95.geojson').then(function(json) {
    json.features.sort(function(a, b) {
        return new Date(a.properties.year) - new Date(b.properties.year);
    });

    json.features.forEach(function(e) {
        hue += 0.35;
        colors[e.properties.year] = hue;
        e.color = 'hsl(' + hue + ',100%, 50%)';
    });

    json.features.sort(function(a, b) {
        return b.properties.mass - a.properties.mass;
    });

    meteorites = svg.append('g')
        .selectAll('circle')
        .data(json.features)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return projection([d.properties.reclong, d.properties.reclat])[0]; })
        .attr('cy', function(d) { return projection([d.properties.reclong, d.properties.reclat])[1]; })
        .attr('r', function(d) {
            var range = 718750 / 2 / 2;

            if (d.properties.mass <= range) return 2;
            else if (d.properties.mass <= range * 2) return 10;
            else if (d.properties.mass <= range * 3) return 20;
            else if (d.properties.mass <= range * 20) return 30;
            else if (d.properties.mass <= range * 100) return 40;
            return 50;
        })
        .attr('fill-opacity', function(d) {
            var range = 718750 / 2 / 2;
            if (d.properties.mass <= range) return 1;
            return 0.5;
        })
        .attr('stroke-width', 1)
        .attr('stroke', '#EAFFD0')
        .attr('fill', function(d) { return d.color; })
        .on('mouseover', function(event, d) {
            d3.select(this).style('fill', 'black');

            // Show tooltip
            div.transition()
                .duration(200)
                .style('opacity', 0.9);
            div.html('<span class="def">fall:</span> ' + d.properties.fall + '<br>' +
                     '<span class="def">mass:</span> ' + d.properties.mass + '<br>' +
                     '<span class="def">name:</span> ' + d.properties.name + '<br>' +
                     '<span class="def">nametype:</span> ' + d.properties.nametype + '<br>' +
                     '<span class="def">recclass:</span> ' + d.properties.recclass + '<br>' +
                     '<span class="def">reclat:</span> ' + d.properties.reclat + '<br>' +
                     '<span class="def">year:</span> ' + d.properties.year + '<br>')
                .style('left', (event.pageX + 30) + 'px')
                .style('top', (event.pageY / 1.5) + 'px');
        })
        .on('mouseout', function() {
            // Reset color of dot
            d3.select(this).style('fill', function(d) { return d.color; });

            // Fade out tooltip
            div.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Initialize map sizes
    sizeChange(100);
});

var div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

// Move and scale map and meteorites on interaction
function zoomed(event) {
    map.attr("transform", event.transform);
    meteorites.attr('transform', event.transform);
}

// Resize map on window resize
function sizeChange() {
    var containerWidth = d3.select("#container").node().getBoundingClientRect().width;
    d3.selectAll("g").attr("transform", "scale(" + containerWidth / 1900 + ")");
    d3.select("svg").attr("height", containerWidth / 2);
}

d3.select(window).on("resize", sizeChange);
