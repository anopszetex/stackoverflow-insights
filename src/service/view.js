import contrib from 'blessed-contrib';
import blessed from 'blessed';

import { calculatePercentage } from './../helpers/index.js';

export function initialize() {
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
