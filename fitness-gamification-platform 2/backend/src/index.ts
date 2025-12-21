// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = Number(process.env.PORT ?? 3000);

if (Number.isNaN(PORT)) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🏋️  Fitness Gamification Platform API                    ║
║                                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Port: ${PORT}                                              ║
║  Host: 0.0.0.0                                             ║
║  API Version: ${API_VERSION}                                         ║
╚═══════════════════════════════════════════════════════════╝
  `);

  if (process.env.NODE_ENV !== 'test') {
    setupCronJobs();
  }
});
