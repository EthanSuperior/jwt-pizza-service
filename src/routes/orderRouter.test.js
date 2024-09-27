const { Role, DB } = require("../database/database.js");
const request = require("supertest");
const app = require("../service.js");
const config = require("../config.js");

const jwtMatchRegExp = /^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/;

let adminUser;
let adminUserToken;
let franchise;
let store;
let menu;
let order;

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
expect.extend({
	toContainObject(received, argument) {
		const pass = this.equals(
			received,
			expect.arrayContaining([expect.objectContaining(argument)])
		);

		if (pass) {
			return {
				message: () =>
					`expected ${this.utils.printReceived(
						received
					)} not to contain object ${this.utils.printExpected(argument)}`,
				pass: true,
			};
		} else {
			return {
				message: () =>
					`expected ${this.utils.printReceived(
						received
					)} to contain object ${this.utils.printExpected(argument)}`,
				pass: false,
			};
		}
	},
});

beforeAll(async () => {
	config.db.connection.database = "pizzatest";
	const loginRes = await request(app)
		.put("/api/auth")
		.send(await createAdminUser());
	expect(loginRes.status).toBe(200);
	adminUser = loginRes.body.user;
	adminUserToken = loginRes.body.token;

	franchise = { name: randomName(), admins: [{ email: adminUser.email }] };
	store = { name: randomName() };

	const addReq = await request(app)
		.post("/api/franchise")
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send(franchise);
	expect(addReq.status).toBe(200);
	franchise.id = addReq.body.id;

	const addRes = await request(app)
		.post("/api/franchise/" + franchise.id + "/store")
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send(store);
	expect(addRes.status).toBe(200);
	store.id = addRes.body.id;
	let rand = randomName();
	menu = {
		title: rand,
		description: rand,
		image: rand + ".png",
		price: 42.01,
	};
});

test("Add Menu Item", async () => {
	const addRes = await request(app)
		.put("/api/order/menu")
		.set("Authorization", `Bearer ${adminUserToken}`)
		.send(menu);
	expect(addRes.status).toBe(200);
	menu.id = addRes.body.id;
	// expect(addRes.body.title).toBe(menu.name);
	// console.log(addRes.body);
	// expect(addRes.body.description).toBe(menu.description);
});

test("Get Menu", async () => {
	const listRes = await request(app).get("/api/order/menu").send();
	expect(listRes.status).toBe(200);
	// expect(listRes.body).toContainObject(menu);
});

test("Add Order", async () => {});

test("Get Order", async () => {});
/*
  {
    method: 'PUT',
    path: '/api/order/menu',
    requiresAuth: true,
    description: 'Add an item to the menu',
    example: `curl -X PUT localhost:3000/api/order/menu -H 'Content-Type: application/json' -d '{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }'  -H 'Authorization: Bearer tttttt'`,
    response: [{ id: 1, title: 'Student', description: 'No topping, no sauce, just carbs', image: 'pizza9.png', price: 0.0001 }],
  },
  {
    method: 'GET',
    path: '/api/order',
    requiresAuth: true,
    description: 'Get the orders for the authenticated user',
    example: `curl -X GET localhost:3000/api/order  -H 'Authorization: Bearer tttttt'`,
    response: { dinerId: 4, orders: [{ id: 1, franchiseId: 1, storeId: 1, date: '2024-06-05T05:14:40.000Z', items: [{ id: 1, menuId: 1, description: 'Veggie', price: 0.05 }] }], page: 1 },
  },
  {
    method: 'POST',
    path: '/api/order',
    requiresAuth: true,
    description: 'Create a order for the authenticated user',
    example: `curl -X POST localhost:3000/api/order -H 'Content-Type: application/json' -d '{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}'  -H 'Authorization: Bearer tttttt'`,
    response: { order: { franchiseId: 1, storeId: 1, items: [{ menuId: 1, description: 'Veggie', price: 0.05 }], id: 1 }, jwt: '1111111111' },
  },
];
*/
