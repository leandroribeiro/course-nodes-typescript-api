import { StormGlass } from '@src/clients/stormGlass';
import * as stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedHoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request';
import CacheUtil from '@src/util/cache';

// jest.mock('axios');
jest.mock('@src/util/request');
jest.mock('@src/util/cache');

describe('StormGlass client', () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  // const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  const MockedCacheUtil = CacheUtil as jest.Mocked<typeof CacheUtil>;


  it('should return the normalize forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture,
    } as HTTPUtil.Response);

    // const stormGlass = new StormGlass(mockedRequest);
    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
    const response = await stormGlass.fetchPoints(lat, lng);

    //    expect([0,0,0]).toBe([0, 0, 0]);
    //    expect([0,0,0]).toEqual([0, 0, 0]);
    expect(response).toStrictEqual(stormGlassNormalizedHoursFixture);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00+00:00',
        },
      ],
    };

    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HTTPUtil.Response);

    //const stormGlass = new StormGlass(mockedRequest);
    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toStrictEqual([]);
  });

  it('should get the normalized forecast points from cache and use it to return data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: null,
    } as HTTPUtil.Response);

    MockedCacheUtil.get.mockReturnValue(stormGlassNormalizedHoursFixture);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalizedHoursFixture);
  })

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    mockedRequest.get.mockRejectedValue(new Error('Network Error'));

    //const stormGlass = new StormGlass(mockedRequest);
    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error ', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue(({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit reached'],
        },
      },
    } as unknown) as HTTPUtil.Response);

    //const stormGlass = new StormGlass(mockedRequest);
    MockedCacheUtil.get.mockReturnValue(undefined);

    const stormGlass = new StormGlass(mockedRequest, MockedCacheUtil);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
