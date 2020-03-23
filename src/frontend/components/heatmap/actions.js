const queuedAddContextCardActions = [];

export const queueAddContextItem = function(itemDetail) {
  if (queuedAddContextCardActions.length <= 5) {
    queuedAddContextCardActions.push(itemDetail);
  }
};

export const removeContextItemAction = function(state, itemDetail) {
  const key = itemDetail.title;
  const {
    heatmap: { items }
  } = state;
  delete items[key];
  const result = {
    ...state,
    heatmap: {
      ...state.heatmap,
      items: items
    }
  };
  return result;
};

export const addContextItemAction = function(state, payload) {
  const item = payload ? payload : queuedAddContextCardActions.pop();
  if (!item) {
    return state;
  }
  const {
    heatmap: { items }
  } = state;
  items[item.title] = item;
  const result = {
    ...state,
    heatmap: {
      ...state.heatmap,
      items: items
    }
  };
  return result;
};
