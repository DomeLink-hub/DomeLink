process.on('uncaughtException', (err) => {
    console.error("UNCAUGHT EXCEPTION", err);
});
process.on('unhandledRejection', (err) => {
    console.error("UNHANDLED REJECTION", err);
});
import('./src/server.ts').catch(console.error);
