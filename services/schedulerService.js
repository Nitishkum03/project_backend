const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskReminder, sendTaskOverdueNotification, sendTaskNotDoneNotification } = require('./notificationService');

const checkTasks = async () => {
  try {
    const now = new Date();
    
    // Find tasks that need reminders (within 1 hour of reminder time)
    const tasksNeedingReminders = await Task.find({
      status: 'Active',
      reminderTime: {
        $gte: now,
        $lte: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
      }
    }).populate('user');

    // Send reminders
    for (const task of tasksNeedingReminders) {
      await sendTaskReminder(task.user.email, task);
    }

    // Find overdue tasks
    const overdueTasks = await Task.find({
      status: 'Active',
      deadline: { $lt: now }
    }).populate('user');

    // Send overdue notifications
    for (const task of overdueTasks) {
      await sendTaskOverdueNotification(task.user.email, task);
    }

    // Find tasks that haven't been marked as done after 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const notDoneTasks = await Task.find({
      status: 'Active',
      createdAt: { $lt: twentyFourHoursAgo }
    }).populate('user');

    // Send not done notifications
    for (const task of notDoneTasks) {
      await sendTaskNotDoneNotification(task.user.email, task);
    }
  } catch (error) {
    console.error('Error in task scheduler:', error);
  }
};

// Run the check every 5 minutes
const startScheduler = () => {
  setInterval(checkTasks, 5 * 60 * 1000);
  console.log('Task scheduler started');
};

module.exports = {
  startScheduler
}; 