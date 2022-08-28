module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/compute.ts',
    watch: true,
    output: {
        path: __dirname ,
        filename: 'build/compute.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'Compute'
                    },
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
}