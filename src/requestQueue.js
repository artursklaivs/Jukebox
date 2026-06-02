class RequestQueue {
  constructor() {
    this.items = [];
  }

  enqueueNext(requests) {
    const normalized = Array.isArray(requests) ? requests : [requests];
    const validRequests = normalized.filter(Boolean);

    if (validRequests.length === 0) {
      return 0;
    }

    this.items.push(...validRequests);
    return validRequests.length;
  }

  takeNext() {
    return this.items.shift() || null;
  }

  size() {
    return this.items.length;
  }
}

module.exports = {
  RequestQueue,
};
