## Projects

1) McArrow - An app that shows an arrow that points to the nearest McDonalds.
2) Baseball Recruiting Site - A hub for recruits to post their accomplishments and recruiters to find them.
3) Kalshi Trading Interface - Make a user interface for trading on Kalshi.
4) Rewards Code Launcher - Automatically pull up your rewards code when you enter restaurants.

### McArrow

We really like this idea and are thinking of pursuing it!

Minimum viable product: one screen with an arrow that always points to the nearest McDonalds
Additional Features:

- Option to switch so it points to the nearest Taco Bell, Wendys, Chipotle, etc...
- Track highscores of who can stay on the straightest path to said restaurant

I think the most challenging part of this project will be interacting with the iOS API and finding the devices orientation. I am not sure how to do this but sure there are plenty of ways to do this.

Our front-end will be built with REACT-Native and our back end will be written in Rust (maybe Python depending on how hard Rust is)

### Rewards Code Launcher

App that runs in the background and automatically opens your rewards code when you walk into a restaurant.

I think making an app that runs efficiently in the background might be challenging, I'm not sure if there are techniques for making these apps but it seems unlikely that running something in the background means a constant loop. I also think getting location data from the device might be challenging.

Similar to above, we would use REACT-Native on the front-end and Rust on the back-end.
