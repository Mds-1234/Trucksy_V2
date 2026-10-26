export const buildCapacityFilterAndUpdate = (routeId, fromIdx, toIdx, weight, space) => {
  const filter = {
    _id: routeId,
    status: { $in: ["open", "in_progress"] }
  };
  const inc = {};

  for (let i = fromIdx; i < toIdx; i++) {
    filter[`segmentRemaining.${i}.weight`] = { $gte: weight };
    filter[`segmentRemaining.${i}.space`] = { $gte: space };
    inc[`segmentRemaining.${i}.weight`] = -weight;
    inc[`segmentRemaining.${i}.space`] = -space;
  }

  return { filter, update: { $inc: inc } };
};

export const applyCapacityDecrement = (segments, fromIdx, toIdx, weight, space) => {
  for (let i = fromIdx; i < toIdx; i++) {
    const seg = segments[i];
    if (!seg || seg.weight < weight || seg.space < space) {
      return null;
    }
  }

  return segments.map((seg, idx) => {
    if (idx >= fromIdx && idx < toIdx) {
      return {
        weight: seg.weight - weight,
        space: seg.space - space
      };
    }
    return { ...seg };
  });
};
