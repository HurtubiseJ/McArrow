# McArrow Project Plan 

### Description
The main component of the application will be the gyroscoping arrow pointing towards the nearest selected
resturant. In compeleting this goal we will have the foundation of the front end set up. After which we
will be able to begin working on additional features. This will include map overlay to display your path,
a scoring system based on path straitness, speed, and distance, as well as leaderboards and friend request 
to view other users activity.

We want to keep the app GUI as simple as possible just focusing on the arrow component. There will be no menu option
and switching to other pages will be done through swiping or haptic input. This will allow for a concise user 
experience focused on following the arrow! Other features will appear as addons to the application.

### Goals 
- Create a MVP application quickly which will have core features implimented. (Gyroscopic arrow, clean UI)
- After MVP product continue to add features:
    - Path tracking via native map API's
    - User persitance through rust backend
    - Scoring system
    - Leader boards ext...

### Features 
- Arrow which points towards the nearest selected resturant, eg. McDonalds.
- Path tracking via native map libraries to show path to resturant after completion. 
- Scoring mechanism based on speed and straitness of path.
- Leader board of other users to given resturant.
- User percistance and management via rust backend
- Reach Goals:
    - Schedule competitions, friend requests, automatic code pull up on arival

### Architecture
# Front End
    - Using React Native with Expo
        - Provides tools such as expo-sensors to allow use of native iOS and Android gyroscopic libraries
        - Using expo-maps to access native map API's on both iOS and Android
    - React Native code will be writen in TypeScript (TSX - Incorperated Native compnents to TypeScript)

# Back End
    - Axium Rust backend library 
    - Provides building blocks and libraries to impliment asyncrinous applications

### Schedule 

### Worries 
- Being able to access and manage native map and gyroscope libraries in one codebase. Will be reliant on 
  quality of expo packages
- Learing Rust and being able to impliment a backend quickly. 
- User data secruity relating to JWT Auth, password/email storage, location data.

### Communication Plan 
    - Slack and messaging GC

### Equal Contribution Plan 
