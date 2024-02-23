/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var gulp = require("gulp"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    util = require("gulp-util"),
    jshint = require("gulp-jshint"),
    replace = require("gulp-replace"),
    insert = require("gulp-insert"),
    inquirer = require("inquirer"),
    semver = require("semver"),
    exec = require("child_process").exec,
    fs = require("fs"),
    package = require("./package.json"),
    browserify = require("browserify"),
    streamify = require("gulp-streamify"),
    source = require("vinyl-source-stream"),
    merge = require("merge-stream");

var srcDir = "./src/";
var outDir = "./dist/";

gulp.task("build", buildTask);
gulp.task("jshint", jshintTask);

function buildTask() {
    var nonBundled = browserify("./src/index.js")
        .ignore("chart.js")
        .bundle()
        .pipe(source("chartjs-plugin-zoom.js"))
        .pipe(streamify(replace("{{ version }}", package.version)))
        .pipe(gulp.dest(outDir))
        .pipe(
            streamify(
                uglify({
                    preserveComments: "some",
                })
            )
        )
        .pipe(streamify(concat("chartjs-plugin-zoom.min.js")))
        .pipe(gulp.dest(outDir));

    return nonBundled;
}

function jshintTask() {
    return gulp
        .src(srcDir + "**/*.js")
        .pipe(jshint("config.jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(jshint.reporter("fail"));
}
