'use strict';
// 引入 gulp
var gulp = require('gulp'),
  rjs = require('gulp-requirejs'),
  connect = require('gulp-connect'),
  webserver = require('gulp-webserver'),
  sftp = require('gulp-sftp'),
  watch = require('gulp-watch'),
// sass = require('gulp-ruby-sass'),
// autoprefixer = require('gulp-autoprefixer'),
minifyCSS = require('gulp-minify-css'),
// jshint = require('gulp-jshint'),
uglify = require('gulp-uglify'),
amdOptimize =require('amd-optimize'),
// imagemin = require('gulp-imagemin'),
// rename = require('gulp-rename'),
concat = require('gulp-concat'),
// notify = require('gulp-notify'),
// cache = require('gulp-cache'),
// livereload = require('gulp-livereload'),
// del = require('del');
// 引入 Plugins
compass = require('gulp-compass')
;

function handleError(err) {
  console.log(err.toString(),'handleError');
  this.emit('end');
}


// gulp.task('scripts', function() {
//   //concat them together
//   gulp.src('./bower_components/requirejs/require.js')
//     .pipe(uglify({
//       mangle: false,
//       outSourceMap: false
//     }))
//     .pipe(concat('./bower_components/requirejs/require.min.js'))
//     .pipe(gulp.dest('./bower_components/requirejs/'));

// });


gulp.task('requirejsBuild', function() {
  try{
  rjs({
      name: 'app',
      baseUrl: './',
      mainConfigFile: './config.js',
      out: './app.min.js',
      shim: {
        'zepto': {
          'exports': '$'
        }
      },
      // ... more require.js options
    })
    // .pipe(uglify())
    .on('error', handleError)
    .pipe(gulp.dest('./dest')); // pipe it to the output DIR
  }catch(e){
    console.log(e);
  }
});

// 压缩css的任务
gulp.task('cssBuild', function() {
  return gulp.src(['./ui/*.css'])
    .pipe(minifyCSS({
      aggressiveMerging:false,
      keepSpecialComments:0,
      advanced:false
    }))
    .pipe(concat('./app.min.css'))
    .pipe(gulp.dest('./dest/'));
});

gulp.task('webserver', function() {
  var server = connect.server({
    livereload: true,
    port: 8080,
    // root: ['.', '.tmp']
  });
  console.log(server, 'server');
});

gulp.task('livereload', function() {
  gulp.src(['./dest/*.*'])
    .pipe(watch('./dest/*.*'))
    .pipe(connect.reload());
});

gulp.task('sftp', function () {
    return gulp.src('./dest/*.*')
        .pipe(sftp({
            'host': '121.40.68.211',
            'user': 'kupai',
            'pass': '9c383c42',
            'remotePath': '/home/kupai/minjin/static/hotu/dest/'
        }));
});

// // 默认任务
gulp.task('default', function() {
  // gulp.run('scripts');
  gulp.run('requirejsBuild');
  gulp.run('cssBuild');
  gulp.run('webserver');
  gulp.run('livereload');

  gulp.watch([
      './ui/*.css',
      // './bower_components/ionicons/css/ionicons.css'
      ], function(event) {
      gulp.run('cssBuild');
  });
  gulp.watch([
      './model/*.js',
      './render/*.js',
      './utils/*.js',
      './ui/*.js',
      './wx/*.js',
      './editor/*.js',
      './brush/*.js',
      './controller.js',
      './app.js',
      './config.js',
      ], function(event) {
      gulp.run('requirejsBuild');
  });

   // gulp.src('./dest/')
   //  .pipe(webserver({
   //    'livereload': true,
   //    'open': true,
   //    'directoryListing': {
   //              enable:true,
   //              path: 'hotu'
   //          },
   //    'host': 'localhost',
   //    'port': 8888,
   //  }));

  gulp.watch('./dest/*.*', function (file) {
    gulp.run('sftp');
  });
});
