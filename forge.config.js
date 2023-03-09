module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: "123456",
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: [
        'darwin',
        'linux',
        'win32',
      ],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
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
