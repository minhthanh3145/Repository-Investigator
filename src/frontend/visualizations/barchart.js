import { h } from "hyperapp";
const HeatMap = require("./heatmap").HeatMap;

const Barchart = {
  init: () => ({
    heatmap: {
      repository_path: "",
      after_date: "",
      width: 100,
      height: 100
    }
  }),
  dashboardView: state => {
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
          >
            Info div
          </div>
          <input
            placeholder="Repository path"
            onchange={(state, e) => (
              { ...state },
              { heatmap: { ...heatmap, repository_path: e.target.value } }
            )}
          />
          <input
            placeholder="After Date"
            onchange={(state, e) => (
              { ...state },
              { heatmap: { ...heatmap, after_date: e.target.value } }
            )}
          />
          <button
            id="fetch_repository_data"
            onClick={() => Barchart.buildDashboard(state)}
          >
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
            <p>asfasf</p>
          </div>
        </div>
      </div>
    );
  },
  buildDashboard: state => [
    { ...state },
    console.log(state),
    HeatMap(state.heatmap.repository_path, state.heatmap.after_date)
  ]
};

module.exports.Barchart = Barchart;
