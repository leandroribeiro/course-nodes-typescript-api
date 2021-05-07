import { Beach, BeachPosition } from '@src/models/beach';

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
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): number {
    if (wavePosition == windPosition) return 1;
    else if (this.isWindOffshore(wavePosition, windPosition)) return 5;
    return 3;
  }

  private isWindOffshore(
    waveDirection: BeachPosition,
    windDirection: BeachPosition
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
    if (period >= 7 && period < 10) {
      return 2;
    }

    if (period >= 10 && period < 14) {
      return 4;
    }
    if (period >= 14) {
      return 5;
    }

    return 1;

    // const rating = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 5];
    // return rating[period > 14 ? 14 : period];
  }

  public getRatingForSwellSize(height: number): number {
    if (
      height >= WaveHeights.ankleToKnee.min &&
      height < WaveHeights.ankleToKnee.max
    ) {
      return 2;
    }

    if (
      height >= WaveHeights.waistHigh.min &&
      height < WaveHeights.waistHigh.max
    ) {
      return 3;
    }

    if (height >= WaveHeights.headHigh.min) {
      return 5;
    }

    return 1;
  }

  public getPositionFromLocation(coordinates: number): BeachPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return BeachPosition.N;
    }

    if (coordinates >= 50 && coordinates < 120) {
      return BeachPosition.E;
    }

    if (coordinates >= 120 && coordinates < 220) {
      return BeachPosition.S;
    }

    if (coordinates >= 220 && coordinates < 310) {
      return BeachPosition.W;
    }

    return BeachPosition.E;
  }
}
