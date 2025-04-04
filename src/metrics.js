// const os = require("os");
const config = require("./config");

// function _getCpuUsagePercentage() {
// 	const cpuUsage = os.loadavg()[0] / os.cpus().length;
// 	return cpuUsage.toFixed(2) * 100;
// }

// function _getMemoryUsagePercentage() {
// 	const totalMemory = os.totalmem();
// 	const freeMemory = os.freemem();
// 	const usedMemory = totalMemory - freeMemory;
// 	const memoryUsage = (usedMemory / totalMemory) * 100;
// 	return memoryUsage.toFixed(2);
// }
function sendMetricsPeriodically(period) {
	return setInterval(() => {
		try {
			const metrics = [];
			metrics.push(...httpMetrics());
			metrics.push(...systemMetrics());
			metrics.push(...userMetrics());
			metrics.push(...purchaseMetrics());
			metrics.push(...authMetrics());
			sendMetricToGrafana(metrics);
		} catch (error) {
			console.log("Error sending metrics", error);
		}
	}, period);
}
function sendMetricToGrafana(metrics) {
	const metric = { resourceMetrics: [{ scopeMetrics: [{ metrics }] }] };

	// if (type === "sum") {
	// 	metric.resourceMetrics[0].scopeMetrics[0].metrics[0][
	// 		type
	// 	].aggregationTemporality = "AGGREGATION_TEMPORALITY_CUMULATIVE";
	// 	metric.resourceMetrics[0].scopeMetrics[0].metrics[0][
	// 		type
	// 	].isMonotonic = true;
	// }

	const body = JSON.stringify(metric);
	fetch(`${config.url}`, {
		method: "POST",
		body: body,
		headers: {
			Authorization: `Bearer ${config.apiKey}`,
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
			} else {
				console.log(`Pushed all metrics`);
			}
		})
		.catch((error) => {
			console.error("Error pushing metrics:", error);
		});
}

function metricObj(metricName, metricValue, type, unit) {
	return {
		name: metricName,
		unit: unit,
		[type]: {
			dataPoints: [
				{
					asInt: metricValue,
					timeUnixNano: Date.now() * 1000000,
				},
			],
		},
	};
}

function httpMetrics() {
	const metrics = [];
	for (let key in httpReq) {
		metrics.push(
			metricObj("http_" + key.toLowerCase(), httpMetrics[key], "sum", 1)
		);
		httpReq[key] = 0;
	}
	return metrics;
}
function systemMetrics() {
	return [];
}
function userMetrics() {
	return [];
}
function purchaseMetrics() {
	return [];
}
function authMetrics() {
	return [];
}
let httpReq = { GET: 0, POST: 0, PUT: 0, DELETE: 0, TOTAL: 0 };
function requestTracker(req, _res, next) {
	httpReq[req.method]++;
	httpReq.TOTAL++;
	next();
}

module.exports = { requestTracker, sendMetricsPeriodically };
