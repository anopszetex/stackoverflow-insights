const LIKES = ['interested', 'would_use'];

const YEARS = ['2016', '2017', '2018', '2019'];

function defaultY() {
  return [0, 0, 0, 0];
}

const lineChartData = {
  angular: {
    title: 'angular',
    x: YEARS,
    y: defaultY(),
    style: {
      // red angular
      line: [170, 42, 44],
    },
  },
  react: {
    title: 'react',
    x: YEARS,
    y: defaultY(),
    // cyan react
    style: { line: [97, 218, 251] },
  },
  vuejs: {
    title: 'vuejs',
    x: YEARS,
    y: defaultY(),
    // green vuejs
    style: { line: [63, 178, 127] },
  },
  ember: {
    title: 'ember',
    x: YEARS,
    y: defaultY(),
    // orange ember
    style: { line: [218, 89, 46] },
  },
  backbone: {
    title: 'backbone',
    x: YEARS,
    y: defaultY(),
    // dark green backbone
    style: { line: [37, 108, 74] },
  },
};

export default {
  lineChartData,
  likes: LIKES,
  years: YEARS,
  tecnologiesInAnalysis: Reflect.ownKeys(lineChartData),
};
