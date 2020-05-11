Standard express [middleware](https://expressjs.com/en/guide/writing-middleware.html).

Application will include the middleware js files under this directory automatically

```
// example middleware
module.exports = function (req, res, next) {
  console.log('Time:', Date.now())
  next()
};
```
