import { addContextItemAction } from "../components/heatmap/actions";

const _contextItemPollingSubscription = fx => _ => [fx];

export const contextItemPollingSubscription = _contextItemPollingSubscription(
  dispatch => {
    const id = setInterval(() => dispatch(addContextItemAction), 500);
    return () => clearInterval(id);
  }
);
