import {
  Command,
  CommandContribution,
  CommandRegistry,
  ComponentContribution,
  ComponentRegistry,
  Domain,
} from '@opensumi/ide-core-browser';
import { IMenuRegistry, MenuContribution } from '@opensumi/ide-core-browser/lib/menu/next';
import { Autowired } from '@opensumi/di';
import { IDialogService } from '@opensumi/ide-overlay';

export const MenuBarLogoId = 'menubar/logo';
export const MenuBarLogoCommandShowInfo: Command = {
  id: 'remax.show-info',
  label: 'About Remax IDE',
};

@Domain(MenuContribution, CommandContribution, ComponentContribution)
export class LogoContribution
  implements MenuContribution, CommandContribution, ComponentContribution
{
  @Autowired(IDialogService)
  protected readonly dialog: IDialogService;

  registerMenus(registry: IMenuRegistry) {
    // 在 Menubar 区域注册一个新的菜单
    registry.registerMenubarItem(MenuBarLogoId, {
      label: 'REMAX IDE',
      order: 0,
    });
    registry.registerMenuItem(MenuBarLogoId, {
      command: MenuBarLogoCommandShowInfo.id,
    });

    // 向已有的菜单注册新的命令，如文件树
    // registry.registerMenuItem(MenuId.ExplorerContext, {
    //   command: HELLO_COMMAND.id,
    //   group: '0_test',
    // });
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(MenuBarLogoCommandShowInfo, {
      execute: () => {
        console.log('remax-ide@1.0.0');
        this.dialog.info('Remax IDE');
      },
    });
  }

  registerComponent(registry: ComponentRegistry): void {
    // registry.register('logo');
  }
}
