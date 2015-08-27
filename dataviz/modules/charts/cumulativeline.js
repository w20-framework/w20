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

    // todo : not working
    common.ngModule.directive('w20CumulativeLineChart', [function () {
        return {
            restrict: 'A',
            scope: {
                config: '=w20CumulativeLineChart'
            },
            template: '<svg></svg>',
            link: function (scope, element, attrs) {
                scope.$watch('config.data', function (data) {
                    if (data) {
                        nv.addGraph({
                            generate: function () {
                                var margin = (scope.$eval(scope.config.margin) || {left: 50, top: 50, bottom: 50, right: 50}),
                                    width = scope.config.width - (margin.left + margin.right),
                                    height = scope.config.height - (margin.top + margin.bottom);

                                var chart = nv.models.cumulativeLineChart()
                                    .margin(margin)
                                    .x(scope.config.x === undefined ? function (d) {
                                        return d[0];
                                    } : scope.config.x)
                                    .y(scope.config.y === undefined ? function (d) {
                                        return d[1];
                                    } : scope.config.y)
                                    .forceX(scope.config.forceX === undefined ? [] : scope.$eval(scope.config.forceX)) // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
                                    .forceY(scope.config.forceY === undefined ? [0] : scope.$eval(scope.config.forceY)) // List of numbers to Force into the Y scale
                                    .width(width)
                                    .height(height)
                                    .showLegend(scope.config.showLegend === undefined ? false : scope.config.showLegend)
                                    .showXAxis(scope.config.showXAxis === undefined ? false : scope.config.showXAxis)
                                    .showYAxis(scope.config.showYAxis === undefined ? false : scope.config.showYAxis)
                                    .rightAlignYAxis(scope.config.rightAlignYAxis === undefined ? false : scope.config.rightAlignYAxis)
                                    .noData(scope.config.noData === undefined ? 'No Data Available.' : scope.config.noData)
                                    .interactive(scope.config.interactive === undefined ? true : scope.config.interactive)
                                    .clipEdge(scope.config.clipedge === undefined ? false : scope.config.clipedge)
                                    .clipVoronoi(scope.config.clipvoronoi === undefined ? false : scope.config.clipvoronoi)
                                    .useVoronoi(scope.config.usevoronoi === undefined ? false : scope.config.usevoronoi)
                                    .average(scope.config.average === undefined ? function (d) {
                                        return d.average;
                                    } : scope.config.average())
                                    .color(scope.config.color === undefined ? d3.scale.category10().range() : scope.config.color)
                                    .isArea(scope.config.isarea === undefined ? false : scope.config.isarea);

                                if (scope.config.tooltips) {
                                    chart.tooltip.enabled();
                                }

                                if (scope.config.tooltipContent) {
                                    chart.tooltip.contentGenerator(scope.config.tooltipContent);
                                }

                                common.configureXaxis(chart, scope);
                                common.configureYaxis(chart, scope);

                                var drawChart = function () {
                                    d3.select('#' + attrs.id + ' svg')
                                        .attr('height', height)
                                        .attr('width', width)
                                        .datum(data)
                                        .transition().duration((scope.config.transitionDuration === undefined ? 500 : scope.config.transitionDuration))
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
                }, true);
            }
        };
    }]);


    return {
        angularModules: [ common.ngModuleName ]
    };
});