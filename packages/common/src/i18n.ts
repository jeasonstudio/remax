import { registerLocalizationBundle } from '@opensumi/ide-core-common';

// 注册多语言（只支持中文和英文）
export const registerLocale = (name: 'zh-CN' | 'en-US', contents: Record<string, string>) => {
  const languageId = name;
  const languageName = name === 'zh-CN' ? 'Chinese' : 'english';
  const localizedLanguageName = name === 'zh-CN' ? '中文(中国)' : 'English';

  registerLocalizationBundle({
    languageId,
    languageName,
    localizedLanguageName,
    contents,
  });
};
