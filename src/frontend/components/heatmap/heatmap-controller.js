import { h } from "hyperapp";
import { buildDashboardWithD3 } from "./heatmap-d3";
import { highlightElementByFullPath } from "./heatmap-d3";
import { zoomToElementByFullPath } from "./heatmap-d3";
import { removeContextItemAction } from "./actions";

const HeatMapController = {
  stateInit: () => ({
    heatmap: {
      items: {},
      repository_path: "",
      after_date: "",
      extensions: "",
      width: 800,
      height: 800,
    },
  }),
  getHeatMapView: (state) => {
    return (
      <div>
        <div>
          <div
            id="info_div"
            style={{
              position: "fixed",
              top: "30px",
              left: "10px",
              "z-index": "10",
            }}
          ></div>
          <input
            placeholder="Repository path"
            style={{
              width: "500px",
            }}
            list="repo_path"
            onchange={(state, e) => ({
              heatmap: { ...state.heatmap, repository_path: e.target.value },
            })}
          />
          <input
            placeholder="After Date"
            style={{
              width: "200px",
            }}
            onchange={(state, e) => ({
              heatmap: { ...state.heatmap, after_date: e.target.value },
            })}
          />
          <input
            placeholder="Extensions, comma separated"
            style={{
              width: "200px",
            }}
            onchange={(state, e) => ({
              heatmap: { ...state.heatmap, extensions: e.target.value },
            })}
          />
          <button id="fetch_repository_data" onClick={buildDashboardWithD3}>
            Build Hotspot
          </button>
          <label id="lbl_info"></label>
        </div>
        <div
          style={{
            display: "table",
            clear: "both",
          }}
        >
          <svg
            id="heatmap"
            width={state.heatmap.width}
            height={state.heatmap.height}
            style={{
              float: "left",
              padding: "10px",
            }}
          ></svg>
          <div class="column">
            {Object.entries(state.heatmap.items).map(([_, value]) => (
              <div class="card">
                <p>
                  <button
                    onClick={[
                      removeContextItemAction,
                      {
                        fullPath: value.fullPath,
                      },
                    ]}
                  >
                    X
                  </button>
                </p>
                <p>
                  <b>{value.title}</b>
                  <button
                    onClick={(state) => [
                      state,
                      zoomToElementByFullPath(value.fullPath),
                    ]}
                  >
                    <b>Zoom</b>
                  </button>
                  <button
                    onClick={(state) => [
                      state,
                      highlightElementByFullPath(value.fullPath),
                    ]}
                  >
                    <b>Link</b>
                  </button>
                </p>
                <p class="price">{value.text}</p>
                <p class="fullPath">{value.fullPath}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

module.exports.HeatMapController = HeatMapController;
