import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

export const emailService = {
  sendOrderNotification: async (order) => {
    try {
      const msg = {
        to: process.env.REACT_APP_ADMIN_EMAIL, // Admin email address
        from: process.env.REACT_APP_SENDER_EMAIL, // Verified sender email
        subject: `New Order Received - Order #${order.id}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Customer Name:</strong> ${order.user.name}</p>
          <p><strong>Customer Email:</strong> ${order.user.email}</p>
          <p><strong>Customer Phone:</strong> ${order.user.phone}</p>
          <p><strong>Order Total:</strong> ₹${order.total.toLocaleString()}</p>
          <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          
          <h3>Order Items:</h3>
          <ul>
            ${order.items.map(item => `
              <li>
                ${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price.toLocaleString()}
              </li>
            `).join('')}
          </ul>
          
          <h3>Shipping Address:</h3>
          <p>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
            Pincode: ${order.shippingAddress.pincode}
          </p>
        `,
      };

      await sgMail.send(msg);
      console.log('Order notification email sent successfully');
    } catch (error) {
      console.error('Error sending order notification email:', error);
      throw error;
    }
  },
}; 