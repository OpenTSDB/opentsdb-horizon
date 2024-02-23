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
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require("path");

module.exports = function (config) {
    config.set({
        basePath: "",
        frameworks: ["jasmine", "@angular-devkit/build-angular"],
        plugins: [
            require("karma-jasmine"),
            require("karma-phantomjs-launcher"),
            require("karma-jasmine-html-reporter"),
            require("karma-junit-reporter"),
            require("karma-coverage-istanbul-reporter"),
            require("@angular-devkit/build-angular/plugins/karma"),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        coverageIstanbulReporter: {
            reports: ["html", "lcov", "json-summary", "text-summary"],
            dir: path.join(__dirname, "../artifacts/coverage"),
            skipFilesWithNoCoverage: true,
            fixWebpackSourcePaths: true,
        },
        junitReporter: {
            outputDir: "../artifacts/test/",
            outputFile: "result.xml",
            useBrowserName: false,
        },
        angularCli: {
            environment: "dev",
        },
        reporters: ["progress", "kjhtml", "coverage-istanbul", "junit"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ["PhantomJS"],
        singleRun: false,
    });
};
