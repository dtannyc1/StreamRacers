# Few Reference Links:

- [SE API docs](https://dev.streamelements.com/docs/api-docs/cd02cda5171ea-o-auth2)
- [Probably Better SE API docs](https://c4ldas.github.io/streamelements-api/)
- [Twitch API docs](https://dev.twitch.tv/docs/api/reference/#get-users)
- [SE Widget docs](https://dev.streamelements.com/docs/widgets-old/186263f447d1d-custom-widget)


## From SE discord:
The route for kvstore is different. It is https://kvstore.streamelements.com/ and it isn't documented.

To list all the entries:
```
https://kvstore.streamelements.com/v2/channel/ACCOUNT_ID/customWidget
Method: GET
Headers: 
  Accept: application/json
  Authorization: bearer JWT or apikey OVERLAY_TOKEN
```

To list a single key (just add the name of the key at the end)
```
https://kvstore.streamelements.com/v2/channel/ACCOUNT_ID/customWidget.KEY_NAME
Method: GET
Headers: 
  Accept: application/json
  Authorization: bearer JWT or apikey OVERLAY_TOKEN
```

To create/modify a key
```
https://kvstore.streamelements.com/v2/channel/ACCOUNT_ID
Method: PUT
Headers: 
  Accept: application/json
  Content-type: application/json
  Authorization: bearer JWT or apikey OVERLAY_TOKEN
Body: { "key": "customWidget.KEY_NAME", "value": "YOUR_VALUE" }
```

## To get from an JWT token to a apiToken:

Since you have the oAuth/JWT token, you can get theapiToken from /channels/me endpoint.
https://c4ldas.github.io/streamelements-api/#/operations/Get/channels/me
https://api.streamelements.com/kappa/v2/channels/me

Headers should include ``Authorization: Bearer TOKEN``

From there, just use ``Authorization: apikey your_apiToken_here`` on the kvstore alerts endpoint.



# Notes for development:
- Don't save anything. Inputs for images should be links, which they can host on their own Dropbox or whatever. Data should be saved in user's own SE.store. Consider uploading imgur files on the user's behalf. 
- Game should have generic functions for drawing images in certain ways. ie spin, oscillate, translate, static, etc
- Data should be stored in a way to know which function to call, then pass in relevant image params as necessary
- Because it's a static website, there's no way to do socket.io stuff to emit events to streamelements... User will have to manually refresh their browser source in order to get the latest data.

- Loading script directly in SE is working fine, it looks something like
```
<script src="https://dtannyc1.github.io/StreamRacers/tester.js"></script>
```

- There are tools to get user avatars without any authorization stuff.
```
async function getUserAvatar(username) {
  let url = "https://decapi.me/twitch/avatar/" + username;
  return await fetch(url)
    .then(res => {
      if (res.ok) {
        return res.text();
      }
    })
    .then(url => {
      if (url) {
        return url;
      } else {
        return null;
      }
    })
    .catch(err => {
      console.log(err);
      return null;
    });
}
```

- Plenty of user data is given on message recieved
```
Twitch User Display Color: event.data.displayColor
Twitch username: event.data.displayName
Twitch badges: event.data.badges => Array of objects with {type: 'broadcaster' | 'subscriber' | 'moderator'}
```

# Notes for deployment:
- `npm run dev` to start up local version
- push to main to deploy it on github pages with env vars injected



# Notes for next changes:
- Chat commands
  - List my cars
    - Enable/disable command? or leave blank to ignore.
  - Switch my car (!switch car_name)
  - Join with specific car (!join car_name)

## Leaderboard Changes
- Settings for Race history overlay appearance - fonts, colors, etc

## Settings
- Force all users to have one car
  - Big dropdown of all cars with usernames shown?
  - Quick enable/disable button, default disabled

## Racer Editor
- Add y-animation / x-animation to car in general
  - Bounce logic
  - Sinusoid
  - Sawtooth
  - Ensure quick stop/start checkbox, stop should reset it to 0 y-height
  - just ctx.save, translate entire car and ctx.restore at end
  - Store as dXY instead of modifying XY

- Add drag and drop to change layer position

- Add global vehicles
  - Store in separate key
  - CarManager should keep track of how many instances of each global vehicle there is
  - Ensure that objects are fully deep duped before using them so all instances are different
  - Allows for some vehicles to be used for all users
    - Add limiting options for global vehicles (ie one user per race has this vehicle)
    - Add percentage chance of change
  - Where does it go in the dashboard? Should it be its own tab?

- when editing or adding a car, an actual track should be used as the background so users can see how the car will look on the road.

- Add support for custom code animations
  - Consider editing interface when dev mode is enabled so it's clear that it's on
  - Consider - all variables are changed back after draw/update functions?
    - dupe asset, then splat and resave afterwards
    - might not be useful. if user breaks the rendering for that asset, we shouldnt stop them
  - Add universal var for cars in general so custom assets can be synchronized
    - Need to pass in var to all assets
  
- Add import/export function to share cars
  - Save car stuff as json
  - Export entire track data json
  - Allows users to contribute to art

- Add way to quickly duplicate cars
  - consider creating a carTemplate key
    - Clicking a button copies the entire car object into that dict
  - Add a way to load from template to change everything

## Track Editor
- Ensure that all fonts are loaded into Track Editor

- Add toggle to enable/disable track scrolling
  - need to change how bg/fg assets are rendered on track editor
  - need to change scrolling asset rendering on track editor

- Add randomized road assets
  - drawn under cars but scrolls like the scrolling layer
  - Note: can't add these to background assets with negative heights because of parallax speed

## Home Page
- Add animation to home page with sample cars. demo should swap between maps/cars randomly

# Next steps:

## Power-ups
- Users should be able to collect powerups by watching streams
  - Much like pokemon game, random timer to send message while stream is live
  - List of powerups:
    - Initial speed 
      - dont change speed behavior, just use 300 for the speed for the first 2 seconds
    - Cheat
      - finishes first but disqualified from the race?
      - "you cheated and you didnt win?"
    - Bombs 
      - blow up spot behind them, launching them forward and a few users back
      - should it just launch users upwards?
      - how are trajectories determined?
    - Blue shell 
      - travels at a set speed, hits first player, causes their speed to go to 0 or low number
    - Swap place 
      - name a user to swap xy position with. speed doesnt change
      - prevent usage in last 1/3rd seconds of race to prevent steals
  - Settings
    - allow/disallow items
    - settings to control how often messages go out
    - how many users can claim specific items
    - percentage chance of actually getting one of the items
  - how are the items used?
     - user chat command?
       - Need a page to explain the powerups
       - Need a list of commands on a page
     - any chat message?
     - random?
  - how do users check what items they have?
  - how to limit how many powerups a user can have?

## Boost word
- Word find boost game
- Enable/disable boost functionality in Settings (behind feature flag for now)

## Idea/feedback submission
- Form to submit ideas for next changes
  - Should include details of how it works
  - how users interact with it
  - how does the streamer interact with it?