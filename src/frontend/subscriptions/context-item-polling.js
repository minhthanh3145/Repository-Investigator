import { addContextItemAction } from "../components/heatmap/actions";

const _contextItemPollingSubscription = (fx) => (_) => [fx];

/**
 * A hyperapp subscription that periodically reads from the FILO queue and
 * push the items into the list of items stored in the state. The reason we use
 * a separate FILO queue is to allow non-hyperapp component (d3 modules) to
 * add/remove items stored in the hyperapp state
 */
export const contextItemPollingSubscription = _contextItemPollingSubscription(
  (dispatch) => {
    const id = setInterval(() => dispatch(addContextItemAction), 500);
    return () => clearInterval(id);
  }
);
