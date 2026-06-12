/* sqleton
name: file-touch-search
short: Search read/write/edit tool calls for file path patterns
flags:
  - name: filePattern
    type: string
    help: File path pattern to search for (LIKE pattern)
  - name: limit
    type: int
    default: 50
    help: Maximum number of rows to return
*/
SELECT
  id AS session_id,
  title,
  timing->>'started_at' AS started_at,
  CAST(tc->>'emitting_turn_index' AS INT) AS turn_index,
  (tc->>'tool_name') AS tool_name,
  COALESCE(
    json_extract_string(tc, '$.input.file_path'),
    json_extract_string(tc, '$.input.path'),
    json_extract_string(tc, '$.input.arguments.path'),
    json_extract_string(tc, '$.input.arguments.file_path')
  ) AS file_path,
  json_extract_string(tc, '$.output.result') AS tool_result
FROM sessions_base,
     UNNEST(tool_calls) AS t(tc)
WHERE (tc->>'tool_name') IN ('read', 'write', 'edit')
  AND COALESCE(
    json_extract_string(tc, '$.input.file_path'),
    json_extract_string(tc, '$.input.path'),
    json_extract_string(tc, '$.input.arguments.path'),
    json_extract_string(tc, '$.input.arguments.file_path'),
    ''
  ) LIKE {{ .filePattern | sqlLike }}
ORDER BY started_at, session_id, turn_index
LIMIT {{ .limit }};
