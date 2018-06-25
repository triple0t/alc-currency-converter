var gulp = require("gulp");
var babel = require("gulp-babel");
var browserSync = require('browser-sync').create();

gulp.task('default', ["copy-html", "js", "libs", "sw"], function () {
  console.log('done');
});

// copy html files
gulp.task('copy-html', function () {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist'));
});

// transpile to es5, copy to dist folder
gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')                                     
      .pipe(babel(
        { presets: ['es2015'] }
      ))   
      .pipe(gulp.dest('dist/js'));               
});

// copy systemjs and polyfills
gulp.task('libs', function(){
  return gulp.src([
      'node_modules/systemjs/dist/system.js',
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/setup.js'
    ])
    .pipe(gulp.dest('dist/libs'));
});

// copy service worker file
gulp.task('sw', function(){
  return gulp.src('src/sw.js')
    .pipe(gulp.dest('dist'));
});

// start the server
gulp.task('serve', ["copy-html", "js", "libs", "sw"], function() {
  browserSync.init({
    server: "dist"
  });

  gulp.watch("src/**/*.*", ["copy-html", "js", "libs", "sw"]).on('change', browserSync.reload);
});
