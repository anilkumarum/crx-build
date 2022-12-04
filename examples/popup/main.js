const eId = document.getElementById.bind(document);
// Get element by CSS selector:
export const qs = (selector, scope) => (scope || document).querySelector(selector);

// addEventListener wrapper:
export const $on = (target, type, callback) => target.addEventListener(type, callback);
