const express = require("express");
const { authRouter, setAuthUser } = require("./routes/authRouter.js");
const orderRouter = require("./routes/orderRouter.js");
const franchiseRouter = require("./routes/franchiseRouter.js");
const version = require("./version.json");
const config = require("./config.js");
const metrics = require("./metrics.js");

const app = express();
app.use(express.json());
app.use(setAuthUser);
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	next();
});

app.use(metrics.metricsRouter);
metrics.sendMetricsPeriodically(1000);

const Logger = require("pizza-logger");
const { asyncHandler } = require("./endpointHelper.js");
const logger = new Logger(config);
app.use(logger.httpLogger);

const apiRouter = express.Router();
app.use("/api", apiRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/order", orderRouter);
apiRouter.use("/franchise", franchiseRouter);

apiRouter.use(
	"/docs/factory",
	asyncHandler(async (req, res) => {
		const r = await fetch(`${config.factory.url}/api/docs`, {
			method: "GET",
		});
		const j = await r.json();
		res.json({
			version: version.version,
			endpoints: j?.endpoints,
			// config: { factory: config.factory.url, db: config.db.connection.host },
		});
	})
);

apiRouter.use("/docs", (req, res) => {
	res.json({
		version: version.version,
		endpoints: [
			...authRouter.endpoints,
			...orderRouter.endpoints,
			...franchiseRouter.endpoints,
		],
		// config: { factory: config.factory.url, db: config.db.connection.host },
	});
});

app.get("/", (req, res) => {
	res.json({
		message: "welcome to JWT Pizza",
		version: version.version,
	});
});

app.use("*", (req, res) => {
	res.status(404).json({
		message: "unknown endpoint",
	});
});

// Default error handler for all exceptions and errors.
app.use((err, req, res, next) => {
	res.status(err.statusCode ?? 500).json({ message: err.message });
	next();
});

module.exports = app;
