const express = require("express");
const app = express();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

require("dotenv").config();

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Milky-Way API",
      description: "All APIs for Milky-Way",
      contact: {
        name: "Emmanuel C. Benson",
        email: "emmanuel.c.benson@gmail.com",
      },
      servers: ["http://localhost:" + process.env.port || 3000],
      version: "1.0.0",
    },
  },
  // ['./routes/*.js']
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-v1-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Routes
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const addressRoutes = require("./routes/address");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");

const checkSource = require("./middlewares/check-source");

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

app.use(checkSource);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/product", productRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = status == 500 ? "Internal server error" : error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const port = process.env.port || 3000;

app.listen(port);
