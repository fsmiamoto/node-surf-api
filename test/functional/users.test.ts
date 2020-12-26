import { User } from "@src/models/user";

describe("Users functional test", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("When creating a new user", () => {
    it("should succesuffly create a new user", async () => {
      const newUser = {
        name: "John Doe",
        email: "john@mail.com",
        password: "1234",
      };

      const response = await global.testRequest.post("/users").send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    });

    it("should return 422 when there is a validation error", async () => {
      const newUser = {
        email: "john@gmail.com",
        password: "Password",
      };

      const response = await global.testRequest.post("/users").send(newUser);
      expect(response.status).toBe(422);
      expect(response.body).toEqual(expect.objectContaining({ code: 422 }));
    });

    it("should return 422 when the email already exists", async () => {
      const newUser = {
        email: "john@gmail.com",
        password: "Password",
      };

      const response = await global.testRequest.post("/users").send(newUser);
      expect(response.status).toBe(422);
      expect(response.body).toEqual(expect.objectContaining({ code: 422 }));
    });
  });
});
