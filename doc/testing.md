# McArrow Testing Doc

## Unit tests
    - We will use the React Native Testing library to write our tests. Default
      react native apps come with this library already installed. This will
      allow us to impliment functional and frontend formatting tests. For more
      diffcult features we might need to move to React Native Jest which provides
      additional testing features.

    - Unit tests will cover small integral components to our app, this includes:
        - Native location services, gyroscope, latitude, longitude
        - Bearing calculation
        - Google API service
        - Path tracking 
        - Path scoring
        
    - Because there is no "right answer" to most of the things we would test (Ex. the coordinates we pull from the device will constantly change) I think most of our tests will just make sure that the API calls are returns data in the correct format and not necessarily the correct data.
        

## Manual tests
    - Navigation and button presses
    - User login (Can also be automated as unit test)
    - Making sure our arrow is actually pointing to the closest restaurant. 


## Testing Assignment 5/13

### Tools 
We are using the Jest library and some built in react native tools for testing.

### Testing Code 
All of our testing code is in FrontendRN/__tests__/ directory 
'cd FrontendRN/__tests__/' 

### Guide to Running Tests 
1) Navigate to FrontendRN Directory 
'cd FrontendRN' 
2) Run tests 
'npm test' 

### Manual Testing Guide 
1) Start the app using expo, and open on your phone by scanning the QR code
'npx expo start --clear' 
2) The first page should be McDonalds
3) Tap the screen, make sure the timer and stop button appear in the top right
4) Tap the stop button, then repeat step three and make sure the timer has reset to 0:00
5) Pull up google maps on a seperate device and make sure the arrow is pointing in generally the right direction
6) Repeat for all locations

### Additional Testing
1) Some sort of automated swiping through the pages of our app
2) Some sort of simulated path that we can test the map with 

