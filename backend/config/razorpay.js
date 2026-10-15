const Razorpay = require("razorpay");

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_5173ShopKart",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkart_razorpay_secret_key_2026",
    });
  }
  return razorpayInstance;
};

module.exports = getRazorpayInstance;
