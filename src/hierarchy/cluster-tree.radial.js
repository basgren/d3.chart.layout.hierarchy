
d3.chart("cluster-tree").extend("cluster-tree.radial", {

  initialize : function() {

    var chart = this;

    // Custom options
    chart.options.diameter = Math.min(chart.options.width, chart.options.height);

    chart.d3.diagonal = d3.svg.diagonal.radial().projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
    chart.d3.zoom.translate([chart.options.diameter / 2, chart.options.diameter / 2]);

    chart.layers.base
      .attr("transform", "translate(" + chart.options.diameter / 2 + "," + chart.options.diameter / 2 + ")");


    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "rotate(" + (chart.source.x0 - 90) + ")translate(" + chart.source.y0 + ")"; });

      this.select("text")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform",   function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart.options.duration)
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "rotate(" + (chart.source.x - 90) + ")translate(" + chart.source.y + ")"; });
    });
  },


  transform: function(root) {
    var chart = this,
        nodes;

    chart.source = root;

    if( ! chart._internalUpdate ) {
      chart.root    = root;
      chart.root.x0 = 360;
      chart.root.y0 = 0;

      nodes = chart.d3.layout
        .size([360, chart.options.diameter / 4])
        .separation(function(a, b) {
            if( a.depth === 0 ) {
               return 1;
            } else {
              return (a.parent == b.parent ? 1 : 2) / a.depth;
            }
        })
        .nodes(chart.root)
        .reverse();

      chart.trigger("collapse:init");
    }

    return chart.d3.layout.nodes(chart.root).reverse();
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this.options.diameter;
    }

    this.options.diameter = _;
    
    this.trigger("change:diameter");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },
});


