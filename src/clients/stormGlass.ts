import { InternalError } from '@src/util/erros/internal-error';
import * as HTTPUtil from '@src/util/request';
import config, { IConfig } from 'config';

export interface StormGlassPointSource {
  //[key: string]: number;
  noaa: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
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
    const internalMessage = `Unexpected error when trying to communicate to StormGlass`;
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stromGlassAPISource = 'noaa';

  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get('apiUrl')}/weather/point?params=${
          this.stormGlassAPIParams
        }&source=${
          this.stromGlassAPISource
        }&end=1592113802&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apiToken'),
          },
        }
      );

      return this.normalizeResponse(response.data);
    } catch (err) {
      console.error(err);
      if (HTTPUtil.Request.isRequestError(err))
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${
            err.response.status
          }`
        );

      throw new ClientRequestError(err.message);
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stromGlassAPISource],
      swellHeight: point.swellHeight[this.stromGlassAPISource],
      swellPeriod: point.swellPeriod[this.stromGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stromGlassAPISource],
      waveHeight: point.waveHeight[this.stromGlassAPISource],
      windDirection: point.windDirection[this.stromGlassAPISource],
      windSpeed: point.windSpeed[this.stromGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stromGlassAPISource] &&
      point.swellHeight?.[this.stromGlassAPISource] &&
      point.swellPeriod?.[this.stromGlassAPISource] &&
      point.waveDirection?.[this.stromGlassAPISource] &&
      point.waveHeight?.[this.stromGlassAPISource] &&
      point.windDirection?.[this.stromGlassAPISource] &&
      point.windSpeed?.[this.stromGlassAPISource]
    );
  }
}
