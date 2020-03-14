const d3 = require("d3");
var svg = d3.select("svg");

var margin = 20;
var diameter = svg.attr("width");
var g = svg
  .append("g")
  .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var pack = d3
  .pack()
  .size([diameter - margin, diameter - margin])
  .padding(2);

const button = document.getElementById("fetch_repository_data");
button.addEventListener("click", function(e) {
  const repository_path = document.getElementById("repository_path").value;
  const after_date = document.getElementById("after_date").value;
  buildDashboard(repository_path, after_date);
});

function buildDashboard(repository_path, after_date) {
  d3.json(
    `http://localhost:3000/fetch_repository_data?repository_path=${repository_path}&after_date=${after_date}`
  )
    .catch(err => console.log(err))
    .then(root => {
      console.log(root);

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

      console.log(nonLeafColorDomain);

      var nonLeafColor = d3
        .scaleLinear()
        .domain(nonLeafColorDomain)
        .range(["white", "blue"])
        .interpolate(d3.interpolateHcl);

      var color = d3
        .scaleLinear()
        .domain(leafColorDomain)
        .range(["blue", "black"])
        .interpolate(d3.interpolateHcl);

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
          if (focus !== d) {
            zoom(d);
            console.log(d);
            d3.event.stopPropagation();
          }
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
        .style("background", nonLeafColor(nonLeafColorDomain[0]))
        .on("click", function() {
          zoom(root);
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
}
