import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import { DatatranformerService } from './datatranformer.service';
import { _MatAutocompleteMixinBase } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class MultigraphService {

  REGDSID = /q?(\d+)?_?(m|e)(\d+).*/;

  constructor(private utils: UtilsService, private tranxService: DatatranformerService) { }

  // fill up tag values from rawdata
  fillMultiTagValues(widget: any, multiConf: any, rawdata: any): any {
    const startTime = new Date().getTime();
    const xTemp = multiConf.x ? '{{{' + Object.keys(multiConf.x).join('}}}/{{{') + '}}}' : 'x';
    const yTemp = multiConf.y ? '{{{' + Object.keys(multiConf.y).join('}}}/{{{') + '}}}' : 'y';
    let xCombine = [];
    let yCombine = [];
    let lookupData = {};
    const results = {};
    const regex = /\{\{([\w-.:\/]+)\}\}/ig;
    const aliasMap = {};
    let hasToT = false;
    // we need to handle the case that query or metric is disable
    for (let i = 0; i < rawdata.results.length; i++) {
      const [source, mid] = rawdata.results[i].source.split(':');
      const midExToT = mid.split('-')[0];
      const tot = mid.split('-')[1];
      hasToT = tot ? true : false;
      const qids = this.REGDSID.exec(mid);
      const qIndex = qids[1] ? parseInt(qids[1], 10) - 1 : 0;
      const mIndex = this.utils.getDSIndexToMetricIndex(widget.queries[qIndex], parseInt(qids[3], 10) - 1, qids[2]);
      const gConfig = widget.queries[qIndex] ? widget.queries[qIndex] : null;
      const mConfig = gConfig && gConfig.metrics[mIndex] ? gConfig.metrics[mIndex] : null;
      const vConfig = mConfig && mConfig.settings ? mConfig.settings.visual : {};
      const dataSrc = rawdata.results[i];
      const mLabel = this.utils.getWidgetMetricDefaultLabel(widget.queries, qIndex, mIndex);
      if (gConfig && gConfig.settings.visual.visible && vConfig.visible) {
        if (dataSrc.source) {
          for (let j = 0; j < dataSrc.data.length; j++) {
            let alias = vConfig.label === '' ? '' : '~' + vConfig.label;
            // collecting alias marco key values
            if (alias.trim() !== '') {
              const matches = alias.match(regex);
              if (matches) {
                const mTags = { metric: !mConfig.expression ? dataSrc.data[j].metric : mLabel, ...dataSrc.data[j].tags };
                for (let i = 0, len = matches.length; i < len; i++) {
                  const key = matches[i].replace(/\{|\}/g, '');
                  if (mTags[key]) {
                    if (!aliasMap[key]) { aliasMap[key] = []; }
                    if (!aliasMap[key].includes(mTags[key])) {
                      aliasMap[key].push(mTags[key]);
                    }
                  }
                }
              }
            }
            // if it hasToT and expression, the metric in data return has ToT info, exclude it
            let tempMetric = !mConfig.expression ? dataSrc.data[j].metric : hasToT ? midExToT : mid;
            const tags = { metric_group: mConfig.id + '~' + tempMetric + alias, ...dataSrc.data[j].tags };
            let x = xTemp;
            let y = yTemp;
            // resolve multigraph with values
            const tagKeys = Object.keys(tags);
            for (let k = 0; k < tagKeys.length; k++) {
              const key = tagKeys[k];
              const tagValue = key === 'metric_group' ? tags[key] : tags[key].toLowerCase();
              if (multiConf.x && x.indexOf(key) !== -1) {
                x = x.replace('{{{' + key + '}}}', tagValue);
                if (multiConf.x[key] && !multiConf.x[key].values.includes(tagValue)) {
                  multiConf.x[key].values.push(tagValue);
                }
              }
              if (multiConf.y && y.indexOf(key) !== -1) {
                y = y.replace('{{{' + key + '}}}', tagValue);
                if (multiConf.y[key] && !multiConf.y[key].values.includes(tagValue)) {
                  multiConf.y[key].values.push(tagValue);
                }
              }
            }
            if (!lookupData[y]) {
              lookupData[y] = {};
            }
            if (!lookupData[y][x]) {
              lookupData[y][x] = {
                results: []
              };
            }
            let srcIndex = lookupData[y][x].results.findIndex(d => d.source === dataSrc.source);
            if (srcIndex === -1) {
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
    // turn array to string and slice them
    let aliasObj = {};
    if (Object.keys(aliasMap).length > 0) {
      for (let key in aliasMap) {
        aliasObj[key] = aliasMap[key].sort().join('');
        aliasObj[key] = aliasObj[key].length > 20 ? aliasObj[key].slice(0, 20) + '...' : aliasObj[key];
      }
      let lookupStr = JSON.stringify(lookupData);
      let multiConfStr = JSON.stringify(multiConf);
      for (let key in aliasObj) {
        let _regex = new RegExp('{{' + key + '}}', 'gi');
        lookupStr = lookupStr.replace(_regex, aliasObj[key]);
        multiConfStr = multiConfStr.replace(_regex, aliasObj[key]);
      }
      lookupData = JSON.parse(lookupStr);
      multiConf = JSON.parse(multiConfStr);
    }
    // let build the master results table
    const xAll = multiConf.x ? [] : [['x']];
    const yAll = multiConf.y ? [] : [['y']];
    for (const tag in multiConf.x) {
      if (multiConf.x.hasOwnProperty(tag)) {
        multiConf.x[tag].values.sort(this.utils.sortAliasforMultigraph(multiConf.x[tag].sortAs));
        xAll.push(multiConf.x[tag].values);
      }
    }
    for (const tag in multiConf.y) {
      if (multiConf.y.hasOwnProperty(tag)) {
        multiConf.y[tag].values.sort(this.utils.sortAliasforMultigraph(multiConf.y[tag].sortAs));
        yAll.push(multiConf.y[tag].values);
      }
    }
    // apply sort for those keys based on con
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
    if (!Object.keys(lookupData).length) {
      results['y'] = { 'x': rawdata };
    }
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
            sortAs: chart.sortAs ? chart.sortAs : 'asc',
            values: []
          };
        } else if (chart.displayAs === 'y') {
          if (!conf['y']) { conf['y'] = {}; }
          conf['y'][chart.key] = {
            sortAs: chart.sortAs ? chart.sortAs : 'asc',
            values: []
          };
        } else {
          if (!conf['g']) { conf['g'] = {}; }
          conf['g'][chart.key] = {
            sortAs: chart.sortAs ? chart.sortAs : 'asc',
            values: []
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
    if (!a.length) { return b; }
    if (!b.length) { return a; }
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
  // this will update multigrap config based on groupby tags of a query
  updateMultigraphConf(groupByTags: string[], multigraph: any) {
    if (groupByTags.length) {
      // make sure to keep item that key are in groupTags
      multigraph.chart = multigraph.chart.filter(item => item.key === 'metric_group' || groupByTags.includes(item.key));
      for (let i = 0; i < groupByTags.length; i++) {
        if (multigraph.chart.findIndex((t: any) => t.key === groupByTags[i]) > -1) {
          continue;
        }
        const item = {
          key: groupByTags[i],
          displayAs: 'g',
          sortAs: 'asc'
        };
        multigraph.chart.push(item);
      }
    } else {
      multigraph.chart = multigraph.chart.filter(item => item.key === 'metric_group');
    }
  }
}
