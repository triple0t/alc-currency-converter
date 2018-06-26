var gulp = require("gulp");
var babel = require("gulp-babel");
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');

var allTasks = ["copy-html", "js", "css", "libs", "other"];

gulp.task('default', allTasks, function () {
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
      .pipe(plumber(function(err) {
        console.error('err with scripts', err);
        this.emit('end');
      }))                                    
      .pipe(babel(
        { presets: ['es2015'] }
      ))   
      .pipe(gulp.dest('dist/js'));               
});

// css files
gulp.task('css', function() {
  return gulp.src('src/css/**/*.css') 
      .pipe(plumber(function(err) {
        console.error('err with styles', err);
        this.emit('end');
      }))                                       
      .pipe(gulp.dest('dist/css'));               
});

// copy systemjs and polyfills
gulp.task('libs', function(){
  return gulp.src([
      'node_modules/systemjs/dist/system.js',
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/setup.js',
      'src/bootstrap/*.*'
    ])
    .pipe(gulp.dest('dist/libs'))
    .pipe(gulp.dest('src/libs'))
});

// copy service worker file
gulp.task('other', function(){
  return gulp.src([
    'src/sw.js'
  ])
  .pipe(plumber(function(err) {
    console.error('err with other scripts', err);
    this.emit('end');
  }))                                    
  .pipe(babel(
    { presets: ['es2015'] }
  ))  
  .pipe(gulp.dest('dist'))
});

// start the server
gulp.task('serve', allTasks, function() {
  browserSync.init({
    server: "dist"
  });

  gulp.watch("src/**/*.*", allTasks).on('change', browserSync.reload);
});
