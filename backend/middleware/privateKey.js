const validatePrivateKey = (req, res, next) => {
  const privateKey = req.headers['x-api-key'] || req.headers['x-private-key'] || req.query.apiKey

  // Set default API key for development if not provided
  if (!process.env.PRIVATE_API_KEY) {
    console.warn('⚠️ PRIVATE_API_KEY not set, using development default')
    process.env.PRIVATE_API_KEY = 'atl_public_key_2024_secure_12345'
  }


  if (!privateKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'Private API key required' 
    })
  }

  if (privateKey !== process.env.PRIVATE_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid private API key' 
    })
  }

  next()
}

module.exports = {
  validatePrivateKey
}
