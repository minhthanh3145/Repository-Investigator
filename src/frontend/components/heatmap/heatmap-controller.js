import { h } from "hyperapp";
import { buildDashboardWithD3 } from "./heatmap-d3";
import { removeContextItemAction } from "./actions";

const HeatMapController = {
  stateInit: () => ({
    heatmap: {
      items: {},
      repository_path: "",
      after_date: "",
      width: 800,
      height: 800
    }
  }),
  getHeatMapView: state => {
    return (
      <div>
        <div>
          <div
            id="info_div"
            style={{
              position: "fixed",
              top: "30px",
              left: "10px",
              "z-index": "10"
            }}
          ></div>
          <input
            placeholder="Repository path"
            style={{
              width: "500px"
            }}
            list="repo_path"
            onchange={(state, e) => ({
              heatmap: { ...state.heatmap, repository_path: e.target.value }
            })}
          />
          <input
            placeholder="After Date"
            style={{
              width: "200px"
            }}
            onchange={(state, e) => ({
              heatmap: { ...state.heatmap, after_date: e.target.value }
            })}
          />
          <button id="fetch_repository_data" onClick={buildDashboardWithD3}>
            Build Hotspot
          </button>
          <label id="lbl_info"></label>
          <datalist id="repo_path">
            <option value="/Users/thanhto/Documents/repository/work/katalon-studio-platform" />
            <option value="/Users/thanhto/Documents/repository/work/katalon" />
            <option value="/Users/thanhto/Documents/repository/work/selenium-ide" />
            <option value="/Users/thanhto/Documents/repository/others/puppeteer" />
          </datalist>
        </div>
        <div
          style={{
            display: "table",
            clear: "both"
          }}
        >
          <svg
            id="heatmap"
            width={state.heatmap.width}
            height={state.heatmap.height}
            style={{
              float: "left",
              padding: "10px"
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
                        title: value.title
                      }
                    ]}
                  >
                    X
                  </button>
                </p>
                <p>
                  <b>{value.title}</b>
                </p>
                <p class="price">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

module.exports.HeatMapController = HeatMapController;
