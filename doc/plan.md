# McArrow Project Plan

### Description

The main component of the application will be the gyroscoping arrow pointing towards the nearest selected
restaurant. After completing this goal, we will have the foundation of the front end set up and can move on to adding additional features. Some features could include: a map overlay to display your path after arriving at the store, a scoring system based on path straitness, speed, and distance, as well as leaderboards and friend request system to view other users activity.

We want to keep the app GUI as simple as possible just focusing on the arrow component. The goal is for the user to open the app and the arrow to start pointing in the correct direction. We don't want the user to use this as a navigation app, more as a "look at this cool app I downloaded that points to the nearest X".  The app should load quickly so the user can pull it out, show someone and then put it away as they please. There will be no menu option and switching to other pages will be done through swiping or shaking the device. This will allow for a concise user experience focused on following the arrow! Other features will appear as add-ons to the application.

### Learning Goals
- Become more confortable with front end styling in React Native.
- Develope familiarity with using Expo with React Native to impliment, test, and release across different platforms.
- Begin learning Rust and specifically using Axum/Tokio as a backend framework.
- Learn more about networking concepts through Rust backend.
- Further skills in creating user centered applications. 

### Goals

- Create a MVP application quickly which will have core features implemented. (Gyroscopic arrow, clean UI)
- Additional features post MVP
  - Additional restaurants
  - Double tapping (?) the arrow leads to opening the users map application with directions to the restaurant
  - Path tracking via native map API's
  - User percistance through rust backend
  - Scoring system
  - Rewards popup
  - Ads at the bottom of the screen
  - Leader boards

### Features

- Arrow which points towards the nearest selected restaurant, eg. McDonalds.
- Path tracking via native map libraries to show path to restaurant after completion.
- Scoring mechanism based on speed and straitness of path.
- Leader board of other users to given restaurant.
- User percistance and management via rust backend
- Reach Goals:
  - Schedule competitions, friend requests, automatic code pull up on arrival

### Architecture

# Front End

- Using React Native with Expo
  - Provides tools such as expo-sensors to allow use of native iOS and Android gyroscopic libraries
  - Using expo-maps to access native map API's on both iOS and Android
- React Native code will be writen in TypeScript (TSX - Incorperated Native compnents to TypeScript)

# Back End

- Axium Rust backend library
- Provides building blocks and libraries to implement async applications

### Schedule

- Sprint 1: App has an arrow on the screen
- Sprint 2/3: Arrow on the screen always points north
- Sprint 3/4: Arrow points towards nearest McDonalds location
- Sprint 4/5: User can swipe to switch which restaurant they want to point to, and can set a list of preferred restaurants to swipe through.

### Worries

- Being able to access and manage native map and gyroscope libraries in one codebase. Will be reliant on
  quality of expo packages
- Learning Rust and being able to implement a backend quickly.
- Is Rust a good tool for the job? Should we use something else?
- User data security relating to JWT Auth, password/email storage, location data.
- Scaling the app as user base grows (will it cost $ to keep app running if we are storing all this data vs just having the arrow)

### Communication Plan

- We plan on using iMessage and Slack to communicate

### Equal Contribution Plan

- We have previous experience working in groups (we were also partners in normal Software Design) so we are going to leverage our previous experience to make sure both group members contribute equally.
- If any team member is not contributing equally, we will have a discussion about it and if it continues we will bring it up to the professor.
