#
# * grunt
# * http://gruntjs.com/
# *
# * Copyright (c) 2013 "Cowboy" Ben Alman
# * Licensed under the MIT license.
# * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
# 
"use strict"

path = require('path')

module.exports = (grunt) ->
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-coffee"
	grunt.loadNpmTasks "grunt-contrib-clean"
	grunt.loadNpmTasks "grunt-contrib-copy"

	workingDirectory = if grunt.option('target')? then grunt.option('target') else '.'

  # configurable paths
	config =
		src: 'src'
		tmp: "#{workingDirectory}/tmp"
  
	# Project configuration.
	grunt.initConfig

		config: config

		pkg: grunt.file.readJSON("package.json")
		meta: {}
		
		watch:

			# options:
			# 	livereload: true

			scripts:
					files: ["!./coffee/manifest/*.coffee","./coffee/**/*.coffee"]
					tasks: ["clean","coffee","copy"]
			manifest:
					files: "./coffee/manifest/*.coffee"
					tasks: ["coffee:manifest"]



		coffee:
			options:
				bare: true
				preserve_dirs: true
			compile:
				expand: true
				cwd: "./coffee"
				src: ["**/*.coffee","!manifest/*.coffee"]
				dest: "./tmp"
				ext: ".js"
			manifest:
				expand: true
				cwd: './coffee'
				src: ["manifest/*.coffee"]
				dest: './public'
				ext: '.js'

		clean:
			tmpcss: ["./tmp/"]

		copy:
			scripts:
				files: [
					expand: true
					cwd: "./tmp/"
					src: ["**"]
					dest: "./cloud/"
				]


	grunt.registerTask "default", ["clean","coffee","copy","watch"]
	# grunt.registerTask "default", ["clean","coffee","watch"]