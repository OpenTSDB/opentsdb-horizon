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
            // require("karma-phantomjs-launcher"),
            require("karma-chrome-launcher"),
            require("karma-jasmine-html-reporter"),
            require("karma-junit-reporter"),
            // require("karma-coverage-istanbul-reporter"),
            require("karma-coverage"),
            require("@angular-devkit/build-angular/plugins/karma"),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        // coverageIstanbulReporter: {
        coverageReporter: {
            reports: ["html", "lcov", "json-summary", "text-summary"],
            dir: path.join(__dirname, "../artifacts/coverage"),
            skipFilesWithNoCoverage: true,
            fixWebpackSourcePaths: true
        },
        junitReporter: {
            outputDir: "../artifacts/test/",
            outputFile: "result.xml",
            useBrowserName: false,
        },
        angularCli: {
            environment: "dev",
        },
        // reporters: ["progress", "kjhtml", "coverage-istanbul", "junit"],
        reporters: ["progress", "kjhtml", "coverage", "junit"],
        maximumSpecCallbackDepth: 100,
        port: 9876,
        colors: true,
        logLevel: config.LOG_DEBUG,
        autoWatch: true,
        // browsers: ["PhantomJS"],
        // browsers: ["Chrome"],
        browsers: ['ChromeHeadlessNoSandbox'], // Use custom headless launcher
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless', // Use headless mode
                flags: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--headless',
                    '--disable-gpu',
                    '--disable-dev-shm-usage', // Use /tmp instead of /dev/shm for shared memory
                    '--remote-debugging-port=9222', // Sets remote debugging port
                    '--enable-logging',
                    '--v=1', // Verbose logging level
                    '--disable-software-rasterizer' // Disables software rasterizer
                ]
            }
        },
        // Increase timeouts
        browserNoActivityTimeout: 120000, // 60 seconds
        captureTimeout: 120000, // 120 seconds
        browserDisconnectTolerance: 4, // Retry disconnections 3 times
        browserDisconnectTimeout: 120000, // 120 seconds
        concurrency: 1, // Run tests sequentially to reduce load
        singleRun: false,
    });
};
