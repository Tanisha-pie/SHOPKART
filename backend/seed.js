require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical gaming keyboard with tactile blue switches and detachable USB-C cable.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=80",
    stock: 12,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with 40-hour battery life and active noise cancellation.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80",
    stock: 25,
  },
  {
    name: "Classic Denim Jacket",
    description: "Premium washed cotton denim jacket with regular fit and brass button accents.",
    price: 1899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&q=80",
    stock: 18,
  },
  {
    name: "Clean Code by Robert C. Martin",
    description: "A handbook of agile software craftsmanship for building maintainable, elegant code.",
    price: 799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&q=80",
    stock: 30,
  },
  {
    name: "Minimalist Ceramic Planter",
    description: "Modern matte ceramic plant pot with built-in drainage saucer for indoor succulents.",
    price: 649,
    category: "Home",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=700&q=80",
    stock: 15,
  },
  {
    name: "Smart Fitness Watch",
    description: "Waterproof fitness tracker with AMOLED display, heart rate monitor, and sleep tracking.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
    stock: 8,
  },
  {
    name: "Canvas Casual Sneakers",
    description: "Comfortable everyday low-top canvas sneakers with cushioned insole and rubber grip.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&q=80",
    stock: 20,
  },
  {
    name: "Atomic Habits by James Clear",
    description: "An easy and proven way to build good habits and break bad ones.",
    price: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&q=80",
    stock: 0, // Out of stock example to demonstrate stock badge
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart");
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products to avoid duplicates
    await Product.deleteMany({});
    console.log("Cleared old products.");

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
