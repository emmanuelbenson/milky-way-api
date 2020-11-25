const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const { limiter } = require("./utils/rateLimiter");
const xss = require("xss-clean");
const useragent = require("express-useragent");

require("dotenv").config();

// Routes
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const addressRoutes = require("./routes/address");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");
const gasStationRoutes = require("./routes/gasStation");
const systemRatingRoutes = require("./routes/systemRating");
const vendorRatingRoutes = require("./routes/vendorRating");
const subscriptionRoutes = require("./routes/subscribtion");
const paymentHookRoute = require("./routes/hooks");
const paymentRoutes = require("./routes/payment");
const vendorTransactionsRoute = require("./routes/vendor");
const transactionLimitRoute = require("./routes/transactionLimit");
const otpRoute = require("./routes/otp");

/**
 * External requests
 */
app.use("/api/v1/payment", paymentHookRoute);

const checkSource = require("./middlewares/check-source");
const handleErrors = require("./middlewares/handleErrors");

app.use(xss());
app.use("/api", limiter);
app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(useragent.express());

app.use(cors());

app.use("/api/v1/auth", checkSource, authRoutes);
app.use("/api/v1/admin", checkSource, adminRoutes);
app.use("/api/v1/address", checkSource, addressRoutes);
app.use("/api/v1/order", checkSource, orderRoutes);
app.use("/api/v1/product", checkSource, productRoutes);
app.use("/api/v1/station", checkSource, gasStationRoutes);
app.use("/api/v1/rating", checkSource, systemRatingRoutes);
app.use("/api/v1/rating/customer", checkSource, vendorRatingRoutes);
app.use("/api/v1/subscription", checkSource, subscriptionRoutes);
app.use("/api/v1/payment", checkSource, paymentRoutes);
app.use("/api/v1/vendor/transaction", checkSource, vendorTransactionsRoute);
app.use("/api/v1/transaction-limit", checkSource, transactionLimitRoute);
app.use("/api/v1/otp", checkSource, otpRoute);

app.use(handleErrors);

const port = process.env.NODE_ENV_PORT || 5000;

app.listen(port);
