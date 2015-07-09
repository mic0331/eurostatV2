/*
Plotter annonymous function which is displaying the barchart and line chart
 */
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
                code: "",
                description: "",
                color: ""
            };
            this.onFirstLoad = true;
            this.enable = true;
            this.selectedCountries = [];
            this.selectedCountriesCode = [];
            this.DURATION = 1500;
            this.DELAY = 500;
            this.YEAR = 2000;
            this.INTERVAL = null;
            this.BUTTONS = null;
            this.change();
            // placeholder for the barchart
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
            },
            // placeholder for the linechart
            this.lineChartContainer = {
                get containerEl() {
                    return document.getElementById( 'lineChart' );    
                },
                get width() {
                    return this.containerEl.clientWidth;
                }, 
                get height() {
                    return this.width * 0.4
                },
                margin : {
                    top    : 60,
                    right  : 10,
                    left   : 10
                },
                detailWidth     : 98,
                detailHeight    : 55,
                detailMargin    : 10
            }
        },        

        // build the line chart
        drawLineChart: function() {
            var self        = this,                

                container   = d3.select( this.lineChartContainer.containerEl ),

                svg         = container.select("svg")
                                .attr('width', this.lineChartContainer.width)
                                .attr('height', this.lineChartContainer.height + this.lineChartContainer.margin.top),

                x           = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] ),

                xAxis       = d3.svg.axis().scale( x )
                                          .ticks ( d3.time.year, 3 )
                                          .tickSize( -this.lineChartContainer.height ),

                xAxisTicks  = d3.svg.axis().scale( x )
                                          .ticks( 16 )
                                          .tickSize( -this.lineChartContainer.height )
                                          .tickFormat( '' ),

                y           = d3.scale.linear().range( [ this.lineChartContainer.height, this.lineChartContainer.margin.top ] ),
                
                yAxis       = d3.svg.axis().scale( y )
                                          .orient( 'left' )
                                          .ticks ( 5 )
                                          .tickFormat(d3.format("%")),

                yAxisTicks  = d3.svg.axis().scale( y )
                                          .ticks( 12 )
                                          .tickSize( this.lineChartContainer.width )
                                          .tickFormat( '' )
                                          .orient( 'right' ),

                line        = d3.svg.line()
                                  .interpolate( 'linear' )
                                  .x( function( d ) { return x( d.year ) + self.lineChartContainer.detailWidth / 2; } )
                                  .y( function( d ) { return y( d.value ); } ),

                // draw one line per country :: perform a group by country
                
                dataGroup   = d3.nest()
                    .key(function(d) {
                            return d.country;
                        })
                    .entries(this.data.lineChart),

                // datum object
                startData   = dataGroup.map( function( d ) {
                    return {
                        year : d.year,
                        value : d.value
                    }
                });

                x.domain( [ 
                    d3.min( this.data.lineChart, function (d) {return d.year} ), 
                    d3.max( this.data.lineChart, function (d) {return d.year} ) ]);
                y.domain( [ 0, d3.max( this.data.lineChart, function( d ) { return d.value; } ) ] );

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--xAxisTicks' )
                    .attr( 'transform', 'translate(' + this.lineChartContainer.detailWidth / 2 + ',' + this.lineChartContainer.height + ')' )
                    .call( xAxisTicks );

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--xAxis' )
                    .attr( 'transform', 'translate(' + this.lineChartContainer.detailWidth / 2 + ',' + ( this.lineChartContainer.height + 7 ) + ')' )
                    .call( xAxis );

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--xAxis' )
                    .attr( 'transform', 'translate(' + this.lineChartContainer.detailHeight + ',' + 0 + ')' )
                    .call( yAxis )
                    .append("text")
                       .attr("transform", "rotate(-90)")
                       .attr("y", -25)
                       .attr("dy", ".71em")        
                       .style("text-anchor", "end")
                       .text("Tax Rate");

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--yAxisTicks' )
                    .call( yAxisTicks );             

                dataGroup.forEach(function(d, i) {
                    if (d.key != 'all' && d.key != self.COUNTRY.description)
                        svg.append('path')
                            .data(startData)
                            .attr( 'class', 'lineChart--areaLine--background')
                            .attr( 'd', line )
                            .transition()
                            .duration( self.DURATION )
                            .delay( self.DURATION / 2 )
                            .attrTween( 'd', self.tween( d.values, line ) )
                            .attr('stroke-width', 2)
                            .attr('fill', 'none')
                    else {
                        self.selectedCountries.push({
                            data : d,
                            color: (d.key === 'all') ? "#43857C" : self.COUNTRY.color
                        });
                        self.selectedCountriesCode.push(d.key)
                    }
                });
                // foreground line
                this.selectedCountries.forEach(function(d, i) {
                    svg.append('path')
                        .data(startData)                            
                        .attr( 'class', 'lineChart--areaLine--NET' )  
                        .attr( 'stroke', d.color)                      
                        .attr( 'd', line )
                        .transition()
                        .duration( self.DURATION )
                        .delay( self.DURATION / 2 )
                        .attrTween( 'd', self.tween( d.data.values, line ) )
                        .attr('stroke-width', 2)
                        .attr('fill', 'none')                            
                        .attr( 'end', function() {
                            self.drawCircles(self.data.lineChart.filter(function(d) {
                                return self.selectedCountriesCode.indexOf(d.country) != -1;
                            }));
                        })
                });
        },

        // Helper functions for line chart
        drawCircles: function(data ) {
            var self = this,
                container   = d3.select( this.lineChartContainer.containerEl ),
                svg         = container.select("svg")
                                .attr('width', this.lineChartContainer.width)
                                .attr('height', this.lineChartContainer.height + this.lineChartContainer.margin.top),
                circleContainer = svg.append( 'g' );

            data.forEach( function( datum, index ) {
                var color = self.selectedCountries.filter(function(d){
                    return d.data.key == datum.country;
                })[0].color;

                self.drawCircle( datum, index, color, circleContainer, self );
            } );
        },
        
        // Helper functions for line chart
        drawCircle: function ( datum, index, color, circleContainer, self ) {
            var x           = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] ),
                y           = d3.scale.linear().range( [ this.lineChartContainer.height, this.lineChartContainer.margin.top ] );
            x.domain( [ 
                    d3.min( this.data.lineChart, function (d) {return d.year} ), 
                    d3.max( this.data.lineChart, function (d) {return d.year} ) ]);
            y.domain( [ 0, d3.max( this.data.lineChart, function( d ) { return d.value; } ) ] );
            var self = this;

            circleContainer.datum( datum )
                .append( 'circle' )
                .attr( 'class', 'lineChart--circle--NET' )
                .attr( 'fill', color)
                .attr( 'r', 0 )
                .attr(
                    'cx',
                    function( d ) {
                        return x( d.year ) + self.lineChartContainer.detailWidth / 2;
                    }
                )
                .attr(
                    'cy',
                    function( d ) {
                        return y( d.value );
                    }
                )
                .on( 'mouseenter', function( d ) {
                    d3.select( this )
                        .attr(
                            'class',
                            'lineChart--circle--NET lineChart--circle--NET__highlighted' 
                        )
                    .attr( 'r', 7 );
                    d.active = true;
                    self.showCircleDetail( d, color, circleContainer, self );
                } )
                .on( 'mouseout', function( d ) {
                    d3.select( this )
                        .attr(
                            'class',
                            'lineChart--circle--NET'
                        )
                    .attr( 'r', 6 );
                  
                if ( d.active ) {
                    self.hideCircleDetails(circleContainer); 
                    d.active = false;
                  }
                } )
                .on( 'click touch', function( d, self ) {
                    if ( d.active ) {
                        self.showCircleDetail( d, color, circleContainer, self)
                    } else {
                        self.hideCircleDetails(circleContainer);
                    }
                } )
                .transition()
                .delay( self.DURATION / 10 * index )
                .attr( 'r', 6 ) 
        },

        // Helper functions for line chart
        hideCircleDetails: function (circleContainer) {
            circleContainer.selectAll( '.lineChart--bubble' )
                .remove();
        },
        
        // Helper functions for line chart
        showCircleDetail: function ( data, color, circleContainer, self ) {
            var x           = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] ),
                y           = d3.scale.linear().range( [ this.lineChartContainer.height, this.lineChartContainer.margin.top ] );
            x.domain( [ 
                    d3.min( this.data.lineChart, function (d) {return d.year} ), 
                    d3.max( this.data.lineChart, function (d) {return d.year} ) ]);
            y.domain( [ 0, d3.max( this.data.lineChart, function( d ) { return d.value; } ) ] );

            var details = circleContainer.append( 'g' )
                    .attr( 'class', 'lineChart--bubble' )
                    .attr(
                        'transform',
                        function() {
                            var result = 'translate(';
                            result += x( data.year );
                            result += ', ';
                            result += y( data.value ) - self.lineChartContainer.detailHeight - self.lineChartContainer.detailMargin;
                            result += ')';

                            return result;
                    }
            );
      
            details.append( 'path' )
                  .attr( 'd', 'M2.99990186,0 C1.34310181,0 0,1.34216977 0,2.99898218 L0,47.6680579 C0,49.32435 1.34136094,50.6670401 3.00074875,50.6670401 L44.4095996,50.6670401 C48.9775098,54.3898926 44.4672607,50.6057129 49,54.46875 C53.4190918,50.6962891 49.0050244,54.4362793 53.501875,50.6670401 L94.9943116,50.6670401 C96.6543075,50.6670401 98,49.3248703 98,47.6680579 L98,2.99898218 C98,1.34269006 96.651936,0 95.0000981,0 L2.99990186,0 Z M2.99990186,0' )
                  .attr( 'width', self.lineChartContainer.detailWidth )
                  .attr( 'height', self.lineChartContainer.detailHeight );
          
            var text = details.append( 'text' )
                    .attr( 'class', 'lineChart--bubble--text' );  
          
            text.append( 'tspan' )
              .attr( 'class', 'lineChart--bubble--label--NET' )
              .attr( 'stroke', color)
              .attr( 'x', self.lineChartContainer.detailWidth / 2 )
              .attr( 'y', self.lineChartContainer.detailHeight / 3 )
              .attr( 'text-anchor', 'middle' )
              .text( function() {
                    if (data.country === 'all') 
                        return 'Avg. Taxes';
                    else
                        return 'Total Taxes';
              });
          
            text.append( 'tspan' )
              .attr( 'class', 'lineChart--bubble--value' )
              .attr( 'x', self.lineChartContainer.detailWidth / 2 )
              .attr( 'y', self.lineChartContainer.detailHeight / 4 * 3 )
              .attr( 'text-anchor', 'middle' )
              .text( (data.value * 100).toFixed(2) + ' %' );
        },

        // Helper functions for line chart
        tween: function ( b, callback ) {
            return function( a ) {
                var i = d3.interpolateArray( a, b );

                return function( t ) {
                    return callback( i ( t ) );
                };
            };
        },

        // build the stack bar
        drawBarChart: function() {
            var self        = this
                containerEl = this.barChartContainer.containerEl,
                x           = d3.scale.ordinal()
                                .rangeRoundBands([0, this.barChartContainer.width - this.barChartContainer.detailWidth], .1),

                y           = d3.scale.linear()
                                .rangeRound([this.barChartContainer.height, 0]),

                xAxis       = d3.svg.axis()
                                .scale(x)
                                .orient("bottom"),                    

                yAxis       = d3.svg.axis()
                                .scale(y)
                                .orient("left")
                                .tickFormat(d3.format("%")),

                yAxisTicks  = d3.svg.axis().scale( y )
                                .tickSize( this.barChartContainer.width - this.barChartContainer.detailWidth )
                                .tickFormat( '' )
                                .orient( 'right' ),

                container   = d3.select( this.barChartContainer.containerEl ),

                color       = d3.scale.ordinal()
                                .range(["#98abc5", "#8a89a6"]),

                svg         = container.select( 'svg' )
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

            svg.append("g")
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

        // event when a bar is selected in the barchart
        onClick_barChart: function(d, this_) {
            var elem = d3.select(this_).attr('label') // get the selected country
            // reset the other country selected 
            d3.selectAll(".g rect")
                .style("fill", function(d) { return"#aaa";} )
            var bars = d3.selectAll(".g rect") // select all segment for the country
                .filter(function(d) {return d.country.code == elem })
                .style("fill", function(d) { return"#804115";} )
            // set the current country as the one selected
            this.COUNTRY = {
                'code': d.country.code,
                'description': d.country.description,
                'color': "#804115"
            } 
            // highlight the selected country in the line chart
            this.highlightLineForCountry();
            // set the country in the title of the line chart (country ...)
            d3.select("h2.chart--headline")
                .text("... for " + this.COUNTRY.description);
            // hide the legend
            svg.selectAll(".bar-legend")
                .style("visibility", "hidden");
            // stop the timer...
            this.enable = false;            
            this.playYears(false);            
        },

        // colorized the country based on the selected bar from the bar-chart
        highlightLineForCountry: function() {
            var self        = this,                

                container   = d3.select( this.lineChartContainer.containerEl ),

                svg         = container.select("svg")
                                .attr('width', this.lineChartContainer.width)
                                .attr('height', this.lineChartContainer.height + this.lineChartContainer.margin.top),

                x           = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] ),
                y           = d3.scale.linear().range( [ this.lineChartContainer.height, this.lineChartContainer.margin.top ] );            

                line        = d3.svg.line()
                                  .interpolate( 'linear' )
                                  .x( function( d ) { return x( d.year ) + self.lineChartContainer.detailWidth / 2; } )
                                  .y( function( d ) { return y( d.value ); } ),

                dataGroup   = d3.nest()
                    .key(function(d) {
                            return d.country;
                        })
                    .entries(this.data.lineChart),                    

                // datum object
                startData   = dataGroup.map( function( d ) {
                    return {
                        year : d.year,
                        value : d.value
                    }
                });

            x.domain( [ 
                d3.min( this.data.lineChart, function (d) {return d.year} ), 
                d3.max( this.data.lineChart, function (d) {return d.year} ) ]);

            y.domain( [ 0, d3.max( this.data.lineChart, function( d ) { return d.value; } ) ] );

            svg.selectAll('path')
                .attr( 'stroke', "#aaa" );
            svg.selectAll('.lineChart--areaLine--NET')
                .remove();
            svg.selectAll('circle')
                .remove();

            self.selectedCountries = [];
            self.selectedCountriesCode = [];
            dataGroup.forEach(function(d, i) {
                if (d.key === self.COUNTRY.description || d.key === 'all')  {
                    self.selectedCountries.push({
                        data : d,
                        color: (d.key === 'all') ? "#43857C" : self.COUNTRY.color
                    });
                    self.selectedCountriesCode.push(d.key)
                } 
            });   
            // foreground line 
            this.selectedCountries.forEach(function(d, i) {
                if (d.data.key != 'all') {
                    // show the selected country
                    svg.append('path')
                        .data(startData)                            
                        .attr( 'stroke', d.color)                      
                        .attr( 'd', line )
                        .transition()
                        .duration( self.DURATION * 20 )
                        .delay( self.DURATION / 2 )
                        .attrTween( 'd', self.tween( d.data.values, line ) )
                        .attr('stroke-width', 2)
                        .attr('fill', 'none')
                        .attr( 'end', function() {
                            self.drawCircles(self.data.lineChart.filter(function(d) {
                                return self.selectedCountriesCode.indexOf(d.country) != -1;
                            }));
                        })
                } else {
                    // still show the average
                    svg.append('path')
                        .data(startData) 
                        .attr( 'class', 'lineChart--areaLine--NET' )                           
                        .attr( 'stroke', "#43857C")                      
                        .attr( 'd', line )
                        .transition()
                        .duration( self.DURATION * 20 )
                        .delay( self.DURATION / 2 )
                        .attrTween( 'd', self.tween( d.data.values, line ) )
                        .attr('stroke-width', 2)
                        .attr('fill', 'none') 
                        .attr( 'end', function() {
                            self.drawCircles(self.data.lineChart.filter(function(d) {
                                return self.selectedCountriesCode.indexOf(d.country) != -1;
                            }));
                        })
                }
                
            });            

            // add legend 
            svg.selectAll(".line-legend").remove();
            var legend = svg.selectAll(".line-legend")
                    .data(this.selectedCountries)
                .enter().append("g")
                .attr("class", "line-legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 18 + ")"; });

            legend.append("rect")
                .attr("x", this.lineChartContainer.width-76)
                .attr("y", 266)
                .attr("width", 16)
                .attr("height", 16)
                .style("fill", function(d) {
                    return d.color;
                });            

            legend.append("text")
                .attr("x", this.lineChartContainer.width-80)
                .attr("y", 276)
                .attr("dy", ".35em")
                .style("font-size", "12px")
                .style("text-anchor", "end")
                .text(function(d) {return (d.data.key === 'all') ?  "Average EU zone" : d.data.key });            
        },

        // display the annotations for the line chart
        displayAnnotations: function() {
            // note, refactoring is needed for this function ...
            var self        = this,                
                container   = d3.select( this.lineChartContainer.containerEl ),
                svg         = container.select("svg")
                                .attr('width', this.lineChartContainer.width)
                                .attr('height', this.lineChartContainer.height + this.lineChartContainer.margin.top),
                x           = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] ),
                y           = d3.scale.linear().range( [ this.lineChartContainer.height, this.lineChartContainer.margin.top ] );
                x.domain( [ 
                    d3.min( this.data.lineChart, function (d) {return d.year} ), 
                    d3.max( this.data.lineChart, function (d) {return d.year} ) ]);
                y.domain( [ 0, d3.max( this.data.lineChart, function( d ) { return d.value; } ) ] );

                // annotation 1
                
                var txt = [
                    "Notice how most of the countries with low",
                    "tax rate have increased the taxes around late ",
                    "2009 where the the European debt crisis erupted"
                ];

                var txtContainer1 = svg.append("g")

                txt.forEach(function(d, i) {
                    txtContainer1.append("text")
                        .data(txt)
                        .attr("class", "g-text-annotation")
                        .attr("x", x(new Date(2012, 0)) + 10 + self.lineChartContainer.detailWidth / 2)
                        .attr("y", 32)
                        .attr("dy",  i + "em" )
                        .style("text-anchor", "end")
                        .text(d)                                                
                })
                
                txtContainer1.on( 'mouseover', function( d ) {
                    txtContainer1.selectAll('.g-text-annotation')
                        .style('opacity', '1')
                        .style('fill', "#98abc5")
                        .style('font-weigh', "bold")
                })

                txtContainer1.on( 'mouseout', function( d ) {
                    txtContainer1.selectAll('.g-text-annotation')
                        .style('opacity', '.5')
                        .style('fill', "#999")
                        .style('font-weigh', "normal")
                })

                // annotation 2

                var txt = [
                    "Late 2009 EU Debt crisis erupted (most affected ",
                    "country : Greece, Spain, Irland and Portugal)"
                ];

                var txtContainer2 = svg.append("g")

                txt.forEach(function(d, i) {
                    txtContainer2.append("text")
                        .data(txt)
                        .attr("class", "g-text-annotation")
                        .attr("x", x(new Date(2010, 0)) + 10 + self.lineChartContainer.detailWidth / 2)
                        .attr("y", 278)
                        .attr("dy",  i + "em" )
                        .style("text-anchor", "end")
                        .text(d)
                })

                txtContainer2.append('line')
                    .attr({
                        'x1': x( new Date(2009 - 1, 0) ) + 20 + self.lineChartContainer.detailWidth / 2,
                        'y1': 240,
                        'x2': x( new Date(2009 - 1, 0) ) + 20 + self.lineChartContainer.detailWidth / 2,
                        'y2': 270
                    })
                    .attr("stroke", "#aaa")
                    .attr('class', 'annotation-line');

                txtContainer2.on( 'mouseover', function( d ) {
                    txtContainer2.selectAll('.g-text-annotation')
                        .style('opacity', '1')
                        .style('fill', "#98abc5")
                        .style('font-weigh', "bold")
                    txtContainer2.selectAll('line')
                        .style('stroke', "#98abc5")
                        .style('stroke-opacity', 1)
                })

                txtContainer2.on( 'mouseout', function( d ) {
                    txtContainer2.selectAll('.g-text-annotation')
                        .style('opacity', '.5')
                        .style('fill', "#999")
                        .style('font-weigh', "normal")
                    txtContainer2.selectAll('line')
                        .style('stroke', "#999")
                        .style('stroke-opacity', .15)
                })

                // annotation 3

                var txt = [
                    "Notice Belgium, Germany & Denmark which",
                    "are leading the top of the highest tax rate",
                    "These counries are those where the impact",
                    "of the crisis was the least significant"
                ];

                var txtContainer3 = svg.append("g");

                txt.forEach(function(d, i) {
                    txtContainer3.append("text")
                        .data(txt)
                        .attr("class", "g-text-annotation")
                        .attr("x", x(new Date(2004, 0)) + 10 + self.lineChartContainer.detailWidth / 2)
                        .attr("y", 20)
                        .attr("dy",  i + "em" )
                        .style("text-anchor", "end")
                        .text(d)
                })

                txtContainer3.append('line')
                    .attr({
                        'x1': x( new Date(2005 - 1, 0) ) + 20 + self.lineChartContainer.detailWidth / 2,
                        'y1': 40,
                        'x2': x( new Date(2006 - 1, 0) ) + 20 + self.lineChartContainer.detailWidth / 2,
                        'y2': 65
                    })
                    .attr("stroke", "#aaa")
                    .attr('class', 'annotation-line');

                txtContainer3.on( 'mouseover', function( d ) {
                    txtContainer3.selectAll('.g-text-annotation')
                        .style('opacity', '1')
                        .style('fill', "#98abc5")
                        .style('font-weigh', "bold")
                    txtContainer3.selectAll('line')
                        .style('stroke', "#98abc5")
                        .style('stroke-opacity', 1)
                })

                txtContainer3.on( 'mouseout', function( d ) {
                    txtContainer3.selectAll('.g-text-annotation')
                        .style('opacity', '.5')
                        .style('fill', "#999")
                        .style('font-weigh', "normal")
                    txtContainer3.selectAll('line')
                        .style('stroke', "#999")
                        .style('stroke-opacity', .15)
                })
                
        },

        // draw the vertical line for the line chart
        drawVerticalLine: function() {
            var self = this,
                container   = d3.select( this.lineChartContainer.containerEl ),
                svg         = container.select("svg")
                                .attr('width', this.lineChartContainer.width)
                                .attr('height', this.lineChartContainer.height + this.lineChartContainer.margin.top),
                x           = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] ),
                y           = d3.scale.linear().range( [ this.lineChartContainer.height, this.lineChartContainer.margin.top ] ); 
            
            x.domain( [ 
                d3.min( this.data.lineChart, function (d) {return d.year} ), 
                d3.max( this.data.lineChart, function (d) {return d.year} ) ]);

            y.domain( [ 0, d3.max( this.data.lineChart, function( d ) { return d.value; } ) ] );
            
            d3.select(".verticalLine").remove();
            var verticalLine = svg.append('line')
                .attr({
                    'x1': x( new Date(self.YEAR - 1, 0) ) + self.lineChartContainer.detailWidth / 2,
                    'y1': 0,
                    'x2': x( new Date(self.YEAR - 1, 0) ) + self.lineChartContainer.detailWidth / 2,
                    'y2': self.lineChartContainer.height
                })
                .attr("stroke", "steelblue")
                .attr('class', 'verticalLine');
        },

        // update the verical line position in the lineChart
        updateVerticalLinePosition: function() {
            var self = this,
                x    = d3.time.scale().range( [ 0, this.lineChartContainer.width - this.lineChartContainer.detailWidth ] );
            x.domain([ 
                this.data.lineChart[this.data.lineChart.length - 1].year,
                this.data.lineChart[0].year]);
            d3.select(".verticalLine").attr("transform", function () {
                var x_pos = d3.select(this).attr('x1');
                var pos = x( new Date(self.YEAR, 0) ) + self.lineChartContainer.detailWidth / 2 - x_pos;
                return "translate(" + pos + ",0)";
            });
        },

        // update the bar chart data at every tick
        updateBarData: function() {
            // parse the data for the new year...
            this.parseBarData(null, this.YEAR);
            var self = this;            

            var container = d3.select( this.barChartContainer.containerEl ),
                x           = d3.scale.ordinal()
                                .rangeRoundBands([0, this.barChartContainer.width - this.barChartContainer.detailWidth], .1),
                y           = d3.scale.linear()
                                .rangeRound([this.barChartContainer.height, 0])
                xAxis       = d3.svg.axis()
                                .scale(x)
                                .orient("bottom"),                    

                yAxis       = d3.svg.axis()
                                .scale(y)
                                .orient("left")
                                .tickFormat(d3.format("%")),

                color       = d3.scale.ordinal()
                                .range(["#98abc5", "#8a89a6"]),
                svg         = container.select( 'svg' );

            color.domain(['tax', 'soc']) // not showing FAM as we are concern with single people

            x.domain( this.data.barChart.map(function(d) {return d.country.description}) )
            var max = d3.max(this.data.barChart, function(d) {
                return d3.max([d.total_taxes]);
            })
            y.domain([0, max]);                        

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

        // parse the data for the line chart
        parseLineData: function(json) {
            var self = this;
            // reset the container
            this.data.lineChart = [];
            json.map(function(d) {    
                for (var idx in d.measure) {
                    for (var year in d.measure[idx]) {
                        if (year < 2014) {
                            dataCountry = {};
                            dataCountry['country'] = d.country.description;
                            dataCountry['value'] = d.measure[idx][year][4].tax_ratio;
                            dataCountry['year'] = year;
                            self.data.lineChart.push(dataCountry);
                        }                        
                    }
                };                
            });
            // average per year
            var years = {};
            var counters = {}; // count the number of value collected per year

            for (var idx in this.data.lineChart) {
                if ( !years[this.data.lineChart[idx].year] ) {
                    years[this.data.lineChart[idx].year] = this.data.lineChart[idx].value;
                    counters[this.data.lineChart[idx].year] = 1;
                } else {
                    years[this.data.lineChart[idx].year] += this.data.lineChart[idx].value;
                    counters[this.data.lineChart[idx].year] += 1;
                }                                
            }                

            // compute the average.  We use a random year for the counter
            // we know all years have value returned by the mdw.            
            for (var year in years) {   
                years[year] = years[year] / counters[2013];                
            }
            // we do not consider 2014 as eurostat is still missing data for that year...
            //delete years[2014]
            
            for (var idx in years) {
                this.data.lineChart.push({
                    year : idx,
                    value: years[idx],
                    country: 'all'
                })
            }
            for (var idx in this.data.lineChart) {
                this.data.lineChart[idx].year = new Date(this.data.lineChart[idx].year, 0)
            }
            // Finally, order the data per year
            this.data.lineChart.sort(function (a,b){
                return new Date(b.year) - new Date(a.year);
            });
        },

        // parse the data for the bar chart
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
                dataYear = {};
                dataYear['country'] = d.country;
                for (var idx in d.measure) {
                    if (Object.keys(d.measure[idx]) == year) {
                        dataYear['total_taxes'] = d.measure[idx][year][4].tax_ratio
                        dataYear['fam'] = d.measure[idx][year][5].tax_fam
                        dataYear['soc'] = d.measure[idx][year][6].tax_soc
                        dataYear['tax'] = d.measure[idx][year][7].tax_tax
                    }
                }
                self.data.barChart.push(dataYear);                       
            }); 
            // sort the barchart data
            self.data.barChart.sort(function(a, b) {
                return parseFloat(a.total_taxes) - parseFloat(b.total_taxes);
            });             
        },  

        // timer used to play the year sequence
        playYears: function(status) {
            var self = this;
            if (status) {
                f = function() {     
                    // make sure the stackedbar chart legend is visible
                    d3.selectAll(".bar-legend")
                        .style("visibility", "visible");                       
                    if (self.YEAR > 2013) {                    
                        self.YEAR = 2000;
                    } 
                    self.updateBarData();
                    self.updateVerticalLinePosition(); 
                    self.YEAR++;                                      
                }
                // timer                
                this.INTERVAL = setInterval(f, 2000); 
                if (!this.onFirstLoad) {
                    f();
                    this.onFirstLoad = false;
                }
                self.enable = true;
            } else {
                clearInterval(self.INTERVAL);
            }
        },

        // render the charts on the page
        render: function(jsondata, country) {
            var self = this;
            // parse the data for the bar chart and the line chart
            this.parseBarData(jsondata, this.YEAR);
            this.parseLineData(jsondata);
            // build the first year
            this.drawBarChart();
            // build the line chart showing the average tax for all countries
            this.drawLineChart();
            // draw vertical line
            this.drawVerticalLine(); 
            // add annotation on the line chart
            this.displayAnnotations();           
            // enable the year sequence
            this.playYears(true);            
            // load the container with year's button
            var container = d3.select(".buttons-container");
            this.BUTTONS = container.selectAll("div")
                .data(this.buttonYears)
                .enter().append("div")
                .text(function(d) { return d; })
                .attr("class", function(d) {
                    if (d == self.YEAR) {
                        return "button selected"; // select the current
                    }                        
                    else {
                        return "button";
                    }
                });
            this.BUTTONS.on("click", function(d) {
                self.YEAR = d;
                self.updateBarData();                
                self.playYears(false);
                self.enable = false;
                self.updateVerticalLinePosition();
            });  
            var playButton = d3.select(".play-button")
                .on("click", function() {
                    if (!self.enable)
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