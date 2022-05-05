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
$ ./bin/sync CONTROL_DB
```

Currently, there isn't a way to manage reocurring tasks in notion databases, so this sync job can be ran on a cron to add new tasks.

To keep my data private and easy to configure, the script requires several databases

##### Control Db

A read-only db to help make configuring new database ids private to my notion page. It's a table like

|Name|Id|
|----|--|
|TASKS_DB|<guid>|
|CONTEXTS_DB|<guid>|
|REOCURRING_DB|<guid>|

##### Tasks Db

A write database to write the new tasks.

|Name|Start|
|----|-----|

##### Context Db

Just a normal database with the `Name` title such that we can perform queries for relations.

##### Reoccuring Db

A read database to retrieve the reoccuring task list

|Name|Frequency|Context|
|----|---------|-------|

It expects a **Name** (`title`) and a **Frequency** multi select which is one of [`daily`, `weekly`]; Context is optionally going to point to something in the **CONTEXTS_DB**.
