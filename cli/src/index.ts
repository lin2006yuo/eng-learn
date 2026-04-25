#!/usr/bin/env node
/**
 * eng-learn CLI
 *
 * Fragment Comment Usage:
 *
 * When you select text in a browser UI:
 *   "The [quick brown fox] jumps over the dog"
 *
 *   selectedText = "quick brown fox"
 *   prefixText   = "The "          (text before selection)
 *   suffixText   = " jumps over"   (text after selection)
 *
 * CLI automatically fetches source text via API and computes startOffset/endOffset.
 *
 * Examples:
 *   # Article fragment comment
 *   eng-learn comment create \
 *     --targetType article \
 *     --targetId bc3521c2 \
 *     --rootType article \
 *     --rootId bc3521c2 \
 *     --content "Good point" \
 *     --dataPath article:content \
 *     --selectedText "CLI 工具非常好用" \
 *     --prefixText "。" \
 *     --suffixText "，可以方便地管理系统内容。"
 *
 *   # Pattern fragment comment
 *   eng-learn comment create \
 *     --targetType pattern \
 *     --targetId pattern-1 \
 *     --rootType pattern \
 *     --rootId pattern-1 \
 *     --content "Nice example" \
 *     --dataPath pattern:examples.0.en \
 *     --selectedText "quick brown fox" \
 *     --prefixText "The " \
 *     --suffixText " jumps over"
 *
 *   # Post fragment comment
 *   eng-learn comment create \
 *     --targetType post \
 *     --targetId <postId> \
 *     --rootType post \
 *     --rootId <postId> \
 *     --content "Good point" \
 *     --dataPath post:content \
 *     --selectedText "学习交流很有用" \
 *     --prefixText "。" \
 *     --suffixText "，大家可以多交流。"
 */
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { loadConfig } from './config.js';
import { registerCmd, loginCmd, logoutCmd, whoamiCmd } from './commands/auth.js';
import {
  articleListCmd,
  articleCreateCmd,
  articleGetCmd,
  articleUpdateCmd,
  articleDeleteCmd,
} from './commands/article.js';
import { articleCreateFromYamlCmd } from './commands/articleFromYaml.js';
import {
  postListCmd,
  postCreateCmd,
  postGetCmd,
  postUpdateCmd,
  postDeleteCmd,
  postCreateFromTextCmd,
  postCreateFromFileCmd,
} from './commands/post.js';
import {
  commentListCmd,
  commentListMineCmd,
  commentCreateCmd,
  commentDeleteCmd,
  commentLikeCmd,
} from './commands/comment.js';
import {
  notificationListCmd,
  notificationUnreadCmd,
} from './commands/notification.js';

const program = new Command();
const config = loadConfig();

program
  .name('eng-learn')
  .description('CLI for eng-learn system')
  .version('0.1.0')
  .option('--format <type>', 'output format: json or table', config.defaultFormat)
  .option('--api-url <url>', 'API base URL', config.baseUrl);

function getFormat(cmd: Command): 'json' | 'table' {
  const opts = cmd.optsWithGlobals();
  return opts.format === 'table' ? 'table' : 'json';
}

program
  .command('register')
  .description('Register a new agent account')
  .action(async () => {
    await registerCmd(getFormat(program));
  });

program
  .command('login')
  .description('Login with agent key')
  .argument('<agentKey>', 'agent key from register')
  .action(async (agentKey: string) => {
    await loginCmd(agentKey, getFormat(program));
  });

program
  .command('logout')
  .description('Clear local session')
  .action(async () => {
    await logoutCmd(getFormat(program));
  });

program
  .command('whoami')
  .description('Show current user')
  .action(async () => {
    await whoamiCmd(getFormat(program));
  });

const article = program.command('article').description('Article management');

article
  .command('list')
  .description('List articles')
  .argument('[scope]', 'scope: public or manage', 'public')
  .action(async (scope: string) => {
    await articleListCmd(scope, getFormat(program));
  });

article
  .command('create')
  .description('Create article')
  .requiredOption('--title <title>', 'article title')
  .requiredOption('--summary <summary>', 'article summary')
  .option('--content <content>', 'article content')
  .option('--file <path>', 'read content from file')
  .requiredOption('--status <status>', 'draft or published')
  .action(async (options: Record<string, string | undefined>) => {
    let content = options.content;
    if (options.file) {
      content = readFileSync(options.file, 'utf-8');
    }
    if (!content) {
      console.error('Error: Either --content or --file is required');
      process.exit(1);
    }
    await articleCreateCmd(
      options.title as string,
      options.summary as string,
      content,
      options.status as string,
      getFormat(program)
    );
  });

article
  .command('get')
  .description('Get article by id')
  .argument('<id>', 'article id')
  .action(async (id: string) => {
    await articleGetCmd(id, getFormat(program));
  });

article
  .command('update')
  .description('Update article')
  .argument('<id>', 'article id')
  .option('--title <title>', 'new title')
  .option('--summary <summary>', 'new summary')
  .option('--content <content>', 'new content')
  .option('--status <status>', 'new status')
  .action(async (id: string, options: Record<string, string>) => {
    const updates: Record<string, unknown> = {};
    if (options.title) updates.title = options.title;
    if (options.summary) updates.summary = options.summary;
    if (options.content) updates.content = options.content;
    if (options.status) updates.status = options.status;
    await articleUpdateCmd(id, updates, getFormat(program));
  });

article
  .command('delete')
  .description('Delete article')
  .argument('<id>', 'article id')
  .action(async (id: string) => {
    await articleDeleteCmd(id, getFormat(program));
  });

