import { h } from "hyperapp";
const d3 = require("d3");
import { queueAddContextItem } from "./actions";

export const buildDashboardWithD3 = function(state) {
  // Refresh SVG
  document.getElementById("heatmap").innerHTML = "";

  var svg = d3.select("#heatmap");
  var margin = 20;
  var diameter = svg.attr("width");
  var g = svg
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
  var pack = d3
    .pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);
  const infoDiv = document.getElementById("info_div");

  let url = "http://localhost:3000/fetch_repository_data";
  const repository_path = state.heatmap.repository_path;
  const after_date = state.heatmap.after_date;

  d3.json(`${url}?repository_path=${repository_path}&after_date=${after_date}`)
    .catch(err => console.log(err))
    .then(root => {
      root = d3
        .hierarchy(root)
        .sum(function(d) {
          return d.loc;
        })
        .sort(function(a, b) {
          return b.value - a.value;
        });

      var focus = root,
        nodes = pack(root).descendants(),
        view;

      var leafColorDomain = d3.extent(nodes, function(d) {
        return +d.data["n-revisions"];
      });

      var nonLeafColorDomain = d3.extent(nodes, function(d) {
        return +d.depth;
      });

      var nonLeafColor = d3
        .scaleLinear()
        .domain(nonLeafColorDomain)
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

      var color = d3
        .scalePow()
        .exponent(2)
        .domain(leafColorDomain)
        .range(["white", "blue"]);

      var circle = g
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", function(d) {
          return d.parent
            ? d.children
              ? "node"
              : "node node--leaf"
            : "node node--root";
        })
        .style("fill", function(d) {
          return d.data["n-revisions"]
            ? color(d.data["n-revisions"])
            : nonLeafColor(d.depth);
        })
        .on("click", function(d) {
          if (d3.event.shiftKey) {
            queueAddContextItem({
              title: d.data.name,
              text: d.data["n-revisions"]
            });
            d3.event.stopPropagation();
          } else if (focus !== d) {
            zoom(d);
            console.log(d);
            d3.event.stopPropagation();
          }
        })
        .on("mouseover", function(d) {
          infoDiv.textContent = d.data.name;
        });

      var text = g
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) {
          return d.parent === root ? 1 : 0;
        })
        .style("display", function(d) {
          return d.parent === root ? "inline" : "none";
        })
        .text(function(d) {
          return d.data.name;
        });

      var node = g.selectAll("circle,text");

      svg
        .style("background", nonLeafColor(nonLeafColorDomain[0] - 1))
        .on("click", function() {
          if (d3.event.shiftKey) {
          } else {
            zoom(root);
          }
        });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        focus = d;

        var transition = d3
          .transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2 + margin
            ]);
            return function(t) {
              zoomTo(i(t));
            };
          });

        transition
          .selectAll("text")
          .filter(function(d) {
            return d.parent === focus || this.style.display === "inline";
          })
          .style("fill-opacity", function(d) {
            return d.parent === focus ? 1 : 0;
          })
          .on("start", function(d) {
            if (d.parent === focus) this.style.display = "inline";
          })
          .on("end", function(d) {
            if (d.parent !== focus) this.style.display = "none";
          });
      }

      function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function(d) {
          return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function(d) {
          return d.r * k;
        });
      }
    });
  return state;
};
