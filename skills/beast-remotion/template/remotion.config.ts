import { Config } from "@remotion/cli/config";

// JPEG frames are faster to encode and look identical for this kind of footage.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// The captions and overlays are text-heavy; a high JPEG quality keeps strokes crisp.
Config.setJpegQuality(92);
