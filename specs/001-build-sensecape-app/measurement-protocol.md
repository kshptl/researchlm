# Measurement Protocol

## FR-033 Output Quality Policy

- minUniqueItemRatio: 0.70
- maxDuplicateItemRatio: 0.30
- keywordCoverage off-topic threshold: 0.50
- requiredSourceKeywords derivation: trim+casefold normalization, punctuation removal, then first 10 unique tokens with length >= 4 in source order (no stopword-removal step in v1)

## SC-004/SC-005 Evaluation Method

- participant sampling
- baseline method
- analysis steps

## Performance Evidence Metadata Schema

- browser/version
- viewport
- hardware class
- network summary
- dataset profile
- quota/rate-limit status
