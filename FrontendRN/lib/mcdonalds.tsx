// USED https://github.com/0neDrop/mcdonalds-api/tree/master/src converted to tsx. 
// Have not tested!!!

const API_URL = 'https://www.mcdonalds.com/googleappsv2/geolocation';

export async function getNearestMDLocation(longitude: number, laditude: number) {
    try{
        const fetchNearestLocation = async (
            latitude: number,
            longitude: number
          ): Promise<any> => {
            const params = new URLSearchParams({
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              radius: '8.045',
              maxResults: '1',
              country: 'us',
              language: 'en-us',
            });
          
            const response = await fetch(`${API_URL}?${params.toString()}`);
          
            if (!response.ok) {
              throw new Error(`Error fetching data: ${response.status}`);
            }
          
            const data = await response.json();
            if (data.features.length < 1) {
                console.log("No results");
                return 
            }
            return data.features[0];
          };
          
    } catch {
        console.log("Error fetching McDonalds location");
        return
    }
}