const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
	entry: './src/index.ts',
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.tsx', '.ts', '.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
		fallback: {
			"url": false,
			"http": false,
			"os": false,
			"https": false
		}
	},
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'index.js',
		libraryTarget: "umd",
		publicPath:'/dist'
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.svelte$/,
				//exclude: /node_modules/,
				use: {
					loader: 'svelte-loader',
					options: {
						preprocess: require('svelte-preprocess')({
							/* options */
						}),
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod,
						hotOptions: {
							// List of options and defaults: https://www.npmjs.com/package/svelte-loader-hot#usage
							noPreserveState: false,
							optimistic: true,
						}
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/assets/', to: 'assets/' }
			]
		})
	],
	devtool: prod ? false : 'source-map',
	devServer: {
		hot: true
	}
};