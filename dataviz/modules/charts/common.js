/*
 * Copyright (c) 2013-2015 by The SeedStack authors. All rights reserved.
 *
 * This file is part of SeedStack, An enterprise-oriented full development stack.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    '{angular}/angular',
    '{d3}/d3'
], function (angular, d3) {
    'use strict';

    /**
     * Used to configure charts axis
     * @param chart the charts configured
     * @param scope chart's scope
     * @param attrs chart's attributes
     */

        // execute "fisheye" (magnifying) view for some charts (ex. scatter)
    (function () {
        d3.fisheye = {
            scale: function (scaleType) {
                return d3_fisheye_scale(scaleType(), 3, 0);
            },
            circular: function () {
                var radius = 200,
                    distortion = 2,
                    k0,
                    k1,
                    focus = [0, 0];

                function fisheye(d) {
                    var dx = d.x - focus[0],
                        dy = d.y - focus[1],
                        dd = Math.sqrt(dx * dx + dy * dy);
                    if (!dd || dd >= radius) {
                        return {x: d.x, y: d.y, z: 1};
                    }
                    var k = k0 * (1 - Math.exp(-dd * k1)) / dd * 0.75 + 0.25;
                    return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
                }

                function rescale() {
                    k0 = Math.exp(distortion);
                    k0 = k0 / (k0 - 1) * radius;
                    k1 = distortion / radius;
                    return fisheye;
                }

                fisheye.radius = function (_) {
                    if (!arguments.length) {
                        return radius;
                    }
                    radius = +_;
                    return rescale();
                };

                fisheye.distortion = function (_) {
                    if (!arguments.length) {
                        return distortion;
                    }
                    distortion = +_;
                    return rescale();
                };

                fisheye.focus = function (_) {
                    if (!arguments.length) {
                        return focus;
                    }
                    focus = _;
                    return fisheye;
                };

                return rescale();
            }
        };

        function d3_fisheye_scale(scale, d, a) {

            function fisheye(_) {
                var x = scale(_),
                    left = x < a,
                    range = d3.extent(scale.range()),
                    min = range[0],
                    max = range[1],
                    m = left ? a - min : max - a;
                if (m === 0) {
                    m = max - min;
                }
                return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
            }

            fisheye.distortion = function (_) {
                if (!arguments.length) {
                    return d;
                }
                d = +_;
                return fisheye;
            };

            fisheye.focus = function (_) {
                if (!arguments.length) {
                    return a;
                }
                a = +_;
                return fisheye;
            };

            fisheye.copy = function () {
                return d3_fisheye_scale(scale.copy(), d, a);
            };

            fisheye.nice = scale.nice;
            fisheye.ticks = scale.ticks;
            fisheye.tickFormat = scale.tickFormat;
            return d3.rebind(fisheye, scale, 'domain', 'range');
        }
    })();


    function configureXaxis(chart, scope) {
        if (scope.config.xAxisOrient) { // ?
            chart.xAxis.orient(scope.config.xAxisOrient);
        }
        if (scope.config.xAxisTicks) { // ?
            chart.xAxis.scale().ticks(scope.config.xAxisTicks);
        }
        if (scope.config.xAxisTickValues) {
            if (Array.isArray(scope.config.xAxisTickValues)) {
                chart.xAxis.tickValues(scope.config.xAxisTickValues);
            } else if (typeof scope.config.xAxisTickValues === 'function') {
                chart.xAxis.tickValues(scope.config.xAxisTickValues());
            }
        }
        if (scope.config.xAxisTickSubdivide) {
            chart.xAxis.tickSubdivide(scope.config.xAxisTickSubdivide);
        }
        if (scope.config.xAxisTickSize) { // ?
            chart.xAxis.tickSize(scope.config.xAxisTickSize);
        }
        if (scope.config.xAxisTickPadding) {
            chart.xAxis.tickPadding(scope.config.xAxisTickPadding);
        }
        if (scope.config.xAxisTickFormat) {
            chart.xAxis.tickFormat(scope.config.xAxisTickFormat);
        }
        if (scope.config.xAxisLabel) {
            chart.xAxis.axisLabel(scope.config.xAxisLabel);
        }
        if (scope.config.xAxisScale) {
            chart.xAxis.scale(scope.config.xAxisScale);
        }
        if (scope.config.xAxisDomain) {
            chart.xDomain(scope.config.xAxisDomain);
        }
        if (scope.config.xAxisRange) {
            chart.xRange(scope.config.xAxisRange);
        }
        if (scope.config.xAxisRangeBand) {
            chart.xAxis.rangeBand(scope.config.xAxisRangeBand());
        }
        if (scope.config.xAxisRangeBands) {
            chart.xAxis.rangeBands(scope.config.xAxisRangeBands());
        }
        if (scope.config.xAxisShowMaxMin) {
            chart.xAxis.showMaxMin(scope.config.xAxisShowMaxMin);
        }
        if (scope.config.xAxisHighlightZero) {
            chart.xAxis.highlightZero(scope.config.xAxisHighlightZero);
        }
        if (scope.config.xAxisRotateLabels) {
            chart.xAxis.rotateLabels(scope.config.xAxisRotateLabels);
        }
//      if(scope.config.xaxisrotateylabel){
//          chart.xAxis.rotateYLabel(scope.config.xaxisrotateylabel);
//      }
        if (scope.config.xAxisStaggerLabels) {
            chart.xAxis.staggerLabels(scope.config.xAxisStaggerLabels);
        }
    }

    function configureX2axis(chart, scope) {
        if (scope.config.x2AxisOrient) { // ?
            chart.x2Axis.orient(scope.config.x2AxisOrient);
        }
        if (scope.config.x2AxisTicks) { // ?
            chart.x2Axis.scale().ticks(scope.config.x2AxisTicks);
        }
        if (scope.config.x2AxisTickValues) {
            if (Array.isArray(scope.config.x2AxisTickValues)) {
                chart.x2Axis.tickValues(scope.config.x2AxisTickValues);
            } else if (typeof scope.config.x2AxisTickValues === 'function') {
                chart.x2Axis.tickValues(scope.config.x2AxisTickValues());
            }
        }
        if (scope.config.x2AxisTickSubdivide) {
            chart.x2Axis.tickSubdivide(scope.config.x2AxisTickSubdivide);
        }
        if (scope.config.x2AxisTickSize) { // ?
            chart.xAxis.tickSize(scope.config.xAxisTickSize);
        }
        if (scope.config.xAxisTickPadding) {
            chart.x2Axis.tickPadding(scope.config.x2AxisTickPadding);
        }
        if (scope.config.x2AxisTickFormat) {
            chart.x2Axis.tickFormat(scope.config.x2AxisTickFormat);
        }
        if (scope.config.x2AxisLabel) {
            chart.x2Axis.axisLabel(scope.config.x2AxisLabel);
        }
        if (scope.config.x2AxisScale) {
            chart.x2Axis.scale(scope.config.x2AxisScale);
        }
//        if (scope.config.x2AxisDomain) {
//            chart.xDomain(scope.config.x2AxisDomain);
//        }
//        if (scope.config.x2AxisRange) {
//            chart.xRange(scope.config.xAxisRange);
//        }
        if (scope.config.x2AxisRangeBand) {
            chart.x2Axis.rangeBand(scope.config.x2AxisRangeBand());
        }
        if (scope.config.x2AxisRangeBands) {
            chart.x2Axis.rangeBands(scope.config.x2AxisRangeBands());
        }
        if (scope.config.x2AxisShowMaxMin) {
            chart.x2Axis.showMaxMin(scope.config.x2AxisShowMaxMin);
        }
        if (scope.config.x2AxisHighlightZero) {
            chart.x2Axis.highlightZero(scope.config.x2AxisHighlightZero);
        }
        if (scope.config.x2AxisRotateLabels) {
            chart.x2Axis.rotateLabels(scope.config.x2AxisRotateLabels);
        }
//      if(scope.config.xaxisrotateylabel){
//          chart.xAxis.rotateYLabel(scope.config.xaxisrotateylabel);
//      }
        if (scope.config.x2AxisStaggerLabels) {
            chart.x2Axis.staggerLabels(scope.config.x2AxisStaggerLabels);
        }
    }

    function configureYaxis(chart, scope) {
        if (scope.config.yAxisOrient) {
            chart.yAxis.orient(scope.config.yAxisOrient);
        }
        if (scope.config.yAxisTicks) {
            chart.yAxis.scale().ticks(scope.config.yAxisTicks);
        }
        if (scope.config.yAxisTickValues) {
            if (Array.isArray(scope.$eval(scope.config.yAxisTickValues))) {
                chart.yAxis.tickValues(scope.$eval(scope.config.yAxisTickValues));
            } else if (typeof scope.config.yAxisTickValues() === 'function') {
                chart.yAxis.tickValues(scope.config.yAxisTickValues());
            }
        }
        if (scope.config.yAxisTickSubdivide) {
            chart.yAxis.tickSubdivide(scope.config.yAxisTickSubdivide());
        }
        if (scope.config.yAxisTickSize) {
            chart.yAxis.tickSize(scope.config.yAxisTickSize());
        }
        if (scope.config.yAxisTickPadding) {
            chart.yAxis.tickPadding(scope.config.yAxisTickPadding());
        }
        if (scope.config.yAxisTickFormat) {
            chart.yAxis.tickFormat(scope.config.yAxisTickFormat);
        }
        if (scope.config.yAxisLabel) {
            chart.yAxis.axisLabel(scope.config.yAxisLabel);
        }
        if (scope.config.yAxisScale) {
            chart.yAxis.yScale(scope.config.yAxisScale());
        }
        if (scope.config.yAxisDomain) {
            chart.yDomain(scope.config.yAxisDomain);
        }
        if (scope.config.yAxisRange) {
            chart.yRange(scope.config.yAxisRange);
        }
        if (scope.config.yAxisRangeBand) {
            chart.yAxis.rangeBand(scope.config.yAxisRangeBand());
        }
        if (scope.config.yAxisRangeBands) {
            chart.yAxis.rangeBands(scope.config.yAxisRangeBands());
        }
        if (scope.config.yAxisShowMaxMin) {
            chart.yAxis.showMaxMin(scope.config.yAxisShowMaxMin);
        }
        if (scope.config.yAxisHighlightZero) {
            chart.yAxis.highlightZero(scope.config.yAxisHighlightZero);
        }
        if (scope.config.yAxisRotateLabels) {
            chart.yAxis.rotateLables(scope.config.yAxisRotateLabels);
        }
        if (scope.config.yAxisRotateYLabel) {
            chart.yAxis.rotateYLabel(scope.config.yAxisRotateYLabel);
        }
        if (scope.config.yAxisStaggerLabels) {
            chart.yAxis.staggerLabels(scope.config.yAxisStaggerLabels);
        }
    }


    function configureY1axis(chart, scope) {
        if (scope.config.y1AxisTicks) {
            chart.y1Axis.scale().ticks(scope.config.y1AxisTicks);
        }
        if (scope.config.y1AxisTickValues) {
            chart.y1Axis.tickValues(scope.config.y1AxisTickValues);
        }
        if (scope.config.y1AxisTickSubdivide) {
            chart.y1Axis.tickSubdivide(scope.config.y1AxisTickSubdivide());
        }
        if (scope.config.y1AxisTickSize) {
            chart.y1Axis.tickSize(scope.config.y1AxisTickSize());
        }
        if (scope.config.y1AxisTickPadding) {
            chart.y1Axis.tickPadding(scope.config.y1AxisTickPadding());
        }
        if (scope.config.y1AxisTickFormat) {
            chart.y1Axis.tickFormat(scope.config.y1AxisTickFormat);
        }
        if (scope.config.y1AxisLabel) {
            chart.y1Axis.axisLabel(scope.config.y1AxisLabel);
        }
        if (scope.config.y1AxisScale) {
            chart.y1Axis.yScale(scope.config.y1AxisScale());
        }
        if (scope.config.y1AxisDomain) {
            chart.y1Axis.domain(scope.config.y1AxisDomain());
        }
        if (scope.config.y1AxisRange) {
            chart.y1Axis.range(scope.config.y1AxisRange());
        }
        if (scope.config.y1AxisRangeBand) {
            chart.y1Axis.rangeBand(scope.config.y1AxisRangeBand());
        }
        if (scope.config.y1AxisRangeBands) {
            chart.y1Axis.rangeBands(scope.config.y1AxisRangeBands());
        }
        if (scope.config.y1AxisShowMaxMin) {
            chart.y1Axis.showMaxMin(scope.config.y1AxisShowMaxMin);
        }
        if (scope.config.y1AxisHighlightZero) {
            chart.y1Axis.highlightZero(scope.config.y1AxisHighlightZero);
        }
        if (scope.config.y1AxisRotateLabels) {
            chart.y1Axis.highlightZero(scope.config.y1AxisRotateLabels);
        }
        if (scope.config.y1AxisRotateYLabel) {
            chart.y1Axis.rotateYLabel(scope.config.y1AxisRotateYLabel);
        }
        if (scope.config.y1AxisStaggerLabels) {
            chart.y1Axis.staggerlabels(scope.config.y1AxisStaggerLabels);
        }
    }


    function configureY2axis(chart, scope) {
        if (scope.config.y2AxisTicks) {
            chart.y2Axis.scale().ticks(scope.config.y2AxisTicks);
        }
        if (scope.config.y2AxisTickValues) {
            chart.y2Axis.tickValues(scope.$eval(scope.config.y2AxisTickValues));
        }
        if (scope.config.y2AxisTickSubdivide) {
            chart.y2Axis.tickSubdivide(scope.config.y2AxisTickSubdivide());
        }
        if (scope.config.y2AxisTickSize) {
            chart.y2Axis.tickSize(scope.config.y2AxisTickSize());
        }
        if (scope.config.y2AxisTickPadding) {
            chart.y2Axis.tickPadding(scope.config.y2AxisTickPadding());
        }
        if (scope.config.y2AxisTickFormat) {
            chart.y2Axis.tickFormat(scope.config.y2AxisTickFormat);
        }
        if (scope.config.y2AxisLabel) {
            chart.y2Axis.axisLabel(scope.config.y2AxisLabel);
        }
        if (scope.config.y2AxisScale) {
            chart.y2Axis.yScale(scope.config.y2AxisScale());
        }
        if (scope.config.y2AxisDomain) {
            chart.y2Axis.domain(scope.config.y2AxisDomain());
        }
        if (scope.config.y2AxisRange) {
            chart.y2Axis.range(scope.config.y2AxisRange());
        }
        if (scope.config.y2AxisRangeBand) {
            chart.y2Axis.rangeBand(scope.config.y2AxisRangeBand());
        }
        if (scope.config.y2AxisRangeBands) {
            chart.y2Axis.rangeBands(scope.config.y2AxisRangeBands());
        }
        if (scope.config.y2AxisShowMaxMin) {
            chart.y2Axis.showMaxMin(scope.config.y2AxisShowMaxMin);
        }
        if (scope.config.y2AxisHighlightZero) {
            chart.y2Axis.highlightZero(scope.config.y2AxisHighlightZero);
        }
        if (scope.config.y2AxisRotateLabels) {
            chart.y2Axis.highlightZero(scope.config.y2AxisRotateLabels);
        }
        if (scope.config.y2AxisRotateYLabel) {
            chart.y2Axis.rotateYLabel(scope.config.y2AxisRotateYLabel);
        }
        if (scope.config.y2AxisStaggerLabels) {
            chart.y2Axis.staggerlabels(scope.config.y2AxisStaggerLabels);
        }
    }

    return {
        ngModule: angular.module('w20DatavizCharts', []),
        ngModuleName: 'w20DatavizCharts',
        configureXaxis: configureXaxis,
        configureX2axis: configureX2axis,
        configureYaxis: configureYaxis,
        configureY1axis: configureY1axis,
        configureY2axis: configureY2axis
    };
});