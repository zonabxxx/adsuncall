const asyncHandler = require('express-async-handler');
const Call = require('../models/callModel');
const Client = require('../models/clientModel');

// @desc    Get all calls
// @route   GET /api/calls
// @access  Private
const getCalls = asyncHandler(async (req, res) => {
  const calls = await Call.find({})
    .populate('client', 'name email phone')
    .populate('user', 'name')
    .sort({ callDate: -1 });
  res.status(200).json(calls);
});

// @desc    Get calls for a specific client
// @route   GET /api/calls/client/:clientId
// @access  Private
const getClientCalls = asyncHandler(async (req, res) => {
  const clientExists = await Client.findById(req.params.clientId);

  if (!clientExists) {
    res.status(404);
    throw new Error('Client not found');
  }

  const calls = await Call.find({ client: req.params.clientId })
    .populate('client', 'name email phone')
    .populate('user', 'name')
    .sort({ callDate: -1 });

  res.status(200).json(calls);
});

// @desc    Get call by ID
// @route   GET /api/calls/:id
// @access  Private
const getCall = asyncHandler(async (req, res) => {
  const call = await Call.findById(req.params.id)
    .populate('client', 'name email phone company')
    .populate('user', 'name');

  if (!call) {
    res.status(404);
    throw new Error('Call not found');
  }

  res.status(200).json(call);
});

// @desc    Create new call
// @route   POST /api/calls
// @access  Private
const createCall = asyncHandler(async (req, res) => {
  console.log('Request body:', req.body);
  
  const { client, callDate, status, duration, notes, outcome, nextAction, nextActionDate } = req.body;

  if (!client) {
    console.log('Client ID missing from request');
    res.status(400);
    throw new Error('Please include client');
  }

  // Check if client exists
  const clientExists = await Client.findById(client);

  if (!clientExists) {
    console.log('Client not found with ID:', client);
    res.status(404);
    throw new Error('Client not found');
  }

  console.log('Client found:', clientExists.name);
  
  // Ensure dates are properly processed if they are provided
  let processedCallDate = callDate ? new Date(callDate) : undefined;
  let processedNextActionDate = nextActionDate ? new Date(nextActionDate) : undefined;

  console.log('Processed call date:', processedCallDate);
  console.log('Processed next action date:', processedNextActionDate);

  // Convert lowercase status to proper case for database
  const statusMap = {
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'failed': 'Failed'
  };

  // Convert lowercase outcome to proper case for database
  const outcomeMap = {
    'success': 'Success',
    'need_followup': 'Need Follow-up',
    'no_answer': 'No Answer',
    'not_interested': 'Not Interested',
    'other': 'Other'
  };

  // Default to Scheduled if status is invalid
  const formattedStatus = statusMap[status] || 'Scheduled';
  
  // If outcome is empty, don't convert it
  const formattedOutcome = outcome ? outcomeMap[outcome] || '' : undefined;

  console.log('Formatted status:', formattedStatus);
  console.log('Formatted outcome:', formattedOutcome);

  const call = await Call.create({
    client,
    user: req.user.id,
    callDate: processedCallDate,
    status: formattedStatus,
    duration,
    notes,
    outcome: formattedOutcome,
    nextAction,
    nextActionDate: processedNextActionDate,
  });

  console.log('Call created with ID:', call._id);

  const populatedCall = await Call.findById(call._id)
    .populate('client', 'name email phone')
    .populate('user', 'name');

  res.status(201).json(populatedCall);
});

