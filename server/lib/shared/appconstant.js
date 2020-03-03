'use strict';

var moduleDefinition = function () {

    var moduleAPI = {

        META_SEARCH_TIMEOUT_MS: 15000,
        
        NAMESPACE_ES_QUERY_TIMEOUT_MS: 7000,
        
        NAMESPACE_ES_CACHE_TTL_MS: 1000 * 60 * 60 * 24,

        METRIC_ES_QUERY_TIMEOUT_MS: 7000,

        TAGKEYS_ES_QUERY_TIMEOUT_MS: 7000,

        TAGVALUES_ES_QUERY_TIMEOUT_MS: 7000,
        REGEX_NAM_FORMAT: /([^\.]*)\.([^\.]*)\.(.*)/,
        
    };
    return moduleAPI;
};


 module.exports = moduleDefinition();
