const nodemailer = require('nodemailer');

// Create transporter - configure with your SMTP settings
// For Gmail, use your App Password (not regular password)
// Using service shorthand (handles network issues internally)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Send email to admin when new booking is created
const sendBookingNotificationToAdmin = async (booking, adminEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: adminEmail,
    subject: `New Boardroom Booking Request - ${booking.meeting_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Booking Request</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">${booking.meeting_title}</h3>
          <p><strong>Purpose:</strong> ${booking.purpose || 'Not specified'}</p>
          <p><strong>Requested By:</strong> ${booking.requested_by}</p>
          <p><strong>Department:</strong> ${booking.department_name}</p>
          <p><strong>Date:</strong> ${booking.booking_date}</p>
          <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
          <p><strong>Expected Attendees:</strong> ${booking.expected_attendees}</p>
          ${booking.refreshments === 'Yes' ? '<p><strong>Refreshments:</strong> Yes</p>' : ''}
          ${booking.projector === 'Yes' ? '<p><strong>Projector:</strong> Yes</p>' : ''}
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Please login to the admin panel to approve or reject this request.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

// Send confirmation email to staff when booking is approved
const sendBookingApprovedEmail = async (booking, staffEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: staffEmail,
    subject: `Your Booking is Approved - ${booking.meeting_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Booking Approved!</h2>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">${booking.meeting_title}</h3>
          <p><strong>Date:</strong> ${booking.booking_date}</p>
          <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Your booking request has been approved. The boardroom is reserved for you.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

// Send rejection email to staff when booking is rejected
const sendBookingRejectedEmail = async (booking, staffEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: staffEmail,
    subject: `Your Booking Request Was Not Approved - ${booking.meeting_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Booking Not Approved</h2>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">${booking.meeting_title}</h3>
          <p><strong>Date:</strong> ${booking.booking_date}</p>
          <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Unfortunately, your booking request was not approved. Please contact the admin for more details or submit a new request.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

module.exports = {
  sendBookingNotificationToAdmin,
  sendBookingApprovedEmail,
  sendBookingRejectedEmail
};