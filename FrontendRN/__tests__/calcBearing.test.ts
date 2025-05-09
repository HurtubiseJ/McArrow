
import calcBearing from '@/lib/locationUtil';
import { getNearestLocation } from '@/lib/locationUtil';

it('Checks the angle between two known points', async () => { 
    // Class northfield location
    const startLocationLatitude = 44.46129320539737;
    const startLocationLongitude = -93.15293492654509;
    const keyWord = "McDonalds";

    const location = await getNearestLocation(startLocationLatitude, startLocationLongitude, keyWord);

    // get bearing
    const bearing = calcBearing(
        startLocationLatitude,
        startLocationLongitude,
        location.lat,
        location.lng
    );

    // Test expected bearing
    expect(bearing).toBeCloseTo(224.12517011791283, 2);
});
