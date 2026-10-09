## Cerebro

Este proyecto forma parte de Cerebro: tiene un grafo de conocimiento (Graphify) en `graphify-out/` y una memoria de sesiones en un vault de Obsidian. La ruta del vault está en `~/.claude/hooks/cerebro-config.json` y las reglas de la nota de memoria, en la sección «Cerebro» del `CLAUDE.md` global.

- En el vault, el índice del proyecto es `Proyectos/magic-portfolio/magic-portfolio.md` y las notas de memoria están en `Proyectos/magic-portfolio/Memoria`.
- Al empezar, si el hook de inicio no cargó la última nota de memoria, léela antes de trabajar.
- El grafo se actualiza solo cuando cambia el código (vigilancia de archivos y hook de commit). Los documentos, PDFs e imágenes nuevos solo entran con `/graphify . --update`, que consume tokens.
- Lo que entra al grafo lo decide `.graphifyignore`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
