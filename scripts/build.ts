import { build } from 'esbuild';
import svgrPlugin from 'esbuild-plugin-svgr';

type Environment = 'production' | 'development';

const BUILD_MODE = (process.env.BUILD_MODE as Environment) || 'development';
if (!BUILD_MODE || !['production', 'development'].includes(BUILD_MODE)) {
    throw new Error(`[Build] Cannot build with provided environment "${BUILD_MODE}".`);
}

/**
 * A builder function for the client package.
 */
export async function buildClient() {
    console.log('[Client] Building...');

    await build({
        entryPoints: ['packages/client/src/index.tsx'],
        outfile: 'packages/client/public/script.js',
        define: {
            'process.env.NODE_ENV': `"${process.env.BUILD_MODE}"`,
            'process.env.REACT_APP_GA_TRACKING_ID': `"${process.env.REACT_APP_GA_TRACKING_ID}"`,
        },
        assetNames: 'assets/[name]-[hash]',
        loader: {
            '.png': 'file',
            '.ogg': 'file',
            '.svg': 'file',
            '.ico': 'file',
        },
        bundle: true,
        minify: BUILD_MODE === 'production',
        sourcemap: BUILD_MODE === 'development',
        plugins: [svgrPlugin()],
        watch:
            BUILD_MODE === 'production'
                ? false
                : {
                      onRebuild: (error, result) => {
                          console.log(`[Client] Rebuilt finished at ${new Date().toISOString()} ✔️`);
                      },
                  },
    });

    console.log('[Client] Done ✅');
}

/**
 * A builder function for the server package.
 */
export async function buildServer() {
    console.log('[Server] Building...');

    await build({
        entryPoints: ['packages/server/src/index.ts'],
        outfile: 'packages/server/dist/index.js',
        define: {
            'process.env.NODE_ENV': `"${BUILD_MODE}"`,
        },
        external: ['express', 'hiredis', 'default-gateway', 'cors'],
        platform: 'node',
        target: 'node14.15.5',
        bundle: true,
        minify: BUILD_MODE === 'production',
        sourcemap: BUILD_MODE === 'development',
        watch:
            BUILD_MODE === 'production'
                ? false
                : {
                      onRebuild: (error, result) => {
                          console.log(`[Server] Rebuilt finished at ${new Date().toISOString()} ✔️`);
                      },
                  },
    });

    console.log('[Server] Done ✅');
}

/**
 * A builder function for all packages.
 */
async function buildAll() {
    console.log(`[All] Building project in "${BUILD_MODE}" mode...`);

    await buildClient();
    await buildServer();

    console.log('[All] Done ✅');
}

// This method is executed when we run the script from the terminal with ts-node
buildAll();
