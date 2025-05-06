const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const authMiddleware = require('../middlewares/auth');

// Protect all routes
router.use(authMiddleware);

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.getAll(req.user.id);
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading customer data' });
  }
});

// Add new customer
router.post('/', async (req, res) => {
  try {
    const customerId = await Customer.create({
      ...req.body,
      pharmacy_id: req.user.id
    });
    res.status(201).json({ id: customerId, message: 'Customer added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding customer' });
  }
});

module.exports = router;