import React from 'react';
import { KeybindingRegistry, localize, useInjectable } from '@opensumi/ide-core-browser';
import './ide-empty.less';

export const IDEEmpty: React.FC<unknown> = () => {
  const keybindingRegistry = useInjectable<KeybindingRegistry>(KeybindingRegistry);
  const getKeybindingsForCommand = React.useCallback(
    (command: string) => {
      const keybindings = keybindingRegistry.getKeybindingsForCommand(command);
      if (keybindings.length > 0) {
        const keybinding = keybindingRegistry.acceleratorFor(keybindings[0], '+');
        return keybinding[0].split('+');
      }
      return [];
    },
    [keybindingRegistry],
  );

  const commands = [
    {
      name: localize('remax.ide-empty.show-all-commands'),
      value: getKeybindingsForCommand('editor.action.quickCommand'),
    },
    {
      name: localize('remax.ide-empty.go-to-file'),
      value: getKeybindingsForCommand('workbench.action.quickOpen'),
    },
    {
      name: localize('remax.ide-empty.find-in-file'),
      value: getKeybindingsForCommand('content-search.openSearch'),
    },
    {
      name: localize('remax.ide-empty.show-settings'),
      value: getKeybindingsForCommand('core.openpreference'),
    },
  ].filter((item) => !!item.value.length);

  return (
    <section className="ide-empty">
      {commands.map((item) => (
        <div key={item.name} className="ide-empty-command">
          <span>{item.name}</span>
          <span>
            {item.value.map((keybinding) => {
              return (
                <span key={keybinding} className="ide-empty-key">
                  {keybinding.toUpperCase()}
                </span>
              );
            })}
          </span>
        </div>
      ))}
    </section>
  );
};
IDEEmpty.displayName = 'IDEEmpty';
IDEEmpty.defaultProps = {};
