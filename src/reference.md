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
- Don't save anything. Inputs for images should be links, which they can host on their own Dropbox or whatever. Data should be saved in user's own SE.store.
- Game should have generic functions for drawing images in certain ways. ie spin, oscillate, translate, static, etc
- Data should be stored in a way to know which function to call, then pass in relevant image params as necessary


# Notes for deployment:
- `npm run dev` to start up local version
- push to main to deploy it on github pages with env vars injected



# Notes for next changes:

## Immediate changes
- allow for image uploads. put them on imgur, add the correct link afterwards. note a restriction of 50 images per hour and file size limits. make sure to show errors where necessary.
- when image is changed, dimensions should change accordingly
- show scaleX scaleY in display, make it a slider, relative to original image size. also include a lock aspect ratio toggle 

## Track stuff
- Need few layers, background, main, foreground
- main should have few requirements
  - start line, finish line, main image minimum
  - if moving main elements, need an option to repeat (ie dashed lines on road)
- background and foreground assets should have min/max sizes
- default track should exist and should be the background of vehicle uploader for scale. The main element of the default track should not be editable, but users should be able to upload background and foreground elements.
- users should be able to adjust the default track.
- when editing or adding a car, an actual track should be used as the background so users can see how the car will look on the road.
  