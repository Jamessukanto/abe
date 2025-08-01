# @annotator/dotcom-worker

The dotcom-worker is used for room management on annotator.com (e.g. creating & joining rooms, readonly rooms, snapshots).

## Enable database persistence for local dev

The values for `env.SUPABASE_KEY` and `env.SUPABASE_URL` are stored in the Cloudflare Workers dashboard for this worker. However we use `--local` mode for local development, which doesn't read these values from the dashboard.

To workaround this, create a file called `.dev.vars` under `merge-server` with the required values (which you can currently find at https://app.supabase.com/project/bfcjbbjqflgfzxhskwct/settings/api). This will be read by `wrangler dev --local` and used to populate the environment variables.

```
SUPABASE_URL=<url>
SUPABASE_KEY=<key>
```

## License

The code in this folder is Copyright (c) 2024-present annotator Inc. The annotator SDK is provided under the [annotator license](https://github.com/annotator/annotator/blob/main/LICENSE.md).

## Trademarks

Copyright (c) 2024-present annotator Inc. The annotator name and logo are trademarks of annotator. Please see our [trademark guidelines](https://github.com/annotator/annotator/blob/main/TRADEMARKS.md) for info on acceptable usage.

## Distributions

You can find annotator on npm [here](https://www.npmjs.com/package/@annotator/annotator?activeTab=versions).

## Contribution

Please see our [contributing guide](https://github.com/annotator/annotator/blob/main/CONTRIBUTING.md). Found a bug? Please [submit an issue](https://github.com/annotator/annotator/issues/new).

## Community

Have questions, comments or feedback? [Join our discord](https://discord.annotator.com/?utm_source=github&utm_medium=readme&utm_campaign=sociallink). For the latest news and release notes, visit [annotator.dev](https://annotator.dev).

## Contact

Find us on Twitter/X at [@annotator](https://twitter.com/annotator).
