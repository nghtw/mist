<div align="center"><img src="./.github/logo.png" width="128px" />

# Mist

Discord bot used primarily on the official server of [Mistwood](https://mistwood.pl).

</div>

## Setup

To run or develop Mist you will need `node` v20 and `pnpm` v8. We recommend using [fnm](https://github.com/Schniz/fnm) and [corepack](https://nodejs.org/api/corepack.html).

```
pnpm i
pnpm dev
```

## Scripts
- `pnpm build` - builds all apps and packages
- `pnpm dev` - runs the bot in watch mode
- `pnpm lint` - runs the formatter, linter and import sorter
- `pnpm lint:fix` - the same as above, but applies easy fixes

Keep in mind that this repository, although small at the moment, uses [turbo](https://turbo.build) for building. Prisma client gets regenerated, if needed, every time `pnpm build` or `pnpm dev` is ran. Additional scripts can be found in relevant packages.

## Environment variables

- `CLIENT_ID`, `BOT_TOKEN` - Discord authentication details
- `DATABASE_URL` - connection URL of a MySQL database
- `GUILD_IDS` - comma-separated list of server IDs that the bot will sync commands to

## Contributing

We welcome and encourage contributions. Don't hesitate to make a PR with a bugfix, but please consult us first on [our Discord server](https://discord.gg/mistwood) if you would like to implement new features.

## License

Distributed under the MIT License. See [LICENSE](/LICENSE) for more information.