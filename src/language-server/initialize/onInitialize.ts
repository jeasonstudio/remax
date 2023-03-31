import path from 'path-browserify';
import { TextDocumentSyncKind, Connection, ProgressType } from 'vscode-languageserver/browser';
import { NodeDirent } from '../../file-system';
import { Context } from '../context';
import { SolidityTextDocument } from '../text-document';

type OnInitialize = Parameters<Connection['onInitialize']>[0];

export const onInitialize =
  (ctx: Context): OnInitialize =>
  async (params) => {
    console.log('initialize:', params);
    const result: ReturnType<OnInitialize> = {
      serverInfo: {
        name: 'Solidity Language Server',
        version: '0.0.0',
      },
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          // resolveProvider: true,
          triggerCharacters: ['.', '/', '"', `'`, '*', ' '],
        },
        signatureHelpProvider: {
          triggerCharacters: ['('],
        },
        definitionProvider: true,
        // typeDefinitionProvider: true,
        // referencesProvider: true,
        // implementationProvider: true,
        // renameProvider: true,
        // codeActionProvider: true,
        hoverProvider: true,

        // workspace capabilities
        workspace: {
          workspaceFolders: {
            supported: true,
            changeNotifications: true,
          },
        },
      },
    };

    if ((params.workspaceFolders?.length ?? 0) >= 1) {
      ctx.workspace = params.workspaceFolders![0].name;
      ctx.workspaceUri = params.workspaceFolders![0].uri;

      // Sync documents from workspace
      await ctx.remaxfsPromise;
      const fp = ctx.uri2path(ctx.workspaceUri);
      const formatEntry = (dir: string, entry: NodeDirent) => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // If is directory, recurse
          ctx.remaxfs
            .readdir(entryPath, { withFileTypes: true })
            .then((entries) => {
              entries.map((e) => formatEntry(entryPath, e));
            })
            .catch(ctx.console.error);
        } else if (entry.isFile() && entry.name.endsWith('.sol')) {
          // If is file, create document
          const uri = ctx.path2uri(entryPath);
          ctx.remaxfs
            .readFile(entryPath)
            .then((content) => {
              const document = SolidityTextDocument.create(uri, 'solidity', 0, content.toString('utf8'));
              // Dangerous cast: _syncedDocuments is private
              ((ctx.documents as any)._syncedDocuments as Map<string, SolidityTextDocument>).set(uri, document);
            })
            .catch(ctx.console.error);
        }
        // Else ignore
      };
      ctx.remaxfs
        .readdir(fp, { withFileTypes: true })
        .then((rootEntries) => {
          rootEntries.map((e) => formatEntry(fp, e));
        })
        .catch(ctx.console.error);
    }

    return result;
  };
