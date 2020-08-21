//code section for drop down information
var seeMore = document.getElementById("seeMore");

$("#seeMore").click(function () {
    $(".desc").toggleClass("active");
    if (seeMore.innerHTML == "See more") {
        seeMore.innerHTML = "See less";
    } else if (seeMore.innerHTML == "See less") {
        setTimeout(changetext, 400);
        //timing of text change was a little off so I threw a timeout to line it up nicer
        function changetext() {
            seeMore.innerHTML = "See more";
        }
    }
});
/*
              DEFINE DIMENSIONS AND GENERATE SVG CANVAS
              Data taken from the following website: https://www.kaggle.com/leonardopena/top-spotify-songs-from-20102019-by-year/activity
              */

d3.csv("./top10s.csv").then(function (data) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var margin = {
        top: 100,
        left: 100,
        right: 150,
        bottom: 100
    };
    var svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //capital letter function source: https://codepen.io/w3resource/pen/KXNpRe
    //this method is changing the genre data from all lowercase to have its first letters be uppercase
    //for example "dance pop" > "Dance Pop", this is for clarity and cleanliness in the tool tips
    function capital_letter(str) {
        str = str.split(" ");

        for (var i = 0, x = str.length; i < x; i++) {
            str[i] = str[i][0].toUpperCase() + str[i].substr(1);
        }

        return str.join(" ");
    }

    /*
            DEFINE DATA SETS
            */

    var yearCounter = 2010;
    document.getElementById("year").innerHTML = yearCounter;

    var leftArrow = document.getElementById("left-arrow");
    var rightArrow = document.getElementById("right-arrow");

    //hide back arrow on page load
    if (yearCounter == 2010) {
        leftArrow.style.visibility = 'hidden';
    }

    //filter data by the year counter variable
    var filtered = data.filter(function (d) {
        return d.year == yearCounter;
    });

    function yearbackward() {
        if (yearCounter == 2010 || yearCounter < 2010) {

            //the counter cycles through the years decreasing by 1 and stopping at 2010
            yearCounter = 2011;
            leftArrow.style.visibility = 'hidden';
        }
        if (yearCounter == 2011) {
            leftArrow.style.visibility = 'hidden';
            yearCounter = 2010;
        } else {
            yearCounter--;
            rightArrow.style.visibility = 'visible'; //this is to make left arrow reappear after 2010
        }
    }

    function yearforward() {
        if (yearCounter == 2019 || yearCounter > 2019) {
            yearCounter = 2018;

        }
        if (yearCounter == 2018) {
            rightArrow.style.visibility = 'hidden';
            yearCounter++;
        } else {
            leftArrow.style.visibility = 'visible'; //this is to make left arrow reappear after 2010
            yearCounter++;
        }
    }

    /*
            DEFINE SCALES
            */
    var xScale = d3
        .scaleLinear()
        .domain([40, 220])
        .range([margin.left, width - margin.right]);

    var yScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

    var colorScale = d3
        .scaleOrdinal(d3.schemeCategory10)
        .range([

            "#3aBBC9",
            "#666DCB",
            "#9bCA3E",
            "#FFE628",
            "#ffb92A",
            "#ff5916",
            "#F44174",
            "#FB9173",
            "#EA9010",
            "#3A7E4D",
            "#AA2A21",
            "#FFEBFE"

        ]);


    /*
            DRAW AXES
            */
    var xAxis = svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    var yAxis = svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    /*
            DRAW AXIS LABELS
            */
    var xAxisLabel = svg
        .append("text")
        .attr("class", "axisLabel")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("BPM");

    var yAxisLabel = svg
        .append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Danceability");

    /*
            DRAW POINTS FOR SCATTER PLOT WITH THE INITIAL DATASET
            */
    var circle = svg
        .selectAll("circle")
        .data(filtered)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d.bpm);
        })
        .attr("cy", function (d) {
            return yScale(d.dnce);
        })
        .attr("r", 10)
        .attr("fill", function (d) {
            return colorScale(d.topGenre);
        })
        .attr("opacity", 0.75);

    //clicking < for the previous year
    d3.select("#yearback").on("click", function () {
        yearbackward()
        var filtered = data.filter(function (d) {
            //youve got to rerun the filter method to update the data
            return d.year == yearCounter;
        });

        document.getElementById("year").innerHTML = yearCounter;

        var c = svg.selectAll("circle").data(filtered, function (d) {
            return d.id;
        });

        c.enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.bpm);
            })
            .attr("cy", function (d) {
                return yScale(d.dnce);
            })
            .attr("r", 0)
            .attr("fill", function (d) {
                return colorScale(d.topGenre);
            })
            .attr("opacity", 0.75)
            .merge(c)
            .transition()
            .duration(1000)
            .attr("cx", function (d) {
                return xScale(d.bpm);
            })
            .attr("cy", function (d) {
                return yScale(d.dnce);
            })
            .attr("r", 10)
            .attr("fill", function (d) {
                return colorScale(d.topGenre);
            })
            .attr("opacity", 0.75);

        c.exit()
            .transition()
            .duration(1000)
            .attr("r", 0)
            .remove();

        svg
            .selectAll("circle")
            .on("click", function (d) {
                var currentCircles = svg.selectAll("circle");

                if (isFiltered == false) {
                    var g = d.topGenre;

                    currentCircles.filter(function (c) {
                            return c.topGenre !== g;
                        }).transition()
                        .duration(1000)
                        .attr("r", 0);

                    setTimeout(changeFilter, 500);

                    function changeFilter() {
                        isFiltered = true;
                        console.log(isFiltered);
                    }

                }
            })

        svg
            .on("click", function (d) {
                var currentCircles = svg.selectAll("circle");

                if (isFiltered == true) {
                    currentCircles.transition()
                        .duration(1000)
                        .attr("r", 10);

                    isFiltered = false;
                    console.log(isFiltered);
                }
            })

        //added for updating tooltip
        svg
            .selectAll("circle")
            .on("mouseover", function (d) {
                // Update style and position of the tooltip div;
                var cx = +d3.select(this).attr("cx") + 20;
                var cy = +d3.select(this).attr("cy") - 10;

                tooltip
                    .style("opacity", "1") // make the tooltip visible
                    .style("left", cx + "px") // adjust the left (x) position of the tooltip
                    .style("top", cy + "px") // adjust the top (y) position of the tooltip
                    .html(
                        d.title +
                        "<br/>" +
                        "<div class='artist-name'>" +
                        d.artist +
                        "</div>" +
                        "<div id='genre-name'>" +
                        capital_letter(d.topGenre) + //calling the capital letter function to display the genres with capital letters for each word
                        "</div>"
                    ); // update the text of the tooltip to the `area` property of the object bound to the circle

                //create variable to set background of genre tag
                var genreTag = d3.select("#genre-name");

                genreTag
                    .style("background-color", colorScale(d.topGenre));

                //also highlight the circle:
                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 2)
                    .attr("r", 11)
                    .attr("opacity", 1);
            })
            .on("mouseout", function () {
                // Make the tooltip invisible when mouse leaves circle
                tooltip.style("opacity", "0");

                //reset visual appearance of highlighted circle
                d3.select(this)
                    .attr("stroke", "none")
                    .attr("stroke-width", 0)
                    .attr("r", 10)
                    .attr("opacity", 0.75);
            })
    });

    //clicking > for the next year
    d3.select("#yearforward").on("click", function () {
        yearforward()
        filtered = [];
        var filtered = data.filter(function (d) {
            return d.year == yearCounter;
        });

        document.getElementById("year").innerHTML = yearCounter;
        var c = svg.selectAll("circle").data(filtered, function (d) {
            return d.id;
        });

        c.enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.bpm);
            })
            .attr("cy", function (d) {
                return yScale(d.dnce);
            })
            .attr("r", 0)
            .attr("fill", function (d) {
                return colorScale(d.topGenre);
            })
            .attr("opacity", 0.75)
            .merge(c)
            .transition()
            .duration(1000)
            .attr("cx", function (d) {
                return xScale(d.bpm);
            })
            .attr("cy", function (d) {
                return yScale(d.dnce);
            })
            .attr("r", 10)
            .attr("fill", function (d) {
                return colorScale(d.topGenre);
            })
            .attr("opacity", 0.75);

        c.exit()
            .transition()
            .duration(1000)
            .attr("r", 0)
            .remove();

        //added for updating tooltip
        svg
            .selectAll("circle")
            .on("mouseover", function (d) {
                // Update style and position of the tooltip div;
                var cx = +d3.select(this).attr("cx") + 20;
                var cy = +d3.select(this).attr("cy") - 10;

                tooltip
                    .style("opacity", "1") // make the tooltip visible
                    .style("left", cx + "px") // adjust the left (x) position of the tooltip
                    .style("top", cy + "px") // adjust the top (y) position of the tooltip
                    .html(
                        d.title +
                        "<br/>" +
                        "<div class='artist-name'>" +
                        d.artist +
                        "</div>" +
                        "<div id='genre-name'>" +
                        capital_letter(d.topGenre) + //calling the capital letter function to display the genres with capital letters for each word
                        "</div>"
                    ); // update the text of the tooltip to the `area` property of the object bound to the circle

                //create variable to set background of genre tag
                var genreTag = d3.select("#genre-name");

                genreTag
                    .style("background-color", colorScale(d.topGenre));

                //also highlight the circle:
                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 2)
                    .attr("r", 11)
                    .attr("opacity", 1);
            })
            .on("mouseout", function () {
                // Make the tooltip invisible when mouse leaves circle
                tooltip.style("opacity", "0");

                //reset visual appearance of highlighted circle
                d3.select(this)
                    .attr("stroke", "none")
                    .attr("stroke-width", 0)
                    .attr("r", 10)
                    .attr("opacity", 0.75);
            })

        svg
            .selectAll("circle")
            .on("click", function (d) {
                var currentCircles = svg.selectAll("circle");

                if (isFiltered == false) {
                    var g = d.topGenre;

                    currentCircles.filter(function (c) {
                            return c.topGenre !== g;
                        }).transition()
                        .duration(1000)
                        .attr("r", 0);

                    setTimeout(changeFilter, 500);

                    function changeFilter() {
                        isFiltered = true;
                        console.log(isFiltered);
                    }

                }
            })

        svg
            .on("click", function (d) {
                var currentCircles = svg.selectAll("circle");

                if (isFiltered == true) {
                    currentCircles.transition()
                        .duration(1000)
                        .attr("r", 10);

                    isFiltered = false;
                    console.log(isFiltered);
                }
            })
    });

    //tooltip variable
    var tooltip = d3
        .select("#chart")
        .append("div")
        .attr("class", "tooltip");


    circle
        .on("mouseover", function (d) {
            // Update style and position of the tooltip div;
            var cx = +d3.select(this).attr("cx") + 20;
            var cy = +d3.select(this).attr("cy") - 10;

            tooltip
                .style("opacity", "1") // make the tooltip visible
                .style("left", cx + "px") // adjust the left (x) position of the tooltip
                .style("top", cy + "px") // adjust the top (y) position of the tooltip

                .html(
                    d.title +
                    "<br/>" +
                    "<div class='artist-name'>" +
                    d.artist +
                    "</div>" +
                    "<div id='genre-name'>" +
                    capital_letter(d.topGenre) +
                    "</div>"
                ); // update the text of the tooltip to the `area` property of the object bound to the circle

            //create variable to set background of genre tag
            var genreTag = d3.select("#genre-name");

            genreTag
                .style("background-color", colorScale(d.topGenre));

            //also highlight the circle:
            d3.select(this)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 2)
                .attr("r", 11)
                .attr("opacity", 1);
        })
        .on("mouseout", function () {
            // Make the tooltip invisible when mouse leaves circle
            tooltip.style("opacity", "0");

            //reset visual appearance of highlighted circle
            d3.select(this)
                .attr("stroke", "none")
                .attr("stroke-width", 0)
                .attr("r", 10)
                .attr("opacity", 0.75);
        }); //this click stuff below is how we filter the data when we click on a circle

    //this is for click by filtering

    var isFiltered = false;
    console.log(isFiltered);
    circle
        .on("click", function (d) {
            var currentCircles = svg.selectAll("circle");

            if (isFiltered == false) {
                var g = d.topGenre;
                currentCircles.filter(function (c) {
                        return c.topGenre !== g;
                    }).transition()
                    .duration(1000)
                    .attr("r", 0);

                setTimeout(changeFilter, 500);

                function changeFilter() {
                    isFiltered = true;
                    console.log(isFiltered);

                }
            }
        })

    svg
        .on("click", function (d) {
            var currentCircles = svg.selectAll("circle");

            if (isFiltered == true) {
                currentCircles.transition()
                    .duration(1000)
                    .attr("r", 10);

                isFiltered = false;
                console.log(isFiltered);
            }
        })
});