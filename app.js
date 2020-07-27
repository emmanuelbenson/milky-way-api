const express = require("express");
const app = express();

const { ModelSyncer } = require("./utils/syncModels");

require("dotenv").config();

// Routes
const adminRoutes = require("./routes/admin");
const vendorRoutes = require("./routes/vendor");
const customerRoutes = require("./routes/customer");
const authRoutes = require("./routes/auth");

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/vendor", adminRoutes);
app.use("/api/v1/customer", adminRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

ModelSyncer()
  .sync()
  .then(() => {
    app.listen(process.env.NODE_ENV_PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
