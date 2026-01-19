# Tasks

## TODO

- [x] 1.1 Review current winner logic in `internal/sbcap/modes/matched_styles.go` and document gaps vs. DevTools.
- [ ] 1.2 Define `Candidate` model (property, selector, important, specificity, origin, order).
- [ ] 1.3 Implement selector specificity calculator (ID, class/attribute/pseudo-class, element/pseudo-element).
- [ ] 1.4 Collect candidates from matched rules and inline styles; assign source order indices.
- [ ] 1.5 Implement cascade comparator and winner selection (importance -> origin -> specificity -> order).
- [ ] 1.6 Replace `findWinner` with cascade winner resolution.
- [ ] 1.7 Update matched-styles Markdown output to include specificity + origin context.
- [ ] 1.8 Add tests for specificity and winner selection (table-driven).
- [ ] 1.9 Update sbcap docs to describe cascade behavior.
