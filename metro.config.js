const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');

const config = getDefaultConfig(__dirname);

// Avoid Watchman when it cannot access the project root (e.g. macOS privacy /
// sandbox "Operation not permitted"). Metro will use Node/native file watching.
module.exports = mergeConfig(config, {
  resolver: {
    useWatchman: false,
  },
});
