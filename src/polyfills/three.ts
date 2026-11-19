const runtimeProcess = (globalThis as any).process;

if (
  runtimeProcess &&
  typeof runtimeProcess.emitWarning !== "function"
) {
  runtimeProcess.emitWarning = (warning: unknown) => {
    if (__DEV__) {
      console.warn("[Three.js]", warning);
    }
  };
}
