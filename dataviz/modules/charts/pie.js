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
     * The pie chart is used to represent proportion between series.
     *
     * Configuration
     * -------------
     *
     *      "pie":{},
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
     * Data fed to the pie chart should follow a default format. This format can be overridden by the use of personal function (See "x" and "y" properties below).
     *
     * Default data format exemple :
     *
     *      [
     *       {
     *          "key": "Series 1",
     *          "value": 10
     *       },
     *       {
     *          "key": "Series 2",
     *          "value": 20
     *       }
     *      ]
     *
     *<div class="alert alert-info">Note that the pie/donut chart has "value" by default instead of "values" as it can only represent one single value</div>
     *
     * The <code>key</code> property defines the name of the series. The <code>value</code> defines the data of the series.
     *
     *
     * Pie chart configuration
     * ---------------
     *
     * The pie chart is configured by the configuration object passed to the directive declaration (see Directives).
     *
     *  Exemple :
     *
     *     $scope.pieConfig = {
     *       data:$scope.pieData,
     *       showLabels:true,
     *       pieLabelsOutside:true,
     *       showValues:true,
     *       tooltips:true,
     *       labelType:'percent',
     *       showLegend:true
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
     *            <td>Numeric</td>
     *            <td>Data to display using the pie chart (mandatory if you don't define the "noData" property.).</td>
     *        </tr>
     *        <tr>
     *            <td>x</td>
     *            <td>function</td>
     *            <td>Providing a function to the x property allows configuration of the data on the "X" axis. Consider this example : say we want to customize the key value displayed on the "X" axis (X refer to the key and Y to the value) in comparison to the data provided to the "data" property.
     *            We can achieve this by providing the following function to the x property :
     *            <code>function(){
     *                            return d.key+" a custom string appended";
     *                   };
     *            </code>
     *              where "d.key" is all the values of key in the array passed to property "data".
     *            </td>
     *        </tr>
     *        <tr>
     *            <td>y</td>
     *            <td>function</td>
     *            <td>See "x" property above. Applied to the Y axis instead. (Exemple : double value :
     *            <code>
     *                function(){
     *                       return d.value*2;
     *                   }
     *            </code>
     *            </td>
     *        </tr>
     *        <tr>
     *            <td>showLegend</td>
     *            <td>Boolean</td>
     *            <td>Display or hide legend.</td>
     *        </tr>
     *        <tr>
     *            <td>tooltips</td>
     *            <td>Boolean</td>
     *            <td>Enable or disable tooltips when hovering the chart.</td>
     *        </tr>
     *          <tr>
     *            <td>noData</td>
     *            <td>String</td>
     *            <td>Message to display when there is no data (default to "No data available") </td>
     *        </tr>
     *          <tr>
     *            <td>color</td>
     *            <td>Array</td>
     *            <td> Color of series in the corresponding order. Can be hexadecimal, named  or RGB. Ex.  <code>['#4D9FF2', 'yellow', 'rgb(151,109,165)']</code>. Note that you can also
     *            specify the value of the color in the "data" array by providing a "color" attribute to each object. </td>
     *        </tr>
     *           <tr>
     *            <td> tooltipContent</td>
     *            <td>function</td>
     *            <td>Customize tooltip content. Ex. <code> function(key, x, y, e, graph) { return '&lth1&gt Tooltip Title &lt/h1&gt &ltp&gt'+ y +'&lt/p&gt';} </code>
     *            where key, x and y are the name and value of the series at the tooltip point, e an event and graph the chart object.</td>
     *        </tr>
     *         <tr>
     *            <td>transitionDuration</td>
     *            <td>integer</td>
     *            <td>Duration of transition effect (Default to 500).</td>
     *        </tr>
     *         <tr>
     *            <td>showLabels</td>
     *            <td>Boolean</td>
     *            <td>Show or hide labels.</td>
     *        </tr>
     *        <tr>
     *            <td>labelType</td>
     *            <td>String</td>
     *            <td>What the label would display : 'key', 'value' or 'percent'.</td>
     *        </tr>
     *        <tr>
     *            <td>pieLabelsOutside</td>
     *            <td>Boolean</td>
     *            <td>Should the label be inside or outside the chart.</td>
     *        </tr>
     *         <tr>
     *            <td>valueFormat</td>
     *            <td>function</td>
     *            <td>Custom formating of values. For instance one can print values in <code>.2f</code> decimal
     *            by passing <code>d3.format(',.2f')</code> to this property. See <a href="https://github.com/mbostock/d3/wiki/Formatting" target="_blank">d3.js documentation</a>
     *            for a list of format value.</td>
     *        </tr>
     *         <tr>
     *            <td>donut</td>
     *            <td>Boolean</td>
     *            <td>Display the chart as a donut</td>
     *        </tr>
     *           <tr>
     *            <td>donutLabelsOutside</td>
     *            <td>Boolean</td>
     *            <td>Should the label be inside or outside the chart</td>
     *        </tr>
     *             </tr>
     *           <tr>
     *            <td>donutRatio</td>
     *            <td>Numeric</td>
     *            <td>Ratio between the hole and edge of donut (Default 0.5)</td>
     *        </tr>
     *
     *
     *
     *
     *
     *
     *    </tbody>
     * </table>
     *
     *
     *
     * @name w20DatavizCharts
     * @w20doc module
     */

    /**
     * The w20PieChart directive allows you to declare the chart on your html markup and specify the configuration object to be used in your controller.
     * <div class="alert alert-info"> You must indicate a unique id for the chart </div>
     *
     *     <div id="pie" data-w20-pie-chart="pieConfig"></div>
     *
     *
     *
     *
     * @name w20PieChart
     * @memberOf w20DatavizCharts
     * @w20doc directive
     *
     *
     */

    common.ngModule.directive('w20PieChart', function () {
        return {
            restrict: 'A',
            scope: {
                config: '=w20PieChart'
            },
            template: '<svg></svg>',
            link: function (scope, element, attrs) {
                scope.$watch('config.data', function (data) {
                    if (data) {
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if (scope.chart) {
                            d3.select('#' + attrs.id + ' svg')
                                .datum(data)
                                .transition().duration((attrs.transitionduration === undefined ? 500 : attrs.transitionduration))
                                .call(scope.chart);
                        }
                        nv.addGraph({
                            generate: function () {
                                var chart = nv.models.pieChart()
                                    .x(scope.config.x === undefined ? function (d) {
                                        return d.key;
                                    } : scope.config.x)
                                    .y(scope.config.y === undefined ? function (d) {
                                        return d.value;
                                    } : scope.config.y)
                                    .noData(scope.config.noData === undefined ? 'No Data Available.' : scope.config.noData)
                                    .showLabels(scope.config.showLabels === undefined ? false : scope.config.showLabels)
                                    .labelThreshold(scope.config.labelThreshold === undefined ? 0.02 : scope.config.labelThreshold)
                                    .labelType(scope.config.labelType === undefined ? 'key' : scope.config.labelType)
                                    .pieLabelsOutside(scope.config.pieLabelsOutside === undefined ? true : scope.config.pieLabelsOutside)
                                    .valueFormat(scope.config.valueFormat === undefined ? d3.format(',.2f') : scope.config.valueFormat)
                                    .showLegend(scope.config.showLegend === undefined ? false : scope.config.showLegend)
                                    .color(scope.config.color === undefined ? nv.utils.defaultColor() : scope.config.color)
                                    .donutLabelsOutside(scope.config.donutLabelsOutside === undefined ? false : scope.config.donutLabelsOutside)
                                    .donut(scope.config.donut === undefined ? false : scope.config.donut)
                                    .donutRatio(scope.config.donutRatio === undefined ? 0.5 : scope.config.donutRatio);


                                if (scope.config.tooltipContent) {
                                    chart.tooltip.contentGenerator(scope.config.tooltipContent);
                                }

                                if (scope.config.tooltips) {
                                    chart.tooltip.enabled();
                                }

                                var drawChart = function () {
                                    d3.select('#' + attrs.id + ' svg')
                                        .datum(data)
                                        .transition().duration((scope.config.transitionDuration === undefined ? 500 : scope.config.transitionDuration))
                                        .call(chart);
                                };

                                element.on('resize', function () {
                                    drawChart();
                                });

                                drawChart();

                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, true);
            }
        };
    });


    return {
        angularModules: [ common.ngModuleName ]
    };
});