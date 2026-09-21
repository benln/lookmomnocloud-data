<!-- Corrections are more welcome than additions. Thank you for bothering. -->

**What changed and why:**

**Checklist**

- [ ] Every value I set to `true` or `false` has a `source`, a `verified_on` and a `confidence`.
      (`unknown` is fine and needs none — an honest gap beats a confident guess.)
- [ ] The criteria describe the device **as sold**. Anything gained by flashing went in the
      `flashing` block, not into the criteria.
- [ ] No prices. Only stable merchant identifiers in `offers`.
- [ ] `npm run validate` passes.
