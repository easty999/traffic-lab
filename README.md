# Traffic Lab

Five interactive traffic simulations: mixed traffic, phantom jams, induced demand, Braess’s paradox and signal timing.

## Preview

Run `npm start` with Node.js, then open http://127.0.0.1:4173. Use an HTTP server rather than opening index.html directly: the JavaScript uses modules. No installation or build is required. Run `npm test` for the model checks.

## GitHub Pages

1. Create a public repository called `traffic-lab` under `easty999`.
2. Upload the **contents** of this folder to the root of its `main` branch, including `vendor` and `.nojekyll`.
3. In Settings → Pages, choose Deploy from a branch → main → /(root), and Save.
4. Once deployment completes, the expected address is https://easty999.github.io/traffic-lab/ . This address is not a claim that the site has been deployed.

All asset paths are relative and work under a GitHub Pages repository path. No server, API key, analytics or database is needed. Files can be served offline. Results remain in memory until exported to CSV; resetting experiments does not erase recorded results, refreshing the page does.

## Models

- Mixed traffic: IDM-style car following with a simple safe-gap lane choice, deterministic arrivals and seeded types. Fixed 0.05 s steps. There is no empirical calibration for India. Autos and trucks vary in size, acceleration and target speed; lane filtering is not represented.
- Phantom jams: the same longitudinal model on a closed loop. Disturbances may dissipate depending on parameters.
- Induced demand: illustrative elasticity adjustment plus a volume-delay curve. This is separate from the microscopic simulator; response assumptions are visible.
- Braess: exact continuous Wardrop equilibrium for the displayed four-node example, with fixed trip demand.
- Signals: two deterministic fluid queues with 1,800 veh/h saturation flow and 8 seconds of lost time per cycle.

Model limitations and sources are also available beside each experiment. Simulated times and measured units are explicitly labelled. Never present results as predictions for a real junction or evidence that every widening project fails.

## Design and authorship

Original code-drawn traffic diagrams; system fonts, muted greens, ochre vehicle markers, no stock or generated imagery. There are no AI features or external inference services in the site. 

Motion is used for short experiment-title transitions, respecting reduced-motion preferences. The traffic engine itself uses deterministic time integration, not decorative animation. See `vendor` for bundled library and license. No external runtime fetches are required.

## Research and inspiration

- Martin Treiber, [Traffic Simulation](https://traffic-simulation.de/) and [IDM documentation](https://traffic-simulation.de/info/info_IDM.html). Conceptual inspiration; their site code and imagery were not copied.
- Duranton & Turner (2011), [The Fundamental Law of Road Congestion](https://www.aeaweb.org/articles?id=10.1257/aer.101.6.2616). US city evidence, not India-specific estimates.
- ARPA-E, [Transportation Optimization introduction](https://arpa-e.energy.gov/sites/default/files/migrated/Transportation%20Optimization%20Intro%203_Burbaum.pdf), Braess network teaching example.
- [Motion examples](https://motion.dev/examples) and [animate documentation](https://motion.dev/docs/animate), restrained state transitions.
