JSON-LD Benchmarks
==================

This directory contains tests designed for benchmarks.

- The benchmark manifests use the same format as the JSON-LD test suite. You
  can test correctness with a normal test runner.
- There are basic tests that just stress minimal input files. These may be
  useful to measure overhead.
- If you have some time to spare, you can use a benchmark runner on the regular
  test suite manifests to check performance of every test.
- Be aware of what you are benchmarking!
  - Only time the actual algorithms.
  - Preload and parse input data.
  - Skip output comparisons.
  - Certainly don't let a document loader hit the network!
- The manifests have a `loader` option that maps URLs to files. Preload these
  for use in a benchmark document loader. These may also be useful to benchmark
  processor optimization.

TODO
----

- Standardize additional benchmark result properties to add to standard EARL
  output format. (avg, min, max, stddev, etc)
- Write text and web UIs to compare benchmark results.
- Tag tests or put in different manifests by complexity (or other attributes).
  May not always be important to get benchmarks on esoteric or degenerate
  graphs and topologies.
- Find crazy test datasets that could optionally be retrieved and tested.
- Write scripts to programmatically generate large tests?
- Write benchmarks to test optimizations:
  - Flags to avoid extra checks that may not be needed.
  - Caching of common data between calls: contexts and other internals.
