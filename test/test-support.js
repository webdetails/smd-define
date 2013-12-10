var DEBUG = 1;

function print(s) {
    DEBUG && console.log('print("' + s + '")');
}

function loadFileSync(s) {
    DEBUG && console.log("load('" + s + "')");

    var xhr = new XMLHttpRequest()
    xhr.open("get", s, /*async*/false);
    xhr.send();
    if(xhr.status ===200) {
        var text = xhr.responseText;
        if(text) doEval(xhr.responseText, s);
    }
}

function doEval(s, sourceUrl) {
    // The sourceURL comment lets browsers give a nice name to the evaluated snippet.
    if(s) {
        if(sourceUrl) s += "\n" + "//@ sourceURL=" + sourceUrl;
        eval(s);
    }
}

var __defineCfg__ = {
    shim: {
        'dada/jquery': {
            deps:    [],
            exports: 'jQuery'
        }
    },
    loadSync: loadFileSync
};