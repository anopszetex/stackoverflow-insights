export function terminate(
  controller,
  logger,
  options = { coredump: false, timeout: 500 }
) {
  const exit = code => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code, reason) => (err, promise) => {
    logger.debug({ code, reason });

    if (err && err instanceof Error) {
      logger.error(err.message, err.stack);
    }

    controller.abort();
    setTimeout(exit, options.timeout).unref();
  };
}
