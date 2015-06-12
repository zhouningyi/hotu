'use strict';
// 引入 gulp
var gulp = require('gulp'),
  rjs = require('gulp-requirejs'),
  connect = require('gulp-connect'),
  webserver = require('gulp-webserver'),
  sftp = require('gulp-sftp'),
  watch = require('gulp-watch'),
  minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  amdOptimize = require('amd-optimize'),
  concat = require('gulp-concat'),
  compass = require('gulp-compass');

function handleError(err) {
  console.log(err.toString(), 'handleError');
  this.emit('end');
}

gulp.task('requirejsBuild', function() {
  try {
    rjs({
        name: 'app',
        baseUrl: './',
        mainConfigFile: './../../config.js',
        out: './app.min.js',
        shim: {
          'zepto': {
            'exports': '$'
          }
        },
      })
      // .pipe(uglify())
      .on('error', handleError)
      .pipe(gulp.dest('./dest')); // pipe it to the output DIR
  } catch (e) {
    console.log(e);
  }
});

// 压缩css的任务
gulp.task('cssBuild', function() {
  return gulp.src(['./ui/*.css'])
    .pipe(minifyCSS({
      aggressiveMerging: false,
      keepSpecialComments: 0,
      advanced: false
    }))
    .pipe(concat('./app.min.css'))
    .pipe(gulp.dest('./dest/'));
});

gulp.task('webserver', function() {
  var server = connect.server({
    livereload: true,
    port: 8080
  });
  console.log(server, 'server');
});

gulp.task('livereload', function() {
  gulp.src(['./dest/*.*'])
    .pipe(watch('./dest/*.*'))
    .pipe(connect.reload());
});

gulp.task('uploadCss', function() {
  return gulp.src(['./dest/app.min.css'])
    .pipe(sftp({
      'host': '121.40.68.211',
      'user': 'kupai',
      'pass': '9c383c42',
      'remotePath': '/home/kupai/minjin/static/gallery_test/dest/'
    }));
});

gulp.task('uploadJs', function() {
  return gulp.src('./dest/app.min.js')
    .pipe(sftp({
      'host': '121.40.68.211',
      'user': 'kupai',
      'pass': '9c383c42',
      'remotePath': '/home/kupai/minjin/static/gallery_test/dest/'
    }));
});

gulp.task('uploadHTML', function() {
  return gulp.src('./index.html')
    .pipe(sftp({
      'host': '121.40.68.211',
      'user': 'kupai',
      'pass': '9c383c42',
      'remotePath': '/home/kupai/minjin/static/gallery_test/'
    }));
});
// 默认任务
gulp.task('default', function() {
  // gulp.run('scripts');
  gulp.run('requirejsBuild');
  gulp.run('cssBuild');
  gulp.run('livereload');

  gulp.watch([
    './ui/*.css',
  ], function(e) {
    gulp.run('cssBuild');
  });

  gulp.watch([
    './ui/*.js',
    './*.js',
  ], function(e) {
    gulp.run('requirejsBuild');
  });

  gulp.watch('./dest/app.min.js', function(file) {
    gulp.run('uploadJs');
  });

  gulp.watch('./dest/app.min.css', function(file) {
    gulp.run('uploadCss');
  });

  gulp.watch('./index.html', function(file) {
    gulp.run('uploadHTML');
  });
  
  gulp.run('webserver');
});