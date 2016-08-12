module.exports = function (grunt) {

		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json') ,

			import: {
				dist: {
					src: ('src/NMath/NMath.js'),
					dest: ( 'dist/NMath.js'),
				}
			},

			watch: {
				src : {
					files: ['src/**/*'],
					tasks: ['copy:src']
				},
				project: {
					files: ['**'],
					tasks: ['copy:project']
				}
			},

			copy: {
				src: {
					src: 'src/NGrid.js',
					dest: 'dist/module/NGrid.js'
				},
				project: {
					src: '**',
					dest: '/var/www/NGrid/'
				}
			}
		})

		grunt.loadNpmTasks('grunt-import');
		grunt.loadNpmTasks('grunt-contrib-copy');
		grunt.loadNpmTasks('grunt-contrib-watch');

		grunt.registerTask('default', ['copy:src', 'watch:src'])
		grunt.registerTask('testing', ['copy:project', 'watch:project'])
}
