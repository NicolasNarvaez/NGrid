module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json') ,

		/*
		import: {
			dist: {
				src: ('src/NMath/NMath.js'),
				dest: ( 'dist/NMath.js'),
			}
		},
		*/

		watch: {
			src : {
				files: ['src/**/*', 'lib/**/*'],
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

	npm_tasks = ['grunt-import', 'grunt-contrib-watch',
    'grunt-contrib-copy']

  npm_tasks.forEach(function(e){grunt.loadNpmTasks(e)})

	grunt.registerTask('default', ['copy:src', 'watch:src'])
	grunt.registerTask('testing', ['copy:project', 'watch:project'])
}
