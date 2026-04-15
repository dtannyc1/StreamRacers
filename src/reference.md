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

## Racer
- Add more options for color changer
  - use a slider to adjust tolerance. Swap to the complimentary color to show the effect well. 
  - Make sure to undo the color swap when color picker is enabled
- Add global vehicles
  - Allows for some vehicles to be used for all users
    - Add limiting options for global vehicles (ie one user per race has this vehicle)
    - Add percentage chance of change
- when editing or adding a car, an actual track should be used as the background so users can see how the car will look on the road.

## Track 
- Add alignment image (aka screenshot of stream). Should always be rendered first and semi-transparent.
- Add toggle to enable/disable track scrolling
  - need to change how bg/fg assets are rendered...
  - need to fix scrolling asset rendering
- Organize background assets into layers? 
  - Change logic to accept a depth range, min max slider, value from 0-10, use that for parallaxFactor instead

- Add road assets
  - drawn under cars but scrolls like the scrolling layer
  - Note: can't add these to background assets with negative heights because of parallax speed
  
## Settings
- Add more default settings
  - Enable/disable boost functionality

## Home Page
- Add animation to home page with sample cars. demo should swap between maps/cars randomly