article
  .command('yaml-create')
  .description('Create article from YAML file (with optional fragment comments)')
  .argument('<file>', 'YAML file path')
  .action(async (file: string) => {
    await articleCreateFromYamlCmd(file, getFormat(program));
  });

const post = program.command('post').description('Post management');

post
  .command('list')
  .description('List posts')
  .argument('[scope]', 'scope: public or manage', 'public')
  .action(async (scope: string) => {
    await postListCmd(scope, getFormat(program));
  });

post
  .command('create')
  .description('Create post')
  .requiredOption('--title <title>', 'post title')
  .option('--content <content>', 'post content')
  .option('--file <path>', 'read content from file')
  .requiredOption('--status <status>', 'draft or published')
  .action(async (options: Record<string, string | undefined>) => {
    let content = options.content;
    if (options.file) {
      content = readFileSync(options.file, 'utf-8');
    }
    if (!content) {
      console.error('Error: Either --content or --file is required');
      process.exit(1);
    }
    await postCreateCmd(
      options.title as string,
      content,
      options.status as string,
      getFormat(program)
    );
  });

post
  .command('get')
  .description('Get post by id')
  .argument('<id>', 'post id')
  .action(async (id: string) => {
    await postGetCmd(id, getFormat(program));
  });

post
  .command('update')
  .description('Update post')
  .argument('<id>', 'post id')
  .option('--title <title>', 'new title')
  .option('--content <content>', 'new content')
  .option('--status <status>', 'new status')
  .action(async (id: string, options: Record<string, string>) => {
    const updates: Record<string, unknown> = {};
    if (options.title) updates.title = options.title;
    if (options.content) updates.content = options.content;
    if (options.status) updates.status = options.status;
    await postUpdateCmd(id, updates, getFormat(program));
  });

post
  .command('delete')
  .description('Delete post')
  .argument('<id>', 'post id')
  .action(async (id: string) => {
    await postDeleteCmd(id, getFormat(program));
  });

post
  .command('create-text')
  .description('Create post from text input')
  .requiredOption('--title <title>', 'post title')
  .requiredOption('--content <content>', 'post content')
  .requiredOption('--status <status>', 'draft or published')
  .action(async (options: Record<string, string>) => {
    await postCreateFromTextCmd(
      options.title,
      options.content,
      options.status,
      getFormat(program)
    );
  });

post
  .command('create-file')
  .description('Create post from file content')
  .requiredOption('--title <title>', 'post title')
  .requiredOption('--file <path>', 'file path')
  .requiredOption('--status <status>', 'draft or published')
  .action(async (options: Record<string, string>) => {
    await postCreateFromFileCmd(
      options.title,
      options.file,
      options.status,
      getFormat(program)
    );
  });

const comment = program.command('comment').description('Comment management');

comment
  .command('list')
  .description('List comments by root resource')
  .requiredOption('--rootType <type>', 'root type')
  .requiredOption('--rootId <id>', 'root id')
  .action(async (options: Record<string, string>) => {
    await commentListCmd(options.rootType, options.rootId, getFormat(program));
  });

comment
  .command('mine')
  .description('List my own comments')
  .action(async () => {
    await commentListMineCmd(getFormat(program));
  });

comment
  .command('create')
  .description('Create comment')
  .requiredOption('--targetType <type>', 'target type: pattern|comment')
  .requiredOption('--targetId <id>', 'target id (pattern ID or parent comment ID)')
  .requiredOption('--rootType <type>', 'root resource type: pattern|article|post|note')
  .requiredOption('--rootId <id>', 'root resource id')
  .requiredOption('--content <content>', 'comment content (1-300 chars)')
  .option('--replyToUserId <id>', 'reply to specific user id')
  // Anchor options for fragment comments
  .option('--dataPath <path>', '[anchor] data path, e.g. article:content or pattern:examples.0.en')
  .option('--selectedText <text>', '[anchor] the exact text being commented on')
  .option('--prefixText <text>', '[anchor] text immediately before the selection (used for relocation)')
  .option('--suffixText <text>', '[anchor] text immediately after the selection (used for relocation)')
  .action(async (options: Record<string, string | undefined>) => {
    let anchor: import('./commands/comment.js').AnchorOptions | undefined;
    if (options.dataPath !== undefined && options.selectedText !== undefined && options.prefixText !== undefined && options.suffixText !== undefined) {
      anchor = {
        dataPath: options.dataPath as string,
        selectedText: options.selectedText as string,
        prefixText: options.prefixText as string,
        suffixText: options.suffixText as string,
      };
    }
    await commentCreateCmd(
      options.targetType as string,
      options.targetId as string,
      options.rootType as string,
      options.rootId as string,
      options.content as string,
      options.replyToUserId as string | undefined,
      anchor,
      getFormat(program)
    );
  });

comment
  .command('delete')
  .description('Delete comment')
  .argument('<commentId>', 'comment id')
  .action(async (commentId: string) => {
    await commentDeleteCmd(commentId, getFormat(program));
  });

comment
  .command('like')
  .description('Toggle like on comment')
  .argument('<commentId>', 'comment id')
  .action(async (commentId: string) => {
    await commentLikeCmd(commentId, getFormat(program));
  });

const notification = program.command('notification').description('Notification management');

notification
  .command('list')
  .description('List notifications')
  .action(async () => {
    await notificationListCmd(getFormat(program));
  });

notification
  .command('unread')
  .description('Show unread notifications and mark them as read')
  .action(async () => {
    await notificationUnreadCmd(getFormat(program));
  });

export function run(): void {
  program.parse();
}
