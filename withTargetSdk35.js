const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withTargetSdk35(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        /targetSdkVersion\s*\d+/,
        'targetSdkVersion 35'
      );
    } else {
      throw new Error('Cannot modify build.gradle: unexpected language');
    }
    return config;
  });
};