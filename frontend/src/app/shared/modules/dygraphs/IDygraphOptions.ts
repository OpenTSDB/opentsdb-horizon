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
// continue adding options
export interface DygraphOptionsAxis {
    valueFormatter?: any;
    labelFormatter?: any;
    tickFormat?: {
        unit?: string;
        precision?: any;
        unitDisplay?: boolean;
        min?: number;
        max?: number;
    };
    valueRange?: number[];
    logscale?: boolean;
    drawAxis?: boolean;
    drawGrid?: boolean;
    independentTicks?: true;
    digitsAfterDecimal?: number;
    axisLabelWidth?: number;
    pixelsPerLabel?: number;
}

export interface IDygraphOptions {
    title?: string;
    width?: number;
    height?: number;
    labels?: any;
    labelsUTC?: boolean;
    labelsDivWidth?: number; // width for label legend
    digitsAfterDecimal?: number;
    connectSeparatedPoints?: boolean;
    drawPoints?: boolean;
    dateWindow?: any[];
    fillAlpha?: number;
    hideOverlayOnMouseOut?: boolean;
    isCustomZoomed?: boolean;
    file?: any;
    legend?: "follow" | "always" | "never" | "onmouseover";
    logscale?: boolean;
    stackedGraph: boolean;
    stackedGraphNaNFill?: string;
    hightlightCircleSize?: number;
    highlightSeriesBackgroundAlpha?: number;
    highlightSeriesBackgroundColor?: string;
    showLabelsOnHighlight?: boolean;
    strokeWidth?: number;
    strokeBorderWidth: number;
    axisLineWidth?: number;
    axisTickSize?: number;
    axisLineColor?: string;
    highlightSeriesOpts?: any;
    axes?: {
        x?: DygraphOptionsAxis;
        y?: DygraphOptionsAxis;
        y2?: DygraphOptionsAxis;
    };
    xlabel?: string;
    ylabel?: string;
    y2label?: string;
    plugins?: any;
    thresholds?: any[];
    series?: any;
    visibilityHash?: any;
    labelsDiv?: any;
    legendFormatter?: any;
    highlightCallback?: any;
    zoomCallback?: any;
    isZoomedIgnoreProgrammaticZoom?: boolean;
    drawCallback?: any;
    underlayCallback?: any;
    labelsKMB?: boolean;
    visibility?: boolean[];
    drawGrid?: boolean;
    gridLineColor?: string;
    plotter?: any[];
    interactionModel?: any;
    heatmap?: any;
    pointSize?: number;
    highlightCircleSize?: number;
    xAxisHeight?: number;
    xRangePad?: number;
    clickCallback?: any;
    isIslandLegendOpen?: boolean;
    initZoom?: any;
}

