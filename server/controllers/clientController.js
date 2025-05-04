const asyncHandler = require('express-async-handler');
const Client = require('../models/clientModel');
const User = require('../models/userModel');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find({}).sort({ createdAt: -1 });
  console.log(`Returning ${clients.length} clients to user ${req.user.id}`);
  res.status(200).json(clients);
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  res.status(200).json(client);
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = asyncHandler(async (req, res) => {
  const { name, address, phone, company, notes, web, mail, postal_mail } = req.body;

  if (!name || !address || !phone) {
    res.status(400);
    throw new Error('Please include all required fields');
  }

  const client = await Client.create({
    user: req.user.id,
    name,
    address,
    phone,
    company,
    notes,
    web,
    mail,
    postal_mail,
  });

  res.status(201).json(client);
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  const updatedClient = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedClient);
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  await client.deleteOne();

  res.status(200).json({ success: true });
});

// @desc    Import clients from CSV
// @route   POST /api/clients/import
// @access  Private
const importClients = asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  console.log('Import request received:', { userId: req.user.id, dataLength: data ? data.length : 0 });
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    res.status(400);
    throw new Error('No valid data provided');
  }

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors = [];
  const processedKeys = new Set(); // Track processed client keys to avoid duplicates

  // Process each client record
  for (const clientData of data) {
    try {
      // Create a sanitized copy of data to work with
      const sanitizedData = { ...clientData };
      
      // Debug info
      console.log('Processing client data:', sanitizedData);
      
      // Check and sanitize required fields
      // Company - required
      if (!sanitizedData.company || sanitizedData.company.trim() === '') {
        errors.push(`Missing or empty required field "company" for record: ${JSON.stringify(clientData)}`);
        skippedCount++;
        continue;
      }
      sanitizedData.company = sanitizedData.company.trim();
      
      // Name - set to company if missing/empty
      sanitizedData.name = (!sanitizedData.name || sanitizedData.name.trim() === '') 
        ? sanitizedData.company 
        : sanitizedData.name.trim();
      
      // Phone - required
      if (!sanitizedData.phone || sanitizedData.phone.trim() === '') {
        errors.push(`Missing or empty required field "phone" for record: ${JSON.stringify(clientData)}`);
        skippedCount++;
        continue;
      }
      sanitizedData.phone = sanitizedData.phone.trim();
      
      // Email/Address - optional now, but initialize if exists
      sanitizedData.address = sanitizedData.address && sanitizedData.address.trim() !== '' 
        ? sanitizedData.address.trim() 
        : '';
      
      // Create a unique key based on company and phone (business name)
      const clientKey = `${sanitizedData.company}|${sanitizedData.phone}`.toLowerCase();
      
      // Check for duplicate entry in current import batch
      if (processedKeys.has(clientKey)) {
        errors.push(`Duplicate business found in import data (${sanitizedData.company}). Skipping this record.`);
        skippedCount++;
        continue;
      }
      
      // Add key to processed set
      processedKeys.add(clientKey);
      
      // Initialize optional fields if they don't exist or are empty
      sanitizedData.mail = sanitizedData.mail && sanitizedData.mail.trim() !== '' ? sanitizedData.mail.trim() : '';
      sanitizedData.postal_mail = sanitizedData.postal_mail && sanitizedData.postal_mail.trim() !== '' ? sanitizedData.postal_mail.trim() : '';
      sanitizedData.notes = sanitizedData.notes && sanitizedData.notes.trim() !== '' ? sanitizedData.notes.trim() : '';
      sanitizedData.web = sanitizedData.web && sanitizedData.web.trim() !== '' ? sanitizedData.web.trim() : '';
      
      // Add user reference
      sanitizedData.user = req.user.id;

      // Check for existing client with the same company (business name) and phone
      const existingClient = await Client.findOne({ 
        company: sanitizedData.company,
        phone: sanitizedData.phone,
        user: req.user.id
      });

      if (existingClient) {
        // Update existing client
        console.log(`Updating existing client: ${existingClient._id}`);
        await Client.findByIdAndUpdate(existingClient._id, sanitizedData);
        updatedCount++;
      } else {
        // Create new client
        console.log('Creating new client for user:', req.user.id);
        const createdClient = await Client.create(sanitizedData);
        console.log('Client created:', createdClient._id);
        importedCount++;
      }
    } catch (error) {
      console.error('Error processing client:', error);
      errors.push(`Error processing record: ${JSON.stringify(clientData)} - ${error.message}`);
      skippedCount++;
    }
  }

  console.log(`Import completed: ${importedCount} new clients imported, ${updatedCount} clients updated, ${skippedCount} records skipped`);
  
  res.status(201).json({
    imported: importedCount,
    updated: updatedCount,
    skipped: skippedCount,
    total: data.length,
    errors: errors.length > 0 ? errors : undefined
  });
});

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private
const getClientStats = asyncHandler(async (req, res) => {
  // Count total clients for the current user
  const userClientsCount = await Client.countDocuments({ user: req.user.id });
  
  // Count total clients in the system
  const totalClientsCount = await Client.countDocuments({});
  
  // Get user distribution (how many clients per user)
  const users = await User.find({}).select('_id name email');
  const userDistribution = [];
  
  for (const user of users) {
    const count = await Client.countDocuments({ user: user._id });
    if (count > 0) {
      userDistribution.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        clientCount: count
      });
    }
  }
  
  // Get unique companies count
  const uniqueCompanies = await Client.distinct('company');
  
  // Get fields coverage statistics
  const fieldStats = {
    withAddress: await Client.countDocuments({ address: { $exists: true, $ne: "" } }),
    withPhone: await Client.countDocuments({ phone: { $exists: true, $ne: "" } }),
    withWebsite: await Client.countDocuments({ web: { $exists: true, $ne: "" } }),
    withCategory: await Client.countDocuments({ mail: { $exists: true, $ne: "" } }),
    withPostalMail: await Client.countDocuments({ postal_mail: { $exists: true, $ne: "" } }),
    withNotes: await Client.countDocuments({ notes: { $exists: true, $ne: "" } })
  };
  
  res.status(200).json({
    userClients: userClientsCount,
    totalClients: totalClientsCount,
    uniqueCompaniesCount: uniqueCompanies.length,
    fieldCoverage: fieldStats,
    userDistribution
  });
});

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  importClients,
  getClientStats,
};