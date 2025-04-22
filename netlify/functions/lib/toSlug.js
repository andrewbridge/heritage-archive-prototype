const toSlug = (str) => str.replace(/\s+/g, ' ').split(' ').join('-').toLowerCase();

exports.toSlug = toSlug;