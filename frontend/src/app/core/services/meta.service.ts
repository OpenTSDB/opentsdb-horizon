import { Injectable } from '@angular/core';
import { UtilsService } from '../services/utils.service';


@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(private utilsService: UtilsService) { }

  getQuery(source, type, params, andOp = true) {
    const [ mSource, fType ] = source.split(':');
    params = Array.isArray(params) ? params : [params];
    const metaQuery: any = {
      'from': 0,
      'to': 1,
      'order': 'ASCENDING',
      'type': type,
      'source': mSource === 'aurastatus' ? 'aurastatus' : '',
      'aggregationSize': 1000,
      'queries': [],
    };

    for ( let i = 0, len = params.length; i < len; i++ ) {
      let filters = [];
      const query: any = {};
      query.id = params[i].id || 'id-' + i;
      query.namespace =  type !== 'NAMESPACES' ? params[i].namespace : this.utilsService.convertPatternTSDBCompat(params[i].search);
      if ( type === 'TAG_KEYS_AND_VALUES' && params[i].tagkey ) {
        metaQuery.aggregationField =  params[i].tagkey;
        filters.push({
          type: 'TagValueRegex',
          filter: this.utilsService.convertPattern(params[i].search),
          tagKey: params[i].tagkey
        });
      } else if ( type === 'BASIC' ) {
        filters.push({
          type: 'AnyFieldRegex',
          filter: this.utilsService.convertPattern(params[i].search),
        });
      }
      switch( type ) {
        case 'METRICS':
          filters.push({
            'type': 'MetricRegex',
            'metric': this.utilsService.convertPattern(params[i].search)
          });
          break;

        // set the metrics filter only if its set. tsdb requires atleast one filter in the query
        case 'TAG_KEYS':
            if ( mSource === 'meta' ) {
              filters.push({
                'type': 'TagKeyRegex',
                'filter': this.utilsService.convertPattern(params[i].search)
              });
            }
          break;
      }

      if (params[i].metrics && params[i].metrics.length) {
        if (andOp) {
          for (let j = 0; j < params[i].metrics.length; j++) {
            filters.push({
              'type': 'MetricLiteral',
              'metric': params[i].metrics[j]
            });
          }
        } else {
          filters.push({
            'type': 'MetricLiteral',
            'metric': params[i].metrics.join('|')
          });
        }
      }

      if ( mSource === 'aurastatus' && (type === 'TAG_KEYS' || type === 'TAG_KEYS_AND_VALUES') ) {
        filters.unshift({
          'type': 'FieldLiteralOr',
          'key': 'statusType',
          'filter': fType === 'alert' ? 'alert' : 'check'
        });
      }

      for (let k = 0;  params[i].tags && k < params[i].tags.length; k++) {
          const f = params[i].tags[k];
          const values = f.filter;
          const filter:any = values.length === 1 ? [this.getFilter(f.tagk, values[0])] : this.getChainFilter(f.tagk, values);
          filters = filters.concat(filter);
      }
      if ( filters.length ) {
        query.filter = {
                          'type': 'Chain',
                          'filters': filters
                        };
      }
      metaQuery.queries.push(query);
    }

    return metaQuery;
  }

  getFilter(key, v) {
    const filterTypes = { 'literalor': 'TagValueLiteralOr', 'wildcard': 'TagValueWildCard', 'regexp': 'TagValueRegex'};
    let hasNotOp = false;
    if ( v[0] === '!' ) {
        hasNotOp = true;
        v = v.substr(1);
    }
    const regexp = v.match(/regexp\((.*)\)/);
    v = regexp ? regexp[1] : v;
    const type = regexp  ? 'regexp' : 'literalor';
    const filter = {
        type: filterTypes[type],
        filter: v,
        tagKey: key
    };
    return !hasNotOp ? filter : { type: 'NOT', filter: filter };
  }

  getChainFilter(key, values) {
    const literalorV = {};
    const filters = {};

    for ( let i = 0, len = values.length; i < len; i++ ) {
      let v = values[i];
      let operator = 'include';
      if ( v[0] === '!' ) {
          operator = 'exclude';
          v = v.substr(1);
      }
      if ( !filters[operator] ) {
        filters[operator] = [];
      }
      const regexp = v.match(/regexp\((.*)\)/);
      const type = regexp  ? 'regexp' : 'literalor';
      if ( type === 'regexp') {
        filters[operator].push(this.getFilter(key, v));
      } else {
        if ( !literalorV[operator] ) {
          literalorV[operator] = [];
        }
        literalorV[operator].push(v);
      }
    }

    for ( const operator in literalorV ) {
      if ( literalorV[operator].length ) {
          const filter = {
              type: 'TagValueLiteralOr',
              filter: literalorV[operator].join('|'),
              tagKey: key
          };
          filters[operator].push(filter);
      }
    }
    const chainFilters = [];
    for ( const operator in filters ) {
        if ( filters[operator] ) {
            const filter: any = {
                'type': 'Chain',
                'op': 'OR',
                'filters': filters[operator]
            };
            chainFilters.push(operator === 'include' ? filter : { type: 'NOT', filter: filter } );
        }
    }
    return chainFilters;
  }
}
