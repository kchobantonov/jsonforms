var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var renderer_service_1 = require('../../renderer-service');
var abstract_control_1 = require('../abstract-control');
var ReferenceDirective = (function () {
    function ReferenceDirective() {
        this.restrict = 'E';
        this.template = "<div>{{vm.prefix}} <a href=\"{{vm.link}}\">{{vm.linkText}}</a></div>";
        this.controller = ReferenceController;
        this.controllerAs = 'vm';
    }
    return ReferenceDirective;
})();
var ReferenceController = (function (_super) {
    __extends(ReferenceController, _super);
    function ReferenceController(scope, pathResolver) {
        _super.call(this, scope, pathResolver);
    }
    Object.defineProperty(ReferenceController.prototype, "link", {
        get: function () {
            var normalizedPath = this.pathResolver.toInstancePath(this.schemaPath);
            return '#' + this.uiSchema['href']['url'] + '/' + this.data[normalizedPath];
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ReferenceController.prototype, "linkText", {
        get: function () {
            return this.uiSchema['href']['label'] ? this.uiSchema['href']['label'] : this.label;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReferenceController.prototype, "prefix", {
        get: function () {
            return this.uiSchema.label ? this.uiSchema.label : 'Go to';
        },
        enumerable: true,
        configurable: true
    });
    ReferenceController.$inject = ['$scope', 'PathResolver'];
    return ReferenceController;
})(abstract_control_1.AbstractControl);
var ReferenceControlRendererTester = function (element, dataSchema, dataObject, pathResolver) {
    if (element.type !== 'ReferenceControl') {
        return renderer_service_1.NOT_FITTING;
    }
    return 2;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = angular
    .module('jsonforms.renderers.controls.reference', ['jsonforms.renderers.controls'])
    .directive('referenceControl', function () { return new ReferenceDirective(); })
    .run(['RendererService', function (RendererService) {
        return RendererService.register('reference-control', ReferenceControlRendererTester);
    }
])
    .name;
//# sourceMappingURL=reference-directive.js.map