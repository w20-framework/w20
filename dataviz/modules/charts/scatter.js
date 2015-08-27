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
     * @name w20DatavizCharts.directive:w20ScatterChart
     *
     * @description
     *
     * The scatter chart is used to compare different series between 3 values : X and Y axis + size of data.
     *
     * Configuration
     * -------------
     *
     *      "scatter":{},
     *
     * Fragment definition sections
     * ----------------------------
     *
     * This module has no fragment definition section.
     *
     *
     * Data format
     * ---------------
     *
     * Data fed to the scatter chart should follow a default format.
     *
     * Default data format exemple :
     *
     *      [
     *       {
     *          "key": "Series 1",
     *          "values": [ {
      *                     x: 10,
      *                     y: 20,
      *                     size: 0.5
      *                     },
      *                     {
      *                     x: 12,
      *                     y: 13,
      *                     size: 0.9
      *                     }
      *                     ]
     *       },
     *       {
     *          "key": "Series 2",
     *          "values":  [ {
      *                     x: 15,
      *                     y: 2,
      *                     size: 0.5
      *                     },
      *                     {
      *                     x: 15,
      *                     y: 13,
      *                     size: 0.6
      *                     }
      *                     ]
     *       }
     *      ]
     *
     * The <code>key</code> property defines the name of the series. The <code>values</code> defines the data of the series.
     *
     *
     * Scatter chart configuration
     * ---------------
     *
     * The scatter chart is configured by the configuration object passed to the directive declaration (see Directives).
     *
     *  Exemple :
     *
     *     $scope.scatterConfig = {
     *       data: $scope.scatterChartData,
     *       tooltips: true,
     *       showLegend: true,
     *       showControls: true,
     *     }
     *
     * Available properties :
     *
     * <table style="width: 100%; text-align: left;" class="table table-striped table-bordered table-condensed">
     *    <thead>
     *        <tr>
     *            <th>Properties</th>
     *            <th>Type</th>
     *            <th>Description</th>
     *        </tr>
     *    </thead>
     *    <tbody>
     *        <tr>
     *            <td>data</td>
     *            <td>Array</td>
     *            <td>Data to display using the scatter chart (mandatory if you don't define the "noData" property.). Generally it would be a property of $scope</td>
     *        </tr>
     *        <tr>
     *            <td>x</td>
     *            <td>function</td>
     *            <td>Providing a function to the x property allows configuration of the data on the X axis. Consider this example : say we want to double the data value displayed on the X axis in comparison to the data provided to the "data" property.
     *            We can achieve this by providing the following function to the x property :
     *            <code>function(){
     *                       return function(d){
     *                            return d[0]*2;
     *                        };
     *                   };
     *            </code>
     *              where "d[0]" is all the values at index 0 of all sub arrays of the array at property "values" of all objects in the array provided to the "data" property.
     *            </td>
     *        </tr>
     *        <tr>
     *            <td>tooltipXContent</td>
     *            <td>function</td>
     *            <td>Customize tooltip content on the X axis (require tooltips to be true). Ex :
     *            <code>
     *                function (key, x, y) {
     *                                   return '&ltstrong&gt' + x + '&lt/strong&gt';
     *                               })
     *             </code>
     *             </td>
     *        </tr>
     *        <tr>
     *            <td>tooltipYContent</td>
     *            <td>function</td>
     *            <td>Customize tooltip content on the X axis (require tooltips to be true). Ex :
     *            <code>
     *                function (key, x, y) {
     *                                   return '&ltstrong&gt' + y + '&lt/strong&gt';
     *                               })
     *            </code>
     *            </td>
     *        </tr>
     *        <tr>
     *            <td>showLegend</td>
     *            <td>Boolean</td>
     *            <td>Display or hide legend.</td>
     *        </tr>
     *        <tr>
     *            <td>showControls</td>
     *            <td>Boolean</td>
     *            <td>Display or hide controls.</td>
     *        </tr>
     *        <tr>
     *            <td>tooltips</td>
     *            <td>Boolean</td>
     *            <td>Enable or disable tooltips when hovering the chart.</td>
     *        </tr>
     *        <tr>
     *            <td>showDistX</td>
     *            <td>Boolean</td>
     *            <td>Show/hide a line marker to the X value when hovering the point</td>
     *        </tr>
     *        <tr>
     *            <td>showDistY</td>
     *            <td>Boolean</td>
     *            <td>Show/hide a line marker to the Y value when hovering the point</td>
     *        </tr>
     *          <tr>
     *            <td>noData</td>
     *            <td>String</td>
     *            <td>Message to display when there is no data (default to "No data available") </td>
     *        </tr>
     *          <tr>
     *            <td>xPadding</td>
     *            <td>Numeric</td>
     *            <td>distance between ticks on the X axis</td>
     *        </tr>
     *         <tr>
     *            <td>yPadding</td>
     *            <td>Numeric</td>
     *            <td>distance between ticks on the Y axis</td>
     *        </tr>
     *          <tr>
     *            <td>color</td>
     *            <td>Array</td>
     *            <td> Color of series in the corresponding order. Can be hexadecimal, named  or RGB. Ex.  <code>['#4D9FF2', 'yellow', 'rgb(151,109,165)']</code>. Note that you can also
     *            specify the value of the color in the "data" array by providing a "color" attribute to each object. </td>
     *        </tr>
     *         <tr>
     *            <td>transitionDuration</td>
     *            <td>integer</td>
     *            <td>Duration of transition effect (Default to 500).</td>
     *        </tr>
     *          <tr>
     *            <td>fisheye</td>
     *            <td>Numeric</td>
     *            <td>Magnifying factor (when showControls is true)</td>
     *        </tr>
     *
     *
     *
     *    </tbody>
     * </table>
     *
     *
     * Axis Configuration
     * -----------------------
     *
     * Axis are configured in the same configuration object.
     *
     * X axis :
     *
     *  <table style="width: 100%; text-align: left;" class="table table-striped table-bordered table-condensed">
     *    <thead>
     *        <tr>
     *            <th>Properties</th>
     *            <th>Type</th>
     *            <th>Description</th>
     *        </tr>
     *    </thead>
     *    <tbody>
     *        <tr>
     *            <td>xAxisTickValues</td>
     *            <td>Array</td>
     *            <td> Specify explicitly the values to plot on the X axis</td>
     *        </tr>
     *         <tr>
     *            <td>xAxisTickSubdivide</td>
     *            <td>Integer</td>
     *            <td> Specify the number of intermediate ticks to show on the X axis </td>
     *        </tr>
     *         <tr>
     *            <td>xAxisTickPadding</td>
     *            <td>Integer</td>
     *            <td>Specify ticks padding on the X axis</td>
     *        </tr>
     *         <tr>
     *            <td>xAxisTickFormat</td>
     *            <td>function</td>
     *            <td> Specify how data should be formatted. For instance you can format number on the X axis to
     *            have exactly two digit after the decimal point : <code> d3.format('.2f')</code>. Or format Date object to
     *            a readable format as <code> d3.time.format('%Y')</code> which shows the year only. See
     *            <a href="https://github.com/mbostock/d3/wiki/Formatting" target="_blank">d3.js documentation</a>
     *            for a list of all format available
     *            </td>
     *        </tr>
     *         <tr>
     *            <td>xAxisLabel</td>
     *            <td>String</td>
     *            <td>Label of the X axis</td>
     *        </tr>
     *         <tr>
     *            <td>xAxisDomain</td>
     *            <td>Array [start, end]</td>
     *            <td> Specify the domain on the X axis (min to max value)</td>
     *        </tr>
     *         <tr>
     *            <td>xAxisShowMaxMin</td>
     *            <td>Boolean</td>
     *            <td> Show or hide maximum and minimum value in bold</td>
     *        </tr>
     *        <tr>
     *            <td>xAxisRotateLabels</td>
     *            <td>Integer</td>
     *            <td> 0 to 180° rotation of X axis tick label</td>
     *        </tr>
     *         <tr>
     *            <td>xAxisStaggerLabels</td>
     *            <td>Integer</td>
     *            <td>Size of the gap between labels to resolve overlapping issue</td>
     *        </tr>
     *
     *    </tbody>
     *  </table>
     *
     *  Y axis :
     *
     *  See X axis. Replace property "xName" by "yName".
     *
     * The w20ScatterChart directive allows you to declare the chart on your html markup and specify the configuration object to be used in your controller.
     * <div class="alert alert-info"> You must indicate a unique id for the chart </div>
     *
     *     <div id="scatter" data-w20-scatter-chart="scatterConfig"></div>
     *
     *
     *
     */

    common.ngModule.directive('w20ScatterChart', [function () {
        return {
            restrict: 'A',
            scope: {
                config: '=w20ScatterChart'
            },
            template: '<svg></svg>',
            link: function (scope, element, attrs) {
                scope.$watch('config.data', function (data) {
                    if (data) {
                        //  if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if (scope.chart) {
                            return d3.select('#' + attrs.id + ' svg')
                                .datum(data)
                                .call(scope.chart);
                        }
                        nv.addGraph({
                            generate: function () {
                                var margin = (scope.$eval(scope.config.margin) || {left: 50, top: 50, bottom: 50, right: 50}),
                                    width = scope.config.width,
                                    height = scope.config.height;
                                var chart = nv.models.scatterChart()
                                    .margin(margin)
                                    .tooltipXContent(scope.$eval(scope.config.tooltipXContent) || function (key, x) {
                                        return '<strong>' + x + '</strong>';
                                    })
                                    .tooltipYContent(scope.$eval(scope.config.tooltipYContent) || function (key, x, y) {
                                        return '<strong>' + y + '</strong>';
                                    })
                                    .showControls(scope.config.showControls === undefined ? false : scope.config.showControls)
                                    .showLegend(scope.config.showLegend === undefined ? true : scope.config.showLegend)
                                    .showDistX(scope.config.showDistX === undefined ? true : scope.config.showDistX)
                                    .showDistY(scope.config.showDistY === undefined ? true : scope.config.showDistY)
                                    .xPadding(scope.config.xPadding === undefined ? 0 : (+scope.config.xPadding))
                                    .yPadding(scope.config.yPadding === undefined ? 0 : (+scope.config.yPadding))
                                    .fisheye(scope.config.fishEye === undefined ? 0 : (+scope.config.fishEye))
                                    .noData(scope.config.noData === undefined ? 'No Data Available.' : scope.config.noData)
                                    .color(d3.scale.category10().range());

                                common.configureXaxis(chart, scope);
                                common.configureYaxis(chart, scope);

                                if (scope.config.tooltipContent) {
                                    chart.tooltip.contentGenerator(scope.config.tooltipContent);
                                }

                                if (scope.config.tooltips) {
                                    chart.tooltip.enabled();
                                }

                                var drawChart = function () {
                                    d3.select('#' + attrs.id + ' svg')
                                        .attr('height', height)
                                        .attr('width', width)
                                        .datum(data)
                                        .transition().duration(scope.config.transitionDuration === undefined ? 500 : scope.config.transitionDuration)
                                        .call(chart);
                                };

                                drawChart();
                                element.on('resize', function () {
                                    drawChart();
                                });

                                nv.utils.windowResize(chart.update);

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