'use strict';

module.exports = function(grunt) {

    grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'), //指定包的信息

      htmlmin: { // html打包

        // dist: { //

        //   options: { // Target options

        //     removeComments: true,

        //     collapseWhitespace: true

        //   },

        //   files: { // 文件

        //     'dest/index.html': './index.html', // '目标html': '源html'

        //   }

        // },

      },


      cssmin: { //css打包

        styles: {

          src: ['./bower_components/animate.css/animate.css','./bower_components/ionicons/css/ionicons.css','./ui/ui.css'],
          // src:['**/*.css'],
          dest: 'dest/css/<%= pkg.name %>.min.css'

        }

      },


      requirejs: {

        compile: {

          options: {

            baseUrl: './', //js根目录

            name: 'app.js', //执行的第一个requirejs包

            optimize: 'uglify',//'uglify',

            mainConfigFile: './config.js', //requirejs的配置文件

            out: 'dest/<%= pkg.name %>.min.js', //输出的压缩文件

            findNestedDependencies: true, //必须指定让requirejs能找到嵌套的文件

            include: ['./bower_components/requirejs/require.js'] //指定requirejs所在的位置。

          }

        }

      }

        // imagemin: {
        //     /* 压缩图片大小 */
        //     dist: {
        //         options: {
        //             optimizationLevel: 3 //定义 PNG 图片优化水平
        //         },
        //         files: [{
        //             expand: true,
        //             cwd: 'img/',
        //             src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
        //             dest: 'img/' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
        //         }]
        //     }
        // }



    });

    //加载所需要的库

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // grunt.loadNpmTasks('grunt-contrib-imagemin');

    //注册相应的类库

    grunt.registerTask('default', ['cssmin','requirejs']);  //,'htmlmin',

  };
