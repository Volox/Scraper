# Twitter Scraper CLI
Command Line Lnterface for https://github.com/Volox/TwitterScraper


# Usage

```sh
# Will pipe to the stdout the result
twitter-scraper-cli -q "#node"

# Will save the results to the specified mongo db/collection
twitter-scraper-cli -q "#node" -M ../mongo.json

# Will enrich each tweet with the full data from Twitter and pipe to the stdout the result
twitter-scraper-cli -q "#node" -T twitter.json
```


# Options

## Query

The query can be specified inline via the `-q` argument, or using the `-Q` flag and specifing the file containing the query.

| Flag   | Long flag      | Description                | Required     | Default         |
| ------ | -------------- | -------------------------- | :----------: | :-------------: |
| -Q     | --query-file   | Twitter query file         | **Yes**      | *N/D*           |
|        |                | **OR**                     |              |                 |
| -q     | --query        | Twitter query              | **Yes**      | *N/D*           |

## Mongo options [Optional]

The mongo options can be specified in a json file or via command line arguments.

If either `-M` or `-d` flags are specified then the data will be saved in the
corresponding configuration.

| Flag   | Long flag      | Description                | Required     | Default         |
| ------ | -------------- | -------------------------- | :----------: | :-------------: |
| -M     | --mongo        | Mongo configuration file   | **Yes**      | *N/D*           |
|        |                | **OR**                     |              |                 |
| -m     | --host         | Mongo host                 | **No**       | `localhost`     |
| -p     | --port         | Mongo port                 | **No**       | `27017`         |
| -d     | --database     | Mongo database name        | **Yes**      | *N/D*           |
| -c     | --collection   | Mongo collection name      | **No**       | `tweets`        |

## Twitter options [Optional]

The Twitter options can be specified in a json file or via command line arguments.

If either `-T` or **all** the other twitter flags (`-k -s -t -y`) are specified then the data will be enriched with the full tweet info.

| Flag   | Long flag        | Description                   | Required     | Default     |
| ------ | ---------------- | ----------------------------- | :----------: | :---------: |
| -T     | --twitter        | Twitter config file           | **Yes**      | N/D         |
|        |                  | **OR**                        |              |             |
| -k     | --key            | Twitter key                   | **Yes**      | N/D         |
| -s     | --secret         | Twitter secret                | **Yes**      | N/D         |
| -t     | --token          | Twitter access token          | **Yes**      | N/D         |
| -y     | --token-secret   | Twitter access token secret   | **Yes**      | N/D         |


# LICENSE
MIT