	
var width = document.getElementById("body").clientWidth;
    height = 500;
	
var linkedByIndex = {};

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-4000)
    .linkDistance(300)
    .size([width, height]);

var svg = d3.select("#graphcontainer").append("svg")
		.attr("width", width)
		.attr("height", height)
            .call(d3.behavior.zoom().on("zoom", redraw))
        .append('g');
		
		var zoom = d3.behavior.zoom().scaleExtent([0.3, 0.3]).on("zoom", redraw);
		zoom.translate([450,100]).scale(0.3);
		zoom.event(svg.transition().duration(50));//initial zoom
		
		function redraw() {
      svg.attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");
    }   
	
	var drag = force.stop().drag()
	.on("dragstart", function(d) {
		d3.event.sourceEvent.stopPropagation(); // to prevent pan functionality from overriding node drag functionality. Put any other 'dragstart' actions here
});

d3.json("http://home.iiitd.edu.in/~romil11092/GraphWithModularity.json", function(error, graph) {
  force
      .nodes(graph.nodes)
      .links(graph.links)
	  .linkDistance(function(d) { return 3000/d.weight; }) 
	  .linkStrength(function(d) { return  d.weight/38; }) 
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return d.weight*0.5; });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) {return 3.14*(Math.log(d.weight)+1)})
      .style("fill", function(d) { return d.rgb; })
	  .on("mouseover", mouseover)
	  .on("mouseout", mouseout)
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.id; });
	  
	  
  var texts = svg.selectAll("text.label")
			.data(graph.nodes)
			.enter().append("text")
			.attr("class", "label")
			.attr("fill", "black")
			.text(function(d) {  return d.id;  });


  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
	
	texts.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
  });
  
	
	graph.links.forEach(function(d) {
          linkedByIndex[d.source.index + "," + d.target.index] = 1;
          linkedByIndex[d.target.index + "," + d.source.index] = 1;
        });
	
	
	    function neighboring(a, b) {
      return a.index == b.index || linkedByIndex[a.index + "," + b.index];
    }
    
    function mouseover(d) {
		  d3.selectAll(".link").style("opacity", function(o) {
			return o.source === d || o.target === d ? 1 : 0.1;
		  });
		  

		  d3.selectAll(".label").style("opacity", function(o) {
			return neighboring(d, o) ? 1 : 0.2;
		  });
		  
		  d3.selectAll(".node").style("opacity", function(o) {
			   return neighboring(d, o) ? 1 : 0.2;
			});
	}

	function mouseout() {
	  d3.selectAll(".link").transition().duration(500)
			.style("opacity", 1);
	  d3.selectAll(".node").transition().duration(500)
			.style("opacity", 1);
	  d3.selectAll(".label").transition().duration(500)
			.style("opacity", 1);
	}
		
		
		
	//Search Code
	var optArray = [];
	for (var i = 0; i < graph.nodes.length - 1; i++) {
		optArray.push(graph.nodes[i].id);
	}
	optArray = optArray.sort();
	$(function () {
		$("#search").autocomplete({
			source: optArray
		});
	});
});


	function searchNode() {
		var selectedVal = document.getElementById('search').value;
		var node = svg.selectAll(".node");
		if (selectedVal == "none") {
			node.style("stroke", "white").style("stroke-width", "1");
		} else {
			var otherNodes= node.filter(function (d, i) {
				return d.id != selectedVal;
			});
			var selectedNode= node.filter(function (d, i) {
				return d.id == selectedVal;
			});
			otherNodes.style("opacity", "0");
			selectedNode.attr("fill", "red");
			var link = svg.selectAll(".link")
			link.style("opacity", "0");
			svg.selectAll(".label").style("opacity", "0");
			d3.selectAll(".node, .link, .label").transition()
				.duration(4000)
				.style("opacity", 1);
		}
	}