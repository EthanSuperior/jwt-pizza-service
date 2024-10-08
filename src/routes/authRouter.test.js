/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/

const request = require("supertest");
const app = require("../service.js");
const config = require("../config.js");

const testUser = { name: "pizza diner", email: "reg@test.com", password: "a" };
const jwtMatchRegExp = /^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/;

let testUserAuthToken;
let testUserId;

beforeAll(async () => {
	config.db.connection.database = "pizzatest";
	testUser.email = Math.random().toString(36).substring(2, 12) + "@test.com";
	const registerRes = await request(app).post("/api/auth").send(testUser);
	testUserAuthToken = registerRes.body.token;
	testUserId = registerRes.body.user.id;
	expect(testUserAuthToken).toMatch(jwtMatchRegExp);
});

test("login", async () => {
	const loginRes = await request(app).put("/api/auth").send(testUser);
	expect(loginRes.status).toBe(200);
	expect(loginRes.body.token).toMatch(jwtMatchRegExp);

	const user = {
		name: testUser.name,
		email: testUser.email,
		roles: [{ role: "diner" }],
	};
	expect(loginRes.body.user).toMatchObject(user);
});

test("update require auth", async () => {
	const updateRes = await request(app)
		.put("/api/auth/" + testUserId)
		.send(testUser);
	expect(updateRes.status).toBe(401);
	expect(updateRes.body).toMatchObject({ message: "unauthorized" });
});

test("update", async () => {
	const updateRes = await request(app)
		.put("/api/auth/" + testUserId)
		.set("Authorization", `Bearer ${testUserAuthToken}`)
		.send(testUser);
	expect(updateRes.status).toBe(200);
	expect(updateRes.body.name).toBe(testUser.name);
	expect(updateRes.body.email).toBe(testUser.email);
});

test("logout require auth", async () => {
	const logoutRes = await request(app).delete("/api/auth").send(testUser);
	expect(logoutRes.status).toBe(401);
	expect(logoutRes.body).toMatchObject({ message: "unauthorized" });
});

test("logout", async () => {
	const logoutRes = await request(app)
		.delete("/api/auth")
		.set("Authorization", `Bearer ${testUserAuthToken}`)
		.send(testUser);
	expect(logoutRes.status).toBe(200);
	expect(logoutRes.body).toMatchObject({ message: "logout successful" });
});
