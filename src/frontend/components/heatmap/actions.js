const queuedAddContextCardActions = [];

/**
 * Push the given argument into a FILO queue which is read periodically
 * by a hyperapp's subscription (refer to subscriptions/context-item-polling.js).
 * @param {*} itemDetail
 */
export const queueAddContextItem = function (itemDetail) {
  if (queuedAddContextCardActions.length <= 1000) {
    queuedAddContextCardActions.push(itemDetail);
  }
};

/**
 * A hyperapp action that removes the given item from the list of items stored in the state
 * @param state
 * @param itemDetail
 */
export const removeContextItemAction = function (state, itemDetail) {
  const key = itemDetail.fullPath;
  const {
    heatmap: { items },
  } = state;
  delete items[key];
  const result = {
    ...state,
    heatmap: {
      ...state.heatmap,
      items: items,
    },
  };
  return result;
};

/**
 * A hyperapp action that either
 * - If the given payload, add the given payload
 * - Otherwise, pop an item from the FILO queue and add that item.
 *
 * into the list of items stored in the state
 * @param {*} state
 * @param {*} payload
 */
export const addContextItemAction = function (state, payload) {
  const item = payload ? payload : queuedAddContextCardActions.pop();
  if (!item) {
    return state;
  }
  const {
    heatmap: { items },
  } = state;
  items[item.fullPath] = item;
  const result = {
    ...state,
    heatmap: {
      ...state.heatmap,
      items: items,
    },
  };
  return result;
};
