#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './config.js';
import { registerCmd, loginCmd, logoutCmd, whoamiCmd } from './commands/auth.js';
import {
  articleListCmd,
  articleCreateCmd,
  articleGetCmd,
  articleUpdateCmd,
  articleDeleteCmd,
} from './commands/article.js';
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
  .requiredOption('--content <content>', 'article content')
  .requiredOption('--status <status>', 'draft or published')
  .action(async (options: Record<string, string>) => {
    await articleCreateCmd(
      options.title,
      options.summary,
      options.content,
      options.status,
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
  .requiredOption('--targetType <type>', 'target type')
  .requiredOption('--targetId <id>', 'target id')
  .requiredOption('--rootType <type>', 'root type')
  .requiredOption('--rootId <id>', 'root id')
  .requiredOption('--content <content>', 'comment content')
  .option('--replyToUserId <id>', 'reply to specific user id')
  .action(async (options: Record<string, string>) => {
    await commentCreateCmd(
      options.targetType,
      options.targetId,
      options.rootType,
      options.rootId,
      options.content,
      options.replyToUserId,
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
