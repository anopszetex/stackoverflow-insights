# Stack Overflow Insights

A terminal dashboard that processes State of JavaScript survey responses as a
stream and compares interest in front-end frameworks from 2016 to 2019.

The application reads about 258 MB of newline-delimited JSON (NDJSON) without
loading the entire data set into memory. It displays processing progress, draws
a line chart, and writes the aggregated result to `docs/final.json`.

## What it measures

For each year, the application counts responses marked as `interested` or
`would_use` for:

- Angular
- React
- Vue.js
- Ember
- Backbone

The `total` in the output is the sum of those five framework counts. A single
respondent may be counted for more than one framework, so it is not the number
of survey respondents.

## Requirements

- [Node.js](https://nodejs.org/) 18 or later
- npm
- A terminal with color support

## Getting started

```bash
git clone https://github.com/anopszetex/stackoverflow-insights.git
cd stackoverflow-insights
npm ci
npm start
```

Press <kbd>Q</kbd>, <kbd>Esc</kbd>, or <kbd>Ctrl</kbd>+<kbd>C</kbd> to exit.

The included files in `docs/state-of-js/` are processed automatically. Each
line must be a valid JSON object containing a `year` and a `tools` object:

```json
{"year":2019,"tools":{"react":{"experience":"would_use"}}}
```

Running the application replaces `docs/final.json` with an object grouped by
year:

```json
{
  "2019": {
    "angular": 6348,
    "react": 16792,
    "vuejs": 14979,
    "ember": 3594,
    "backbone": 0,
    "total": 41713
  }
}
```

## How it works

The processing pipeline:

1. Concatenates the yearly NDJSON files as readable streams.
2. Parses one survey response at a time.
3. Maps the selected experience values to framework counters.
4. Aggregates the counters by year.
5. Updates the terminal dashboard and writes the final JSON file.

This approach keeps memory usage bounded as the input data grows.

## Configuration

The analyzed years, frameworks, and accepted experience values are defined in
`src/helpers/config.js`. Input and output paths are defined in `src/index.js`.

Logging can be configured with an optional `.env` file:

```bash
cp .env.example .env
```

`NODE_ENV=development` enables pretty debug logs, and `APP_VERSION` is included
in each log record.

## Screenshots

| Processing | Results |
| --- | --- |
| ![Circular progress indicator while survey files are processed](https://github.com/anopszetex/stackoverflow-insights/assets/31970167/a316afa5-1a4a-49e1-a396-0952f28da382) | ![Line chart comparing framework interest by year](https://github.com/anopszetex/stackoverflow-insights/assets/31970167/20cc5d03-9298-424f-9a8a-03927a243b0a) |

## Project structure

```text
src/
├── helpers/       # Configuration and shutdown helpers
├── infra/         # Logger setup
├── service/       # Streaming pipeline and terminal UI
└── index.js       # Application entry point
docs/
├── state-of-js/   # NDJSON survey files
└── final.json     # Generated aggregation
```
