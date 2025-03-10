This is a functional repository for AnimeRumble v1
It is no longer maintained. Uploaded as reference.

To run this version, you will need an active MongoDB instance running and set it up on a config.js file to be located in root.

Config to be written something like this:

```
let credentials = {}

credentials.mongodb = "mongodb://user:password@mongodbinstance/database"

module.exports = credentials
```