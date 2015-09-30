(function (d3) {
  'use strict';

  d3.chart("hierarchy", {

    initialize: function() {
      var chart = this;


      chart.options  = {};
      chart.d3       = {};
      chart.layers   = {};


      chart.base.attr("width",  chart.base.node().parentNode.clientWidth);
      chart.base.attr("height", chart.base.node().parentNode.clientHeight);

      chart.options.width  = chart.base.attr("width");
      chart.options.height = chart.base.attr("height");

      chart.d3.colorScale = chart.options.colors ? d3.scale.ordinal().range(chart.options.colors) : d3.scale.category20c();

      chart.d3.zoom = d3.behavior.zoom();
      chart.layers.base = chart.base.append("g");

      chart.name(chart.options.name         || "name");
      chart.value(chart.options.value       || "value");
      chart.duration(chart.options.duration || 750);



      chart.on("change:value", function() {
        chart.d3.layout.value(function(d) { return chart.options.value === "_COUNT" ? 1 : d[chart.options.value]; });
      });


      chart.on("change:colors", function() {
        chart.d3.colorScale = d3.scale.ordinal().range(chart.options.colors);
      });


      // http://bl.ocks.org/robschmuecker/7926762
      chart._walker = function(parent, walkerFunction, childrenFunction) {
        if( ! parent ) {
          return;
        }

        walkerFunction(parent);

        var children = childrenFunction(parent);
        if( children ) {
          for( var count = children.length, i = 0; i < count; i++ ) {
            chart._walker( children[i], walkerFunction, childrenFunction );
          }
        }
      };


      /**
       * Initializes node attributes.
       *
       * @param node SVG element that represents node.
       * @private
       */
      chart._initNode = function(node) {
        node
          .classed("leaf",     function(d) { return d.isLeaf; })
          .classed("non-leaf", function(d) { return ! d.isLeaf; });
      };


    },



    transform: function(nodes) {
      // Before we proceed, mark leaf nodes on tree
      this._walker(

        this.root,

        function(d) { d.isLeaf = ! d.children && ! d._children; },

        function(d) {
          if( d.children && d.children.length > 0 ) {
            return d.children;
          } else if( d._children && d._children.length > 0 ) {
            return d._children;
          } else {
            return null;
          }
        }
      );

      return nodes;
    },


    name: function(_) {
      if( ! arguments.length ) {
        return this.options.name;
      }

      this.options.name = _;

      this.trigger("change:name");
      if( this.root ) {
        this.draw(this.root);
      }

      return this;
    },


    value: function(_) {
      if( ! arguments.length ) {
        return this.options.value;
      }

      this.options.value = _;

      this.trigger("change:value");
      if( this.root ) {
        this.draw(this.root);
      }

      return this;
    },


    colors: function(_) {
      if( ! arguments.length ) {
        return this.options.colors;
      }

      this.options.colors = _;

      this.trigger("change:colors");
      if( this.root ) {
        this.draw(this.root);
      }

      return this;
    },


    duration: function(_) {
      if( ! arguments.length ) {
        return this.options.duration;
      }

      this.options.duration = _;

      this.trigger("change:duration");
      if( this.root ) {
        this.draw(this.root);
      }

      return this;
    },


    sortable: function(_) {
      var chart = this;

      if( _ === "_ASC" ) {
        chart.d3.layout.sort(function(a, b) { return d3.ascending(a[chart.options.name], b[chart.options.name] ); });
      } else if( _ === "_DESC" ) {
        chart.d3.layout.sort(function(a, b) { return d3.descending(a[chart.options.name], b[chart.options.name] ); });
      } else {
        chart.d3.layout.sort(_);
      }

      return chart;
    },


    zoomable: function(_) {
      var chart = this;

      var extent = _ || [0, Infinity];

      function zoom() {
        chart.layers.base
          .attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
      }

      chart.base.call(chart.d3.zoom.scaleExtent(extent).on("zoom", zoom));

      return chart;
    },

  });

})(d3);
