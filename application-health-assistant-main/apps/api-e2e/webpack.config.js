const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const path = require('path');
const glob = require('glob');

module.exports = {
    output: {
        path: path.join(process.cwd(), 'dist/apps/api-e2e'),
    },
    plugins: [
        new NxAppWebpackPlugin({
            target: 'node',
            compiler: 'tsc',
            main: './src/main.ts',
            tsConfig: './tsconfig.spec.json',
            optimization: false,
            outputHashing: 'none',
            generatePackageJson: true,
        }),
    ],
    entry: {
        ...glob.sync(path.join(__dirname, 'src/*.e2e.ts')).reduce((acc, file) => {
            acc[path.parse(file).name] = file;
            return acc;
        }, {}),
    },
};
