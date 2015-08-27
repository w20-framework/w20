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
    '{d3}/d3',
    '{nvd3}/nv.d3',
    '{w20-dataviz}/modules/charts/common',
    '[css]!{nvd3}/nv.d3'
], function (angular, d3, nv, common) {
    'use strict';

    /**
     * @ngdoc directive
     * @name w20DatavizCharts.directive:w20BulletChart
     * @restrict A
     *
     * @description
     *
     * A bullet graph is a variation of a bar graph developed by Stephen Few. Seemingly inspired by the traditional thermometer
     * charts and progress bars found in many dashboards, the bullet graph serves as a replacement for dashboard gauges and meters.
     *
     * Configuration
     * -------------
     *
     *      "bullet":{},
     *
     * Fragment definition sections
     * ----------------------------
     *
     * This module has no fragment definition section.
     *
     * The w20BulletChart directive allows you to declare the chart on your html markup and specify the configuration object to be used in your controller.
     * <div class="alert alert-info"> You must indicate a unique id for the chart </div>
     *
     *
     * <div id="multibar" data-w20-bullet-chart="bulletChartConfig"></div>
     *
     */
    common.ngModule.directive('w20BulletChart', [function () {
        return {
            restrict: 'A',
            scope: {
                config: '=w20BulletChart'
            },
            template: '<svg><svg>',
            link: function (scope, element, attrs) {
                scope.$watch('config.data', function (data) {
                    if (data) {
                        nv.addGraph({
                            generate: function () {
                                var margin = {left: 150, top: 10, bottom: 10, right: 10},
                                    width = scope.config.width,
                                    height = scope.config.height;

                                var chart = nv.models.bulletChart()
                                    .margin(margin)
                                    .orient(scope.config.orient === undefined ? 'left' : scope.config.orient)
                                    .ranges(scope.config.ranges === undefined ? function (d) {
                                        return d.ranges;
                                    } : scope.config.ranges())
                                    .markers(scope.config.markers === undefined ? function (d) {
                                        return d.markers;
                                    } : scope.config.markers())
                                    .measures(scope.config.measures === undefined ? function (d) {
                                        return d.measures;
                                    } : scope.config.measures())
                                    .tickFormat(scope.config.tickFormat === undefined ? null : scope.config.tickFormat())
                                    .noData(scope.config.noData === undefined ? 'No Data Available.' : scope.config.noData);

                                if (scope.config.tooltips) {
                                    chart.tooltip.enabled();
                                }

                                if (scope.config.tooltipContent) {
                                    chart.tooltipContent(scope.config.tooltipContent());
                                }

                                var drawChart = function () {
                                    d3.select('#' + attrs.id + ' svg')
                                        .attr('height', height)
                                        .attr('width', width)
                                        .datum(data)
                                        .call(chart);
                                };

                                drawChart();
                                element.on('resize', function () {
                                    drawChart();
                                });

                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (scope.config.objectequality === undefined ? false : scope.config.objectequality === 'true'));
            }
        };
    }]);


    return {
        angularModules: [ common.ngModuleName ]
    };
});