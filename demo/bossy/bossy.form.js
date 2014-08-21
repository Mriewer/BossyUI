angular.module('app.directive.bossy.form', [])
    .run(function($templateCache){
        $templateCache.put('bossy-input.html', 'templates/bossy-input.html');
    })
    .directive('bossyForm', function ($compile, $http, $schema, $data) {
        var _schema,
            _data,
            _itemTemplate = {
                number: function () {
                    return '<input type="number"/>';
                },
                text: function (obj, key) {
                    return '<bossy-input title="\''+obj.title+'\'" value="\''+_data.address[key]+'\'"></bossy-input>';                    
                },
                textArea: function () {
                    return '<textarea></textarea>';
                },
                checkbox: function(obj){
                    return '<div class="checkbox"><label><input type="checkbox">'+obj.title+'</label></div>';
                }
            };

        function setData(data) {
            _data = $data.getData(data);
        }

        function setSchema(schema) {
            _schema = $schema.getSchema(schema);
        }

        function buildTemplate(schemaPart, parentKey) {
            var template = '',
                fullKey = '';
            angular.forEach(schemaPart, function(value, key) {                
                if (value.type) {
                    console.log(fullKey + ' is '+ value.type);
                    switch (value.type) {
                        case 'object':
                            template += buildTemplate(value.properties, fullKey);
                            break;
                        case 'array':
                            template += buildTemplate(value.items.properties, fullKey);
                            break;
                        case 'number' || 'integer':
                            template += _itemTemplate.number(value);
                            break;
                        case 'string':
                            template += _itemTemplate.text(value, key);
                            break;
                        case 'boolean':
                            template += _itemTemplate.checkbox(value);
                            break;
                    }
                }
            });

            return template;
        }

        return {
            restrict: 'E',
            replace: true,
            template: '',
            scope: {
                options:"=", //Create scope isolation with bi-directional binding,
                title: "="
            },
            link: function (scope, element, attributes) {
                setData(scope.options.data);
                setSchema(scope.options.schema);
                element.html('<form style="width: 40%; margin:0 auto">'+
            '<h4 class="text-center text-uppercase well">{{title}}</h4>'+buildTemplate(_schema)+'</form>');
                $compile(element.contents())(scope);
            }
        };

    })
;