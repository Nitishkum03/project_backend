const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks for the current user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, deadline, reminderTime, priority, category, status } = req.body;
    
    // Validate dates
    if (!deadline || !reminderTime) {
      return res.status(400).json({ message: 'Deadline and reminder time are required' });
    }

    // Convert string dates to Date objects
    const deadlineDate = new Date(deadline);
    const reminderDate = new Date(reminderTime);

    // Validate date formats
    if (isNaN(deadlineDate.getTime()) || isNaN(reminderDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Validate reminder time is before deadline
    if (reminderDate >= deadlineDate) {
      return res.status(400).json({ message: 'Reminder time must be before deadline' });
    }
    
    const task = new Task({
      title,
      description,
      deadline: deadlineDate,
      reminderTime: reminderDate,
      priority,
      category,
      status,
      user: req.user._id
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, deadline, reminderTime, priority, category, status } = req.body;
    
    // Find task and check ownership
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Validate dates if provided
    if (deadline || reminderTime) {
      const deadlineDate = deadline ? new Date(deadline) : task.deadline;
      const reminderDate = reminderTime ? new Date(reminderTime) : task.reminderTime;

      if (isNaN(deadlineDate.getTime()) || isNaN(reminderDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      if (reminderDate >= deadlineDate) {
        return res.status(400).json({ message: 'Reminder time must be before deadline' });
      }
    }
    
    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, date, priority, category, status },
      { new: true }
    );
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find task and check ownership
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle task status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    // Find task and check ownership
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Toggle status
    task.status = task.status === 'Active' ? 'Completed' : 'Active';
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      category: req.params.category
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      status: req.params.status
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks by deadline date
router.get('/deadline/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const tasks = await Task.find({
      user: req.user._id,
      deadline: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get upcoming tasks (tasks with deadline in the next 7 days)
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const tasks = await Task.find({
      user: req.user._id,
      status: 'Active',
      deadline: {
        $gte: now,
        $lte: sevenDaysFromNow
      }
    }).sort({ deadline: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 