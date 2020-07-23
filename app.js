const express = require("express");
const app = express();

// Routes
const adminRoutes = require("./routes/admin");
const vendorRoutes = require("./routes/vendor");
const customerRoutes = require("./routes/customer");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/vendor", adminRoutes);
app.use("/api/v1/customer", adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    data: {
      message: "Resource not found.",
    },
  });
});

app.listen(3000);
