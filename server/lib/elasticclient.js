//external
var _             = require('lodash');
var Q             = require('q');
var os            = require('os');
var elasticsearch = require('elasticsearch');
//var md5           = require('md5');

//internal
var appconstant = require('../lib/shared/appconstant');
//var collector   = require('./metricscollector');
var utils       = require('./utils');
var sharedutils = require('./shared/utils');
var app_setting = utils.getConfig();
//var simpleCache = {};

//var appName = 'olympus_server';
var tags    = {
    'env': utils.getEnv(),
    'host': os.hostname(),
    'userid': ''
};

function getElasticQueryResultExtractor(elasticSearchEndpoint) {

    if (elasticSearchEndpoint === 'namespaces') {
        return function (response) {
            if (response.aggregations.elasticQueryResults.buckets) {
                return response.aggregations.elasticQueryResults.buckets;
            }
            else {
                return [];
            }
        }
    }
    else if (elasticSearchEndpoint === 'appMetrics') {
        return function (response) {
            if (response.aggregations.elasticQueryResults.elasticQueryResults.elasticQueryResults.buckets) {
                return response.aggregations.elasticQueryResults.elasticQueryResults.elasticQueryResults.buckets;
            }
            else {
                return [];
            }
        }
    }
    else if (elasticSearchEndpoint === 'nstagKeys') {
        return function (response) {
            if (response.aggregations.elasticQueryResults.elasticQueryResults.buckets) {
                return response.aggregations.elasticQueryResults.elasticQueryResults.buckets;
            }
            else {
                return [];
            }
        }
    }
    else if (elasticSearchEndpoint === 'tagKeys') {
        return function (response) {
            if (response.aggregations.elasticQueryResults.elasticQueryResults.elasticQueryResults.buckets) {
                return response.aggregations.elasticQueryResults.elasticQueryResults.elasticQueryResults.buckets;
            }
            else {
                return [];
            }
        }
    }
    else if (elasticSearchEndpoint === 'tagValues') {
        return function (response) {
            if (response.aggregations.elasticQueryResults.elasticQueryResults.elasticQueryResults.buckets) {
                return response.aggregations.elasticQueryResults.elasticQueryResults.elasticQueryResults.buckets;
            }
            else {
                return [];
            }
        }
    }
}

/*
 Function to extract relevant response from ES
 Relevancy is determined by the elasticSearchEndpoint
 For ex: When searching for namespaces, relevant response is namespaceList
 @return suggestionValueList Array containing a list of namespaces/tagkeys/tagvalues/appmetrics
 */

function extractResultsFromElasticSearchResponse(elasticResponseList, extractorFn) {
    var resultValueMap = {};
    var results        = [];
    for (var i = 0; i < elasticResponseList.length; i += 1) {
        var response = elasticResponseList[i];
        if (response.timed_out === false && undefined !== response.hits) {
            results = extractorFn(response);
            // results will be empty if response structure is different
            // from the definition in the getElasticQueryResultExtractor
            for (var j = 0; j < results.length; j += 1) {
                resultValueMap[results[j].key] = 1;
            }
        }
        // else ignore the response
    }

    // TODO: capture if the map is empty  to do something meaningful
    return Object.keys(resultValueMap);
}

function convertPatternESCompat(searchPattern) {
    searchPattern = searchPattern.replace(/\s+/g, ".*");
    if ((searchPattern).search(/^\s*\.\*/) === -1) {
        searchPattern = '.*' + searchPattern;
    }
    if ((searchPattern).search(/\.\*\s*$/) === -1) {
        searchPattern = searchPattern + '.*'
    }
    return searchPattern.toLowerCase();
}

