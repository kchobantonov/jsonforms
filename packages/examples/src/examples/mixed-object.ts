/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import { registerExamples } from '../register';

export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Mixed Types Example',
  type: 'object',
  properties: {
    mixedSimple: {
      type: ['string', 'boolean', 'integer'],
      description: 'This property can be a string, boolean, or integer.',
    },
    nullableString: {
      type: ['string', 'null'],
    },
    mixed: {
      type: [
        'array',
        'boolean',
        'integer',
        'null',
        'number',
        'object',
        'string',
      ],
    },
  },
  required: ['mixedSimple'],
};

export const uischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/mixedSimple',
    },
    {
      type: 'Control',
      scope: '#/properties/nullableString',
    },
    {
      type: 'Control',
      scope: '#/properties/mixed',
    },
  ],
};

const data = {
  mixedSimple: 'String',
  nullableString: null as any,
};

registerExamples([
  {
    name: 'mixed-object',
    label: 'Mixed Object',
    data,
    schema,
    uischema,
  },
]);
