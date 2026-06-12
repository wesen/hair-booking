/* sqleton
name: bash-keyword-search
short: Search bash tool calls for a keyword in command text or output
flags:
  - name: keyword
    type: string
    help: Keyword to search for (LIKE pattern)
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
  tc->>'id' AS call_id,
  json_extract_string(tc, '$.input.command') AS bash_command,
  json_extract_string(tc, '$.output.result') AS bash_output
FROM sessions_base,
     UNNEST(tool_calls) AS t(tc)
WHERE (tc->>'tool_name') = 'bash'
  AND (
    COALESCE(json_extract_string(tc, '$.input.command'), '') LIKE {{ .keyword | sqlLike }}
    OR COALESCE(json_extract_string(tc, '$.output.result'), '') LIKE {{ .keyword | sqlLike }}
  )
ORDER BY started_at, session_id, turn_index
LIMIT {{ .limit }};
