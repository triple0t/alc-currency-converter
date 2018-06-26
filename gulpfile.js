var gulp = require("gulp");
var babel = require("gulp-babel");
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');

var allTasks = ["libs", "copy-html", "js", "css", "other"];

gulp.task('default', allTasks, function () {
  console.log('done');
});


// copy libs
gulp.task('libs', function(){
  return gulp.src('src/libs/*.*')
    .pipe(gulp.dest('libs'))
});



// copy html files
gulp.task('copy-html', function () {
  return gulp.src([
    'src/**/*.html',
  ])
    .pipe(gulp.dest(''));
});

// transpile to es5, copy to dist folder
gulp.task('js', function() {
  return gulp.src('src/js/**/*.js') 
      .pipe(plumber(function(err) {
        console.error('err with scripts', err);
        this.emit('end');
      }))                                    
      .pipe(babel(
        { presets: ['env'] }
      ))   
      .pipe(gulp.dest('js'));               
});

// css files
gulp.task('css', function() {
  return gulp.src('src/css/**/*.css') 
      .pipe(plumber(function(err) {
        console.error('err with styles', err);
        this.emit('end');
      }))                                       
      .pipe(gulp.dest('css'));               
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
    { presets: ['env'] }
  ))  
  .pipe(gulp.dest(''))
});

// start the server
gulp.task('serve', allTasks, function() {
  browserSync.init({
    server: ""
  });

  gulp.watch("src/**/*.*", ["copy-html", "js", "css", "other"]).on('change', browserSync.reload);
});
