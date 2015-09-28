
d3.chart("hierarchy").extend("pack.nested", {

  initialize : function() {
    var chart = this;
    
    chart.d3.layout = d3.layout.pack();

    chart.diameter(chart.options.diameter || Math.min(chart.options.width, chart.options.height));

    chart.d3.zoom.translate([(chart.options.width - chart.options.diameter) / 2, (chart.options.height - chart.options.diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart.options.width - chart.options.diameter) / 2 + "," + (chart.options.height - chart.options.diameter) / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll(".pack").data(nodes);
      },

      insert: function() {
        return this.append("g").classed("pack", true);
      },

      events: {
        "enter": function() {
          
          chart._initNode(this);

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("circle")
            .attr("r", function(d) { return d.r; });

          this.append("text");

          this.on("click", function(event) {
            chart.trigger("pack:click", event);
          });
        },

        "merge": function() {

          chart._initNode(this);

          this.select("text")
            .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
            .text(function(d) { return d[chart.options.name]; });
        },
      }
    });


    chart.on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart.options.width - chart.options.diameter) / 2 + "," + (chart.options.height - chart.options.diameter) / 2 + ")");
    });
  },


  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout
      .size([chart.options.diameter, chart.options.diameter])
      .nodes(root);
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this.options.diameter;
    }

    this.options.diameter = _ - 10;

    this.trigger("change:diameter");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  }, 


  collapsible: function() {
    var chart = this;

    var pack,
        x = d3.scale.linear().range([0, chart.options.diameter]),
        y = d3.scale.linear().range([0, chart.options.diameter]);


    chart.layers.base.on("merge", function() {
      pack = chart.root;
      chart.on("pack:click", function(d) { collapse(pack == d ? chart.root : d); });
    });


    function collapse(d) {
      var k = chart.options.diameter / d.r / 2;

      x.domain([d.x - d.r, d.x + d.r]);
      y.domain([d.y - d.r, d.y + d.r]);

      var t = chart.layers.base.transition()
        .duration(chart.options.duration);

      t.selectAll(".pack")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      t.selectAll("circle")
        .attr("r", function(d) { return k * d.r; });

      t.selectAll("text")
        .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

      pack = d;
    }

    return chart;
  },
});


