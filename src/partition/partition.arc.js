
d3.chart("hierarchy").extend("partition.arc", {
 
  initialize : function() {

    var chart = this;

    chart.d3.layout = d3.layout.partition();

    chart.diameter(chart.options.diameter || Math.min(chart.options.width, chart.options.height));

    chart.d3.x   = d3.scale.linear().range([0, 2 * Math.PI]);
    chart.d3.y   = d3.scale.sqrt().range([0, chart.options.diameter / 2]);
    chart.d3.arc = d3.svg.arc()
      .startAngle(function(d)  { return Math.max(0, Math.min(2 * Math.PI, chart.d3.x(d.x))); })
      .endAngle(function(d)    { return Math.max(0, Math.min(2 * Math.PI, chart.d3.x(d.x + d.dx))); })
      .innerRadius(function(d) { return Math.max(0, chart.d3.y(d.y)); })
      .outerRadius(function(d) { return Math.max(0, chart.d3.y(d.y + d.dy)); });

    chart.d3.zoom.translate([chart.options.width / 2, chart.options.height / 2]);

    chart.layers.base
      .attr("transform", "translate(" + chart.options.width / 2 + "," + chart.options.height / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(nodes) {
        return this.selectAll("path").data(nodes);
      },

      insert: function() {
        return this.append("path");
      },

      events: {
        "enter": function() {
          this.attr("d", chart.d3.arc)
            .style("fill", function(d) { return chart.d3.colorScale((d.children ? d : d.parent)[chart.options.name]); });

          this.on("click", function(event) {
            chart.trigger("path:click", event);
          });
        }
      }
    });


    chart.on("change:radius", function() {
      chart.layers.paths
        .attr("transform", "translate(" + chart.options.width / 2 + "," + chart.options.height / 2 + ")");

      chart.d3.y = d3.scale.sqrt().range([0, chart.options.diameter / 2]);
    });

  },



  transform: function(root) {
    var chart = this;

    chart.root = root;

    return chart.d3.layout.nodes(root);
  },


  diameter: function(_) {
    if( ! arguments.length ) {
      return this.options.diameter;
    }

    this.options.diameter = _ - 10;

    this.trigger("change:radius");
    if( this.root ) {
      this.draw(this.root);
    }

    return this;
  },


  collapsible: function() {
    var chart = this;

    chart.layers.base.on("merge", function() {
      var path = this;
      chart.on("path:click", function(d) {
          path.transition()
            .duration(chart.options.duration)
            .attrTween("d", arcTween(d));
        });
    });

    function arcTween(d) {
      var xd = d3.interpolate(chart.d3.x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(chart.d3.y.domain(), [d.y, 1]),
          yr = d3.interpolate(chart.d3.y.range(),  [d.y ? 20 : 0, chart.options.diameter / 2]);

      return function(d, i) {
        return i ? function(t) { return chart.d3.arc(d); }
                 : function(t) { chart.d3.x.domain(xd(t)); chart.d3.y.domain(yd(t)).range(yr(t)); return chart.d3.arc(d); };
      };
    }

    return chart;
  },
});

