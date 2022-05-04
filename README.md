# notion secretary

manage/automate things on notion

## Usage

Checkout `./bin` for various utilities written along the way.

```
$ export NOTION_KEY=secret_heymadeyoulook
```

### `find-databases`

```
$ ./bin/find-databases
```

Quickly list out the names/ids of databases my integration key has access to!

### `sync`

```
$ ./bin/sync READ_DB_ID WRITE_DB_ID
```

Currently, there isn't a way to manage reocurring tasks in notion databases, so this sync job can be ran on a cron to add new tasks.

To keep my data private and easy to configure, the script will require two databases:

1. a write database to write the new tasks, it expects a **Name** (`title`) and a **Start** (`date`) field
2. a read database to retrieve the reoccuring task list, it expects a **Name** (`title`) and a **Frequency** multi select which is one of [`daily`, `weekly`]
