const express = require("express");
const os = require("os");
const config = require("./config");
const metricsRouter = express.Router();

function sendMetricsPeriodically(period) {
	return setInterval(() => {
		try {
			const metrics = [];
			metrics.push(...httpMetrics());
			metrics.push(...userMetrics());
			metrics.push(...authMetrics());
			metrics.push(...systemMetrics());
			metrics.push(...purchaseMetrics());
			metrics.push(...latencyMetrics());
			sendMetricToGrafana(metrics);
		} catch (error) {
			console.log("Error sending metrics", error);
		}
	}, period);
}

let httpReq = { GET: 0, POST: 0, PUT: 0, DELETE: 0, TOTAL: 0 };
function httpMetrics() {
	const metrics = [];
	for (let key in httpReq) {
		metrics.push(
			metricObj("http_" + key.toLowerCase(), httpReq[key], "sum", "1")
		);
		httpReq[key] = 0;
	}
	return metrics;
}
metricsRouter.use((req, _res, next) => {
	httpReq[req.method]++;
	httpReq.TOTAL++;
	next();
});

let activeUsers = 0;
function userMetrics() {
	return [metricObj("active_users", activeUsers, "sum", "1")];
}
metricsRouter.get("/api/auth", (req, res, next) => {
	const originalSend = res.send;
	res.send = function (data) {
		if (res.statusCode === 200) {
			if (req.method == "POST" || req.method == "PUT") activeUsers++;
			else if (req.method == "DELETE") activeUsers--;
		}
		originalSend.call(this, data);
	};
	next();
});

let authSucesses = 0;
let authFailures = 0;
function authMetrics() {
	const metrics = [
		metricObj("auth_success", authSucesses, "sum", "1"),
		metricObj("auth_failure", authFailures, "sum", "1"),
	];
	authSucesses = 0;
	authFailures = 0;
	return metrics;
}
metricsRouter.get("/api/auth", (req, res, next) => {
	const originalSend = res.send;
	res.send = function (data) {
		if (req.method == "POST" || req.method == "PUT") {
			if (res.statusCode === 200) authSucesses++;
			else authFailures++;
		}
		originalSend.call(this, data);
	};
	next();
});

function systemMetrics() {
	function getCpuUsagePercentage() {
		const cpuUsage = os.loadavg()[0] / os.cpus().length;
		return cpuUsage.toFixed(2) * 100;
	}

	function getMemoryUsagePercentage() {
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const usedMemory = totalMemory - freeMemory;
		const memoryUsage = (usedMemory / totalMemory) * 100;
		return memoryUsage.toFixed(2);
	}
	const cpuValue = getCpuUsagePercentage();
	const memoryValue = getMemoryUsagePercentage();
	return [
		metricObj("cpu", cpuValue, "gauge", "%"),
		metricObj("memory", memoryValue, "gauge", "%"),
	];
}

let pizzasSold = 0;
let pizzasFailed = 0;
let pizzaRevenue = 0;
function purchaseMetrics() {
	const metrics = [
		metricObj("pizza_sold", pizzasSold, "sum", "1"),
		metricObj("pizza_fail", pizzasFailed, "sum", "1"),
		metricObj("pizza_earn", pizzaRevenue, "sum", "1"),
	];
	pizzasSold = 0;
	pizzasFailed = 0;
	pizzaRevenue = 0;
	return metrics;
}
metricsRouter.post("/api/order", (req, res, next) => {
	const originalSend = res.send;
	console.log("", req.data);
	res.send = function (data) {
		if (res.statusCode !== 200) pizzasFailed++;
		else {
			pizzasSold += data.order.items.length;
			pizzaRevenue += data.order.items.reduce((a, v) => a + v.price, 0);
		}
		originalSend.call(this, data);
	};
	next();
});

let latencyServer = 0;
let latencyPizza = 0;
function latencyMetrics() {
	const metrics = [
		metricObj("latency_server", latencyServer, "sum", "1"),
		metricObj("latency_pizza", latencyPizza, "sum", "1"),
	];
	latencyServer = 0;
	latencyPizza = 0;
	return metrics;
}
metricsRouter.use((_req, res, next) => {
	const originalSend = res.send;
	const startTime = Date.now() * 1000000;
	res.send = function (data) {
		latencyServer += Date.now() * 1000000 - startTime;
		originalSend.call(this, data);
	};
	next();
});
metricsRouter.post("/api/order", (_req, res, next) => {
	const originalSend = res.send;
	const startTime = Date.now() * 1000000;
	res.send = function (data) {
		latencyPizza += Date.now() * 1000000 - startTime;
		originalSend.call(this, data);
	};
	next();
});

function metricObj(metricName, metricValue, type, unit) {
	return {
		name: metricName,
		unit: unit,
		[type]: {
			dataPoints: [
				{
					[Number.isInteger(metricValue) ? "asInt" : "asDouble"]: metricValue,
					timeUnixNano: Date.now() * 1000000,
					attributes: [
						{
							key: "source",
							value: { stringValue: config.metrics.source },
						},
					],
				},
			],
			...(type !== "sum"
				? {}
				: {
						aggregationTemporality: "AGGREGATION_TEMPORALITY_CUMULATIVE",
						isMonotonic: true,
				  }),
		},
	};
}

function sendMetricToGrafana(metrics) {
	const metric = { resourceMetrics: [{ scopeMetrics: [{ metrics }] }] };
	const body = JSON.stringify(metric);
	fetch(`${config.metrics.url}`, {
		method: "POST",
		body: body,
		headers: {
			Authorization: `Bearer ${config.metrics.appKey}`,
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			if (!response.ok) {
				response.text().then((text) => {
					console.error(
						`Failed to push metrics data to Grafana: ${text}\n${body}`
					);
				});
			}
		})
		.catch((error) => {
			console.error("Error pushing metrics:", error);
		});
}

module.exports = { metricsRouter, sendMetricsPeriodically };
