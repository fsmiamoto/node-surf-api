import { Beach, BeachPosition } from "@src/models/beach";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json";
import apiForecastResponseForOneBeach from "@test/fixtures/api_forecast_response_1_beach.json";
import nock from "nock";

describe("Beach forecast functional tests", () => {
  beforeEach(async () => {
    await Beach.deleteMany({});
    const beach = new Beach({
      lat: -33.792726,
      lng: 151.289824,
      name: "Manly",
      position: BeachPosition.E,
    });
    await beach.save();
  });

  it("should return a forecast with just a few times", async () => {
    nock("https://api.stormglass.io:443", {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: () => true,
      },
    })
      .defaultReplyHeaders({ "access-control-allow-origin": "*" })
      .get("/v2/weather/point")
      .query({
        lat: "-33.792726",
        lng: "151.289824",
        params: /(.*)/,
        source: "noaa",
      })
      .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await global.testRequest.get("/forecast");
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponseForOneBeach);
  });

  it("should return 500 if something goes wrong during the processing", async () => {
    nock("https://api.stormglass.io:443", {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: () => true,
      },
    })
      .defaultReplyHeaders({ "access-control-allow-origin": "*" })
      .get("/v2/weather/point")
      .query({ lat: "-33.792726", lng: "151.289824" })
      .replyWithError("Something went wrong");

    const { status } = await global.testRequest.get("/forecast");
    expect(status).toBe(500);
  });
});
