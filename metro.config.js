const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prise en charge des modèles 3D
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'glb',
  'gltf'
];

module.exports = config;
