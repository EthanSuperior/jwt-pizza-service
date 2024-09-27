const { Role, DB } = require("../database/database.js");
const request = require("supertest");
const app = require("../service.js");
const config = require("../config.js");

const jwtMatchRegExp = /^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/;

let adminUser;
let adminUserToken;

function randomName() {
	return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
	let user = { password: "toomanysecrets", roles: [{ role: Role.Admin }] };
	user.name = randomName();
	user.email = user.name + "@admin.com";

	await DB.addUser(user);

	user.password = "toomanysecrets";
	return user;
}

beforeAll(async () => {
	config.db.connection.database = "pizzatest";
	const loginRes = await request(app).put("/api/auth").send(createAdminUser());
	expect(loginRes.status).toBe(200);
	adminUser = loginRes.body.user;
	adminUserToken = loginRes.body.token;
});

test("list franchises", async () => {
	const listRes = await request(app).get("/api/franchise").send();
	expect(listRes.status).toBe(200);
	console.log(listRes.body);
	// response: [{ id: 1, name: 'pizzaPocket', stores: [{ id: 1, name: 'SLC' }] }];
});
/*
test("list user's franchise", async () => {
	const listRes = await request(app)
		.get("/api/franchise/" + adminUser.id)
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send();
	expect(listRes.status).toBe(200);
	console.log(listRes.body);
	// response: [{ id: 2, name: 'pizzaPocket', admins: [{ id: 4, name: 'pizza franchisee', email: 'f@jwt.com' }], stores: [{ id: 4, name: 'SLC', totalRevenue: 0 }] }],
});
test("create new franchise", async () => {
	const listRes = await request(app)
		.post("/api/franchise")
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send();
	// send '{"name": "pizzaPocket", "admins": [{"email": "f@jwt.com"}]}',
	// response: { name: 'pizzaPocket', admins: [{ email: 'f@jwt.com', id: 4, name: 'pizza franchisee' }], id: 1 },
});
test("remove a franchise", async () => {
	const listRes = await request(app)
		.delete("/api/franchise/" + id)
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send(adminUser);
	// response: { message: 'franchise deleted' },
});
test("create franchise store", async () => {
	const listRes = await request(app)
		.post("/api/franchise/" + id + "/store")
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send(adminUser);
	// send '{"franchiseId": 1, "name":"SLC"}' -H 'Authorization: Bearer tttttt'`,
	// response: { id: 1, franchiseId: 1, name: 'SLC' },
});
test("delete a franchise store", async () => {
	const listRes = await request(app)
		.delete("/api/franchise/" + id + "/store/" + storeId)
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send(adminUser);
	// response: { message: 'store deleted' },
});


*/
