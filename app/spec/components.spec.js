'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('thf-mobile-base:app', function () {

    var FolderComponents = [
            'node_modules/thf-mobile-components'
    ],

    configFiles = [           
            '.gitignore',
			'ionic.config.json',
            'package.json',
            'config.xml',
			'tslint.json',
			'tsconfig.json'                        
    ]

    describe('Default answers', function() {

        it('Creates folder components', function () {
            assert.file(FolderComponents);
        });

        it('Creates config files', function () {
            assert.file(configFiles);
        });

    });
    
});