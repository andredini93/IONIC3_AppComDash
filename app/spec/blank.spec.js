'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('thf-mobile-blank:app', function () {

    var appFiles = [
            'src/app/app.component.ts',
            'src/app/app.html',
            'src/app/app.module.ts',
            'src/app/app.scss',
			'src/app/main.ts'
        ],
		
        assetsFiles = [            
            'src/assets/img/logo.png',
            'src/assets/img/logo@2x.png',
            'src/assets/img/logo@3x.png',
            'src/assets/img/loading.png',
            'src/assets/img/loading@2x.png',
            'src/assets/img/loading@3x.png',
        ],

        providersFiles = [
            'src/providers/resource.ts'            
        ],

        themeFiles = [           
            'src/theme/variables.scss'
        ]      
		

    describe('Default answers', function() {
        
        it('Creates files app', function () {
            assert.file(appFiles);
        });

        it('Creates files assets', function () {
            assert.file(assetsFiles);
        });

        it('Creates files Providers', function () {
            assert.file(providersFiles);
        });

    });
    
});