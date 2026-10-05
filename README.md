<details>
<summary><strong>🇧🇷 Ver documentação em Português (Brasil)</strong></summary>

# stackoverflow-insights

Aplicação de terminal baseada em streams que analisa grandes datasets das pesquisas State of JavaScript sem carregar todos os registros na memória.

## O que o projeto demonstra

- Concatenação de múltiplas fontes NDJSON como streams.
- Leitura e transformação incremental dos registros.
- Agregação de preferências de tecnologias por ano.
- Progresso por quantidade de bytes usando eventos.
- Interface de terminal com Blessed para progresso e resultados.
- Cancelamento do pipeline com `AbortController`.

## Execução

```sh
npm ci
npm start
```

Os datasets de exemplo ficam em `docs/state-of-js`, e o resultado agregado é gravado em `docs/final.json`.

## Arquitetura

```text
src/
├── helpers/   # configuração, ciclo de vida e encerramento
├── infra/     # logging
└── service/   # pipeline de streams e visualização no terminal
```

## Limitações atuais

- Os datasets incluídos cobrem 2016–2019 e servem como fixtures reproduzíveis, não como análise atual do ecossistema.
- A cobertura de testes ainda é incompleta.
- A interface exige um terminal interativo.

</details>

# stackoverflow-insights

---

A stream-based terminal application that analyzes large State of JavaScript survey datasets without loading every record into memory.

## What it demonstrates

- Concatenating multiple NDJSON data sources as streams.
- Parsing and transforming records incrementally.
- Aggregating technology preferences by survey year.
- Reporting byte-level progress through events.
- Rendering progress and results in a terminal UI with Blessed.
- Cancelling the pipeline through an `AbortController`.

## Run

```sh
npm ci
npm start
```

The sample datasets are stored under `docs/state-of-js`, and the aggregated result is written to `docs/final.json`.

## Architecture

```text
src/
├── helpers/   # configuration, lifecycle, and termination
├── infra/     # logging
└── service/   # stream pipeline and terminal views
```

## Current limitations

- The bundled datasets cover 2016–2019 and are intended as reproducible fixtures, not current ecosystem analysis.
- Test coverage is still incomplete.
- The terminal interface requires an interactive TTY.
