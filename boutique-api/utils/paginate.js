// Lit ?page=1&limit=10 dans l'URL
exports.getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

// Formate le résultat de findAndCountAll
exports.formatPage = (result, page, limit) => ({
  total: result.count,
  page,
  limit,
  totalPages: Math.ceil(result.count / limit),
  data: result.rows,
});
