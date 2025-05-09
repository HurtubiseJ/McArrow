import { getDistance } from '@/lib/locationUtil';
import { getNearestLocation } from '@/lib/locationUtil';

it('Check getDistance util, takes two locations and returns a distance', async () => {
    // Class northfield location
    const startLocationLatitude = 44.46129320539737;
    const startLocationLongitude = -93.15293492654509;

    const endLocationLatitude = 44.4486537;
    const endLocationLongitude = -93.17010599999999;

    // Expect the northfield Mcdonalds location
    const dist = await getDistance(startLocationLatitude, startLocationLongitude, endLocationLatitude, endLocationLongitude);
    console.log(dist);
    expect(dist).toBeCloseTo(1.957739855588045, 1)
});


