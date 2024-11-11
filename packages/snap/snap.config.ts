import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8080,
  },
  polyfills: {
    crypto: true,
    buffer: true,
  },
  customizeWebpackConfig: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config.module?.rules || []),
          {
            test: /\.svg$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: 'images/[hash]-[name].[ext]',
                },
              },
            ],
          },
        ],
      },
    };
  },
};

export default config;
