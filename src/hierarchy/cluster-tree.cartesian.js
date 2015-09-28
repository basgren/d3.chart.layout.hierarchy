
d3.chart("cluster-tree").extend("cluster-tree.cartesian", {

  initialize : function() {

    var chart = this;

    chart.margin(chart.options.margin || {});

    chart.d3.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y0 + "," + chart.source.x0 + ")"; });

      this.select("text")
        .attr("x", function(d) { return d.isLeaf ? 10 : -10; })
        .attr("text-anchor", function(d) { return d.isLeaf ? "start" : "end"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart.options.duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y + "," + chart.source.x + ")"; });
    });


    chart.on("change:margin", function() {
      chart.options.width  = chart.base.attr("width")  - chart.options.margin.left - chart.options.margin.right;
      chart.options.height = chart.base.attr("height") - chart.options.margin.top  - chart.options.margin.bottom;
      chart.base.attr("transform", "translate(" + chart.options.margin.left + "," + chart.options.margin.top + ")");
    });
  },



  transform: function(root) {
    var chart = this,
        nodes;

    chart.source = root;

    if( ! chart._internalUpdate ) {
      chart.root    = root;
      chart.root.x0 = chart.options.height / 2;
      chart.root.y0 = 0;

      nodes = chart.d3.layout
        .size([chart.options.height, chart.options.width])
        .nodes(chart.root)
        .reverse();

      chart.trigger("collapse:init");
    }

    return chart.d3.layout.nodes(chart.root).reverse();
  },


  margin: function(_) {
    if( ! arguments.length ) {
      return this.options.margin;
    }

    ["top", "right", "bottom", "left"].forEach(function(dimension) {
      if( dimension in _ ) {
        this[dimension] = _[dimension];
      }
    }, this.options.margin = { top: 0, right: 0, bottom: 0, left: 0 });

    this.trigger("change:margin");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },
});


