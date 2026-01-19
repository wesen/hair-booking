# Tasks

## TODO

- [x] 1.1 Review current winner logic in `internal/sbcap/modes/matched_styles.go` and document gaps vs. DevTools.
- [x] 1.2 Define `Candidate` model (property, selector, important, specificity, origin, order).
- [x] 1.3 Implement selector specificity calculator (ID, class/attribute/pseudo-class, element/pseudo-element).
- [x] 1.4 Collect candidates from matched rules and inline styles; assign source order indices.
- [x] 1.5 Implement cascade comparator and winner selection (importance -> origin -> specificity -> order).
- [x] 1.6 Replace `findWinner` with cascade winner resolution.
- [x] 1.7 Update matched-styles Markdown output to include specificity + origin context.
- [x] 1.8 Add tests for specificity and winner selection (table-driven).
- [x] 1.9 Update sbcap docs to describe cascade behavior.
