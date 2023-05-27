import contrib from 'blessed-contrib';
import blessed from 'blessed';

import { calculatePercentage } from './../helpers/index.js';

/**
 * @typedef {Object} LineChartData
 * @property {Object} angular
 * @property {string} angular.title
 * @property {Array<number>} angular.x
 * @property {Array<number>} angular.y
 * @property {Object} angular.style
 * @property {Array<number>} angular.style.line
 * @property {Object} react
 * @property {string} react.title
 * @property {Array<number>} react.x
 * @property {Array<number>} react.y
 * @property {Object} react.style
 * @property {Array<number>} react.style.line
 * @property {Object} vuejs
 * @property {string} vuejs.title
 * @property {Array<number>} vuejs.x
 * @property {Array<number>} vuejs.y
 * @property {Object} vuejs.style
 * @property {Array<number>} vuejs.style.line
 * @property {Object} ember
 * @property {string} ember.title
 * @property {Array<number>} ember.x
 * @property {Array<number>} ember.y
 * @property {Object} ember.style
 * @property {Array<number>} ember.style.line
 * @property {Object} backbone
 * @property {string} backbone.title
 * @property {Array<number>} backbone.x
 * @property {Array<number>} backbone.y
 * @property {Object} backbone.style
 * @property {Array<number>} backbone.style.line
 */

/**
 * @typedef {Object} finalGraphData
 * @property {Object} year2016
 * @property {number} year2016.angular
 * @property {number} year2016.react
 * @property {number} year2016.vuejs
 * @property {number} year2016.ember
 * @property {number} year2016.backbone
 * @property {() => number} year2016.total - it's a getter
 * @property {Object} year2017
 * @property {number} year2017.angular
 * @property {number} year2017.react
 * @property {number} year2017.vuejs
 * @property {number} year2017.ember
 * @property {number} year2017.backbone
 * @property {() => number} year2017.total - it's a getter
 * @property {Object} year2018
 * @property {number} year2018.angular
 * @property {number} year2018.react
 * @property {number} year2018.vuejs
 * @property {number} year2018.ember
 * @property {number} year2018.backbone
 * @property {() => number} year2018.total - it's a getter
 * @property {Object} year2019
 * @property {number} year2019.angular
 * @property {number} year2019.react
 * @property {number} year2019.vuejs
 * @property {number} year2019.ember
 * @property {number} year2019.backbone
 * @property {() => number} year2019.total - it's a getter
 */

/**
 * @type {LineChartData}
 * @type {finalGraphData}
 */

/**
 *
 * @param {Object} params
 * @param {['2016', '2017', '2018', '2019']} params.years
 * @param {LineChartData} params.lineChartData
 */
export function initialize({ years, lineChartData }) {
  const screen = blessed.screen();

  const progressBar = contrib.donut({
    left: 'center',
    top: 'center',
    height: '50%',
    width: '50%',
    radius: 8,
    arcWidth: 3,
    remainColor: 'black',
    yPadding: 2,
  });

  const lineChart = contrib.line({
    left: 'center',
    top: 'center',
    border: 'line',
    height: '100%',
    width: '100%',
    label: 'Frameworks Most Used per Year',
    showLegend: true,
  });

  return {
    buildInterface() {
      screen.key(['escape', 'q', 'C-c'], () => process.emit('SIGINT'));
      screen.render();
      return this;
    },
    buildProgressBar() {
      screen.append(progressBar);
      screen.render();
      return this;
    },
    /**
      @param {finalGraphData} items
     */
    processLineChartData(items) {
      // ['2016', '2017', '2018', '2019'];
      Object.keys(items).forEach(year => {
        const indexYear = years.indexOf(year);

        const { total, ...yearContext } = items[year];

        // yearContext = { angular: 0, react: 0, vuejs: 0, ember: 0, backbone: 0 };
        Object.keys(yearContext).forEach(lib => {
          lineChartData[lib].y[indexYear] = yearContext[lib];
        });
      });

      return Object.values(lineChartData);
    },
    buildLineChart() {
      screen.append(lineChart);
    },
    updateLineChart(result) {
      lineChart.setData(result);
      screen.render();
    },
    handleLineChartUpdate(items) {
      this.buildLineChart();
      const result = this.processLineChartData(items);
      this.updateLineChart(result);
    },
    handleProgressBarUpdate() {
      const stat = { lastUpdatedValue: 0 };

      return function onProgressUpdated(processedAlready, fileSize) {
        const percentage = calculatePercentage(processedAlready, fileSize);

        if (percentage === stat.lastUpdatedValue) {
          return;
        }

        stat.lastUpdatedValue = percentage;

        progressBar.setData([
          {
            percent: percentage,
            label: 'processing...',
            color: 'green',
          },
        ]);

        screen.render();
      };
    },
  };
}
