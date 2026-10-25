---
title: 'Fixture'
description: 'Synthetic example of plain writing.'
pubDate: 'Oct 25 2026'
---

The first time I deployed this stack, the bill surprised me. Nobody had told me that idle workflows still held memory.

I still think the default is right. A function that forgets everything between calls is simpler to reason about — and simpler to test.

### What I changed

1. **Measure first.** I added a dashboard for idle cost before touching the code.
2. **Cut the state.** Two of the four workflows did not need to survive a restart.

The rest of the team disagreed with me about the second point, and they were right about one of the workflows.
