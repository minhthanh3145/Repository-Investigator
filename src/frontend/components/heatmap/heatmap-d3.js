import { h } from "hyperapp";
const d3 = require("d3");
import { queueAddContextItem } from "./actions";

export const highlightElementByFullPath = function (fullPath) {
  const matched = d3.selectAll(".node").filter(function (d) {
    const item = buildContextActionItem(d);
    return item.fullPath == fullPath;
  });
  let timer = 0;
  const interval = setInterval(function () {
    if (timer >= 5) {
      clearInterval(interval);
    }

    blink(matched);
    timer++;
    console.log(timer);
  }, 1000);
};

export const zoomToElementByFullPath = function (fullPath) {
  const matched = d3.selectAll(".node").filter(function (d) {
    const item = buildContextActionItem(d);
    return item.fullPath == fullPath;
  });
  zoom(matched.datum());
};

function blink(nodeToBlink) {
  nodeToBlink
    .transition()
    .duration(500)
    .style("stroke", "#000")
    .style("stroke-width", "2px")
    .transition()
    .duration(500)
    .style("stroke", "#FFFF00")
    .style("stroke-width", "0px");
}

let root, focus, view, diameter, node, circle, nodes;
var margin = 20;
/**
 * Build the heat map by making request to back-end to retrieve
 * repository information in usable form which d3 understands
 * and using d3 to construct what essentially a packed layout
 * with zooming ability.
 *
 * Several events are defined:
 * - **Alt + Click** : Show top n context items that correspond to n-revisitd files within the selected region.
 *  Refer to heatmap-controller#getHeatMapView.
 * - **Shift + Click**: Show a context item of the selected item.
 * - **Click**: Zoom into the element.
 * @param state
 */
export const buildDashboardWithD3 = function (state) {
  // Refresh SVG
  document.getElementById("heatmap").innerHTML = "";

  var svg = d3.select("#heatmap");
  diameter = svg.attr("width");
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
  const extensions = state.heatmap.extensions;

  d3.json(
    `${url}?repository_path=${repository_path}&after_date=${after_date}&extensions=${extensions}`
  )
    .catch((err) => console.log(err))
    .then((data) => {
      root = d3
        .hierarchy(data)
        .sum(function (d) {
          return d.loc;
        })
        .sort(function (a, b) {
          return b.value - a.value;
        });

      (focus = root), (nodes = pack(root).descendants());

      var leafColorDomain = d3.extent(nodes, function (d) {
        return +d.data["n-revisions"];
      });

      var nonLeafColorDomain = d3.extent(nodes, function (d) {
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

      circle = g
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return d.parent
            ? d.children
              ? "node"
              : "node node--leaf"
            : "node node--root";
        })
        .style("fill", function (d) {
          return d.data["n-revisions"]
            ? color(d.data["n-revisions"])
            : nonLeafColor(d.depth);
        })
        .on("click", function (d) {
          if (d3.event.shiftKey) {
            const contextActionItem = buildContextActionItem(d);

            queueAddContextItem({
              title: contextActionItem.data.name,
              text: contextActionItem.data["n-revisions"],
              fullPath: contextActionItem.fullPath,
            });
            d3.event.stopPropagation();
          } else if (d3.event.altKey) {
            const unflattenedArray = d.children;
            const flattenedArray = unflattenedArray
              .flatMap((ele) => getAllChildren(ele))
              .filter((ele) => !ele.data.children);

            flattenedArray.sort(function (a, b) {
              if (!b.data["n-revisions"]) {
                console.log(b);
              }
              if (!a.data["n-revisions"]) {
                console.log(a);
              }
              return +b.data["n-revisions"] - +a.data["n-revisions"];
            });

            const val = document.getElementById("top-n-revisited").value;
            const top5 = flattenedArray.slice(0, Number(val));

            top5.forEach(function (top) {
              const contextActionItem = buildContextActionItem(top);
              queueAddContextItem({
                title: contextActionItem.data.name,
                text: contextActionItem.data["n-revisions"],
                fullPath: contextActionItem.fullPath,
              });
            });

            d3.event.stopPropagation();
          } else if (focus !== d) {
            zoom(d);
            console.log(d);
            d3.event.stopPropagation();
          }
        })
        .on("mouseover", function (d) {
          infoDiv.textContent = d.data.name;
        });

      function getAllChildren(ele) {
        return !ele.children || ele.children.length == 0
          ? ele
          : ele.children.flatMap((child) => getAllChildren(child));
      }

      var text = g
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("fill-opacity", function (d) {
          return d.parent === root ? 1 : 0;
        })
        .style("display", function (d) {
          return d.parent === root ? "inline" : "none";
        })
        .text(function (d) {
          return d.data.name;
        });

      node = g.selectAll("circle,text");

      svg
        .style("background", nonLeafColor(nonLeafColorDomain[0] - 1))
        .on("click", function () {
          if (d3.event.shiftKey) {
          } else {
            zoom(root);
          }
        });

      view = [root.x, root.y, root.r * 2 + margin];
      zoomTo(view);

      function zoom(d) {
        focus = d;

        var transition = d3
          .transition()
          .duration(750)
          .tween("zoom", function (d) {
            var i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2 + margin,
            ]);
            return function (t) {
              zoomTo(i(t));
            };
          });

        transition
          .selectAll("text")
          .filter(function (d) {
            return d.parent === focus || this.style.display === "inline";
          })
          .style("fill-opacity", function (d) {
            return d.parent === focus ? 1 : 0;
          })
          .on("start", function (d) {
            if (d.parent === focus) this.style.display = "inline";
          })
          .on("end", function (d) {
            if (d.parent !== focus) this.style.display = "none";
          });
      }

      function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function (d) {
          return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function (d) {
          return d.r * k;
        });
      }
    });
  return state;
};

function zoom(d) {
  focus = d;
  console.log(view);
  console.log(focus);
  var transition = d3
    .transition()
    .duration(750)
    .tween("zoom", function (d) {
      var i = d3.interpolateZoom(view, [
        focus.x,
        focus.y,
        focus.r * 2 + margin,
      ]);
      return function (t) {
        zoomTo(i(t));
      };
    });

  transition
    .selectAll("text")
    .filter(function (d) {
      return d.parent === focus || this.style.display === "inline";
    })
    .style("fill-opacity", function (d) {
      return d.parent === focus ? 1 : 0;
    })
    .on("start", function (d) {
      if (d.parent === focus) this.style.display = "inline";
    })
    .on("end", function (d) {
      if (d.parent !== focus) this.style.display = "none";
    });
}

function zoomTo(v) {
  console.log(v);
  var k = diameter / v[2];
  view = v;
  node.attr("transform", function (d) {
    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
  });
  circle.attr("r", function (d) {
    return d.r * k;
  });
}

function buildContextActionItem(d) {
  let res = d;
  let curr = d.parent;
  let fullPath = d.data.name;
  while (curr) {
    fullPath = curr.data.name + "/" + fullPath;
    curr = curr.parent;
  }
  res.fullPath = fullPath;
  return res;
}
