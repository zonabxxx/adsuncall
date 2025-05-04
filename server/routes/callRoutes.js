const express = require('express');
const router = express.Router();
const {
  getCalls,
  getClientCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
  importCalls,
  getTodaysCalls
} = require('../controllers/callController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCalls)
  .post(protect, createCall);

router.get('/today', protect, getTodaysCalls);

router.route('/import')
  .post(protect, importCalls);

router.route('/client/:clientId').get(protect, getClientCalls);

router.route('/:id')
  .get(protect, getCall)
  .put(protect, updateCall)
  .delete(protect, deleteCall);

module.exports = router; 