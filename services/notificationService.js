const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendTaskReminder = async (userEmail, task) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Task Reminder: ' + task.title,
      html: `
        <h2>Task Reminder</h2>
        <p>Hello,</p>
        <p>This is a reminder for your task:</p>
        <ul>
          <li><strong>Title:</strong> ${task.title}</li>
          <li><strong>Description:</strong> ${task.description}</li>
          <li><strong>Deadline:</strong> ${new Date(task?.deadline).toLocaleString()}</li>
          <li><strong>Priority:</strong> ${task.priority}</li>
          <li><strong>Category:</strong> ${task.category}</li>
        </ul>
        <p>Please complete this task before the deadline.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully');
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

const sendTaskOverdueNotification = async (userEmail, task) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Task Overdue: ' + task.title,
      html: `
        <h2>Task Overdue</h2>
        <p>Hello,</p>
        <p>Your task is overdue:</p>
        <ul>
          <li><strong>Title:</strong> ${task.title}</li>
          <li><strong>Description:</strong> ${task.description}</li>
          <li><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleString()}</li>
          <li><strong>Priority:</strong> ${task.priority}</li>
          <li><strong>Category:</strong> ${task.category}</li>
        </ul>
        <p>Please complete this task as soon as possible.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Overdue notification email sent successfully');
  } catch (error) {
    console.error('Error sending overdue notification email:', error);
    throw error;
  }
};

module.exports = {
  sendTaskReminder,
  sendTaskOverdueNotification
}; 