const express = require('express');
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  importClients,
  getClientStats,
  setClientStatus
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getClients).post(protect, createClient);
router.route('/import').post(protect, importClients);
router.route('/stats').get(protect, getClientStats);
router.route('/:id').get(protect, getClient).put(protect, updateClient).delete(protect, deleteClient);
router.route('/:id/setClientStatus').put(protect, setClientStatus);

module.exports = router; 