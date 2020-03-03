var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    jshint = require('gulp-jshint'),
    replace = require('gulp-replace'),
    insert = require('gulp-insert'),
    inquirer = require('inquirer'),
    semver = require('semver'),
    exec = require('child_process').exec,
    fs = require('fs'),
    package = require('./package.json'),
    browserify = require('browserify'),
    streamify = require('gulp-streamify'),
    source = require('vinyl-source-stream'),
    merge = require('merge-stream');

var srcDir = './src/';
var outDir = './dist/';

gulp.task('build', buildTask);
gulp.task('jshint', jshintTask);

function buildTask() {
  var nonBundled = browserify('./src/index.js')
    .ignore('chart.js')
    .bundle()
    .pipe(source('chartjs-plugin-zoom.js'))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(outDir))
    .pipe(streamify(uglify({
      preserveComments: 'some'
    })))
    .pipe(streamify(concat('chartjs-plugin-zoom.min.js')))
    .pipe(gulp.dest(outDir));

  return nonBundled;

}



function jshintTask() {
  return gulp.src(srcDir + '**/*.js')
    .pipe(jshint('config.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
}
