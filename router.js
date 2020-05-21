const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
  res.send('server is up and running');
});

module.exports = router;
