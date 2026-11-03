/**
 * Print the demo plan as a props file, a starting point for your own video:
 *
 *   npm run plan:demo > plans/my-video.json
 *   npm run render -- out/my-video.mp4 --props=plans/my-video.json
 */
import { demoPlan } from "../src/demo/demoPlan";

process.stdout.write(`${JSON.stringify({ plan: demoPlan }, null, 2)}\n`);
