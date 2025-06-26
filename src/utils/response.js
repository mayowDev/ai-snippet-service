function sendError(res, status, error, message) {
  return res.status(status).json({
    error,
    message,
  });
}

function sendSuccess(res, status, data) {
  return res.status(status).json(data);
}

module.exports = { sendError, sendSuccess }; 