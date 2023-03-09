module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: [
        'darwin',
        'linux',
        'win32',
      ],
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'wuguanghai45',
          name: 'hc_nrf_tool',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
};
