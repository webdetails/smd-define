# Yet Another Synchronous (A)MD JS Loader

A lightweight synchronous AMD module loader.

Follows the amdjs spec: https://github.com/amdjs/amdjs-api/wiki

Features that are not implemented:
* sniffing the factory function for `require` argument and inline `require` calls.
* require.toUrl
* path normalization, loading of an url only once.
* stricter signature of `require`.

Also, needs many more tests.

Test it:
```
$ karma start
```