import { h, app } from "hyperapp";
const BarChart = require("../frontend/visualizations/barchart").Barchart;

const increase = state => ({ count: state.count + 1 });
const doSomethingClever = state => [
  {
    ...state,
    count: state.count + 1
  },
  console.log(state)
];

app({
  init: {
    ...BarChart.init(),
    count: 0
  },
  view: state =>
    h("div", {}, [
      <h1>{state.count}</h1>,
      h("button", { onClick: doSomethingClever }),
      BarChart.dashboardView(state)
    ]),
  node: document.getElementById("hyperapp-container")
});
