Few Reference Links:

- [SE API docs](https://dev.streamelements.com/docs/api-docs/cd02cda5171ea-o-auth2)
- [Twitch API docs](https://dev.twitch.tv/docs/api/reference/#get-users)
- [SE Widget docs](https://dev.streamelements.com/docs/widgets-old/186263f447d1d-custom-widget)


Notes for development:
- Don't save anything. Inputs for images should be links, which they can host on their own Dropbox or whatever. Data should be saved in user's own SE.store.
- Game should have generic functions for drawing images in certain ways. ie spin, oscillate, translate, static, etc
- Data should be stored in a way to know which function to call, then pass in relevant image params as necessary
