import { StormGlass, ForecastPoint } from "@src/clients/stormGlass";
import { Beach } from "@src/models/beach";
import { InternalError } from "@src/util/internal-error";

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export interface BeachForecast extends Omit<Beach, "user">, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const forecasts: BeachForecast[] = [];

    for (const beach of beaches) {
      try {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        forecasts.push(...this.enrichPointsWithBeachData(points, beach));
      } catch (error) {
        throw new ForecastProcessingInternalError(error.message);
      }
    }

    return this.mapForecastByTime(forecasts);
  }

  private enrichPointsWithBeachData(
    forecastPoints: ForecastPoint[],
    beach: Beach
  ) {
    return forecastPoints.map((e) => ({
      lat: beach.lat,
      lng: beach.lng,
      name: beach.name,
      position: beach.position,
      rating: 1, //TODO: Implement this
      ...e,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }

    return forecastByTime;
  }
}
