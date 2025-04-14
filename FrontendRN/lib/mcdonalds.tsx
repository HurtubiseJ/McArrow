// USED https://github.com/0neDrop/mcdonalds-api/tree/master/src converted to tsx. 
// Have not tested!!!

const API_URL = 'https://www.mcdonalds.com/googleapps/GoogleRestaurantLocAction.do?method=searchLocation';
const MCDONALDS_LOCATION_API_URL = 'https://www.mcdonalds.com/googleapps/GoogleRestaurantLocAction.do?method=searchLocation' +
					'&latitude={lat}&longitude={lng}&radius={radius}&maxResults={count}&language=en&country={region}'

export async function getNearestMDLocation(longitude: number, latitude: number) {
    try{
        const fetchNearestLocation = async (
            lat: number,
            lng: number
          ): Promise<any> => {
            const radius = 10;
            const keyWord = "McDonalds";
            const location = latitude.toString() + "," + longitude.toString();
            const type = "restaurant";
            const key = "API_KEY";
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyWord}&location=${location}&radius=${radius}&type=${type}&key=${key}`;

            return radius;
          };
    } catch {
        console.log("Error fetching McDonalds location");
        return
    }
}