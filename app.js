const express = require("express");
const path = require("path");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const httpStatus = require("http-status");
const cookieParser = require("cookie-parser");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { jwtStrategy } = require("./config/passport");
const { authLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const sequelize = require("./config/db.config");

const app = express();

// Use morgan for logging (only in non-test environments)
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Set security HTTP headers using helmet
app.use(helmet());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Sanitize request data to prevent XSS attacks
app.use(xss());

// Enable gzip compression
app.use(compression());

// Parse cookies
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === "null" || config.corsOrigin.includes(origin)) {
      // Allow requests with 'null' origin (file://), or if origin is in the allowed list
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// Ensure pre-flight (OPTIONS) requests are handled
app.options("*", cors(corsOptions));

// Database synchronization
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Error synchronizing the database:", error);
  });

// Language middleware
app.use((req, res, next) => {
  const langCode = req.acceptsLanguages("en", "ar");
  req.languageCode = langCode || "en"; // Default to 'en' if none found
  next();
});

// Initialize passport for JWT authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// Apply rate limiter to authentication routes only in production
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// Set Content Security Policy (CSP)
app.use((req, res, next) => {
  res.set(
    "Content-Security-Policy",
    "default-src ; style-src 'self' http:// 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
  );
  next();
});

// Use the v1 API routes
app.use("/v1", routes);

// Handle unknown routes with a 404 error
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Convert errors to ApiError if necessary
app.use(errorConverter);

// Global error handler
app.use(errorHandler);

module.exports = app;