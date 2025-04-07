const express = require("express");
const os = require("os");
const config = require("./config");
const metricsRouter = express.Router();
const Logger = require("pizza-logger");
const logger = new Logger(config);

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
			logger.log("warn", "metrics", "Error sending metrics", error);
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

let activeUsers = 0;
function userMetrics() {
	return [metricObj("active_users", activeUsers, "sum", "1")];
}

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
	return metrics;
}

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

metricsRouter.use((req, res, next) => {
	httpReq[req.method]++;
	httpReq.TOTAL++;
	const startTime = Date.now();
	const originalSend = res.send;
	res.send = function (data) {
		if (req.originalUrl === "/api/auth") {
			if (req.method == "POST" || req.method == "PUT") {
				if (res.statusCode === 200) {
					activeUsers++;
					authSucesses++;
				} else authFailures++;
			} else if (req.method == "DELETE" && res.statusCode === 200)
				activeUsers--;
		} else if (req.originalUrl === "/api/order") {
			if (req.method == "POST") {
				if (res.statusCode !== 200) pizzasFailed++;
				else {
					try {
						pizzasSold += data.order.items.length;
						pizzaRevenue += data.order.items.reduce(
							(a, v) => a + parseFloat("" + v.price),
							0
						);
					} catch {
						console.error("");
					}
				}
				latencyPizza += (Date.now() - startTime) / 100;
			}
		}
		latencyServer += Date.now() - startTime;
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
					logger.log(
						"warn",
						"metrics",
						`Failed to push metrics data to Grafana: ${text}\n${body}`
					);
				});
			}
		})
		.catch((error) => {
			logger.log("warn", "metrics", "Error pushing metrics:", error);
		});
}

module.exports = { metricsRouter, sendMetricsPeriodically };
