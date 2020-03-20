class HierarchicalDataBuilder {
  _generateHierarchicalData(output, currentPath, currentElement) {
    var current = output["children"];
    const paths = currentPath.split("/");
    for (let index = 0; index < paths.length; index++) {
      let segment = paths[index];
      if (segment !== "") {
        if (!current) {
          current = [];
        }
        const firstEle = current.find(curr => curr["name"] == segment);
        if (!firstEle) {
          if (index != paths.length - 1) {
            current.push({
              name: segment,
              children: []
            });
          } else {
            current.push({
              ...currentElement,
              name: segment
            });
          }
        } else {
          current = firstEle;
        }
        current = current["children"];
      }
    }
  }
}

module.exports.HierarchicalDataBuilder = HierarchicalDataBuilder;