// @desc    Update call
// @route   PUT /api/calls/:id
// @access  Private
const updateCall = asyncHandler(async (req, res) => {
  const call = await Call.findById(req.params.id);

  if (!call) {
    res.status(404);
    throw new Error('Call not found');
  }

  // If client is being updated, check if new client exists
  if (req.body.client && req.body.client !== call.client.toString()) {
    const clientExists = await Client.findById(req.body.client);

    if (!clientExists) {
      res.status(404);
      throw new Error('Client not found');
    }
  }

  // Process dates if they are provided
  let updatedData = { ...req.body };
  
  if (updatedData.callDate) {
    updatedData.callDate = new Date(updatedData.callDate);
  }
  
  if (updatedData.nextActionDate) {
    updatedData.nextActionDate = new Date(updatedData.nextActionDate);
  }

  // Convert lowercase status to proper case for database if provided
  if (updatedData.status) {
    const statusMap = {
      'scheduled': 'Scheduled',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'failed': 'Failed'
    };
    updatedData.status = statusMap[updatedData.status] || updatedData.status;
  }

  // Convert lowercase outcome to proper case for database if provided
  if (updatedData.outcome) {
    const outcomeMap = {
      'success': 'Success',
      'need_followup': 'Need Follow-up',
      'no_answer': 'No Answer',
      'not_interested': 'Not Interested',
      'other': 'Other'
    };
    updatedData.outcome = outcomeMap[updatedData.outcome] || updatedData.outcome;
  }

  const updatedCall = await Call.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
  })
    .populate('client', 'name email phone')
    .populate('user', 'name');

  res.status(200).json(updatedCall);
});

// @desc    Delete call
// @route   DELETE /api/calls/:id
// @access  Private
const deleteCall = asyncHandler(async (req, res) => {
  const call = await Call.findById(req.params.id);

  if (!call) {
    res.status(404);
    throw new Error('Call not found');
  }

  await call.deleteOne();

  res.status(200).json({ success: true });
});

// @desc    Import calls from CSV
// @route   POST /api/calls/import
// @access  Private
const importCalls = asyncHandler(async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    res.status(400);
    throw new Error('No valid data provided');
  }

  let importedCount = 0;
  const errors = [];

  // Process each call record
  for (const callData of data) {
    try {
      // Validate required fields
      if (!callData.client || !callData.callDate || !callData.status) {
        errors.push(`Missing required fields for record: ${JSON.stringify(callData)}`);
        continue;
      }

      // Check if this is a client ID or client name/email
      let clientId = callData.client;

      // If it's not a valid ObjectId, try to find the client by name or email
      if (!callData.client.match(/^[0-9a-fA-F]{24}$/)) {
        const client = await Client.findOne({
          $or: [
            { name: callData.client },
            { email: callData.client }
          ],
          user: req.user.id
        });

        if (!client) {
          errors.push(`Client not found for record: ${JSON.stringify(callData)}`);
          continue;
        }

        clientId = client._id;
      } else {
        // Verify the client exists and belongs to this user
        const client = await Client.findOne({ 
          _id: callData.client,
          user: req.user.id
        });

        if (!client) {
          errors.push(`Client not found or not accessible for record: ${JSON.stringify(callData)}`);
          continue;
        }
      }

      // Create new call
      await Call.create({
        user: req.user.id,
        client: clientId,
        callDate: callData.callDate,
        status: callData.status,
        duration: callData.duration || 0,
        outcome: callData.outcome || '',
        notes: callData.notes || '',
        nextAction: callData.nextAction || '',
        nextActionDate: callData.nextActionDate || null
      });

      importedCount++;
    } catch (error) {
      errors.push(`Error processing record: ${JSON.stringify(callData)} - ${error.message}`);
    }
  }

  res.status(201).json({
    imported: importedCount,
    total: data.length,
    errors: errors.length > 0 ? errors : undefined
  });
});

// @desc    Get today's calls
// @route   GET /api/calls/today
// @access  Private
const getTodaysCalls = asyncHandler(async (req, res) => {
  // Get the date from query or use today's date
  const dateParam = req.query.date || new Date().toISOString().split('T')[0];
  
  console.log('Getting calls for date:', dateParam);
  
  // Parse the date and set start/end of day
  const startDate = new Date(dateParam);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateParam);
  endDate.setHours(23, 59, 59, 999);
  
  console.log('Date range:', startDate, 'to', endDate);
  
  // Find calls scheduled for today with status 'Scheduled' only
  const calls = await Call.find({
    user: req.user.id,
    callDate: { $gte: startDate, $lte: endDate },
    status: 'Scheduled'  // Only scheduled calls, not in progress
  }).populate('client').sort({ callDate: 1 });
  
  console.log('Found calls:', calls.length);
  
  res.status(200).json(calls);
});

module.exports = {
  getCalls,
  getClientCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
  importCalls,
  getTodaysCalls,
}; 