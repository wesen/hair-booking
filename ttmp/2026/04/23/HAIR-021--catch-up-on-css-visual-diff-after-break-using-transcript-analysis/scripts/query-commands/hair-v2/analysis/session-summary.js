function sessionSummary(args) {
  const { db, params } = args;
  const limit = params.limit || 10;

  const rows = db.query(`
    SELECT
      id AS session_id,
      title,
      timing->>'started_at' AS started_at,
      length(tool_calls) AS tool_call_count,
      turn_count,
      quality,
      classification
    FROM sessions_base
    ORDER BY started_at
    LIMIT ${limit}
  `);

  return rows.map(r => ({
    session_id: r.session_id,
    started_at: r.started_at,
    tool_calls: r.tool_call_count,
    turns: r.turn_count,
    quality: r.quality,
    classification: r.classification,
    title: r.title
  }));
}

module.exports = { sessionSummary };
