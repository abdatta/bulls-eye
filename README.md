# Bulls Eye <img src="https://i.imgur.com/qkhF7hE.png" alt="logo" height="24">
A reactive admin panel for monitoring [bull](https://www.npmjs.com/package/bull) queues, using sockets for realtime updates!

## Installation
```
npm i -g @abdatta/bulls-eye
```
Create a json file (say `config.json`) of the following format having your bull queue configarations.
```
/* config.json */
{
    "<some-host-name>": [
        {
            "name": "<queue-name>",
            "url": "<redis-url>(optional)",
            "options": { <bull-queue-options> }
        },
        {
          ...
        }
    ],
    "<another-host-name>": [
        ...
    ]
}
```
Here:
- `<some-host-name>` can be any string, helpful for namespacing same named queues from different machines
- `<queue-name>`, `<redis-url>` and `{<bull-queue-options>}` are the same params that you provide to bull when creating your queue using: `new bull(name, url?, options?)`

Now simply open the terminal in the directory where your `config.json` file is and execute:
```
bulls-eye --config config.json --port 4869
```
That's it! Now go to `localhost:4869` and you can see your jobs and queues! :smile:

## Screenshots
- List of jobs in a queue
![SS1](https://i.imgur.com/mLpE7g8.png)

- Details of a particular job
![SS2](https://i.imgur.com/jiUe9XZ.png)
