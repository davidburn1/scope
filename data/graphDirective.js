var graphPlotter = angular.module('graphPlotter', []);

graphPlotter.directive('linePlot', [function () {
	var gr;
    function linkFunc(scope, element, attrs) {

		gr = new graph(element[0], scope.settings);
		gr.render();
		//window.onresize = gr.render;

        scope.$watch('model', function (newVal) {
			gr.redraw(newVal);
        }, true);
		
		scope.$watch('settings', function (newVal) {
			element.html("");
			gr = new graph(element[0], scope.settings);
			gr.render();
        }, true);
    }

    return {
		scope: {'model': '=', 'settings': '='},
        link: linkFunc
    };
}]);








var graph = (function () {
	var id;
	var settings;
	var myLine;
	var x;
	var y;

	function graph( id, settings) {
		this.id = id;
		this.settings = settings;
	}
	
	return graph;
}());




graph.prototype.render = function() {
	var width = d3.select(this.id).node().offsetWidth;
	var height = d3.select(this.id).node().offsetHeight;

	// Set the dimensions of the canvas / graph
	var margin = {top: 10, right: 10, bottom: 30, left: 50};
	width = width - margin.left - margin.right;
	height = height - margin.top - margin.bottom;
		
	var svg = d3.select(this.id)
	.append("svg")
	.attr("class", "scatter")
	.attr("width", width +  margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	// Set the ranges
	this.x = d3.scaleLinear().range([0, width]);
	this.y = d3.scaleLinear().range([height, 0]);

	// Scale the range of the data
	this.x.domain([0,this.settings.memoryDepth*this.settings.timePerBit]);
	//this.x.domain([0,10]); // 10 divisions
	this.y.domain([0, 3.5]);



	// Define the axes
	var axisLeft = d3.axisLeft(this.y).ticks(5);
	svg.append("g")
		.attr("class", "axis axis--yl")
		.call(axisLeft);

	var axisRight = d3.axisLeft(this.y).tickFormat("");
	svg.append("g")
		.attr("class", "axis axis--yr")
		.attr("transform", "translate(" + width + ",0)")
		.call(axisRight);

	var axisBottom = d3.axisBottom(this.x).tickFormat(d3.format(".2s"));
	svg.append("g")
		.attr("class", "axis axis--xb")
		.attr("transform", "translate(0," + height + ")")
		.call(axisBottom);
		
	var axisTop = d3.axisBottom(this.x).tickFormat("");
	svg.append("g")
		.attr("class", "axis axis--xt")
		.call(axisTop);



	// gridlines 
	//var x_gridlines= d3.axisBottom(this.x).ticks(10).tickSize(-height).tickFormat("");
	//var y_gridlines= d3.axisLeft(this.y).ticks(10).tickSize(-width).tickFormat("");

	//svg.append("g")			
	//	.attr("class", "grid")
	//	.attr("transform", "translate(0," + height + ")")
	//	.call(x_gridlines)

	//svg.append("g")			
	//	.attr("class", "grid")
	//	.call(y_gridlines)





	// Add the valueline path.
	this.myLine = svg.append("path")
			.attr("class", "line");
			
			


}


graph.prototype.redraw = function(data) {
	//console.log(data);
	// Define the line
	settings = this.settings;
	x = this.x;
	y = this.y;
	
	var valueline = d3.line()
		.x(function(d,i) { return x(i*settings.timePerBit); })
		.y(function(d) { return y(d*settings.voltsPerBit); });
		
		
	this.myLine.attr("d", valueline(data));
}

