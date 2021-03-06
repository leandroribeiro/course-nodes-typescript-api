import { Beach, GeoPosition } from '@src/models/beach';
import { ForecastPoint } from '@src/clients/stormGlass';

const WaveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: Beach) {}

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): number {
    if (wavePosition == windPosition) return 1;
    else if (this.isWindOffshore(wavePosition, windPosition)) return 5;
    return 3;
  }

  private isWindOffshore(
    waveDirection: GeoPosition,
    windDirection: GeoPosition
  ) {
    // return (
    //   (waveDirection === BeachPosition.N &&
    //     windDirection === BeachPosition.S &&
    //     this.beach.position === BeachPosition.N) ||
    //   (waveDirection === BeachPosition.S &&
    //     windDirection === BeachPosition.N &&
    //     this.beach.position === BeachPosition.S) ||
    //   (waveDirection === BeachPosition.E &&
    //     windDirection === BeachPosition.W &&
    //     this.beach.position === BeachPosition.E) ||
    //   (waveDirection === BeachPosition.W &&
    //     windDirection === BeachPosition.E &&
    //     this.beach.position === BeachPosition.W)
    // );

    return (
      ('NESW'.indexOf(waveDirection) + 'NESW'.indexOf(windDirection)) % 2 == 0
    );
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period < 7) return 1;
    if (period < 10) return 2;
    if (period < 14) return 4;

    return 5;

    // const rating = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 5];
    // return rating[period > 14 ? 14 : period];
  }

  public getRatingForSwellSize(height: number): number {
    if (height < WaveHeights.ankleToKnee.min) return 1;
    if (height < WaveHeights.ankleToKnee.max) return 2;
    if (height < WaveHeights.waistHigh.max) return 3;

    return 5;
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates < 50) return GeoPosition.N;
    if (coordinates < 120) return GeoPosition.E;
    if (coordinates < 220) return GeoPosition.S;
    if (coordinates < 310) return GeoPosition.W;

    return GeoPosition.N;
  }

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);

    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    );
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);

    return Math.round(
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3
    );
  }
}
