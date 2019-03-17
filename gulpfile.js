const { series, src, dest, watch } = require('gulp');
const babel = require("gulp-babel");
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');


function serve() {
  console.log('running serve');

  browserSync.init({
    server: ""
  });

  // watch("src/**/*.*", series(libs, copyHtml, js, css, other)).on('change', browserSync.reload);
  // Do not copy the service worker file during dev.
  watch("src/**/*.*", series(libs, copyHtml, js, css)).on('change', browserSync.reload);
}

// copy libs
function libs(){
  console.log('running libs tasks');

  return src('src/libs/*.*')
    .pipe(dest('libs'))
};

// copy html files
function copyHtml() {
  console.log('running html tasks');

  return src([
    'src/**/*.html',
  ])
    .pipe(dest(__dirname));
};

// transpile to es5, copy to dist folder
function js() {
  console.log('running js tasks');

  return src('src/js/**/*.js') 
      .pipe(plumber(function(err) {
        console.error('err with scripts', err);
        this.emit('end');
      }))                                    
      .pipe(babel())   
      .pipe(dest('js'));           
};

// css files
function css() {
  console.log('running css tasks');

  return src('src/css/**/*.css') 
      .pipe(plumber(function(err) {
        console.error('err with styles', err);
        this.emit('end');
      }))                                       
      .pipe(dest('css'));               
};

// copy service worker file
function other(){
  console.log('running other tasks');
  
  return src([
    'src/sw.js'
  ])
  .pipe(plumber(function(err) {
    console.error('err with other scripts', err);
    this.emit('end');
  }))                                    
  .pipe(babel())  
  .pipe(dest(__dirname))
};

exports.serve = serve;
exports.default = series(libs, copyHtml, js, css, other);