module.exports = function () {
    var self = this;

    self._makeESMultiQuery = function (queryBody, headers, timeout) {
        var defer                     = Q.defer(),          // defer object which will resolve with merged es reponses or err
            promises                  = [],              // holds promises created for es calls per colo
            elasticSearchResponseList = [];// object that holds the merged responses from colos which have a success response

        console.log("meta search body", JSON.stringify(queryBody));
        headers.host = "proxy-meta-bf1.yamas.ops.yahoo.com";
        console.log("headers", headers);

        //create a client for every ES cluster
        for (var i = 0; i < app_setting.elasticsearch.source.length; i++) {
            var esclient = new elasticsearch.Client({
                host: {
                    protocol: app_setting.elasticsearch.source[i].protocol,
                    host: app_setting.elasticsearch.source[i].host,
                    port: app_setting.elasticsearch.source[i].port,
                    headers: headers
                },
                log: 'info',
                maxRetries: 0
            });
            promises.push(
                esclient.msearch({
                    body: queryBody,
                    requestTimeout: timeout
                })
            );
        }

        Q.allSettled(promises)
            .then(function (results) {
                console.log("\n\n\nES RESULT", JSON.stringify(results) + "\n\n\n");
                var error = [];
                for (var i = 0; i < results.length; i++ ) {
                    var result = results[i];
                    // if success, merge with responses from other colos, else discard
                    if (result.state === 'fulfilled') {
                        for (var j = 0; j < result.value.responses.length; j++ ) {
                            elasticSearchResponseList.push(result.value.responses[j]);
                        }
                    }
                    else if (result.state === 'rejected') {
                        console.log('es colo failed to respond with success response',
                            JSON.stringify(queryBody),
                            result.reason.message);
                        error.push({
                            'colo': i,
                            'reason': result.reason.message
                        });
                    }
                }
                if (elasticSearchResponseList.length > 0) {
                    defer.resolve(elasticSearchResponseList);
                }
                // if all responses are unsuccessful, reject with err
                else {
                    defer.reject({
                        'message': 'both colos failed to respond',
                        'error': error
                    });
                }
            }, function(err){
                defer.reject(err);
            });

        return defer.promise;
    };

    self.getNamespaceSuggestions = function (params) {
        var defer       = Q.defer();
        var suggestions = [];
        var startTime, endTime, requestTime;
        var searchPattern = params.searchPattern,
            headers = params.headers;

        searchPattern = convertPatternESCompat(searchPattern);

        var queryBody = {
            "size": "0",
            "query": {
                "bool": {
                    "must": [
                        {
                            "regexp": {
                                "namespace.lowercase": searchPattern
                            }
                        }

                    ]
                }
            },
            "aggs": {
                "elasticQueryResults": {
                    "terms": {"field": "namespace.raw", "size": "0"}
                }
            }
        };

        //build multiquery object
        var multisearchQueryBody = [], queryMetadata;
        queryMetadata            = {
            "index": "all_namespace",
            "query_cache": true
        };

        //note: keep insertion order, expected by elastic search
        multisearchQueryBody.push(queryMetadata);
        multisearchQueryBody.push(queryBody);

        tags.endpoint = 'namespace';

        startTime = (new Date()).getTime();
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.NAMESPACE_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            endTime     = (new Date()).getTime();
            requestTime = endTime - startTime;
            suggestions = extractResultsFromElasticSearchResponse(
                resp,
                getElasticQueryResultExtractor('namespaces')
            );
            defer.resolve(suggestions);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    self.parseSearchTerms = function(terms) {
        // js regex does not support lookbehind just yet
        // hack it.
        var t = terms.toString()
                .replace(/\s{2,}/g, ' ')
                .trim()
                .replace(/\s(?=[:,|])/g, '')
                .split('').reverse().join('')
                .replace(/\s(?=[:,|])/g, '')
                .split('').reverse().join('')
                .split(' ');
    
        t.sort(function(a,b) {
            var re = /[,|]/g;
            var x = a.search(re);
            var y = b.search(re);
            return x < y ? 1 : x > y ? -1 : 0;
        });
        return t;       
    };

    self.getBoolQuery = function(pattern, index) {
        var tagKeyCondition = {
                        "nested": {
                            "path": "tags",
                            "query": {
                                "bool": {
                                    "should": []
                                }
                            }
                        }
                    };
        var tagValueCondition = {
                        "nested": {
                            "path": "tags",
                            "query": {
                                "bool": {
                                    "should": []
                                }
                            }
                        }
                    };
        var metricCondition = {
                        "nested": {
                            "path": "AM_nested",
                            "query": {
                                "bool": {
                                    "should": []
                                }
                            }
                        }
                    };
        var tagKeyValueCondition =  function(key, pattern) {
            return {
                        "nested": {
                            "path": "tags",
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            "term": {
                                                "tags.key.lowercase": key
                                            }
                                        },
                                        {
                                            "regexp": {
                                                "tags.value": pattern
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                };
        }
        var regexCondition = function(key, pattern) {
            var regexCondition = {
                "regexp": {}
            };
            regexCondition["regexp"][key] = pattern;
            return regexCondition;
        };

        var condition = {
                            "bool": { "should":[] }
                        };
        
        var patterns = pattern.split(",");
        var freeTextSearch = false;
        for ( var i=0; i< patterns.length; i++ ) {
            if ( patterns[i].indexOf(":") !== -1 ) {
                var kv = patterns[i].split(":");
                condition.bool.should.push(tagKeyValueCondition(kv[0],convertPatternESCompat(kv[1])));
            } else {
                freeTextSearch = true;
                var esPattern = convertPatternESCompat(patterns[i]);
                metricCondition.nested.query.bool.should.push(regexCondition( "AM_nested.name.lowercase" , esPattern));
                tagKeyCondition.nested.query.bool.should.push(regexCondition( "tags.key.lowercase" , esPattern));
                tagValueCondition.nested.query.bool.should.push(regexCondition( "tags.value" , esPattern));
            }
        }
        if ( freeTextSearch ) {
            condition.bool.should.push(metricCondition);
            condition.bool.should.push(tagKeyCondition);
            condition.bool.should.push(tagValueCondition);
        }
        return condition;
    };
    
    self.getSeriesSuggestions = function (params) {
        var defer       = Q.defer();
        var suggestions = [];
        var queryParams = params.query,
            headers = params.headers;
        var namespace     = queryParams.namespace.toLowerCase();
        var searchPattern = queryParams.searchPattern.toLowerCase();
        var startTime, endTime, requestTime;
        //TODO: split the search pattern by space and generate several filters,
        //this would allow to search for "inter lat" or "lat inter"

        var queryBody = {
                "query": {
                    "filtered": {
                        "filter": {
                            "bool": {
                                "must": []
                            }
                        }
                    }
                },
                "size": 1000,
                "_source": {
                    "excludes": ["lastSeenTime", "firstSeenTime", "application.raw", "timestamp"]
                }
        };

        var searchTerms = self.parseSearchTerms(searchPattern);

        for ( var i=0; i< searchTerms.length; i++ ) {
            queryBody.query.filtered.filter.bool.must.push(self.getBoolQuery(searchTerms[i], i));
        }
        
        console.log("search pattern", searchPattern, JSON.stringify(queryBody));

        //build multiquery object
        var multisearchQueryBody = [], queryMetadata;
        queryMetadata            = {
            "index": namespace,
            "query_cache": true
        };
        // am => only metrics
        // tagkeys => only have metrics and tagKeys
        // namespace will have everything

        //note: keep insertion order, expected by elastic search
        multisearchQueryBody.push(queryMetadata);
        multisearchQueryBody.push(queryBody);

        tags.endpoint = 'metrics';

        startTime = (new Date()).getTime();
        //perform the query
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.METRIC_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            defer.resolve(resp);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    self._splitByNamespaceAM = function (metrics) {
        //build query params need for elastic search
        var res, nsamMap = {};
        for (var i = 0; i < metrics.length; i++) {
            res = sharedutils.splitByNamespaceAndApplicationMetric(metrics[i]);

            if ( !(nsamMap[res.namespace]) ) {
                nsamMap[res.namespace] = {'namespace': res.namespace, 'applicationMetric': []};
            }
            if ( nsamMap[res.namespace].applicationMetric.indexOf(res.applicationMetric) === -1 ) {
                nsamMap[res.namespace].applicationMetric.push(res.applicationMetric);
            }
        }
        return nsamMap;
    };

    self._makeQueryBodyTagKeysForMetrics = function (queryParams) {

        //to lowercase
        queryParams.application_metric_lc = queryParams.applicationMetric.map(function (am) {
            return am.toLowerCase();
        });

        var queryBody = {
            "size": "0",
            "query": {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": [
                                //insert here the metric filters
                            ]
                        }
                    }
                }
            },

            "aggs": {
                "elasticQueryResults": {
                    "nested": {
                        "path": "tags"
                    },
                    "aggs": {
                        "elasticQueryResults": {
                            "terms": {
                                "field": "tags.key.raw",
                                "size": 0
                            }
                        }
                    }
                }
            }

        };

        //First: append the application_metric filters
        var metricsFilter = {
            "nested": {
                "path": "AM_nested",
                "query": {
                    "bool": {
                        "should": []
                    }
                }
            }
        };
        var numTerms      = 0, metricsArray;
        if (queryParams.application_metric_lc.length > 1024) {
            metricsArray = _.cloneDeep(queryParams.application_metric_lc);
            sharedutils.shuffleArray(metricsArray);
        } else {
            metricsArray = queryParams.application_metric_lc;
        }
        _.forEach(metricsArray, function (app_metric, idx) {
            if (numTerms < 1024) {
                numTerms++;
                metricsFilter.nested.query.bool.should.push(
                    {
                        "term": {"AM_nested.name.lowercase": app_metric}
                    }
                );
            }
        });
        queryBody.query.filtered.filter.bool.must.push(metricsFilter);

        return queryBody;
    };

    self.getTagKeysForMetrics = function (params) {
        var defer       = Q.defer();
        var metrics     = params.metrics;
        var headers     = params.headers;
        var namQueries  = self._splitByNamespaceAM(metrics);
        var suggestions = [];

        var startTime, endTime, requestTime;
        //build multiquery object
        var multisearchQueryBody = [], queryMetadata, queryBody;
        _.forEach(namQueries, function (namQuery, idx) {
            queryMetadata = {
                "index": namQuery.namespace.toLowerCase() + "_tagkeys",
                "query_cache": true
            };
            queryBody     = self._makeQueryBodyTagKeysForMetrics(namQuery);

            //note: keep insertion order, expected by elastic search
            multisearchQueryBody.push(queryMetadata);
            multisearchQueryBody.push(queryBody);
        });

        tags.endpoint = 'tagkeys';
        //tags.userid   = headers.auth.getPrincipal();
        startTime = (new Date()).getTime();
        //perform the query
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.TAGKEYS_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            // console.log(JSON.stringify(resp));
            // suggestions  =  extractResultsFromElasticSearchResponse(resp, getElasticQueryResultExtractor('tagValues'));
            if (resp[0].timed_out === false && undefined !== resp[0].hits) {
                suggestions = resp[0].aggregations.elasticQueryResults.elasticQueryResults.buckets;
            }
            defer.resolve(suggestions);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    self._convertRegexp = function (value) {
        value = value.replace(/^regexp\(/i, "");
        value = value.replace(/\)$/, "");
        value = self._convertJavaRegexpToLuceneRegexp(value);
        return value;
    }

    self.getQuery = function( tags, metrics ) {
        var query = {
            "filtered": {
                "filter": {
                    "bool": {
                        "must": [],
                    }
                }
            }
        };

        var nestedQueryFilters = [];
        var nestedQueryShouldFilters = [];

        // additional tag-value filters
        if ( tags.length ) {
            console.log('tag', tags)
            for ( var i=0, len = tags.length; i < len; i++ ) {
                var condition='must';
                if ( tags[i].operator && tags[i].operator === 'NOTIN' ) {
                        condition = 'must_not';
                }
                var key = tags[i].key.toLowerCase();
                var filterType = 'term';
                if ( key.indexOf('.*') !== -1   ) { 
                    filterType = 'regexp';
                }
                var filter = {};
                filter[filterType] = { "tags.key.lowercase": key };
                // nestedQueryFilters.push(self.getNestedQueryFilter('tags', condition));
                // nestedQueryFilters[nestedQueryFilters.length-1].nested.query.bool[condition].push(filter);
                
                // var v = Array.isArray(tags[i].value) ? tags[i].value.join('|') : tags[i].value;
                
                
                if ( tags[i].value ) {
                    // nestedQueryFilter.nested.query.bool['should'] = [];
                    var nestedQueryFilter = self.getNestedQueryFilter('tags', 'should');
                        
                    for ( var j=0;  j<tags[i].value.length; j++ ){
                        var v = tags[i].value[j];
                        var bool = { bool: { must: [  ] }};
                        bool.bool.must.push(filter);
                        self._convertTagValueToESNotation( bool.bool.must, v);
                        nestedQueryFilter.nested.query.bool['should'].push(bool);
                        // nestedQueryShouldFilters.push(nestedQueryFilter);
                    }
                    nestedQueryFilters.push(nestedQueryFilter);
                } else {
                    var nestedQueryFilter = self.getNestedQueryFilter('tags', condition);
                    nestedQueryFilter.nested.query.bool[condition].push(filter);
                    nestedQueryFilters.push(nestedQueryFilter);
                }

                // if ( Array.isArray(tags[i].value) ) {
                //    console.log('v=', v)
                // } else {
                //    self._convertTagValueToESNotation(nestedQueryFilters[nestedQueryFilters.length-1].nested.query.bool[condition], v);
                // }
            }
        }

        if ( metrics.length ) {
            nestedQueryFilters.push(self.getNestedQueryFilter('AM_nested', 'should'));

            var n = nestedQueryFilters.length;
            for ( var i=0, len = metrics.length; i < len; i++ ) {
                var metric = metrics[i].toLowerCase();
                console.log("metric=", metric)

                var filterType = 'term';
                if ( metric.indexOf('.*') !== -1  ) { 
                    filterType = 'regexp';
                    // metric = self._convertRegexp(metric);
                }
                var filter = {};
                filter[filterType] = { "AM_nested.name.lowercase": metric };
                nestedQueryFilters[n-1].nested.query.bool.should.push(filter);
            }
        }
        if ( nestedQueryShouldFilters.length ) {
            // query.filtered.filter.bool.should = nestedQueryShouldFilters;
        }
        query.filtered.filter.bool.must.push(nestedQueryFilters);

        return query;
    }
    self.getNestedQueryFilter = function(path, operator) {
        var queryFilter = {
            "nested": {
                "path": path,
                "query": {
                    "bool": {
                    }
                }
            }
        };
        queryFilter.nested.query.bool[operator] =   [];
       return queryFilter;
    };

    self.getMetricsSuggestions = function (params) {
        var defer       = Q.defer();
        var suggestions = [];
        var headers = params.headers;
        var namespace     = params.namespace.toLowerCase();
        var tags = params.tags || [];
        var search = convertPatternESCompat(params.search || '');


        var queryBody = {
            "size": "0",
            "query": {},
            "aggs": {
                "elasticQueryResults": {
                    "nested": {
                        "path": "AM_nested"
                    },
                    "aggs": {
                        "elasticQueryResults": {
                            "filter": {
                                "bool": {
                                    "must": [
                                        {
                                            "regexp": {
                                                "AM_nested.name.lowercase": search
                                            }
                                        }
                                    ]
                                }
                            },
                            "aggs": {
                                "elasticQueryResults": {
                                    "terms": {
                                        "field": "AM_nested.name.raw",
                                        "size": 100
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        queryBody.query = self.getQuery(tags, [search]);


        //build multiquery object
        var multisearchQueryBody = [], queryMetadata;
        queryMetadata            = {
            "index": namespace,
            "query_cache": true
        };
        // am => only metrics
        // tagkeys => only have metrics and tagKeys
        // namespace will have everything

        //note: keep insertion order, expected by elastic search
        multisearchQueryBody.push(queryMetadata);
        multisearchQueryBody.push(queryBody);

        tags.endpoint = 'metrics';
        //perform the query
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.METRIC_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            suggestions = extractResultsFromElasticSearchResponse(
                resp,
                getElasticQueryResultExtractor('appMetrics')
            );
            defer.resolve(suggestions);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    self.getTagkeysForNamespace = function ( params ) {
        var defer       = Q.defer();
        var namespace     = params.namespace;
        var metrics = params.metrics || [];
        var headers     = params.headers;
        var suggestions = [];
        var tags = params.tags || [];
        var search = convertPatternESCompat(params.search);

        //build multiquery object
        var multisearchQueryBody = [], queryMetadata, queryBody;
            queryMetadata = {
                "index": namespace.toLowerCase(),
                "query_cache": true
            };
            queryBody     =  {
                "size": 0,
                "query": {},
                "aggs": {
                    "elasticQueryResults": {
                        "nested": {
                            "path": "tags"
                        },
                        "aggs": {
                            "elasticQueryResults": {
                                "filter": {
                                    "bool": {
                                        "must": [
                                            {
                                                "regexp": {
                                                    "tags.key.lowercase": search
                                                }
                                            },
                                        ]
                                    }
                                },
                                "aggs": {
                                    "elasticQueryResults": {
                                        "terms": {
                                            "field": "tags.key.raw",
                                            "size": 1000
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        var tagFilter = { key: search };
        tags.unshift(tagFilter);

        queryBody.query = self.getQuery(tags, metrics);
        //note: keep insertion order, expected by elastic search
        multisearchQueryBody.push(queryMetadata);
        multisearchQueryBody.push(queryBody);

        

        // tags.endpoint = 'tagkeys';
        //tags.userid   = headers.auth.getPrincipal();
        //perform the query
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.TAGKEYS_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            suggestions = extractResultsFromElasticSearchResponse(
                resp,
                getElasticQueryResultExtractor('tagKeys')
            );
            var tagsSelected = [];
            for ( var i = 0; i < tags.length; i++ ) {
                tagsSelected.push(tags[i].key);
            }
            suggestions = suggestions.filter( tag => tagsSelected.indexOf(tag) === -1 );
            defer.resolve(suggestions);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    self.getTagValuesByNamespace = function (params) {
        var defer       = Q.defer();
        var suggestions = [];

        var namespace     = params.namespace;
        var metrics     = params.metrics || [];
        var tags = params.tags || [];
        var tagkey = params.tagkey;
        var search = params.search ? 'regexp(' + params.search + ')' : '';
        var headers     = params.headers;

        //build multiquery object
        var multisearchQueryBody = [], queryMetadata, queryBody;
        queryMetadata = {
            "index": namespace.toLowerCase(),
            "query_cache": true
        };
        queryBody     =  {
            "size": 0,
            "query": {},
            "aggs": {
                "elasticQueryResults": {
                    "nested": {
                        "path": "tags"
                    },
                    "aggs": {
                        "elasticQueryResults": {
                            "filter": {
                                "bool": {
                                    "must": [
                                        {
                                            "term": {
                                                "tags.key.lowercase": params.tagkey
                                            }
                                        },
                                    ]
                                }
                            },
                            "aggs": {
                                "elasticQueryResults": {
                                    "terms": {
                                        "field": "tags.value.raw",
                                        "size": 1000
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        var tagFilter = { key: tagkey };
        if ( search ) {
            tagFilter.value = [search];
        }
        tags.unshift(tagFilter);
        queryBody.query = self.getQuery( tags, metrics );

        //note: keep insertion order, expected by elastic search
        multisearchQueryBody.push(queryMetadata);
        multisearchQueryBody.push(queryBody);

        tags.endpoint = 'tagvalues';

        //perform the query
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.TAGVALUES_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            suggestions = extractResultsFromElasticSearchResponse(
                resp,
                getElasticQueryResultExtractor('tagValues')
            );
            defer.resolve(suggestions);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    /**
     * converts Java regular expression notation to Lucene regexp (used by ES).
     * The conversion that we do is related to ^ and $, given that ES
     * assumes that always the regexp are anchored
     * https://www.elastic.co/guide/en/elasticsearch/reference/1.7/query-dsl-regexp-query.html#_standard_operators
     *
     * @param  String the regular expression in JAVA supported Regexp
     * @return String converted regular expression in Lucenes regexp form
     */
    self._convertJavaRegexpToLuceneRegexp = function (value) {
        var convertedValue = value;

        convertedValue = convertedValue.trim();
        var len;
        len            = convertedValue.length;
        if (convertedValue.substr(0, 1) === '^') {
            convertedValue = convertedValue.substr(1, len - 1);
        } else if (convertedValue.substr(0, 1) !== '~') {
            convertedValue = '.*' + convertedValue;
        }
        len = convertedValue.length;

        if (convertedValue.substr(len - 1) === '$' &&
            self.numberTrailingBackslash(convertedValue.substr(0, len - 1)) % 2 === 0) {
            convertedValue = convertedValue.substr(0, len - 1);
        } else if ((convertedValue.substr(0, 1) !== '~') && (convertedValue.substr(len - 1, 1) !== ')')) {
            convertedValue = convertedValue + '.*';
        }

        return convertedValue;
    };

    /**
     * converts regexp/tab_separated/star yamas2 notation to
     * elastic search notation, and inserts it in the passed object
     * @param  Array Array where the converted tag filter will be inserted
     * @param  String value of the tag
     * @return Array Array after the insertion (optional) of the converted tag value
     */
    self._convertTagValueToESNotation = function (targetArray, value) {
        //make it lower case
        value = value.toLowerCase();

        if (value === "*") {
            //if *, do not filter by it because
            //it will take all the series by default
        } else if (value.match(/^regexp/i)) {
            value = value.replace(/^regexp\(/i, "");
            value = value.replace(/\)$/, "");
            value = self._convertJavaRegexpToLuceneRegexp(value);
            targetArray.push(
                {
                    "regexp": {"tags.value": value}
                }
            );
        } else if (value.match(/^librange:\/\//i)) {
            //Note: if there is a librange expression, we do not take it into account
        } else if (-1 !== value.indexOf("|")) {
            //NOTE: keep this after regexp, to avoid confusion with regex pipes
            targetArray.push(
                {
                    "regexp": {"tags.value": value}
                }
            );
        } else { //single value
            targetArray.push(
                {
                    "term": {"tags.value": value}
                }
            );
        }
        return targetArray;
    };

    self._makeQueryBodyPossibleValuesForTag = function (queryParams) {

        //to lowercase
        queryParams.namespace         = queryParams.namespace.toLowerCase();
        queryParams.applicationMetric = queryParams.applicationMetric.map(function (am) {
            return am.toLowerCase();
        });
        queryParams.tag_search.key    = queryParams.tag_search.key.toLowerCase();
        queryParams.tag_search.value  = queryParams.tag_search.value.toLowerCase();

        var queryBody = {
            "size": 0,
            "query": {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": [
                                //First: insert here the tag we are getting the values for
                                //Second: insert here the already selected tag filters
                                //Third: insert here the application_metric filters
                            ]
                        }
                    }
                }
            },
            "aggs": {
                "elasticQueryResults": {
                    "nested": {
                        "path": "tags"
                    },
                    "aggs": {
                        "elasticQueryResults": {
                            "filter": {
                                "bool": {
                                    "must": [
                                        {
                                            "term": {
                                                "tags.key.lowercase": queryParams.tag_search.key
                                            }
                                        },
                                        //Fourth: tag search value
                                    ]
                                }
                            },
                            "aggs": {
                                "elasticQueryResults": {
                                    "terms": {
                                        "field": "tags.value.raw",
                                        "size": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        //First: append the filter tag value
        queryBody.query.filtered.filter.bool.must.push(
            {
                "nested": {
                    "path": "tags",
                    "query": {
                        "bool": {
                            "must": [{
                                "term": {
                                    "tags.key.lowercase": queryParams.tag_search.key
                                }
                            }]
                        }
                    }
                }
            }
        );

        //Second: append the filters tagkey-tagvalue
        _.forEach(queryParams.tags_filtered, function (tagInfo, idx) {
            tagInfo.key   = tagInfo.key.toLowerCase();
            tagInfo.value = tagInfo.value.toLowerCase();

            var tagFilter = self._makeNestedQueryTagsFiltered(tagInfo.key, tagInfo.value);
            queryBody.query.filtered.filter.bool.must.push(tagFilter);
        });

        //Third: append the application_metric filters
        var metricsFilter = {
            "nested": {
                "path": "AM_nested",
                "query": {
                    "bool": {
                        "should": [
                            //fill the metrics here
                        ]
                    }
                }
            }
        };

        var numTerms = 0, metricsArray;
        if (queryParams.applicationMetric.length > 1024) {
            metricsArray = _.cloneDeep(queryParams.applicationMetric);
            sharedutils.shuffleArray(metricsArray);
        } else {
            metricsArray = queryParams.applicationMetric;
        }
        _.forEach(metricsArray, function (app_metric, idx) {
            if (numTerms < 1024) {
                numTerms++;
                metricsFilter.nested.query.bool.should.push(
                    {
                        "term": {"AM_nested.name.lowercase": app_metric}
                    }
                );
            }
        });
        queryBody.query.filtered.filter.bool.must.push(metricsFilter);

        //Fourth: push the filter for the searched tag value
        self._convertTagValueToESNotation(queryBody.aggs.elasticQueryResults.aggs.elasticQueryResults.filter.bool.must, queryParams.tag_search.value);

        return queryBody;
    };

    self.getPossibleValuesForTag = function (params) {
        var defer       = Q.defer();
        var suggestions = [];

        var metrics     = params.metrics;
        var headers     = params.headers;
        var namtQueries = self._splitByNamespaceAM(metrics);

        //augment the nsam_map with the other parameters
        _.forEach(namtQueries, function (objInfo, nsam_key) {
            objInfo.tags_filtered = params.tagsFiltered;
            objInfo.tag_search    = params.tagSearch;
            objInfo.limitResults  = params.limitResults || 50;
        });

        //build multiquery object
        var multisearchQueryBody = [], queryMetadata, queryBody;
        _.forEach(namtQueries, function (namtQuery, idx) {
            queryMetadata = {
                "index": namtQuery.namespace.toLowerCase(),
                "query_cache": true
            };
            queryBody     = self._makeQueryBodyPossibleValuesForTag(namtQuery);

            //note: keep insertion order, expected by elastic search
            multisearchQueryBody.push(queryMetadata);
            multisearchQueryBody.push(queryBody);
        });

        tags.endpoint = 'tagvalues';
        //tags.userid   = headers.auth.getPrincipal();

        startTime = (new Date()).getTime();
        //perform the query
        self._makeESMultiQuery(
            multisearchQueryBody,
            headers,
            appconstant.TAGVALUES_ES_QUERY_TIMEOUT_MS
        ).then(function (resp) {
            suggestions = extractResultsFromElasticSearchResponse(
                resp,
                getElasticQueryResultExtractor('tagValues')
            );
            defer.resolve(suggestions);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    };

    return self;
};
