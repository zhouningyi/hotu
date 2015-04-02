'use strict';
// 引入 gulp
var gulp = require('gulp'),
  rjs = require('gulp-requirejs'),
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

gulp.task('scripts', function() {
  //concat them together
  gulp.src('./bower_components/requirejs/require.js')
    .pipe(uglify({
      mangle: false,
      outSourceMap: false
    }))
    .pipe(concat('./bower_components/requirejs/require.min.js'))
    .pipe(gulp.dest('./bower_components/requirejs/'))
  ;
});



gulp.task('requirejsBuild', function() {
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
    .pipe(gulp.dest('./dest')); // pipe it to the output DIR
});

// 压缩css的任务
gulp.task('cssBuild', function() {
  return gulp.src(['./bower_components/ionicons/css/ionicons.css','./ui/*.css'])
    .pipe(minifyCSS({
      aggressiveMerging:false,
      keepSpecialComments:0
    }))
    .pipe(concat('./app.min.css'))
    .pipe(gulp.dest('./dest/'));
});

// // 默认任务
gulp.task('default', function() {
  gulp.run('scripts');
  gulp.run('requirejsBuild');
  gulp.run('cssBuild');

  gulp.watch([
      './ui/*.css'
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
});
