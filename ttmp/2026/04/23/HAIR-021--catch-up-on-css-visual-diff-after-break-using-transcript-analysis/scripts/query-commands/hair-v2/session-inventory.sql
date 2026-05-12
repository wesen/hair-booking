/* sqleton
name: session-inventory
short: Basic metadata and tool-call counts per session
flags:
  - name: limit
    type: int
    default: 50
    help: Maximum number of rows to return
*/
SELECT
  id AS session_id,
  title,
  timing->>'started_at' AS started_at,
  timing->>'ended_at' AS ended_at,
  length(tool_calls) AS tool_call_count,
  CAST(metrics->>'turn_count' AS INT) AS turn_count,
  classification,
  provenance->>'source_format' AS source_format
FROM sessions_base
ORDER BY started_at
LIMIT {{ .limit }};
