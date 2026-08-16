import type { ControlElement, JsonSchema } from '@jsonforms/core';
import { describe, expect, it } from 'vitest';
import {
  buildTreeFromData,
  createMixedRenderInfos,
  findNodeById,
  flattenTree,
  getJsonDataType,
  getSchemaTypesAsArray,
  schemaSupportsInputType,
  toTreeNodeId,
} from '../../../src/util/mixedTree';

describe('mixed tree utilities', () => {
  const itemLabel = (index: number) => `Item ${index + 1}`;

  describe('JSON type handling', () => {
    it('distinguishes JSON-compatible values, including integers', () => {
      expect(getJsonDataType('value')).toBe('string');
      expect(getJsonDataType(1)).toBe('integer');
      expect(getJsonDataType(1.5)).toBe('number');
      expect(getJsonDataType(false)).toBe('boolean');
      expect(getJsonDataType([])).toBe('array');
      expect(getJsonDataType({})).toBe('object');
      expect(getJsonDataType(null)).toBe('null');
      expect(getJsonDataType(undefined)).toBeNull();
    });

    it('derives schema types from type arrays and enums', () => {
      expect(getSchemaTypesAsArray({ type: ['string', 'null'] })).toEqual([
        'string',
        'null',
      ]);
      expect(getSchemaTypesAsArray({ enum: [1, 2.5] })).toEqual([
        'integer',
        'number',
      ]);
    });

    it('allows integers to use a number schema', () => {
      expect(schemaSupportsInputType('number', 'integer')).toBe(true);
      expect(schemaSupportsInputType('integer', 'number')).toBe(false);
      expect(schemaSupportsInputType(['number', 'null'], 'number')).toBe(
        false,
      );
    });
  });

  it('creates cleaned render schemas for each supported mixed type', () => {
    const schema: JsonSchema = {
      type: ['string', 'array'],
      default: 'default value',
      minLength: 2,
      minItems: 1,
      items: true,
    };
    const originalSchema = structuredClone(schema);
    const control: ControlElement = {
      type: 'Control',
      scope: '#',
      options: {
        'array-detail': { type: 'Control', scope: '#/items' },
      },
    };

    const infos = createMixedRenderInfos(
      schema,
      schema,
      schema,
      control,
      '',
      [],
    );

    expect(infos.map((info) => info.label)).toEqual(['string', 'array']);
    expect(infos[0].resolvedSchema.default).toBe('default value');
    expect(infos[0].schema).toMatchObject({
      type: 'string',
      minLength: 2,
    });
    expect(infos[0].schema.minItems).toBeUndefined();
    expect(infos[1].resolvedSchema.default).toBeUndefined();
    expect(infos[1].resolvedSchema.items).toEqual({
      type: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'],
    });
    expect(infos[1].schema).toMatchObject({ type: 'array', minItems: 1 });
    expect(infos[1].schema.minLength).toBeUndefined();
    expect(infos[1].uischema).toMatchObject({
      type: 'Control',
      scope: '#/items',
    });
    expect(schema).toEqual(originalSchema);
  });

  it('builds nested object and array nodes with absolute paths', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        declared: { type: 'string' },
      },
      additionalProperties: true,
    };
    const data = {
      declared: 'value',
      dynamic: {
        items: [1, { deep: true }],
      },
    };

    const tree = buildTreeFromData(
      data,
      schema,
      schema,
      'data',
      'Data',
      true,
      false,
      true,
      itemLabel,
    );

    expect(flattenTree(tree).map((node) => node.nodeId)).toEqual([
      '$path:data',
      '$path:data.declared',
      '$path:data.dynamic',
      '$path:data.dynamic.items',
      '$path:data.dynamic.items.0',
      '$path:data.dynamic.items.1',
      '$path:data.dynamic.items.1.deep',
    ]);
    expect(findNodeById(tree, '$path:data.declared')).toMatchObject({
      jsonType: 'string',
      canRename: false,
      canDelete: true,
    });
    expect(findNodeById(tree, '$path:data.dynamic')).toMatchObject({
      jsonType: 'object',
      canRename: true,
      canDelete: true,
    });
    expect(findNodeById(tree, '$path:data.dynamic.items.1.deep')).toMatchObject(
      {
        title: 'deep',
        jsonType: 'boolean',
        control: {
          path: 'data.dynamic.items.1.deep',
          enabled: true,
          readonly: false,
        },
      },
    );
  });

  it('hides primitive nodes while retaining complex descendants', () => {
    const schema: JsonSchema = {
      type: 'object',
      additionalProperties: true,
    };
    const tree = buildTreeFromData(
      { primitive: 1, nested: { value: 2 } },
      schema,
      schema,
      '',
      '',
      true,
      false,
      false,
      itemLabel,
    );

    expect(tree[0].nodeId).toBe('$root');
    expect(tree[0].title).toBe('{}');
    expect(tree[0].children?.map((node) => node.nodeId)).toEqual([
      '$path:nested',
    ]);
    expect(tree[0].children?.[0].children).toBeUndefined();
  });

  it('uses tuple and referenced schemas without mutating the input schema', () => {
    const rootSchema: JsonSchema = {
      type: 'array',
      items: [
        { $ref: '#/$defs/count' },
        { type: 'object', additionalProperties: false },
      ],
      $defs: {
        count: { type: 'number', minimum: 0 },
      },
    };
    const originalSchema = structuredClone(rootSchema);
    const tree = buildTreeFromData(
      [3, {}],
      rootSchema,
      rootSchema,
      'values',
      'Values',
      false,
      true,
      true,
      itemLabel,
    );

    expect(findNodeById(tree, '$path:values.0')).toMatchObject({
      title: 'Item 1',
      jsonType: 'integer',
      canRename: false,
      control: {
        schema: { type: 'number', minimum: 0, title: 'Item 1' },
        enabled: false,
        readonly: true,
      },
    });
    expect(findNodeById(tree, '$path:values.1')?.control.schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
    });
    expect(rootSchema).toEqual(originalSchema);
  });

  it('returns no tree for primitive root data and no match for unknown ids', () => {
    expect(
      buildTreeFromData(
        'value',
        { type: 'string' },
        { type: 'string' },
        'value',
        'Value',
        true,
        false,
        true,
        itemLabel,
      ),
    ).toEqual([]);
    expect(findNodeById([], toTreeNodeId('missing'))).toBeUndefined();
  });
});
