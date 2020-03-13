'use strict';


    var moduleDefinition = function (AppConstant) {
        var self = {};//service returned object

        self.isValidNAMFormat = function (metricName) {
            return AppConstant.REGEX_NAM_FORMAT.test(metricName);
        };

        // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        self.shuffleArray = function shuffle(array) {
            var currentIndex = array.length
                , temporaryValue
                , randomIndex
                ;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue      = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex]  = temporaryValue;
            }

            return array;
        };

        /**
         * extract the namespace and application-metric part from an NAM string
         *
         * @param  String NAM string, for example "YAMAS.US.yapache.requests"
         * @return Hash Containing the separated namespace and application-metric parts
         *      { 'namespace': "YAMAS.US", "applicationMetric": "yapache.requests"}
         */
        self.splitByNamespaceAndApplicationMetric = function (metric) {
            if (undefined === metric || "" === metric || !metric.match(AppConstant.REGEX_NAM_FORMAT)) {
                throw new Error("Wrong input metric. Expected format to be <Namespace>.<Application>.<Metric>");
            }

            var ns, am;
            var namParts = metric.match(AppConstant.REGEX_NAM_FORMAT);
            ns           = namParts[1];
            am           = namParts[2] + "." + namParts[3];

            return {'namespace': ns, 'applicationMetric': am};
        };
        return self;
    };


module.exports = moduleDefinition(
    require('./appconstant'),
);
