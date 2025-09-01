module.exports = {
  project: {
    // ios: {
    //   automaticPodsInstallation: true
    // }
    android: {},
  },
  assets: ['src\\assets\\fonts', 'src\\assets\\images'],

  dependencies: {
    boost: {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
};
