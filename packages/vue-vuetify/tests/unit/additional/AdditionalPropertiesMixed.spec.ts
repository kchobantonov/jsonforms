import { clearAllIds } from '@jsonforms/core';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { extendedVuetifyRenderers } from '../../../src';
import { mountJsonForms } from '../util';

describe('AdditionalProperties mixed values', () => {
  const schema = {
    type: 'object' as const,
    additionalProperties: {},
  };
  const uischema = { type: 'Control' as const, scope: '#' };

  beforeEach(() => {
    clearAllIds();
  });

  it('updates the mixed renderer when an existing property changes type', async () => {
    const wrapper = mountJsonForms(
      { dynamic: 'text' },
      schema,
      extendedVuetifyRenderers,
      uischema,
    );

    expect(wrapper.find('.mixed-primitive').exists()).toBe(true);

    await wrapper.setProps({ data: { dynamic: { nested: true } } });
    await nextTick();

    expect(wrapper.find('.mixed-tree-container').exists()).toBe(true);
  });

  it.each(['object', 'array'] as const)(
    'opens the collapsible panel when selecting the %s type',
    async (type) => {
      const wrapper = mountJsonForms(
        { dynamic: 'text' },
        schema,
        extendedVuetifyRenderers,
        uischema,
      );
      const mixedRenderer = wrapper.findComponent({ name: 'mixed-renderer' });
      const vm = mixedRenderer.vm as unknown as {
        mixedRenderInfos: Array<{
          index: number;
          resolvedSchema: { type?: string };
        }>;
        handleSelectChange: (index: number) => void;
      };
      const selected = vm.mixedRenderInfos.find(
        (info) => info.resolvedSchema.type === type,
      );

      expect(selected).toBeDefined();
      vm.handleSelectChange(selected!.index);
      await nextTick();

      expect(wrapper.find('.v-expansion-panel--active').exists()).toBe(true);
      expect(wrapper.find('.mixed-tree-container').exists()).toBe(true);
    },
  );
});
