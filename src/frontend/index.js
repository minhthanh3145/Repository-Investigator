import { h, app } from "hyperapp";
const HeatMapController = require("./components/heatmap/heatmap-controller")
  .HeatMapController;
import { contextItemPollingSubscription } from "./subscriptions/context-item-polling";

app({
  init: {
    ...HeatMapController.stateInit()
  },
  view: state => h("div", {}, [HeatMapController.getHeatMapView(state)]),
  subscriptions: contextItemPollingSubscription,
  node: document.getElementById("hyperapp-container")
});
