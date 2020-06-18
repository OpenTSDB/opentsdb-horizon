import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class MultigraphService {

  REGDSID = /q?(\d+)?_?(m|e)(\d+).*/;

  constructor(private utils: UtilsService) { }

  // fill up tag values from rawdata
  fillMultiTagValues(widget: any, multiConf: any, rawdata: any): any {
    const startTime = new Date().getTime();
    const xTemp = multiConf.x ? '{{' + Object.keys(multiConf.x).join('}}/{{') + '}}' : 'x';
    const yTemp = multiConf.y ? '{{' + Object.keys(multiConf.y).join('}}/{{') + '}}' : 'y';
    let xCombine = [];
    let yCombine = [];
    const lookupData = {};
    const results = {};
    // we need to handle the case that query or metric is disable
    for (let i = 0; i < rawdata.results.length; i++) {
      const [ source, mid ] = rawdata.results[i].source.split(':');
      const qids = this.REGDSID.exec(mid);
      const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
      const mIndex = this.utils.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2] );
      const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
      const mConfig = gConfig && gConfig.metrics[mIndex] ? gConfig.metrics[mIndex] : null;
      const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
      const dataSrc = rawdata.results[i];
      if (gConfig && gConfig.settings.visual.visible && vConfig.visible ) {
      if (dataSrc.source) {
        for (let j = 0; j < dataSrc.data.length; j++) {
          const tags = { metric_group: dataSrc.data[j].metric, ...dataSrc.data[j].tags};
          let x = xTemp;
          let y = yTemp;
          const tagKeys = Object.keys(tags);
          for ( let k = 0; k < tagKeys.length; k++ ) {
            const key = tagKeys[k];
            const tagValue = key === 'metric_group' ? tags[key] : tags[key].toLowerCase();
            if ( multiConf.x && x.indexOf(key) !== -1 ) {
              x = x.replace('{{' + key + '}}', tagValue);
              if (multiConf.x[key] && !multiConf.x[key].includes(tagValue)) {
                multiConf.x[key].push(tagValue);
              }
            }
            if ( multiConf.y && y.indexOf(key) !== -1 ) {
              y = y.replace('{{' + key + '}}', tagValue);
              if (multiConf.y[key] && !multiConf.y[key].includes(tagValue)) {
                multiConf.y[key].push(tagValue);
              }
            }
          }
          // console.log("series" + j , "x="+x, "y="+y );
          if ( !lookupData[y] ) {
            lookupData[y] = {};
          }
          if ( !lookupData[y][x] ) {
            lookupData[y][x] = {
              results: []
            };
          }
          let srcIndex = lookupData[y][x].results.findIndex(d => d.source === dataSrc.source);
          if ( srcIndex === -1 ) {
            lookupData[y][x].results.push({
                                            source: dataSrc.source,
                                            timeSpecification: dataSrc.timeSpecification,
                                            data: []
                                          });
            srcIndex = lookupData[y][x].results.length - 1;
          }
          lookupData[y][x].results[srcIndex].data.push(dataSrc.data[j]);
        }
      }
    }
    }
    // let build the master results table
    const xAll = multiConf.x ? [] : [['x']];
    const yAll = multiConf.y ? [] : [['y']];
    for (const tag in multiConf.x) {
      if (multiConf.x.hasOwnProperty(tag)) {
        xAll.push(multiConf.x[tag]);
      }
    }
    for (const tag in multiConf.y) {
      if (multiConf.y.hasOwnProperty(tag)) {
        yAll.push(multiConf.y[tag]);
      }
    }
    for (let i = 0; i < xAll.length; i++) {
      xCombine = this.combineKeys(xCombine, xAll[i]);
    }
    for (let i = 0; i < yAll.length; i++) {
      yCombine = this.combineKeys(yCombine, yAll[i]);
    }
    for (let i = 0; i < yCombine.length; i++) {
        for (let j = 0; j < xCombine.length; j++) {
            if ((multiConf.layout === 'grid' || lookupData[yCombine[i]]) && !results[yCombine[i]]) { 
                results[yCombine[i]] = {};
            }
            if (!results[yCombine[i]][xCombine[j]] && multiConf.layout === 'grid') {
                results[yCombine[i]][xCombine[j]] = {};
            }
            if (lookupData[yCombine[i]] && lookupData[yCombine[i]][xCombine[j]]) {
                results[yCombine[i]][xCombine[j]] = lookupData[yCombine[i]][xCombine[j]];
            }
        }
    }
    if ( !Object.keys(lookupData).length ) {
      results['y'] = {'x': rawdata };
    }
    // we need to sort the results first before apply limit or anything on it
   
   /*  const sortedResults = {};
    Object.keys(results)
      .sort(this.utils.sortAlphaNum)
      .forEach((k1) => {
        sortedResults[k1] = {};
        Object.keys(results[k1])
          .sort(this.utils.sortAlphaNum)
          .forEach((k2) => {
            sortedResults[k1][k2] = results[k1][k2]
          })
      });
    return sortedResults;
    */
   // return no sort
   return results;
  }

  // build multigraph config
  buildMultiConf(multigraph: any): any {
    const conf: any = {};
    if (multigraph) {
      for (let i = 0; i < multigraph.chart.length; i++) {
        const chart = multigraph.chart[i];
        if (chart.displayAs === 'x') {
          if (!conf['x']) { conf['x'] = {}; }
          conf['x'][chart.key] = {
            sortAs: chart.sortAs,
            value: []
          };
        } else if (chart.displayAs === 'y') {
          if (!conf['y']) { conf['y'] = {}; }
          conf['y'][chart.key] = {
            sortAs: chart.sortAs,
            value: []
          };
        } else {
          if (!conf['g']) { conf['g'] = {}; }
          conf['g'][chart.key] = {
            sortAs: chart.sortAs,
            value: []
          };
        }
      }
      conf.layout = multigraph.layout;
    }
    return conf;
  }

  // combine keys
  combineKeys(a: string[], b: string[]): string[] {
    const ret = [];
    if ( !a.length ) { return b; }
    if ( !b.length ) { return a; }
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        ret.push(a[i] + '/' + b[j]);
      }
    }
    return ret;
  }

  // to get all groupby tags of a wigdet
  getGroupByTags(queries: any[]): string[] {
    let ret = [];
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      for (let j = 0; j < query.metrics.length; j++) {
        const metric = query.metrics[j];
        if (metric.groupByTags && metric.groupByTags.length) {
          ret = ret.concat(metric.groupByTags.filter((item) => {
            return ret.indexOf(item) < 0;
          }));
        }
      }
    }
    return ret;
  }
}
