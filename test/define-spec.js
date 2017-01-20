
describe('define', function() {

    beforeEach(function() {
        require.reset();
    });

    it('should be defined globally', function() {
        expect(typeof define).toBe('function');
    });

    it('should allow defining factory modules', function() {
        define('dada/bar', function() {
            return {};
        });
    });

    it('should allow defining constant modules', function() {
        define('dada/bar', {});
    });

    describe("require", function() {
      it('should be defined globally', function() {
          expect(typeof require).toBe('function');
      });

      it('should allow requiring factory modules', function() {
          var A = {};
          define('dada/bar', function() {
              return A;
          });
          require(['dada/bar'], function(A_) {
              expect(A_).toBe(A);
          });
      });

      it('should respect the order of required modules', function() {
          var A = {}, B = {};
          define('dada/bar', function() { return A; });
          define('dada/foo', function() { return B; });

          require(['dada/foo', 'dada/bar'], function(B_, A_) {
              expect(A_).toBe(A);
              expect(B_).toBe(B);
          });

          require(['dada/bar', 'dada/foo'], function(A_, B_) {
              expect(A_).toBe(A);
              expect(B_).toBe(B);
          });
      });

      it('should allow requiring constant modules', function() {
          var A = {};
          define('dada/bar', A);
          require(['dada/bar'], function(A_) {
              expect(A_).toBe(A);
          });
      });

      it('should require a package\'s main.js when the package is requested', function() {
          require.config({
              packages: ['dada']
          });

          var beenHere = false;

          // pretend to be "main.js"
          define('dada/main', function() {
              beenHere = true;
          });

          require('dada');

          expect(beenHere).toBe(true);
      });

      it('should require a package\'s configured main module when the package is requested', function() {
          require.config({
              packages: [
                {
                  name: 'dada',
                  main: 'foo'
                }
              ]
          });

          var beenHere = false;

          // pretend to be "main.js"
          define('dada/foo', function() {
              beenHere = true;
          });

          require('dada');

          expect(beenHere).toBe(true);
      });

      it('should require a package main.js relative dependencies correctly', function() {
          require.config({
              packages: ['dada']
          });

          var foo = {};
          var foo2;
          define('dada/foo', function() { return foo; });

          // pretend to be "main.js"
          define('dada/main', ['./foo'], function(_foo) {
              foo2 = _foo;
          });

          require('dada');

          expect(foo2).toBe(foo);
      });

      describe('require#toUrl', function() {
        it('should be defined in the global require function', function() {
          expect(typeof require.toUrl).toBe('function');
        });

        it('should be defined in contextual require functions', function() {
          define('foo', ['require'], function(contextualRequire) {
            expect(typeof contextualRequire.toUrl).toBe('function');
          });

          require('foo');
        });

        it('should convert a module id to the absolute path built with "baseUrl"', function() {

          require.config({baseUrl: 'http://foo/bar'});

          expect(require.toUrl('a')).toBe('http://foo/bar/a');
        });

        it('should convert a relative module id to the absolute path built with "baseUrl"', function() {

          require.config({baseUrl: 'http://foo/bar'});

          expect(require.toUrl('./a')).toBe('http://foo/bar/a');
        });

        it('should convert a module id to the absolute path when there is no "baseUrl"', function() {
          expect(require.toUrl('a')).toBe('a');
        });

        it('should convert a relative module id to the absolute path when there is no "baseUrl"', function() {
          expect(require.toUrl('./a')).toBe('a');
        });
      });
    });

    describe('Mapping', function() {
        it('should use the mapped module id when the map context matches exactly', function() {
            console.log("START")
            require.config({
                paths: {
                    jquery: 'jquery/not/here'
                },
                map: {
                    // When <> is requiring
                    'foo/bar': {
                        // for <>, give <> instead
                        'jquery': 'dada/jquery'
                    }
                }
            });

            define('foo/bar', ['jquery'], function(jq2) { return {jq: jq2}; });

            require(['foo/bar', 'dada/jquery'], function(fooBar, jq1) {
                expect(fooBar.jq).toBe(jq1);
            });
        });

        it('should use the mapped module id when the map context is an ascendant', function() {
            require.config({
                paths: {
                    jquery: 'jquery/not/here'
                },
                map: {
                    // When <> is requiring
                    'foo': {
                        // for <>, give <> instead
                        'jquery': 'dada/jquery'
                    }
                }
            });

            define('foo/bar', ['jquery'], function(jq2) { return {jq: jq2}; });

            require(['foo/bar', 'dada/jquery'], function(fooBar, jq1) {
                expect(fooBar.jq).toBe(jq1);
            });
        });

        it('should use the mapped module id when the map context is *', function() {
            require.config({
                paths: {
                    jquery: 'jquery/not/here'
                },
                map: {
                    // When <> is requiring
                    '*': {
                        // for <>, give <> instead
                        'jquery': 'dada/jquery'
                    }
                }
            });

            define('foo/bar', ['jquery'], function(jq2) { return {jq: jq2}; });

            require(['foo/bar', 'dada/jquery'], function(fooBar, jq1) {
                expect(fooBar.jq).toBe(jq1);
            });
        });

        // Most-specific context/from, consecutive mapping substitutions
    });

    describe('Special modules', function() {
        describe('`require`', function() {
            it('should resolve the special \'require\' module to itself', function() {
                require(['require'], function(module) {
                    expect(module).toBe(require);
                });
            });

            it('should not resolve the special \'exports\' module', function() {
                require(['exports'], function(exports) {
                    expect(exports).toBeUndefined();
                });
            });

            it('should not resolve the special \'module\' module', function() {
                require(['module'], function(module) {
                    expect(module).toBeUndefined();
                });
            });
        });

        describe('`define`', function() {
            it('should resolve \'require\'', function() {
                define('foo', ['require'], function(require) {
                    expect(typeof require).toBe('function');
                });
                require('foo');
            });

            it('should resolve \'module\'', function() {
                define('foo', ['module'], function(module) {
                    expect(module instanceof Object).toBe(true);
                    expect(module.id).toBe('foo');
                });
                require('foo');
            });

            it('should resolve \'exports\'', function() {
                define('foo', ['exports'], function(exports) {
                    expect(exports).toBeDefined();
                });
                require('foo');
            });

            describe('\'exports\'', function() {
                it('should be native empty objects', function() {
                    define('foo', ['exports'], function(exports) {
                        expect(exports instanceof Object).toBe(true);
                        expect(exports.constructor).toBe(Object);

                        var any = false;
                        for(var p in exports) { any = true; break; }

                        expect(any).toBe(false);
                    });

                    require('foo');
                });

                it('should be the same value returned when required', function() {
                    var exp1;
                    define('foo', ['exports'], function(exports) { exp1 = exports; });

                    var exp2 = require('foo');
                    expect(exp1).toBeDefined();
                    expect(exp2).toBe(exp1);
                });

                it('should be overridden by a defined return value', function() {
                    var A = {};
                    define('foo', ['exports'], function(exports) { return A; });
                    expect(require('foo')).toBe(A);
                });
            })

            it('should resolve \'require\' to a contextualized require', function() {
                var A = {};
                define('foo/a', A);
                define('foo/b', ['require'], function(require) {
                    var _A = require('./a');
                    expect(_A).toBe(A);
                });

                require('foo/b');
            });

        });
    });

    describe('module.config', function() {

        it('should be a function in `module`', function() {
            require.config({
                config: {
                    'foo/bar': 1
                }
            });

            define('foo/bar', ['module'], function(module) {
                expect(typeof module.config).toBe('function');
            });

            require('foo/bar');
        });

        it('should return the exact value specified upon configuration', function() {
            var config = {};
            require.config({
                config: {
                    'foo/bar': config
                }
            });

            define('foo/bar', ['module'], function(module) {
                var _config = module.config();
                expect(_config).toBe(config);
            });

            require('foo/bar');
        });

        it('should not mix the configuration values of different modules', function() {
            var A = {};
            var B = {};
            require.config({
                config: {
                    'foo/bar':   A,
                    'gugu/dada': B
                }
            });

            define('foo/bar', ['module'], function(module) {
                expect(module.config()).toBe(A);
            });

            define('gugu/dada', ['module'], function(module) {
                expect(module.config()).toBe(B);
            });

            require('foo/bar');
            require('gugu/dada');
        });
    });

    describe('loader plugin module', function() {
        it('should call `plugin.load` passing to argument `id` the text after the first `!`', function() {

            var called;

            define('foo', function() {
                return {
                    load: function(id, require, callback) {
                        called = true;
                        expect(id).toBe('a!');
                    }
                }
            });

            require('foo!a!');

            expect(called).toBe(true);
        });

        it('should support empty text after the first `!`', function() {
            var called;

            define('foo', function() {
                return {
                    load: function(id, require, callback) {
                        called = true;
                        expect(id).toBe('');
                    }
                }
            });

            require('foo!');

            expect(called).toBe(true);
        });

        it('should call `plugin.load` passing to argument `require` a contextual `require` function ' +
           'relative to the module requiring the amd plugin - the global require, when there\'s none', function() {
            var topLevelRequire = require;
            var A1 = {};
            var A2 = {};
            define('a', A2);
            define('foo/a', A1);
            define('foo/b', function() {
                return {
                    load: function(id, require, callback) {
                        expect(typeof require).toBe('function');
                        expect(require).toBe(topLevelRequire);

                        require(['./a'], function(_A) {
                            expect(_A).not.toBe(A1);
                            expect(_A).toBe(A2);
                        });
                    }
                }
            });

            require('foo/b!a');
        });

        it('should call `plugin.load` passing to argument `require` a contextual `require` function ' +
           'relative to the module requiring the amd plugin', function() {
            var topLevelRequire = require;
            var A1 = {};
            var A2 = {};

            define('foo/a', A1);
            define('foo/b', function() {
                return {
                    load: function(id, require, callback) {
                        expect(typeof require).toBe('function');
                        expect(require).not.toBe(topLevelRequire);

                        require(['./a'], function(_A) {
                            expect(_A).not.toBe(A1);
                            expect(_A).toBe(A2);
                        });
                    }
                }
            });

            define('bar/a', A2);
            define('bar/b', ['foo/b!'], function() {});

            require('bar/b');
        });

        it('should call `plugin.load` passing to argument `callback` a function', function() {
            define('foo/b', function() {
                return {
                    load: function(id, require, callback) {
                        expect(typeof callback).toBe('function');
                    }
                }
            });

            require('foo/b!a');
        });

        it('should return the value passed to the `callback` function', function() {
            var A = {};
            define('foo/b', function() {
                return {
                    load: function(id, require, callback) { callback(A); }
                }
            });
            expect(require('foo/b!a')).toBe(A);
        });
    });

    describe('relative modules', function() {
        it('should load a relative dependency module id', function() {
            var A = {};
            define('foo/A', A);
            define('foo/B', ['./A'], function(_A) {
                expect(_A).toBe(A);
            });
            require('foo/B');
        });
    });

    // protocol and '/' paths
    // packages/location
});