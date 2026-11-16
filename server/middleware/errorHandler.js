const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  // Multer invalid file type
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Postgres: invalid text representation (e.g. a malformed UUID in the URL)
  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default server error — never leak internals on 5xx
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 && !err.statusCode ? 'Internal Server Error' : err.message
  });
};

module.exports = errorHandler;
