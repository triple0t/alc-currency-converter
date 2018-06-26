// set baseURL reference path
System.config({
    packages: {
        js: {
            format: 'register',
            defaultExtension: 'js'
        },
    },
    meta: {
        // transpiled modules to commonJS
        'js/*': {format: 'cjs'}
    }
});

System.import('js/app.js')
.then(null, console.error.bind(console));