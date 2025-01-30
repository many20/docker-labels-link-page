
const _logger = {
    info: (...message) => console.log(...message),
    error: (...message) => console.error(...message),
    warn: (...message) => console.warn(...message),
    debug: (...message) => console.debug(...message),
}

process["logger"] = process["logger"] || _logger;

export const logger = process["logger"];
export default _logger;
