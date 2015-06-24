(function() {
    var Ploter = {
        // Initialize the constants and bind events.
        init: function() {
            // Production
            //this.DATAURL_per_country = 'http://radiant-basin-3159.herokuapp.com/api/v1/eurostat/basic/country/';
            //this.DATAURL_all_countries = 'http://radiant-basin-3159.herokuapp.com/api/v1/eurostat/basic/countries/';
            // Development
            this.DATAURL_per_country = 'http://localhost:3030/api/v1/eurostat/basic/country/';
            this.DATAURL_all_countries = 'http://localhost:3030/api/v1/eurostat/basic/countries/';
            this.LINE_DURATION = 200;
            this.PIE_DURATION = 1000;
            this.DELAY    = 500;
            // where we store the data from the middleware
            this.data = [];            
            this.COUNTRY = {
                code: "BE",
                description: "Belgium"
            }
            // draw the bar chart
            this.drawBarChart('barChart', this.data.barChart);
            // bind all events
            this.change(); 
        },

        // manipulate the data for the pie chart, calculate percentages
        getPieDataForYear: function( year ) {
            var pieData = [];
            var total = 0.;
            // retreive the data for the year of choice
            for (var idx in this.data.pieChart) {            
                if (this.data.pieChart[idx].year == year) {
                    pieData.push(this.data.pieChart[idx])
                    total += this.data.pieChart[idx].value
                }
            }
            // convert the value into pct
            for (var idx in pieData) {
                val = pieData[idx].value;
                pieData[idx].value =  val / total
            }
            return pieData;
        },

        // build the donuts chart
        drawPieChart: function( elementId, date ) {            

            year = date.getFullYear()
            document.getElementById("title").innerHTML = year;
            var data = this.getPieDataForYear(year)

            var containerEl = document.getElementById( elementId ),        
            width       = containerEl.clientWidth,
            height      = width * 0.4,
            radius      = Math.min( width, height ) / 2,
            container   = d3.select( containerEl ),
            svg         = container.select( 'svg' )
                                  .attr( 'width', width )
                                  .attr( 'height', height + 30 ); 
            // FIX: There is a small problem in the pic chart. 
            // Sometimes, it overlays the number making it hard to read 
            svg.selectAll('g').remove();

            var pie = svg.append( 'g' )
                .attr(
                    'transform',
                    'translate(' + width / 2 + ',' + height / 2 + ')'
                );
        
            var detailedInfo = svg.append( 'g' )
                .attr( 'class', 'pieChart--detailedInformation' );

            var twoPi   = 2 * Math.PI;
            var pieData = d3.layout.pie()
                .value( function( d ) { return d.value; } ).sort(null);

            var arc = d3.svg.arc()
                .outerRadius( radius - 20)
                .innerRadius( 0 );

            // remove data not being used            
            pie.datum(data).selectAll("path")
                .data(pieData).exit().remove();
            svg.selectAll('text').remove();
            svg.selectAll('line').remove();
            svg.selectAll('.pieChart--detail--textContainer').remove();

            // add any new paths
            var self = this;
            var pieChartPieces = pie.datum( data )
                .selectAll( 'path' )
                .data( pieData )
                .enter()
                .append( 'path' )
                .attr( 'class', function( d ) {
                    return 'pieChart__' + d.data.color;
                } )
                .attr( 'filter', 'url(#pieChartInsetShadow)' )
                .attr( 'd', arc )
                .each( function() {
                    self._current = { startAngle: 0, endAngle: 0 }; 
                } )
                .transition()
                .duration( this.PIE_DURATION )
                // Store the displayed angles in _current.
                // Then, interpolate from _current to the new angles.
                // During the transition, _current is updated in-place by d3.iterpolate.
                .attrTween( 'd', function( d ) {
                    var interpolate = d3.interpolate( self._current, d );
                    self._current = interpolate( 0 );
        
                    return function( t ) {
                        return arc( interpolate( t ) );
                    };
                } )
                .each( 'end', function handleAnimationEnd( d ) {
                    drawDetailedInformation( d.data, this ); 
                } );

            drawChartCenter(); 
            
            function drawChartCenter() {
                var centerContainer = pie.append( 'g' )
                                        .attr( 'class', 'pieChart--center' );
              
                centerContainer.append( 'circle' )
                              .attr( 'class', 'pieChart--center--outerCircle' )
                              .attr( 'r', 0 )
                              .attr( 'filter', 'url(#pieChartDropShadow)' )
                              .transition()
                              .duration( self.PIE_DURATION )
                              .delay( self.DELAY )
                              .attr( 'r', radius - 50 );
              
                centerContainer.append( 'circle' )
                              .attr( 'id', 'pieChart-clippy' )
                              .attr( 'class', 'pieChart--center--innerCircle' )
                              .attr( 'r', 0 )
                              .transition()
                              .delay( self.DELAY )
                              .duration( self.PIE_DURATION )
                              .attr( 'r', radius - 55 )
                              .attr( 'fill', '#fff' );
            }
        
            function drawDetailedInformation ( data, element ) {
                var bBox      = element.getBBox(),
                    infoWidth = width * 0.3,
                    anchor,
                    infoContainer,
                    position;            

                if ( ( bBox.x + bBox.width / 2 ) > 0 ) {                    
                    infoContainer = detailedInfo.append( 'g' )
                                            .attr( 'width', infoWidth )
                                            .attr(
                                              'transform',
                                              'translate(' + ( width - infoWidth ) + ',' + ( bBox.height + bBox.y ) + ')'
                                            );
                    anchor   = 'end';
                    position = 'right';
                } else {
                    infoContainer = detailedInfo.append( 'g' )
                                                .attr( 'width', infoWidth )
                                                .attr(
                                                  'transform',
                                                  'translate(' + 0 + ',' + ( bBox.height + bBox.y + 50 ) + ')'
                                                );
                    anchor   = 'start';
                    position = 'left';
                }

                infoContainer.data( [ data.value * 100 ] )
                    .append( 'text' )
                    .text ( '0 %' )
                    .attr( 'class', 'pieChart--detail--percentage' )
                    .attr( 'x', ( position === 'left' ? 0 : infoWidth ) )
                    .attr( 'y', -10 )
                    .attr( 'text-anchor', anchor )
                    .transition()
                    .duration( self.PIE_DURATION )
                    .tween( 'text', function( d ) {
                        var i = d3.interpolateRound(
                            +this.textContent.replace( /\s%/ig, '' ),
                            d
                        );

                        return function( t ) {
                            this.textContent = i( t ) + ' %';
                        };
                    });
              
                infoContainer.append( 'line' )
                            .attr( 'class', 'pieChart--detail--divider' )
                            .attr( 'x1', 0 )
                            .attr( 'x2', 0 )
                            .attr( 'y1', 0 )
                            .attr( 'y2', 0 )
                            .transition()
                            .duration( self.PIE_DURATION )
                            .attr( 'x2', infoWidth );
              
                infoContainer.data( [ data.description ] ) 
                            .append( 'foreignObject' )
                            .attr( 'width', infoWidth ) 
                            .attr( 'height', 100 )
                            .append( 'xhtml:body' )
                            .attr(
                                'class',
                                'pieChart--detail--textContainer ' + 'pieChart--detail__' + position
                            )
                            .html( data.description );
            }
        },

        // build the stack bar
        drawBarChart: function( elementId, data ) {
            var self = this;
            d3.json(self.DATAURL_all_countries, function(error, data) {
                if (error) throw error;

                self.parseBarData(data);
                var containerEl = document.getElementById( elementId ),
                    width       = containerEl.clientWidth;
                    height      = width * 0.4;
                    margin      = {
                        top    : 10,
                        right  : 10,
                        left   : 40,
                        bottom : 100 
                    },
                    detailWidth  = 98,
                    detailHeight = 55,
                    detailMargin = 10;
                    x   = d3.scale.ordinal()
                            .rangeRoundBands([0, width - detailWidth], .1),

                    y   = d3.scale.linear()
                            .rangeRound([height, 0]),

                    xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom"),                    

                    yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickFormat(d3.format("%")),

                    yAxisTicks = d3.svg.axis().scale( y )
                        .tickSize( width - detailWidth )
                        .tickFormat( '' )
                        .orient( 'right' ),

                    container = d3.select( containerEl ),

                    svg = container.select( 'svg' )
                        .attr("width", width)
                        .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                x.domain( self.data.barChart.map(function(d) {return d.country}) )

                var max = d3.max(self.data.barChart, function(d) {
                    return d3.max([d.data.TAX]);
                })

                y.domain([0, max]);

                svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
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
                   .attr("y", 0)
                   .attr("dy", ".71em")                  
                   .style("text-anchor", "end")
                   .text("Tax Rate");                  

                var bar = svg.selectAll(".bar")
                    .data(self.data.barChart) 
                    .enter().append("g")
                        .attr("class", "g")
                        .attr("transform", function(d) { return "translate(" + x(d.country) + ",0)"; })
                    
                bar.append("rect")                  
                    .attr("y", function(d) { return y(d.data.TAX); })
                    .on("click", function(d) {
                        d3.selectAll('rect')
                            .attr("fill", "#ccc")
                        d3.select(this)
                            .attr("fill", "#804115")
                        self.COUNTRY = {
                            'code': d.country_code,
                            'description': d.country
                        }
                        self.change();
                    })
                    .attr("width", x.rangeBand())
                    .transition()
                    .delay(function (d, i) { return i*100; })
                    .attr("height", function(d) { return height - y(d.data.TAX); })
                    .attr("fill", function(d, i){
                        return (d.country_code === 'BE') ? "#804115" : "#ccc";
                    });                   
            })
        },
        
        // build the multi-line chart
        drawLineChart: function( elementId, data ) {
            var self = this;
            // draw one line per code
            var dataGroup = d3.nest()
                .key(function(d) {
                        return d.code;
                    })
                .entries(data);
            
            var parseDate = d3.time.format("%Y").parse;
             
            var containerEl = document.getElementById( elementId ),
                width       = containerEl.clientWidth,
                height      = width * 0.4,
                margin      = {
                  top    : 30,
                  right  : 10,
                  left   : 10 
                },
                
                detailWidth  = 98,
                detailHeight = 55,
                detailMargin = 10,

                container   = d3.select( containerEl ),
                svg         = container.select( 'svg' )
                                    .attr( 'width', width )
                                    .attr( 'height', height + margin.top ),

                x          = d3.time.scale().range( [ 0, width - detailWidth ] ),

                xAxis      = d3.svg.axis().scale( x )
                                          .ticks ( 8 )
                                          .tickSize( -height ),                
                xAxisTicks = d3.svg.axis().scale( x )
                                          .ticks( 16 )
                                          .tickSize( -height )
                                          .tickFormat( '' ),
                y          = d3.scale.linear().range( [ height, 0 ] ),
                // ** y axxis added after feedback
                yAxis      = d3.svg.axis().scale( y )
                                          .orient( 'left' )
                                          .ticks ( 8 ),
                                          //.tickSize( -height ),

                yAxisTicks = d3.svg.axis().scale( y )
                                          .ticks( 12 )
                                          .tickSize( width )
                                          .tickFormat( '' )
                                          .orient( 'right' ),
                area = d3.svg.area()
                          .interpolate( 'linear' )
                          .x( function( d )  { return x( d.year ) + detailWidth / 2; } )
                          .y0( height )
                          .y1( function( d ) { return y( d.value ); } ),

                line = d3.svg.line()
                          .interpolate( 'linear' )
                          .x( function( d ) { return x( d.year ) + detailWidth / 2; } )
                          .y( function( d ) { return y( d.value ); } ),

                startData = dataGroup.map( function( d ) {
                    return {
                        year : d.year,
                        value : d.value
                    }
                }),

                circleContainer;

            // remove data not being used
            svg.selectAll('circle').remove();
            svg.selectAll('path').remove();            
            svg.selectAll('g').remove();

            // Compute the minimum and maximum date, and the maximum value.
            x.domain( [ data[ 0 ].year, data[ data.length - 1 ].year ] );
            y.domain( [ 0, d3.max( data, function( d ) { return d.value + 15000; } ) ] );

            svg.append( 'g' )
                .attr( 'class', 'lineChart--xAxisTicks' )
                .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + height + ')' )
                .call( xAxisTicks );

            svg.append( 'g' )
                .attr( 'class', 'lineChart--xAxis' )
                .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + ( height + 7 ) + ')' )
                .call( xAxis );

            // ** y-axis added after feedback
            svg.append( 'g' )
                .attr( 'class', 'lineChart--xAxis' )
                .attr( 'transform', 'translate(' + 55 + ',' + 0 + ')' )
                .call( yAxis );

            svg.append( 'g' )
                .attr( 'class', 'lineChart--yAxisTicks' )
                .call( yAxisTicks );                        

            // Add the line path
            dataGroup.forEach(function(d, i) {
                svg.append('path')
                    .data( startData )
                    .attr( 'class', 'lineChart--areaLine--'+d.key )
                    .attr( 'd', line )
                    .transition()
                    .duration( self.LINE_DURATION )
                    .delay( self.LINE_DURATION / 2 )
                    .attrTween( 'd', tween( d.values, line ) )               
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .each( 'end', function() {
                        drawCircles( data );
                    })
            });

            // Add the area path.
            dataGroup.forEach(function(d, i) {
                svg.append( 'path' )
                    .data( startData )
                    .attr( 'class', 'lineChart--area--'+d.key )
                    .attr( 'd', area )
                    .transition()
                    .duration( this.LINE_DURATION )
                    .attrTween( 'd', tween( d.values, area ) );
            });

            // Helper functions!!!
            function drawCircle( datum, index ) {

                circleContainer.datum( datum )
                    .append( 'circle' )
                    .attr( 'class', 'lineChart--circle--'+datum.code )
                    .attr( 'r', 0 )
                    .attr(
                        'cx',
                        function( d ) {
                            return x( d.year ) + detailWidth / 2;
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
                                'lineChart--circle--'+datum.code+' lineChart--circle--'+datum.code+'__highlighted' 
                            )
                        .attr( 'r', 7 );
                        d.active = true;
                        showCircleDetail( d );
                    } )
                    .on( 'mouseout', function( d ) {
                        d3.select( this )
                            .attr(
                                'class',
                                'lineChart--circle--'+datum.code
                            )
                        .attr( 'r', 6 );
                      
                    if ( d.active ) {
                        hideCircleDetails(); 
                        d.active = false;
                      }
                    } )
                    .on( 'click touch', function( d ) {
                        if ( d.active ) {
                            showCircleDetail( d )
                        } else {
                            hideCircleDetails();
                        }
                    } )
                    .transition()
                    .delay( self.LINE_DURATION / 10 * index )
                    .attr( 'r', 6 ) 
            }

            function drawCircles( data ) {
                circleContainer = svg.append( 'g' );
                data.forEach( function( datum, index ) {
                    drawCircle( datum, index );
                } );
            }
        
            function hideCircleDetails() {
                circleContainer.selectAll( '.lineChart--bubble' )
                    .remove();
            }
        
            function showCircleDetail( data ) {
                self.drawPieChart('pieChart', data.year)
                var details = circleContainer.append( 'g' )
                    .attr( 'class', 'lineChart--bubble' )
                    .attr(
                        'transform',
                        function() {
                            var result = 'translate(';
                            result += x( data.year );
                            result += ', ';
                            result += y( data.value ) - detailHeight - detailMargin;
                            result += ')';

                            return result;
                    }
                );
          
                details.append( 'path' )
                      .attr( 'd', 'M2.99990186,0 C1.34310181,0 0,1.34216977 0,2.99898218 L0,47.6680579 C0,49.32435 1.34136094,50.6670401 3.00074875,50.6670401 L44.4095996,50.6670401 C48.9775098,54.3898926 44.4672607,50.6057129 49,54.46875 C53.4190918,50.6962891 49.0050244,54.4362793 53.501875,50.6670401 L94.9943116,50.6670401 C96.6543075,50.6670401 98,49.3248703 98,47.6680579 L98,2.99898218 C98,1.34269006 96.651936,0 95.0000981,0 L2.99990186,0 Z M2.99990186,0' )
                      .attr( 'width', detailWidth )
                      .attr( 'height', detailHeight );
              
                var text = details.append( 'text' )
                        .attr( 'class', 'lineChart--bubble--text' );
              
                text.append( 'tspan' )
                  .attr( 'class', 'lineChart--bubble--label--' + data.code )
                  .attr( 'x', detailWidth / 2 )
                  .attr( 'y', detailHeight / 3 )
                  .attr( 'text-anchor', 'middle' )
                  .text( data.label );
              
                text.append( 'tspan' )
                  .attr( 'class', 'lineChart--bubble--value' )
                  .attr( 'x', detailWidth / 2 )
                  .attr( 'y', detailHeight / 4 * 3 )
                  .attr( 'text-anchor', 'middle' )
                  .text( data.value + ' EUR' );
            }

            function tween( b, callback ) {
                return function( a ) {
                    var i = d3.interpolateArray( a, b );

                    return function( t ) {
                        return callback( i ( t ) );
                    };
                };
            }
        },

        // parse the data from the API for the line / pie charts
        parsePieLineData: function(json) {
            var self = this;
            // reset the data
            this.data = {
                lineChart: [],
                pieChart: []
            }
            json.map(function(d) {  
                var estruct = d.estruct;
                for (var idx in d.measure) {
                    // we are only interested about Tax and Net
                    if (['NET', 'TAX'].indexOf(estruct.code) >= 0) {
                        self.data.lineChart.push({
                            'code'      : estruct.code,
                            'label'     : estruct.description,
                            'year'      : new Date(d.measure[idx].year, 0),
                            'value'     : d.measure[idx].data
                        });

                        self.data.pieChart.push({
                            'color'           : ((estruct.code == 'NET') ? 'blue' : 'red'),
                            'description'     : ((estruct.code == 'TAX') ?
                                'TAXES (avg.) - A compulsory contribution to state revenue, levied by the government on workers\' income.'
                                :
                                'NET INCOME (avg.) - Gross income minus taxes, allowances, and deductions.  This is what is take home pay.'),
                            'title'           : estruct.description,
                            'value'           : d.measure[idx].data,
                            'year'            : d.measure[idx].year
                        })
                    }                
                }
            })
            return self.data;
        },    

        parseBarData: function(json) {
            var self = this;
            // reset the container
            this.data.barChart = []
            json.map(function(d) {  
                var estruct = d.estruct;
                for (var idx in d) {
                    if (['NET', 'TAX'].indexOf(estruct.code) >= 0) {
                        // only append non existing country
                        position = self.data.barChart.map(function(e) { return e.country_code; }).indexOf(d.country.code);
                        if (!~position) {
                            var description = d.country.description;
                            // Germany is using a long description, re-phrase it..
                            if (d.country.code === 'DE') {
                                description = 'Germany';
                            }
                            self.data.barChart.push({
                                'country'       : description,
                                'country_code'  : d.country.code,
                                'data'          : {
                                    'TAX'       : 0,
                                }
                            });   
                            position = self.data.barChart.length - 1;                       
                        }
                        if (estruct.code === 'NET') {
                            self.data.barChart[position].data['NET'] =+ d.measure[0].data
                        } else {
                            self.data.barChart[position].data['TAX'] =+ d.measure[0].data
                        } 
                    }
                }                
            })            
            for (var idx in self.data.barChart) {
                // apply the mean on the NET / TAX features
                self.data.barChart[position].data['NET'] = self.data.barChart[position].data['NET'] / (2014 - 2000)
                self.data.barChart[position].data['TAX'] = self.data.barChart[position].data['TAX'] / (2014 - 2000)
                // next, convert to pct
                var net = self.data.barChart[idx].data['NET'];
                var tax = self.data.barChart[idx].data['TAX'];
                var total = net + tax;
                self.data.barChart[idx].data['NET'] = net / total
                self.data.barChart[idx].data['TAX'] = tax / total
            }
        },    

        // render the charts on the page
        render: function(jsondata, country) {
            var self = this;            

            document.getElementById("pie-title").innerHTML = country + " Average Earnings (Single person without children)";
            document.getElementById("line-title").innerHTML = country + " Annual Average Earnings";

            // parse the json data coming from the middleware
            this.parsePieLineData(jsondata);
            
            // draw the line chart
            this.drawLineChart('lineChart', this.data.lineChart);

            // draw the pie chart
            date = new Date(2014, 0);
            this.drawPieChart('pieChart', date);                            
        },

        // handle data change and callback to the middleware
        change: function() {
            var self = this;
            d3.json(self.DATAURL_per_country + self.COUNTRY.code)
                .on("load", function(data) {self.render(data, self.COUNTRY.description);})
                .on("error", function(error) { console.log("failure!", error); })
                .get();
        }
    }

    // this is where the magic is initiated !
    Ploter.init();

})();


