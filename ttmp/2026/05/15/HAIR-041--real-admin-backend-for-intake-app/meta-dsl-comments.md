Comments on @07-ui-dsl-meta-spec-compiler-implementation-guide.md

- i want the input dsl meta-spec to be transformed using a set of deterministic "passes"
  - the concept here is that while passes have to be deterministic, their output doesn't need to be "finished output",
    because it will get further processed by an LLM
  - one plugin for example can extract protobuf definitions (or skeletons of protobuf definitions)
  - actions annotated to be frontend actions can create a RTK slice / action (or its sketch)
  - actions annotate to be backend can create a go handler / a protobuf payload definition / a rtk-query action, a msw mock
  - target widget annotations can be transformed into storybook definitions and filename layouts (one directory per widget, etc...)
  - ...

- some passes or a big pass by an LLM can further generate "IR artifacts" that are semi formal as well, for example a
  list of example scenarios, a list of action sequences, playwright script sketches to try things out

- actions should be defined by their signature, for example a row action is just an action that takes a table + row
  context as first argument