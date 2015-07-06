(function() {
    var Ploter = {
        // Initialize the constants and bind events.
        init: function() {
            // Production
            //this.DATAURL_all_countries = 'http://radiant-basin-3159.herokuapp.com/api/v1/eurostat/basic/countries/';
            // Development
            this.DATAURL_ratio = 'http://localhost:3030/api/v1/ratio';
            this.buttonYears = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
            // where we store the data from the middleware
            this.data = [];   
            this.COUNTRY = {
                code: "BE",
                description: "Belgium"
            };
            this.YEAR = 2000;
            this.INTERVAL = null;
            this.BUTTONS = null;
            this.change();
            this.barChartContainer = {
                get containerEl() {
                    return document.getElementById( 'barChart' );    
                },
                get width() {
                    return this.containerEl.clientWidth;
                }, 
                get height() {
                    return this.width * 0.4
                },
                margin : {
                    top    : 25,
                    right  : 10,
                    left   : 40,
                    bottom : 100 
                },
                detailWidth     : 98,
                detailHeight    : 55,
                detailMargin    : 10
            }
        },

        // build the stack bar
        drawBarChart: function() {
            var self = this
                containerEl = this.barChartContainer.containerEl,
                x   = d3.scale.ordinal()
                        .rangeRoundBands([0, this.barChartContainer.width - this.barChartContainer.detailWidth], .1),

                y   = d3.scale.linear()
                        .rangeRound([this.barChartContainer.height, 0]),

                xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom"),                    

                yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickFormat(d3.format("%")),

                yAxisTicks = d3.svg.axis().scale( y )
                    .tickSize( this.barChartContainer.width - this.barChartContainer.detailWidth )
                    .tickFormat( '' )
                    .orient( 'right' ),

                container = d3.select( this.barChartContainer.containerEl ),

                color = d3.scale.ordinal()
                    .range(["#98abc5", "#8a89a6"]);

            svg = container.select( 'svg' )
                .attr("width", this.barChartContainer.width)
                .attr("height", this.barChartContainer.height + this.barChartContainer.margin.top + this.barChartContainer.margin.bottom)
                    .append("g")
                .attr("transform", "translate(" + this.barChartContainer.margin.left + "," + this.barChartContainer.margin.top + ")");           
            x.domain( this.data.barChart.map(function(d) {return d.country.description}) )

            var max = d3.max(this.data.barChart, function(d) {
                return d3.max([d.total_taxes]);
            })

            y.domain([0, max]);

            color.domain(['tax', 'soc']) // not showing FAM as we are concern with single people

            this.data.barChart.forEach(function(d) {
                var y0 = 0;
                d.taxes = color.domain().map(function(name) {return {country: d['country'], name: name, y0: y0, y1: y0 += +(d['total_taxes']/(1/d[name]))}; })
                d.total = d['total_taxes']
            })

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.barChartContainer.height + ")")
                .call(xAxis)
                .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)" 
                    });

            svg.append( 'g' )
                .attr( 'class', 'lineChart--yAxisTicks' )
                .call( yAxisTicks );

            y_axis = svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)                
                .append("text")
                   .attr("transform", "rotate(-90)")
                   .attr("y", 5)
                   .attr("dy", ".71em")        
                   .style("text-anchor", "end")
                   .text("Tax Rate"); 

            var bar = svg.selectAll(".bar")
                .data(this.data.barChart);
            bar.enter().append("g")
                .attr("class", "g")
                .attr("transform", function(d) { return "translate(" + x(d.country.description) + ",0)"; })  

            bar.selectAll("rect")
                .data(function(d) { return d.taxes; })       
                .enter().append("rect")
                .on("click", function(d) { self.onClick_barChart(d, this); })
                .attr("y", function(d) {return y(d.y1); })
                .attr("width", x.rangeBand())
                .transition() // initial animation
                    .delay(function (d, i) {return d.y1*3000; })                                    
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .attr("label", function(d) {return d.country.code; })   
                .style("fill", function(d) { return color(d.name); })

            var legend = svg.selectAll(".bar-legend")
                    .data(["Income Taxes", "Employee's Social security"])
                .enter().append("g")
                .attr("class", "bar-legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", 178)
                .attr("y", 43)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", 174)
                .attr("y", 52)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });   
        },

        onClick_barChart: function(d, this_) {
            var elem = d3.select(this_).attr('label') // get the selected country
            // reset the other country selected 
            d3.selectAll(".g rect")
                .style("fill", function(d) { return"#ccc";} )
            var bars = d3.selectAll(".g rect") // select all segment for the country
                .filter(function(d) {return d.country.code == elem })
                .style("fill", function(d) { return"#804115";} )
            // set the current country as the one selected
            this.COUNTRY = {
                'code': d.country.code,
                'description': d.country.description
            } 
            // hide the legend
            svg.selectAll(".bar-legend")
                .style("visibility", "hidden");
            // stop the timer...
            this.playYears(false);
        },

        updateBarData: function() {
            // parse the data for the new year...
            this.parseBarData(null, this.YEAR);
            var self = this;

            var container = d3.select( this.barChartContainer.containerEl ),
                x   = d3.scale.ordinal()
                        .rangeRoundBands([0, this.barChartContainer.width - this.barChartContainer.detailWidth], .1),
                y   = d3.scale.linear()
                        .rangeRound([this.barChartContainer.height, 0])
                xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom"),                    

                yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickFormat(d3.format("%")),

                color = d3.scale.ordinal()
                    .range(["#98abc5", "#8a89a6"]);

            color.domain(['tax', 'soc']) // not showing FAM as we are concern with single people

            x.domain( this.data.barChart.map(function(d) {return d.country.description}) )
            var max = d3.max(this.data.barChart, function(d) {
                return d3.max([d.total_taxes]);
            })
            y.domain([0, max]);            
            var svg = container.select( 'svg' );

            this.data.barChart.forEach(function(d) {
                var y0 = 0;
                d.taxes = color.domain().map(function(name) {return {
                    country: d['country'], 
                    name: name, 
                    y0: y0, 
                    y1: y0 += +(d['total_taxes']/(1/d[name]))}; 
                })
                d.total = d['total_taxes']
            })

            // Make the changes
            // 1/ the bars        
            // I did not managed to get a clean way to update the stacked bars so
            // I simply remove each bars and re-create it.
            // http://stackoverflow.com/questions/31186892/how-to-update-a-stackedbar-with-d3-js    
            svg.selectAll(".g rect").remove() // remove the previous bars
            svg.selectAll(".g").remove()
            var bar = svg.selectAll(".bar")
                .data(this.data.barChart);

            bar.enter().append("g")
                .attr("class", "g")                
                .attr("transform", function(d) { 
                    return "translate(" + x(d.country.description) + "," + self.barChartContainer.margin.top + ")"; 
                })              
            
            bar.selectAll("rect")
                .data(function(d) { return d.taxes; })                        
                .enter().append("rect")
                .on("click", function(d) { self.onClick_barChart(d, this); })
                .attr("x", this.barChartContainer.margin.left)
                .attr("width", x.rangeBand())
                .attr("y", function(d) {return y(d.y1); })   
                .attr("label", function(d) {return d.country.code; })           
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .style("fill", function(d) { return color(d.name); });
            // 2/ x-axis
            svg.select(".x.axis") // change the x axis
                .call(xAxis)
                .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)" 
                    });
            // 3/ y-axis
            svg.select(".y.axis") // change the y axis
                .call(yAxis);
            // 4/ reset the selected button
            d3.select(".selected")
                .classed("selected", false);
            if (this.BUTTONS) {
                this.BUTTONS.filter(function(d) { return d == self.YEAR; })
                        .classed("selected", true);
            }            
        },

        parseBarData: function(json, year) {
            var self = this;
            if (json == null){
                json = this.data.rawData;
            } else {
                this.data.rawData = json;
            }
            // reset the container
            this.data.barChart = []
            json.map(function(d) { 
                dataYear = {}
                dataYear['country'] = d.country
                for (var idx in d.measure) {
                    if (Object.keys(d.measure[idx]) == year) {
                        dataYear['total_taxes'] = d.measure[idx][year][4].tax_ratio
                        dataYear['fam'] = d.measure[idx][year][5].tax_fam
                        dataYear['soc'] = d.measure[idx][year][6].tax_soc
                        dataYear['tax'] = d.measure[idx][year][7].tax_tax
                    }
                }
                self.data.barChart.push(dataYear);                       
            }) 
            // sort the barchart data
            self.data.barChart.sort(function(a, b) {
                return parseFloat(a.total_taxes) - parseFloat(b.total_taxes);
            }); 
        },  

        playYears: function(status) {
            var self = this;
            if (status) {
                f = function() {     
                    // make sure the stackedbar chart legend is visible
                    d3.selectAll(".bar-legend")
                        .style("visibility", "visible");           
                    self.YEAR++;
                    self.updateBarData();
                    if (self.YEAR >= 2013) {                    
                        self.YEAR = 1999;
                    }
                }
                // timer                
                this.INTERVAL = setInterval(f, 2000); 
                f();
            } else {
                clearInterval(self.INTERVAL);
            }
        },

        // render the charts on the page
        render: function(jsondata, country) {
            var self = this;
            this.parseBarData(jsondata, this.YEAR);
            // build the first year
            this.drawBarChart();
            // enable the year sequence
            this.playYears(true);
            // load the container with year's button
            var container = d3.select(".buttons-container");
            this.BUTTONS = container.selectAll("div")
                .data(this.buttonYears)
                .enter().append("div")
                .text(function(d) { return d; })
                .attr("class", function(d) {
                    if (d == self.YEAR)
                        return "button selected"; // select the current
                    else
                        return "button";
                });
            this.BUTTONS.on("click", function(d) {
                self.YEAR = d;
                self.updateBarData()
            });  
            var playButton = d3.select(".play-button")
                .on("click", function() {
                    self.playYears(true)
                })  
        },

        // handle data change and callback to the middleware
        change: function() {
            var self = this;
            d3.json(self.DATAURL_ratio)
                .on("load", function(data) {self.render(data, self.COUNTRY.description);})
                .on("error", function(error) { console.log("failure!", error); })
                .get();
        }
    }

    // this is where the magic is initiated !
    Ploter.init();

})();


