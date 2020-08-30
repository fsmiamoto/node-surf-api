import { InternalError } from "@src/util/internal-error";
import config, { IConfig } from "config";
import * as HTTPUtil from "@src/util/request";

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      "Unexpected error when trying to communicate to StormGlass";
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      "Unexpected error returned by the StormGlass service";
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  "App.resources.StormGlass"
);

export class StormGlass {
  readonly apiParams =
    "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed";
  readonly apiSource = "noaa";

  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get("apiUrl")}/weather/point?params=${
          this.apiParams
        }&source=${this.apiSource}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get("apiToken"),
          },
        }
      );
      return this.normalizeResponse(response.data);
    } catch (err) {
      if (HTTPUtil.Request.isRequestError(err)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${
            err.response.status
          }`
        );
      }
      throw new ClientRequestError(err.message);
    }
  }

  private normalizeResponse(points: StormGlassForecastResponse) {
    return points.hours
      .filter((p) => this.isValidPoint(p))
      .map((point) => ({
        swellDirection: point.swellDirection[this.apiSource],
        swellHeight: point.swellHeight[this.apiSource],
        swellPeriod: point.swellPeriod[this.apiSource],
        time: point.time,
        waveDirection: point.waveDirection[this.apiSource],
        waveHeight: point.waveHeight[this.apiSource],
        windDirection: point.windDirection[this.apiSource],
        windSpeed: point.windSpeed[this.apiSource],
      }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>) {
    return !!(
      point.time &&
      point.swellDirection?.[this.apiSource] &&
      point.swellHeight?.[this.apiSource] &&
      point.swellPeriod?.[this.apiSource] &&
      point.waveDirection?.[this.apiSource] &&
      point.waveHeight?.[this.apiSource] &&
      point.windDirection?.[this.apiSource] &&
      point.windSpeed?.[this.apiSource]
    );
  }
}
