# ractive-timeout-transition
Ractive.js port of [`timeout-transition-group`](https://github.com/Khan/react-components/blob/master/js/timeout-transition-group)

**Note: I wouldn't recommend to use this plugin in its current state in production as it hasn't been thoroughly tested.**

# How to use

First you need to register the plugin to your ractive instance.

```
Ractive.transitions.timeoutTransition = require('ractive-timeout-transition');
```

Then use it inside your templates:

```
<div class="foo" intro-outro='timeoutTransition: {name: "foo", enterTimeout: 250, leaveTimeout: 250}'>
  ...
</div>
```

This will generate the following class names when the node enters and leaves:

**Enter class names:**

`foo--enter` `foo--enter-active`

**Leave class names:**

`foo--leave` `foo--leave-active`

